'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { mockHospitals } from '@/lib/mock-data'
import type { Treatment } from '@/types'

// ── Types ─────────────────────────────────────────────────────────────────────
type Step = 'summary' | 'interpreter' | 'hotel' | 'patient' | 'payment' | 'done'
type PayMethod = 'card' | 'paypal' | 'wechat' | 'alipay'
type MatchPhase = 'idle' | 'loading' | 'matched'

interface Interpreter { id: string; name: string; language: string; flag: string; rating: number; cases: number; price: number }
interface HotelOption { id: string; name: string; dist: string; rating: number; pricePerNight: number; tags: string[] }
interface VehicleOption { id: string; label: string; desc: string; price: number }

interface CartState {
  hospitalId: string
  treatments: Treatment[]
  visitDate: string
  interpreter: Interpreter | null
  needInterpreter: boolean
  interpreterLang: string
  hotel: HotelOption | null
  hotelNights: number
  vehicle: VehicleOption
  patient: PatientInfo
  payMethod: PayMethod
  bookingRef: string
}

interface PatientInfo {
  name: string; dob: string; gender: string; nationality: string
  passport: string; phone: string; email: string
  emergencyName: string; emergencyPhone: string; medNote: string
}

// ── Static data ───────────────────────────────────────────────────────────────
const INTERPRETER_POOL: Interpreter[] = [
  { id: 'i1', name: '이리나 킴', language: '러시아어', flag: '🇷🇺', rating: 4.8, cases: 245, price: 200000 },
  { id: 'i2', name: '장하오', language: '중국어', flag: '🇨🇳', rating: 4.9, cases: 312, price: 200000 },
  { id: 'i3', name: '모하마드 알리', language: '아랍어', flag: '🇸🇦', rating: 4.7, cases: 189, price: 200000 },
  { id: 'i4', name: '다나카 유코', language: '일본어', flag: '🇯🇵', rating: 4.9, cases: 278, price: 200000 },
  { id: 'i5', name: '간바타르', language: '몽골어', flag: '🇲🇳', rating: 4.6, cases: 134, price: 200000 },
  { id: 'i6', name: 'James Wilson', language: '영어', flag: '🇺🇸', rating: 4.8, cases: 201, price: 200000 },
]
const HOTEL_OPTIONS: HotelOption[] = [
  { id: 'h1', name: '메디컬 스테이 서울', dist: '병원까지 0.3km', rating: 4.8, pricePerNight: 120000, tags: ['의료특화', '무료셔틀'] },
  { id: 'h2', name: '케어 레지던스', dist: '병원까지 0.8km', rating: 4.6, pricePerNight: 90000, tags: ['24h 간호사 대기', '조식포함'] },
  { id: 'h3', name: '힐링 호텔', dist: '병원까지 1.2km', rating: 4.5, pricePerNight: 75000, tags: ['도심접근성', '회복특화'] },
]
const VEHICLE_OPTIONS: VehicleOption[] = [
  { id: 'v0', label: '필요 없음', desc: '자체 이동', price: 0 },
  { id: 'v1', label: '공항 픽업', desc: '인천공항 → 병원', price: 80000 },
  { id: 'v2', label: '공항 왕복', desc: '인천공항 ↔ 병원', price: 140000 },
]
const LANGUAGES = ['영어', '중국어', '일본어', '러시아어', '아랍어', '몽골어', '베트남어', '태국어']
const STEP_ORDER: Step[] = ['summary', 'interpreter', 'hotel', 'patient', 'payment']
const STEP_LABELS: Record<Step, string> = {
  summary: '예약 확인', interpreter: '통역', hotel: '숙박·차량',
  patient: '환자 정보', payment: '결제', done: '완료',
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatPrice(n: number) {
  if (n >= 10000000) return `${(n / 10000000).toFixed(0)}천만원`
  if (n >= 1000000) return `${(n / 1000000).toFixed(0)}백만원`
  if (n >= 10000) return `${Math.round(n / 10000)}만원`
  return `${n.toLocaleString()}원`
}

function genRef() {
  return 'KMM-2026-' + Math.random().toString(36).slice(2, 8).toUpperCase()
}

const EMPTY_PATIENT: PatientInfo = {
  name: '', dob: '', gender: '', nationality: '', passport: '',
  phone: '', email: '', emergencyName: '', emergencyPhone: '', medNote: '',
}

// ── Step 1: 예약 확인 ──────────────────────────────────────────────────────────
function StepSummary({ cart, setCart }: {
  cart: CartState
  setCart: React.Dispatch<React.SetStateAction<CartState>>
}) {
  const hospital = mockHospitals.find((h) => h.id === cart.hospitalId)
  const allTreatments = hospital?.treatments ?? []

  function toggle(t: Treatment) {
    setCart((c) => {
      const exists = c.treatments.find((x) => x.id === t.id)
      return {
        ...c,
        treatments: exists ? c.treatments.filter((x) => x.id !== t.id) : [...c.treatments, t],
      }
    })
  }

  return (
    <div className="space-y-6">
      {hospital && (
        <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
            {hospital.name[0]}
          </div>
          <div>
            <p className="font-bold text-gray-900">{hospital.name}</p>
            <p className="text-sm text-gray-500">{hospital.nameEn} · {hospital.location} {hospital.district}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-yellow-400 text-xs">★</span>
              <span className="text-xs font-medium text-gray-700">{hospital.rating}</span>
              <span className="text-xs text-gray-400">({hospital.reviewCount.toLocaleString()}리뷰)</span>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">시술 선택 <span className="text-gray-400 font-normal">(중복 가능)</span></h3>
        {allTreatments.length === 0 ? (
          <p className="text-sm text-gray-400">선택 가능한 시술이 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {allTreatments.map((t) => {
              const selected = !!cart.treatments.find((x) => x.id === t.id)
              return (
                <label key={t.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  selected ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}>
                  <input type="checkbox" checked={selected} onChange={() => toggle(t)} className="rounded text-blue-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.duration} · 회복 {t.recovery}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-blue-700">{formatPrice(t.priceMin)}~</p>
                    <p className="text-xs text-gray-400">{formatPrice(t.priceMax)}</p>
                  </div>
                </label>
              )
            })}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">희망 방문일</h3>
        <input
          type="date"
          value={cart.visitDate}
          min={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setCart((c) => ({ ...c, visitDate: e.target.value }))}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 bg-white w-full max-w-xs"
        />
      </div>
    </div>
  )
}

// ── Step 2: 통역 선택 ──────────────────────────────────────────────────────────
function StepInterpreter({ cart, setCart }: {
  cart: CartState
  setCart: React.Dispatch<React.SetStateAction<CartState>>
}) {
  const [phase, setPhase] = useState<MatchPhase>(cart.interpreter ? 'matched' : 'idle')

  function runMatch() {
    setPhase('loading')
    setTimeout(() => {
      const match = INTERPRETER_POOL.find((i) => i.language === cart.interpreterLang) ?? INTERPRETER_POOL[0]
      setCart((c) => ({ ...c, interpreter: match }))
      setPhase('matched')
    }, 1800)
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        {[false, true].map((val) => (
          <button
            key={String(val)}
            onClick={() => {
              setCart((c) => ({ ...c, needInterpreter: val, interpreter: val ? c.interpreter : null }))
              if (!val) setPhase('idle')
            }}
            className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-colors ${
              cart.needInterpreter === val
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            {val ? '통역사 배정 요청' : '통역사 불필요'}
          </button>
        ))}
      </div>

      {cart.needInterpreter && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">언어 선택</label>
            <select
              value={cart.interpreterLang}
              onChange={(e) => {
                setCart((c) => ({ ...c, interpreterLang: e.target.value, interpreter: null }))
                setPhase('idle')
              }}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 bg-white w-full max-w-xs"
            >
              <option value="">언어 선택...</option>
              {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          {phase === 'idle' && cart.interpreterLang && (
            <button
              onClick={runMatch}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
            >
              <span>✦</span> AI 통역사 매칭
            </button>
          )}

          {phase === 'loading' && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              <p className="text-sm text-blue-700">최적의 통역사를 매칭하는 중...</p>
            </div>
          )}

          {phase === 'matched' && cart.interpreter && (
            <div className="flex items-center gap-4 p-4 bg-white border-2 border-blue-200 rounded-2xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                {cart.interpreter.flag}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-gray-900">{cart.interpreter.name}</p>
                  <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100">매칭완료</span>
                </div>
                <p className="text-xs text-gray-500">{cart.interpreter.language} · {cart.interpreter.cases}건 · ★{cart.interpreter.rating}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-gray-800">{formatPrice(cart.interpreter.price)}</p>
                <p className="text-xs text-gray-400">/1일</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Step 3: 숙박·차량 ──────────────────────────────────────────────────────────
function StepHotelVehicle({ cart, setCart }: {
  cart: CartState
  setCart: React.Dispatch<React.SetStateAction<CartState>>
}) {
  return (
    <div className="space-y-8">
      {/* Hotel */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">숙소 선택 <span className="text-gray-400 font-normal">(선택사항)</span></h3>
        <div className="space-y-3">
          <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
            !cart.hotel ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
          }`}>
            <input type="radio" name="hotel" checked={!cart.hotel} onChange={() => setCart((c) => ({ ...c, hotel: null, hotelNights: 0 }))} className="text-blue-600" />
            <span className="text-sm font-medium text-gray-700">숙소 직접 예약 (별도 진행)</span>
          </label>
          {HOTEL_OPTIONS.map((h) => (
            <div key={h.id} className={`border rounded-2xl transition-colors overflow-hidden ${
              cart.hotel?.id === h.id ? 'border-blue-300' : 'border-gray-200'
            }`}>
              <label className={`flex items-center gap-3 p-4 cursor-pointer ${
                cart.hotel?.id === h.id ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'
              }`}>
                <input type="radio" name="hotel" checked={cart.hotel?.id === h.id}
                  onChange={() => setCart((c) => ({ ...c, hotel: h, hotelNights: c.hotelNights || 1 }))}
                  className="text-blue-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-gray-900">{h.name}</p>
                    {h.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded-md">{tag}</span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">📍 {h.dist} · ★{h.rating}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-gray-800">{formatPrice(h.pricePerNight)}</p>
                  <p className="text-xs text-gray-400">/박</p>
                </div>
              </label>
              {cart.hotel?.id === h.id && (
                <div className="flex items-center gap-3 px-4 pb-4 border-t border-blue-100 pt-3">
                  <span className="text-sm text-gray-600">숙박 일수</span>
                  <div className="flex items-center gap-2 ml-auto">
                    <button onClick={() => setCart((c) => ({ ...c, hotelNights: Math.max(1, c.hotelNights - 1) }))}
                      className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100">−</button>
                    <span className="text-sm font-bold w-10 text-center">{cart.hotelNights}박</span>
                    <button onClick={() => setCart((c) => ({ ...c, hotelNights: c.hotelNights + 1 }))}
                      className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100">+</button>
                    <span className="text-sm font-bold text-blue-700 ml-2">{formatPrice(h.pricePerNight * cart.hotelNights)}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Vehicle */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">차량 서비스 <span className="text-gray-400 font-normal">(선택사항)</span></h3>
        <div className="space-y-2">
          {VEHICLE_OPTIONS.map((v) => (
            <label key={v.id} className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
              cart.vehicle.id === v.id ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}>
              <input type="radio" name="vehicle" checked={cart.vehicle.id === v.id}
                onChange={() => setCart((c) => ({ ...c, vehicle: v }))} className="text-blue-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{v.label}</p>
                <p className="text-xs text-gray-400">{v.desc}</p>
              </div>
              {v.price > 0 && <span className="text-sm font-bold text-gray-700">{formatPrice(v.price)}</span>}
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Step 4: 환자 정보 ──────────────────────────────────────────────────────────
function StepPatient({ cart, setCart }: {
  cart: CartState
  setCart: React.Dispatch<React.SetStateAction<CartState>>
}) {
  const p = cart.patient
  function set(k: keyof PatientInfo, v: string) {
    setCart((c) => ({ ...c, patient: { ...c.patient, [k]: v } }))
  }

  const fieldCls = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 bg-white'
  const labelCls = 'text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block'

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelCls}>성명 (여권 영문)</label>
          <input className={fieldCls} placeholder="HONG GILDONG" value={p.name} onChange={(e) => set('name', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>생년월일</label>
          <input type="date" className={fieldCls} value={p.dob} onChange={(e) => set('dob', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>성별</label>
          <select className={fieldCls} value={p.gender} onChange={(e) => set('gender', e.target.value)}>
            <option value="">선택</option>
            <option value="남">남성</option>
            <option value="여">여성</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>국적</label>
          <input className={fieldCls} placeholder="러시아" value={p.nationality} onChange={(e) => set('nationality', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>여권 번호</label>
          <input className={fieldCls} placeholder="AB1234567" value={p.passport} onChange={(e) => set('passport', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>연락처 (WhatsApp)</label>
          <input className={fieldCls} placeholder="+7-910-000-0000" value={p.phone} onChange={(e) => set('phone', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>이메일</label>
          <input type="email" className={fieldCls} placeholder="you@email.com" value={p.email} onChange={(e) => set('email', e.target.value)} />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-5 space-y-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">비상 연락처</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>이름</label>
            <input className={fieldCls} placeholder="보호자 성명" value={p.emergencyName} onChange={(e) => set('emergencyName', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>연락처</label>
            <input className={fieldCls} placeholder="+7-910-000-0001" value={p.emergencyPhone} onChange={(e) => set('emergencyPhone', e.target.value)} />
          </div>
        </div>
      </div>

      <div>
        <label className={labelCls}>특이사항 / 알레르기 / 복용 약물</label>
        <textarea
          className={`${fieldCls} resize-none h-20`}
          placeholder="약물 알레르기, 기저질환 등 의료진이 알아야 할 사항을 입력해 주세요."
          value={p.medNote}
          onChange={(e) => set('medNote', e.target.value)}
        />
      </div>
    </div>
  )
}

// ── Step 5: 결제 ───────────────────────────────────────────────────────────────
function StepPayment({ cart, setCart, total, onPay }: {
  cart: CartState
  setCart: React.Dispatch<React.SetStateAction<CartState>>
  total: number
  onPay: () => void
}) {
  const [cardNum, setCardNum] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [holder, setHolder] = useState('')
  const [agreed, setAgreed] = useState(false)

  function fmtCardNum(v: string) {
    const raw = v.replace(/\D/g, '').slice(0, 16)
    return raw.replace(/(.{4})/g, '$1 ').trim()
  }
  function fmtExpiry(v: string) {
    const raw = v.replace(/\D/g, '').slice(0, 4)
    return raw.length > 2 ? raw.slice(0, 2) + '/' + raw.slice(2) : raw
  }

  const cardType = cardNum.startsWith('4') ? 'VISA' : cardNum.startsWith('5') ? 'MC' : cardNum.startsWith('3') ? 'AMEX' : null
  const canPay = agreed && (
    cart.payMethod !== 'card' ||
    (cardNum.replace(/\s/g, '').length === 16 && expiry.length === 5 && cvv.length >= 3 && holder.trim().length > 0)
  )

  const METHOD_TABS: { id: PayMethod; label: string; icon: string }[] = [
    { id: 'card', label: '해외 카드', icon: '💳' },
    { id: 'paypal', label: 'PayPal', icon: '🅿' },
    { id: 'wechat', label: 'WeChat Pay', icon: '💬' },
    { id: 'alipay', label: 'Alipay', icon: '🔵' },
  ]

  return (
    <div className="space-y-6">
      {/* Method tabs */}
      <div className="grid grid-cols-4 gap-2">
        {METHOD_TABS.map((m) => (
          <button key={m.id}
            onClick={() => setCart((c) => ({ ...c, payMethod: m.id }))}
            className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 text-xs font-medium transition-colors ${
              cart.payMethod === m.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}>
            <span className="text-xl">{m.icon}</span>
            {m.label}
          </button>
        ))}
      </div>

      {/* Card form */}
      {cart.payMethod === 'card' && (
        <div className="space-y-4">
          {/* Mock card preview */}
          <div className="h-40 bg-ink rounded-lg p-5 text-white relative overflow-hidden shadow-lg">
            <div className="absolute right-5 top-5 text-2xl opacity-30 font-bold select-none">◎◎</div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full" />
            <div className="absolute -bottom-10 -right-14 w-40 h-40 bg-white/5 rounded-full" />
            <div className="flex items-start justify-between mb-6">
              <div className="w-10 h-7 bg-yellow-400 rounded-md opacity-80" />
              {cardType && <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded">{cardType}</span>}
            </div>
            <p className="text-base font-mono tracking-widest mb-3">
              {cardNum || '•••• •••• •••• ••••'}
            </p>
            <div className="flex justify-between text-xs">
              <p className="opacity-70">{holder || 'CARDHOLDER NAME'}</p>
              <p className="opacity-70">{expiry || 'MM/YY'}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">카드 번호</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-blue-400 bg-white"
                placeholder="0000 0000 0000 0000"
                value={cardNum}
                onChange={(e) => setCardNum(fmtCardNum(e.target.value))}
                maxLength={19}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">유효기간</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-blue-400 bg-white"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => setExpiry(fmtExpiry(e.target.value))}
                  maxLength={5}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">CVV</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-blue-400 bg-white"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g,'').slice(0,4))}
                  maxLength={4}
                  type="password"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">카드 소지인 (영문)</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-blue-400 bg-white"
                placeholder="HONG GILDONG"
                value={holder}
                onChange={(e) => setHolder(e.target.value.toUpperCase())}
              />
            </div>
          </div>
        </div>
      )}

      {/* PayPal */}
      {cart.payMethod === 'paypal' && (
        <div className="flex flex-col items-center gap-4 py-6 bg-blue-50 rounded-2xl border border-blue-100">
          <div className="text-4xl">🅿</div>
          <p className="text-sm text-gray-600 text-center">아래 버튼을 클릭하면 PayPal 결제 화면으로 이동합니다.</p>
          <div className="w-full max-w-xs bg-[#0070ba] text-white py-3 px-6 rounded-full text-center text-sm font-bold cursor-pointer hover:bg-[#005ea6] transition-colors">
            PayPal로 결제
          </div>
          <p className="text-xs text-gray-400">PayPal 계정이 없으면 게스트로 결제하세요</p>
        </div>
      )}

      {/* WeChat / Alipay QR */}
      {(cart.payMethod === 'wechat' || cart.payMethod === 'alipay') && (
        <div className="flex flex-col items-center gap-4 py-6">
          <div className={`w-40 h-40 rounded-2xl flex items-center justify-center ${
            cart.payMethod === 'wechat' ? 'bg-green-50 border-2 border-green-200' : 'bg-blue-50 border-2 border-blue-200'
          }`}>
            {/* Mock QR pattern */}
            <div className="grid grid-cols-5 gap-0.5">
              {Array.from({ length: 25 }).map((_, i) => (
                <div key={i} className={`w-5 h-5 rounded-sm ${
                  [0,1,2,5,6,10,12,14,18,20,22,23,24,7,11,13,17].includes(i)
                    ? (cart.payMethod === 'wechat' ? 'bg-green-600' : 'bg-blue-600')
                    : 'bg-transparent'
                }`} />
              ))}
            </div>
          </div>
          <p className="text-sm font-medium text-gray-700">
            {cart.payMethod === 'wechat' ? 'WeChat Pay' : 'Alipay'} 앱으로 QR 코드를 스캔하세요
          </p>
          <p className="text-xs text-gray-400">결제 금액: {formatPrice(total)}</p>
        </div>
      )}

      {/* Terms */}
      <label className="flex items-start gap-2.5 cursor-pointer">
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 rounded text-blue-600 flex-shrink-0" />
        <p className="text-xs text-gray-500 leading-relaxed">
          <span className="text-gray-800 font-medium">이용약관</span> 및 <span className="text-gray-800 font-medium">개인정보 처리방침</span>에 동의하며, 예약 취소 및 환불 정책을 확인했습니다. 결제 완료 후 즉시 예약 확인서가 발급됩니다.
        </p>
      </label>

      {/* Pay button */}
      <button
        onClick={onPay}
        disabled={!canPay}
        className="w-full bg-blue-600 text-white py-4 rounded-2xl text-base font-bold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
      >
        <span>🔒</span>
        {formatPrice(total)} 안전 결제
      </button>
    </div>
  )
}

// ── Step 6: 완료 ───────────────────────────────────────────────────────────────
function StepDone({ cart }: { cart: CartState }) {
  const hospital = mockHospitals.find((h) => h.id === cart.hospitalId)
  const treatMin = cart.treatments.reduce((s, t) => s + t.priceMin, 0)
  const treatMax = cart.treatments.reduce((s, t) => s + t.priceMax, 0)
  const hotelTotal = cart.hotel ? cart.hotel.pricePerNight * cart.hotelNights : 0
  const interpTotal = cart.interpreter ? cart.interpreter.price : 0
  const vehicleTotal = cart.vehicle.price
  const grandMin = treatMin + hotelTotal + interpTotal + vehicleTotal
  const grandMax = treatMax + hotelTotal + interpTotal + vehicleTotal

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">✓</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">예약이 확정되었습니다!</h2>
        <p className="text-gray-500 text-sm">담당 코디네이터가 24시간 내 상세 안내를 드립니다.</p>
        <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full mt-3">
          <span className="text-xs text-gray-500">예약 번호</span>
          <span className="text-sm font-bold text-gray-900 font-mono">{cart.bookingRef}</span>
        </div>
      </div>

      {/* Booking details */}
      <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100 mb-6">
        {hospital && (
          <div className="flex items-center gap-3 p-4">
            <span className="text-gray-400 text-sm w-20 flex-shrink-0">병원</span>
            <span className="text-sm font-medium text-gray-900">{hospital.name}</span>
          </div>
        )}
        {cart.treatments.length > 0 && (
          <div className="flex items-start gap-3 p-4">
            <span className="text-gray-400 text-sm w-20 flex-shrink-0">시술</span>
            <div className="space-y-1">
              {cart.treatments.map((t) => (
                <p key={t.id} className="text-sm text-gray-900">{t.name}</p>
              ))}
            </div>
          </div>
        )}
        {cart.visitDate && (
          <div className="flex items-center gap-3 p-4">
            <span className="text-gray-400 text-sm w-20 flex-shrink-0">방문일</span>
            <span className="text-sm font-medium text-gray-900">{cart.visitDate}</span>
          </div>
        )}
        {cart.interpreter && (
          <div className="flex items-center gap-3 p-4">
            <span className="text-gray-400 text-sm w-20 flex-shrink-0">통역사</span>
            <span className="text-sm font-medium text-gray-900">{cart.interpreter.name} ({cart.interpreter.language})</span>
          </div>
        )}
        {cart.hotel && (
          <div className="flex items-center gap-3 p-4">
            <span className="text-gray-400 text-sm w-20 flex-shrink-0">숙소</span>
            <span className="text-sm font-medium text-gray-900">{cart.hotel.name} · {cart.hotelNights}박</span>
          </div>
        )}
        {cart.vehicle.price > 0 && (
          <div className="flex items-center gap-3 p-4">
            <span className="text-gray-400 text-sm w-20 flex-shrink-0">차량</span>
            <span className="text-sm font-medium text-gray-900">{cart.vehicle.label}</span>
          </div>
        )}
        <div className="flex items-center gap-3 p-4 bg-blue-50">
          <span className="text-gray-500 text-sm w-20 flex-shrink-0">결제 금액</span>
          <span className="text-base font-bold text-blue-700">
            {formatPrice(grandMin)}{grandMin !== grandMax ? ` ~ ${formatPrice(grandMax)}` : ''}
          </span>
        </div>
      </div>

      {/* Mock QR */}
      <div className="flex flex-col items-center gap-3 p-6 bg-gray-50 border border-gray-200 rounded-2xl mb-6">
        <p className="text-xs text-gray-500 font-medium">예약 확인 QR 코드</p>
        <div className="w-28 h-28 bg-white border border-gray-200 rounded-xl flex items-center justify-center p-2">
          <div className="grid grid-cols-5 gap-0.5 w-full h-full">
            {Array.from({ length: 25 }).map((_, i) => (
              <div key={i} className={`rounded-sm ${
                [0,1,2,3,4,5,9,10,14,15,19,20,21,22,23,24,6,12,18,7,11,17].includes(i)
                  ? 'bg-gray-900' : 'bg-transparent'
              }`} />
            ))}
          </div>
        </div>
        <p className="text-xs text-gray-400">병원 방문 시 제시</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
          예약 확인서 다운로드
        </button>
        <Link href="/patient" className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors text-center">
          환자 포털 이동
        </Link>
      </div>

      <p className="text-xs text-gray-400 text-center mt-4">
        문의: <span className="text-blue-600">support@koreamedmatch.com</span> · 카카오톡 @KMM
      </p>
    </div>
  )
}

// ── Quote Sidebar ─────────────────────────────────────────────────────────────
function QuoteSidebar({ cart, step, onBack, onNext, canNext }: {
  cart: CartState
  step: Step
  onBack: () => void
  onNext: () => void
  canNext: boolean
}) {
  const hospital = mockHospitals.find((h) => h.id === cart.hospitalId)
  const treatMin = cart.treatments.reduce((s, t) => s + t.priceMin, 0)
  const treatMax = cart.treatments.reduce((s, t) => s + t.priceMax, 0)
  const hotelTotal = cart.hotel ? cart.hotel.pricePerNight * cart.hotelNights : 0
  const interpTotal = cart.interpreter ? cart.interpreter.price : 0
  const vehicleTotal = cart.vehicle.price
  const grandMin = treatMin + hotelTotal + interpTotal + vehicleTotal
  const grandMax = treatMax + hotelTotal + interpTotal + vehicleTotal
  const stepIdx = STEP_ORDER.indexOf(step)

  return (
    <div className="w-72 flex-shrink-0">
      <div className="sticky top-24">
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-ink px-5 py-4">
            <p className="text-white font-bold text-sm">견적 요약</p>
            {hospital && <p className="text-blue-100 text-xs mt-0.5">{hospital.name}</p>}
          </div>

          <div className="p-5 space-y-3">
            {/* Treatments */}
            {cart.treatments.length > 0 ? (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">시술</p>
                {cart.treatments.map((t) => (
                  <div key={t.id} className="flex justify-between gap-2 text-xs py-1">
                    <span className="text-gray-600 truncate">{t.name}</span>
                    <span className="text-gray-800 whitespace-nowrap flex-shrink-0">{formatPrice(t.priceMin)}~</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-2">시술을 선택해 주세요</p>
            )}

            {/* Add-ons */}
            {(interpTotal > 0 || hotelTotal > 0 || vehicleTotal > 0) && (
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">추가 서비스</p>
                {cart.interpreter && (
                  <div className="flex justify-between text-xs py-1">
                    <span className="text-gray-600">통역사 ({cart.interpreter.language})</span>
                    <span className="text-gray-800">{formatPrice(interpTotal)}</span>
                  </div>
                )}
                {cart.hotel && hotelTotal > 0 && (
                  <div className="flex justify-between text-xs py-1">
                    <span className="text-gray-600">{cart.hotel.name} {cart.hotelNights}박</span>
                    <span className="text-gray-800">{formatPrice(hotelTotal)}</span>
                  </div>
                )}
                {vehicleTotal > 0 && (
                  <div className="flex justify-between text-xs py-1">
                    <span className="text-gray-600">{cart.vehicle.label}</span>
                    <span className="text-gray-800">{formatPrice(vehicleTotal)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Total */}
            {grandMin > 0 && (
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between items-end">
                  <span className="text-xs text-gray-500">예상 합계</span>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-700">{formatPrice(grandMin)}</p>
                    {grandMin !== grandMax && <p className="text-xs text-gray-400">~ {formatPrice(grandMax)}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {step !== 'done' && (
            <div className="px-5 pb-5 space-y-2">
              <button
                onClick={onNext}
                disabled={!canNext}
                className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {step === 'payment' ? '결제 진행' : '다음 단계 →'}
              </button>
              {stepIdx > 0 && (
                <button onClick={onBack} className="w-full text-sm text-gray-500 hover:text-gray-700 py-2">
                  ← 이전
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────
function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [step, setStep] = useState<Step>('summary')
  const [processing, setProcessing] = useState(false)

  const initialHospitalId = searchParams.get('hospitalId') ?? (mockHospitals[0]?.id ?? '')
  const initialTreatmentIds = (searchParams.get('treatments') ?? '').split(',').filter(Boolean)
  const hospital = mockHospitals.find((h) => h.id === initialHospitalId)
  const initialTreatments = hospital?.treatments.filter((t) => initialTreatmentIds.includes(t.id)) ?? []

  const [cart, setCart] = useState<CartState>({
    hospitalId: initialHospitalId,
    treatments: initialTreatments,
    visitDate: '',
    interpreter: null,
    needInterpreter: false,
    interpreterLang: '',
    hotel: null,
    hotelNights: 1,
    vehicle: VEHICLE_OPTIONS[0],
    patient: EMPTY_PATIENT,
    payMethod: 'card',
    bookingRef: '',
  })

  const stepIdx = STEP_ORDER.indexOf(step)

  const total =
    cart.treatments.reduce((s, t) => s + t.priceMin, 0) +
    (cart.interpreter ? cart.interpreter.price : 0) +
    (cart.hotel ? cart.hotel.pricePerNight * cart.hotelNights : 0) +
    cart.vehicle.price

  const canNext =
    step === 'summary' ? cart.treatments.length > 0 && !!cart.visitDate :
    step === 'interpreter' ? true :
    step === 'hotel' ? true :
    step === 'patient' ? !!(cart.patient.name && cart.patient.dob && cart.patient.nationality && cart.patient.phone && cart.patient.email) :
    step === 'payment' ? true : false

  function goNext() {
    const next = STEP_ORDER[stepIdx + 1]
    if (next) setStep(next)
  }

  function goBack() {
    const prev = STEP_ORDER[stepIdx - 1]
    if (prev) setStep(prev)
  }

  function handlePay() {
    setProcessing(true)
    setTimeout(() => {
      setCart((c) => ({ ...c, bookingRef: genRef() }))
      setProcessing(false)
      setStep('done')
    }, 2200)
  }

  if (processing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-700 font-medium">결제를 처리하는 중입니다...</p>
          <p className="text-sm text-gray-400">잠시만 기다려 주세요</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top progress bar */}
      {step !== 'done' && (
        <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
          <div className="max-w-5xl mx-auto px-4 py-3">
            <div className="flex items-center gap-1">
              {STEP_ORDER.map((s, i) => (
                <div key={s} className="flex items-center gap-1 flex-1 min-w-0">
                  <div className={`flex items-center gap-1.5 flex-shrink-0 ${
                    s === step ? 'text-blue-600' :
                    i < stepIdx ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      s === step ? 'bg-blue-600 text-white' :
                      i < stepIdx ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {i < stepIdx ? '✓' : i + 1}
                    </div>
                    <span className="text-xs font-medium whitespace-nowrap hidden sm:block">{STEP_LABELS[s]}</span>
                  </div>
                  {i < STEP_ORDER.length - 1 && (
                    <div className={`flex-1 h-px mx-1 ${i < stepIdx ? 'bg-green-400' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className={`max-w-5xl mx-auto px-4 py-8 ${step !== 'done' ? 'flex gap-6 items-start' : ''}`}>
        {/* Main content */}
        <div className={step !== 'done' ? 'flex-1 min-w-0' : 'w-full'}>
          {step !== 'done' && (
            <h2 className="text-xl font-bold text-gray-900 mb-6">{STEP_LABELS[step]}</h2>
          )}

          {step === 'summary' && <StepSummary cart={cart} setCart={setCart} />}
          {step === 'interpreter' && <StepInterpreter cart={cart} setCart={setCart} />}
          {step === 'hotel' && <StepHotelVehicle cart={cart} setCart={setCart} />}
          {step === 'patient' && <StepPatient cart={cart} setCart={setCart} />}
          {step === 'payment' && (
            <StepPayment cart={cart} setCart={setCart} total={total} onPay={handlePay} />
          )}
          {step === 'done' && <StepDone cart={cart} />}
        </div>

        {/* Sidebar */}
        {step !== 'done' && (
          <QuoteSidebar
            cart={cart}
            step={step}
            onBack={goBack}
            onNext={step === 'payment' ? handlePay : goNext}
            canNext={canNext}
          />
        )}
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
