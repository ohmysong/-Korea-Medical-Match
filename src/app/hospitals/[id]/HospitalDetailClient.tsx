'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { mockHospitals } from '@/lib/mock-data'
import type { Treatment } from '@/types'

type DetailTab = 'about' | 'doctors' | 'cost' | 'reviews' | 'interpreter'

const CATEGORY_LABEL: Record<string, string> = {
  disease: '질환', procedure: '시술', surgery: '수술', checkup: '검진',
}
const CATEGORY_STYLE: Record<string, string> = {
  disease: 'bg-orange-50 text-orange-700 border-orange-200',
  procedure: 'bg-purple-50 text-purple-700 border-purple-200',
  surgery: 'bg-red-50 text-red-700 border-red-200',
  checkup: 'bg-green-50 text-green-700 border-green-200',
}

function formatPrice(n: number) {
  if (n >= 10000000) return `${(n / 10000000).toFixed(0)}천만원`
  if (n >= 1000000) return `${(n / 1000000).toFixed(0)}백만원`
  if (n >= 10000) return `${(n / 10000).toFixed(0)}만원`
  return `${n.toLocaleString()}원`
}

// ── Mock Reviews ──────────────────────────────────────────────────────────────
const MOCK_REVIEWS = [
  {
    id: 1, name: 'Mohammed A.', nationality: 'UAE', flag: '🇦🇪', rating: 5,
    date: '2026-05-10', treatment: '척추 디스크 수술',
    content: '의료진이 매우 친절했고 러시아어·아랍어 통역 서비스도 완벽했습니다. 수술 결과에 매우 만족하며 가족에게도 강력 추천합니다.',
  },
  {
    id: 2, name: 'Natasha I.', nationality: '러시아', flag: '🇷🇺', rating: 5,
    date: '2026-04-22', treatment: '종합 건강검진',
    content: '영문 결과지를 당일 받을 수 있어서 좋았습니다. 시설이 매우 청결하고 현대적이었으며 코디네이터분이 처음부터 끝까지 동행해 주었습니다.',
  },
  {
    id: 3, name: 'Chen J.', nationality: '중국', flag: '🇨🇳', rating: 4,
    date: '2026-04-03', treatment: '인공관절치환술',
    content: '전반적으로 만족스러웠습니다. 입원 기간 동안 불편함 없이 치료받았습니다. 병원식이 맛있었습니다.',
  },
  {
    id: 4, name: 'Tanaka K.', nationality: '일본', flag: '🇯🇵', rating: 5,
    date: '2026-03-18', treatment: '라식/라섹',
    content: '기다림 없이 빠르게 수술이 진행되었습니다. 일본어 통역사가 모든 과정을 설명해 주어 불안함 없이 수술받을 수 있었습니다.',
  },
  {
    id: 5, name: 'Aisha R.', nationality: '카자흐스탄', flag: '🇰🇿', rating: 4,
    date: '2026-03-05', treatment: 'PRP 줄기세포 치료',
    content: '재생의학 치료를 받았는데 결과가 매우 좋습니다. 가격이 러시아보다 훨씬 합리적이고 의료 수준이 높습니다.',
  },
]

// ── Mock Interpreter Pool ─────────────────────────────────────────────────────
const INTERPRETER_POOL = [
  { id: 'i1', name: '이리나 킴', language: '러시아어', flag: '🇷🇺', rating: 4.8, cases: 245, specialties: ['정형외과', '척추', '재활'], available: true },
  { id: 'i2', name: '장하오', language: '중국어', flag: '🇨🇳', rating: 4.9, cases: 312, specialties: ['외과', '내과', '건강검진'], available: true },
  { id: 'i3', name: '모하마드 알리', language: '아랍어', flag: '🇸🇦', rating: 4.7, cases: 189, specialties: ['암센터', '심장외과'], available: true },
  { id: 'i4', name: '나라 바트', language: '몽골어', flag: '🇲🇳', rating: 4.9, cases: 421, specialties: ['성형외과', '피부과', '안과'], available: false },
  { id: 'i5', name: '다나카 유코', language: '일본어', flag: '🇯🇵', rating: 4.8, cases: 178, specialties: ['외과', '안과', '재생의학'], available: true },
  { id: 'i6', name: '김민준', language: '영어', flag: '🇺🇸', rating: 4.6, cases: 89, specialties: ['전 진료과'], available: true },
]

// ── Quote Calculator ──────────────────────────────────────────────────────────
function QuoteCalculator({ treatments, hospitalId }: { treatments: Treatment[]; hospitalId: string }) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())

  function toggleTreatment(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const selectedTreatments = treatments.filter((t) => selected.has(t.id))
  const totalMin = selectedTreatments.reduce((sum, t) => sum + t.priceMin, 0)
  const totalMax = selectedTreatments.reduce((sum, t) => sum + t.priceMax, 0)
  const hasSelection = selected.size > 0

  function goToCheckout() {
    const ids = [...selected].join(',')
    router.push(`/checkout?hospitalId=${hospitalId}&treatments=${ids}`)
  }

  return (
    <div className="flex gap-6 items-start">
      {/* Left: treatment list */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">시술 선택 (중복 가능)</h3>
        <div className="space-y-2">
          {treatments.map((t) => (
            <label key={t.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
              selected.has(t.id) ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}>
              <input
                type="checkbox"
                checked={selected.has(t.id)}
                onChange={() => toggleTreatment(t.id)}
                className="text-blue-600 rounded flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-1.5 py-0.5 rounded border ${CATEGORY_STYLE[t.category]}`}>
                    {CATEGORY_LABEL[t.category]}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{t.name}</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{t.duration} · 회복 {t.recovery}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-blue-700">{formatPrice(t.priceMin)}</p>
                <p className="text-xs text-gray-400">~ {formatPrice(t.priceMax)}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Right: summary */}
      <div className="w-60 flex-shrink-0 sticky top-32">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4">견적 요약</h3>

          {!hasSelection ? (
            <p className="text-xs text-gray-400 text-center py-6">시술을 선택하면<br />예상 비용을 볼 수 있습니다</p>
          ) : (
            <div className="space-y-2 mb-4">
              {selectedTreatments.map((t) => (
                <div key={t.id} className="flex justify-between gap-2 text-xs">
                  <span className="text-gray-600 truncate">{t.name}</span>
                  <span className="text-gray-800 whitespace-nowrap flex-shrink-0">{formatPrice(t.priceMin)}~</span>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-2 mt-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-gray-500">예상 합계</span>
                  <div className="text-right">
                    <p className="text-base font-bold text-blue-700">{formatPrice(totalMin)}</p>
                    <p className="text-xs text-gray-400">~ {formatPrice(totalMax)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={goToCheckout}
            disabled={!hasSelection}
            className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            예약 · 결제 진행 →
          </button>
          <p className="text-xs text-gray-400 text-center mt-2">통역·숙소·차량까지 한 번에</p>
        </div>
      </div>
    </div>
  )
}

// ── Reviews Tab ───────────────────────────────────────────────────────────────
function ReviewsTab() {
  const avg = (MOCK_REVIEWS.reduce((s, r) => s + r.rating, 0) / MOCK_REVIEWS.length).toFixed(1)
  const dist = [5, 4, 3, 2, 1].map((s) => ({
    star: s,
    count: MOCK_REVIEWS.filter((r) => r.rating === s).length,
    pct: Math.round((MOCK_REVIEWS.filter((r) => r.rating === s).length / MOCK_REVIEWS.length) * 100),
  }))

  return (
    <div>
      <h2 className="text-base font-bold text-gray-900 mb-5">환자 후기</h2>

      {/* Summary */}
      <div className="flex items-center gap-8 p-5 bg-blue-50 rounded-2xl mb-6 border border-blue-100">
        <div className="text-center">
          <p className="text-5xl font-bold text-blue-700">{avg}</p>
          <div className="flex gap-0.5 mt-1 justify-center">
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i} className={i <= Math.round(Number(avg)) ? 'text-yellow-400' : 'text-gray-200'}>★</span>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">{MOCK_REVIEWS.length}개 리뷰</p>
        </div>
        <div className="flex-1 space-y-1.5">
          {dist.map((d) => (
            <div key={d.star} className="flex items-center gap-2 text-xs">
              <span className="text-gray-500 w-3">{d.star}</span>
              <span className="text-yellow-400 text-xs">★</span>
              <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: `${d.pct}%` }} />
              </div>
              <span className="text-gray-400 w-6 text-right">{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review list */}
      <div className="space-y-4">
        {MOCK_REVIEWS.map((r) => (
          <div key={r.id} className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-base flex-shrink-0">
                  {r.flag}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{r.name}</p>
                  <p className="text-xs text-gray-400">{r.nationality} · {r.date}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i} className={i <= r.rating ? 'text-yellow-400 text-sm' : 'text-gray-200 text-sm'}>★</span>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">시술: {r.treatment}</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{r.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Interpreter Tab ───────────────────────────────────────────────────────────
type MatchPhase = 'idle' | 'loading' | 'matched'

function InterpreterTab() {
  const [phase, setPhase] = useState<MatchPhase>('idle')
  const [selectedLang, setSelectedLang] = useState('')
  const [matchedId, setMatchedId] = useState<string | null>(null)
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  async function handleMatch() {
    if (!selectedLang) return
    setPhase('loading')
    setMatchedId(null)
    await new Promise((r) => setTimeout(r, 2200))
    const match = INTERPRETER_POOL.find((i) => i.language === selectedLang && i.available)
    setMatchedId(match?.id ?? INTERPRETER_POOL.find((i) => i.available)?.id ?? null)
    setPhase('matched')
  }

  function handleRequest(name: string) {
    showToast(`${name} 통역사 배정을 요청했습니다. 코디네이터가 확인 후 연락드립니다.`)
  }

  const matchedInterpreter = INTERPRETER_POOL.find((i) => i.id === matchedId)

  return (
    <div>
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      <h2 className="text-base font-bold text-gray-900 mb-1">통역 서비스</h2>
      <p className="text-sm text-gray-500 mb-6">언어를 선택하면 AI가 최적의 통역사를 자동 매칭합니다</p>

      {/* AI Matching */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">AI</span>
          </div>
          <p className="text-sm font-bold text-gray-900">AI 통역사 자동 매칭</p>
        </div>

        <div className="flex gap-3 mb-4">
          <select
            value={selectedLang}
            onChange={(e) => { setSelectedLang(e.target.value); setPhase('idle'); setMatchedId(null) }}
            className="flex-1 border border-blue-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 bg-white"
          >
            <option value="">언어 선택</option>
            {Array.from(new Set(INTERPRETER_POOL.map((i) => i.language))).map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <button
            onClick={handleMatch}
            disabled={!selectedLang || phase === 'loading'}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {phase === 'loading' ? <><span className="animate-spin">◌</span> 매칭 중...</> : '통역사 매칭 요청'}
          </button>
        </div>

        {phase === 'loading' && (
          <div className="bg-white rounded-xl p-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32" />
                <div className="h-3 bg-gray-100 rounded w-48" />
              </div>
            </div>
          </div>
        )}

        {phase === 'matched' && matchedInterpreter && (
          <div className="bg-white rounded-2xl p-4 border border-green-200">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xl">{matchedInterpreter.name[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-gray-900">{matchedInterpreter.name}</p>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium border border-green-200">
                    ✓ AI 매칭
                  </span>
                  <span className="text-base">{matchedInterpreter.flag}</span>
                </div>
                <p className="text-sm text-blue-600 font-medium mb-1">{matchedInterpreter.language} 전문</p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>★ {matchedInterpreter.rating}</span>
                  <span>담당 {matchedInterpreter.cases}건</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {matchedInterpreter.specialties.map((s) => (
                    <span key={s} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => handleRequest(matchedInterpreter.name)}
                className="flex-shrink-0 bg-blue-600 text-white text-sm px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors"
              >
                배정 요청
              </button>
            </div>
          </div>
        )}

        {phase === 'matched' && !matchedInterpreter && (
          <div className="bg-white rounded-xl p-4 text-center">
            <p className="text-sm text-gray-500">해당 언어의 가용 통역사가 없습니다. 코디네이터에게 문의해 주세요.</p>
          </div>
        )}
      </div>

      {/* All interpreters */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">전체 통역사 목록</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {INTERPRETER_POOL.map((interpreter) => (
            <div key={interpreter.id} className={`border rounded-2xl p-4 flex items-start gap-3 ${
              interpreter.available ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'
            }`}>
              <div className="w-11 h-11 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">{interpreter.name[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-gray-900">{interpreter.name}</p>
                  <span className="text-base">{interpreter.flag}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    interpreter.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {interpreter.available ? '가용' : '예약중'}
                  </span>
                </div>
                <p className="text-xs text-blue-600">{interpreter.language}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                  <span>★ {interpreter.rating}</span>
                  <span>·</span>
                  <span>담당 {interpreter.cases}건</span>
                </div>
              </div>
              {interpreter.available && (
                <button
                  onClick={() => handleRequest(interpreter.name)}
                  className="text-xs border border-blue-200 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 flex-shrink-0"
                >
                  요청
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function HospitalDetailClient({ id }: { id: string }) {
  const hospital = mockHospitals.find((h) => h.id === id)
  const [activeTab, setActiveTab] = useState<DetailTab>('about')

  if (!hospital) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-2">병원 정보를 찾을 수 없습니다.</p>
          <Link href="/hospitals" className="text-blue-600 text-sm hover:underline">병원 목록으로 돌아가기</Link>
        </div>
      </div>
    )
  }

  const TABS: { id: DetailTab; label: string }[] = [
    { id: 'about', label: '소개' },
    { id: 'doctors', label: `의료진 (${hospital.doctors.length})` },
    { id: 'cost', label: `비용·견적 (${hospital.treatments.length})` },
    { id: 'reviews', label: `후기 (${MOCK_REVIEWS.length})` },
    { id: 'interpreter', label: '통역' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-blue-600">홈</Link>
          <span>/</span>
          <Link href="/hospitals" className="hover:text-blue-600">병원 검색</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{hospital.name}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Hospital header */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-6 shadow-sm">
          {/* Banner */}
          <div className="h-40 bg-gradient-to-br from-blue-600 to-blue-900 relative overflow-hidden flex items-end">
            <span className="absolute right-8 top-1/2 -translate-y-1/2 text-white font-bold text-9xl opacity-10 select-none">
              {hospital.name[0]}
            </span>
            <div className="relative z-10 p-6 w-full flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-2xl font-bold text-white">{hospital.name}</h1>
                  <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/30">
                    {hospital.type}
                  </span>
                  {hospital.internationalDept && (
                    <span className="text-xs bg-green-400/80 text-white px-2 py-0.5 rounded-full">
                      국제진료팀
                    </span>
                  )}
                </div>
                <p className="text-blue-200 text-sm">{hospital.nameEn}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1 justify-end">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i} className={i <= Math.floor(hospital.rating) ? 'text-yellow-300' : 'text-white/20'}>★</span>
                  ))}
                  <span className="font-bold text-white ml-1">{hospital.rating}</span>
                </div>
                <p className="text-sm text-blue-200">리뷰 {hospital.reviewCount.toLocaleString()}개</p>
              </div>
            </div>
          </div>

          {/* Info grid */}
          <div className="p-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4 border-b border-gray-100 mb-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">주소</p>
                <p className="text-sm text-gray-700 leading-snug">{hospital.address}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">전화</p>
                <p className="text-sm text-gray-800 font-medium">{hospital.phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">이메일</p>
                <p className="text-sm text-blue-600 break-all">{hospital.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">{hospital.bedCount ? '병상 수' : '위치'}</p>
                <p className="text-sm text-gray-700 font-medium">
                  {hospital.bedCount ? `${hospital.bedCount.toLocaleString()}병상` : `${hospital.location} · ${hospital.district}`}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-400 font-medium">인증</span>
                {hospital.accreditations.map((acc) => (
                  <span key={acc} className="text-xs bg-green-50 border border-green-200 text-green-700 px-2 py-0.5 rounded">
                    ✓ {acc}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-400 font-medium">지원 언어</span>
                {hospital.languages.map((lang) => (
                  <span key={lang} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{lang}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50/30'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* 소개 */}
            {activeTab === 'about' && (
              <div>
                <h2 className="text-base font-bold text-gray-900 mb-3">병원 소개</h2>
                <p className="text-gray-700 leading-relaxed mb-6">{hospital.description}</p>

                <h3 className="text-sm font-semibold text-gray-900 mb-3">주요 진료과목</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {hospital.specialties.map((s) => (
                    <Link key={s} href={`/hospitals?specialty=${encodeURIComponent(s)}`}
                      className="bg-blue-50 text-blue-700 border border-blue-200 text-sm px-3 py-1 rounded-full hover:bg-blue-100">
                      {s}
                    </Link>
                  ))}
                </div>

                <h3 className="text-sm font-semibold text-gray-900 mb-3">인증 현황</h3>
                <div className="flex flex-wrap gap-2">
                  {hospital.accreditations.map((acc) => (
                    <div key={acc} className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                      <span className="text-green-600">✓</span>
                      <span className="text-sm text-green-800 font-medium">{acc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 의료진 */}
            {activeTab === 'doctors' && (
              <div>
                <h2 className="text-base font-bold text-gray-900 mb-4">의료진</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hospital.doctors.map((doctor, i) => (
                    <div key={i} className="border border-gray-200 rounded-2xl p-5 hover:border-gray-300 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {doctor.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{doctor.name}</p>
                          <p className="text-sm text-blue-600">{doctor.specialty}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 leading-relaxed">{doctor.career}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-gray-400">언어:</span>
                        {doctor.languages.map((lang) => (
                          <span key={lang} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{lang}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 비용·견적 */}
            {activeTab === 'cost' && (
              <div>
                <h2 className="text-base font-bold text-gray-900 mb-1">비용 · 견적 계산기</h2>
                <p className="text-xs text-gray-400 mb-5">
                  시술을 선택하고 부가 서비스를 추가하면 예상 총 비용을 확인할 수 있습니다.
                  ※ 실제 비용은 진료 후 확정됩니다.
                </p>
                <QuoteCalculator treatments={hospital.treatments} hospitalId={id} />
              </div>
            )}

            {/* 후기 */}
            {activeTab === 'reviews' && <ReviewsTab />}

            {/* 통역 */}
            {activeTab === 'interpreter' && <InterpreterTab />}
          </div>
        </div>
      </div>
    </div>
  )
}
