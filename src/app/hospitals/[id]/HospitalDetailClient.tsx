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

const sectionTitle = 'text-[18px] font-bold tracking-[-0.02em] text-ink'

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

  const primaryBtn =
    'h-11 rounded-md bg-brand text-[14px] font-semibold text-white transition-colors duration-150 hover:bg-brand-hover active:bg-brand-press disabled:cursor-not-allowed disabled:bg-line disabled:text-subtle'

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-8">
      {/* Left: treatment list */}
      <div className="min-w-0">
        <p className="mb-3 text-[13px] font-semibold text-muted">
          시술 선택 <span className="font-normal text-subtle">(중복 가능)</span>
        </p>
        <div className="divide-y divide-line overflow-hidden rounded-lg border border-line">
          {treatments.map((t) => {
            const on = selected.has(t.id)
            return (
              <label
                key={t.id}
                className={`flex cursor-pointer items-center gap-3.5 px-4 py-3.5 transition-colors duration-150 ${
                  on ? 'bg-brand-soft' : 'bg-surface hover:bg-canvas'
                }`}
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => toggleTreatment(t.id)}
                  className="h-4 w-4 shrink-0 accent-brand"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="shrink-0 text-[11px] font-semibold text-muted">{CATEGORY_LABEL[t.category]}</span>
                    <span className={`text-[14px] font-medium ${on ? 'text-brand' : 'text-ink'}`}>{t.name}</span>
                  </div>
                  <p className="mt-0.5 text-[12px] text-subtle">{t.duration} · 회복 {t.recovery}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="tabular text-[14px] font-semibold text-ink">{formatPrice(t.priceMin)}</p>
                  <p className="tabular text-[12px] text-subtle">~ {formatPrice(t.priceMax)}</p>
                </div>
              </label>
            )
          })}
        </div>
      </div>

      {/* Right: summary (desktop) */}
      <div className="sticky top-[8.5rem] hidden lg:block">
        <div className="rounded-lg border border-line bg-surface p-5">
          <h3 className="mb-3 text-[14px] font-semibold text-ink">견적 요약</h3>
          {!hasSelection ? (
            <p className="py-6 text-center text-[13px] leading-relaxed text-subtle">
              시술을 선택하면<br />예상 비용을 볼 수 있습니다
            </p>
          ) : (
            <div className="mb-4">
              <ul className="space-y-1.5">
                {selectedTreatments.map((t) => (
                  <li key={t.id} className="flex justify-between gap-3 text-[13px]">
                    <span className="truncate text-ink-2">{t.name}</span>
                    <span className="tabular shrink-0 whitespace-nowrap text-ink">{formatPrice(t.priceMin)}~</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
                <span className="text-[13px] text-muted">예상 합계</span>
                <div className="text-right">
                  <p className="tabular text-[20px] font-bold tracking-[-0.02em] text-ink">{formatPrice(totalMin)}</p>
                  <p className="tabular text-[12px] text-subtle">~ {formatPrice(totalMax)}</p>
                </div>
              </div>
            </div>
          )}
          <button onClick={goToCheckout} disabled={!hasSelection} className={`w-full ${primaryBtn}`}>
            예약 · 결제 진행
          </button>
          <p className="mt-2 text-center text-[12px] text-subtle">통역·숙소·차량까지 한 번에</p>
        </div>
      </div>

      {/* Summary bar (mobile) */}
      <div className="sticky bottom-0 -mx-5 -mb-5 border-t border-line bg-surface px-5 py-3 sm:-mx-8 sm:-mb-8 sm:px-8 lg:hidden">
        <div className="flex items-center gap-4">
          <div className="min-w-0 flex-1">
            {hasSelection ? (
              <>
                <p className="text-[12px] text-muted">예상 합계 · {selected.size}개 선택</p>
                <p className="tabular text-[17px] font-bold text-ink">
                  {formatPrice(totalMin)}{' '}
                  <span className="text-[13px] font-normal text-subtle">~ {formatPrice(totalMax)}</span>
                </p>
              </>
            ) : (
              <p className="text-[13px] text-subtle">시술을 선택해 주세요</p>
            )}
          </div>
          <button onClick={goToCheckout} disabled={!hasSelection} className={`shrink-0 px-5 ${primaryBtn}`}>
            예약 · 결제 진행
          </button>
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
      <h2 className={`mb-5 ${sectionTitle}`}>환자 후기</h2>

      {/* Summary */}
      <div className="grid gap-6 border-b border-line pb-6 sm:grid-cols-[auto_minmax(0,22rem)] sm:items-center sm:gap-12">
        <div>
          <p className="tabular text-[44px] font-bold leading-none tracking-[-0.03em] text-ink">{avg}</p>
          <p className="mt-2 text-[14px]" aria-label={`평균 ${avg}점`}>
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i} aria-hidden className={i <= Math.round(Number(avg)) ? 'text-accent' : 'text-line-strong'}>★</span>
            ))}
          </p>
          <p className="mt-1 text-[12px] text-subtle">{MOCK_REVIEWS.length}개 리뷰</p>
        </div>
        <div className="space-y-1.5">
          {dist.map((d) => (
            <div key={d.star} className="flex items-center gap-3 text-[12px]">
              <span className="tabular w-6 text-muted">{d.star}점</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-wash">
                <div className="h-1.5 rounded-full bg-ink" style={{ width: `${d.pct}%` }} />
              </div>
              <span className="tabular w-4 text-right text-subtle">{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review list */}
      <ul className="divide-y divide-line">
        {MOCK_REVIEWS.map((r) => (
          <li key={r.id} className="py-5">
            <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p className="text-[14px] font-semibold text-ink">
                {r.name}
                <span className="ml-2 text-[13px] font-normal text-muted">
                  <span aria-hidden>{r.flag}</span> {r.nationality}
                </span>
              </p>
              <p className="tabular text-[12px] text-subtle">{r.date}</p>
            </div>
            <p className="mb-2.5 text-[12px]">
              <span className="text-accent" aria-label={`${r.rating}점`}>
                {'★'.repeat(r.rating)}
                <span className="text-line-strong">{'★'.repeat(5 - r.rating)}</span>
              </span>
              <span className="text-muted"> · 시술: {r.treatment}</span>
            </p>
            <p className="max-w-[44rem] text-[14px] leading-[1.7] text-ink-2">{r.content}</p>
          </li>
        ))}
      </ul>
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
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-md bg-ink px-4 py-3 text-[14px] text-white shadow-raise"
        >
          {toast}
        </div>
      )}

      <h2 className={sectionTitle}>통역 서비스</h2>
      <p className="mb-6 mt-1 text-[14px] text-muted">언어를 선택하면 AI가 최적의 통역사를 자동 매칭합니다</p>

      {/* AI Matching */}
      <div className="mb-8 rounded-lg border border-line bg-canvas p-5">
        <p className="mb-3 flex items-center gap-2 text-[14px] font-semibold text-ink">
          <span className="rounded-sm bg-ink px-1.5 py-0.5 text-[11px] font-bold text-white">AI</span>
          통역사 자동 매칭
        </p>

        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            aria-label="언어 선택"
            value={selectedLang}
            onChange={(e) => { setSelectedLang(e.target.value); setPhase('idle'); setMatchedId(null) }}
            className="h-11 flex-1 rounded-md border border-line-strong bg-surface px-3 text-[14px] text-ink outline-none hover:border-subtle focus:border-brand focus:shadow-[0_0_0_3px_var(--color-brand-soft)]"
          >
            <option value="">언어 선택</option>
            {Array.from(new Set(INTERPRETER_POOL.map((i) => i.language))).map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <button
            onClick={handleMatch}
            disabled={!selectedLang || phase === 'loading'}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-brand px-5 text-[14px] font-semibold text-white transition-colors duration-150 hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-line disabled:text-subtle"
          >
            {phase === 'loading' ? (
              <>
                <span aria-hidden className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                매칭 중
              </>
            ) : '통역사 매칭 요청'}
          </button>
        </div>

        {phase === 'loading' && (
          <div className="mt-4 animate-pulse rounded-md border border-line bg-surface p-4" aria-busy="true">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-wash" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-32 rounded-sm bg-wash" />
                <div className="h-3 w-48 rounded-sm bg-wash" />
              </div>
            </div>
          </div>
        )}

        {phase === 'matched' && matchedInterpreter && (
          <div className="mt-4 rounded-md border border-line bg-surface p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="flex min-w-0 flex-1 items-start gap-3.5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-soft text-[15px] font-semibold text-brand">
                  {matchedInterpreter.name[0]}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[15px] font-semibold text-ink">{matchedInterpreter.name}</p>
                    <span className="rounded-sm bg-success-soft px-1.5 py-0.5 text-[11px] font-semibold text-success">AI 매칭</span>
                  </div>
                  <p className="mt-0.5 text-[13px] text-ink-2">
                    <span aria-hidden>{matchedInterpreter.flag}</span> {matchedInterpreter.language} 전문
                    <span className="tabular text-subtle"> · ★ {matchedInterpreter.rating} · 담당 {matchedInterpreter.cases}건</span>
                  </p>
                  <p className="mt-1.5 text-[12px] text-muted">{matchedInterpreter.specialties.join(' · ')}</p>
                </div>
              </div>
              <button
                onClick={() => handleRequest(matchedInterpreter.name)}
                className="h-10 shrink-0 rounded-md bg-brand px-5 text-[14px] font-semibold text-white transition-colors duration-150 hover:bg-brand-hover"
              >
                배정 요청
              </button>
            </div>
          </div>
        )}

        {phase === 'matched' && !matchedInterpreter && (
          <p className="mt-4 rounded-md border border-line bg-surface p-4 text-center text-[14px] text-muted">
            해당 언어의 가용 통역사가 없습니다. 코디네이터에게 문의해 주세요.
          </p>
        )}
      </div>

      {/* All interpreters */}
      <h3 className="mb-2 text-[13px] font-semibold text-muted">전체 통역사 목록</h3>
      <ul className="divide-y divide-line border-y border-line">
        {INTERPRETER_POOL.map((interpreter) => (
          <li key={interpreter.id} className={`flex items-center gap-3.5 py-3.5 ${interpreter.available ? '' : 'opacity-55'}`}>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-wash text-[13px] font-semibold text-ink-2">
              {interpreter.name[0]}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium text-ink">
                {interpreter.name}
                <span className="ml-2 text-[13px] font-normal text-muted">
                  <span aria-hidden>{interpreter.flag}</span> {interpreter.language}
                </span>
              </p>
              <p className="tabular mt-0.5 text-[12px] text-subtle">★ {interpreter.rating} · 담당 {interpreter.cases}건</p>
            </div>
            <span className={`inline-flex shrink-0 items-center gap-1.5 text-[12px] font-medium ${interpreter.available ? 'text-success' : 'text-subtle'}`}>
              <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${interpreter.available ? 'bg-success' : 'bg-line-strong'}`} />
              {interpreter.available ? '가용' : '예약중'}
            </span>
            {interpreter.available && (
              <button
                onClick={() => handleRequest(interpreter.name)}
                className="h-8 shrink-0 rounded-md border border-line-strong px-3 text-[13px] font-medium text-ink transition-colors duration-150 hover:border-ink hover:bg-wash"
              >
                요청
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function HospitalDetailClient({ id }: { id: string }) {
  const hospital = mockHospitals.find((h) => h.id === id)
  const [activeTab, setActiveTab] = useState<DetailTab>('about')

  if (!hospital) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[16px] font-semibold text-ink">병원 정보를 찾을 수 없습니다.</p>
          <Link href="/hospitals" className="mt-3 inline-block text-[14px] font-medium text-brand hover:text-brand-hover">
            병원 목록으로 돌아가기
          </Link>
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

  const minPrice = hospital.treatments.length ? Math.min(...hospital.treatments.map((t) => t.priceMin)) : null

  return (
    <div className="min-h-screen bg-canvas">
      <div className="border-b border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav aria-label="경로" className="flex items-center gap-1.5 pt-5 text-[13px] text-subtle">
            <Link href="/" className="hover:text-ink">홈</Link>
            <span aria-hidden>/</span>
            <Link href="/hospitals" className="hover:text-ink">병원 검색</Link>
            <span aria-hidden>/</span>
            <span className="truncate text-ink-2" aria-current="page">{hospital.name}</span>
          </nav>

          {/* Hospital header */}
          <div className="grid gap-8 pb-8 pt-6 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-12">
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-medium text-muted">
                {hospital.type}
                <span aria-hidden className="text-line-strong">|</span>
                {hospital.location} {hospital.district}
                {hospital.internationalDept && (
                  <>
                    <span aria-hidden className="text-line-strong">|</span>
                    <span className="inline-flex items-center gap-1.5 text-success">
                      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-success" />
                      국제진료팀
                    </span>
                  </>
                )}
              </p>
              <h1 className="mt-3 text-[28px] font-bold leading-tight tracking-[-0.03em] text-ink sm:text-[34px]">
                {hospital.name}
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px]">
                <span className="text-muted">{hospital.nameEn}</span>
                <span className="tabular inline-flex items-center gap-1">
                  <span aria-hidden className="text-accent">★</span>
                  <span className="font-semibold text-ink">{hospital.rating}</span>
                  <span className="text-subtle">· 리뷰 {hospital.reviewCount.toLocaleString()}개</span>
                </span>
              </div>

              <dl className="mt-7 grid grid-cols-1 gap-x-8 gap-y-4 border-t border-line pt-5 text-[14px] sm:grid-cols-2 lg:grid-cols-[1.2fr_0.9fr_1.5fr_0.7fr]">
                <div className="sm:col-span-2 lg:col-span-1">
                  <dt className="text-[12px] text-subtle">주소</dt>
                  <dd className="mt-1 leading-snug text-ink-2">{hospital.address}</dd>
                </div>
                <div>
                  <dt className="text-[12px] text-subtle">전화</dt>
                  <dd className="tabular mt-1 font-medium text-ink">{hospital.phone}</dd>
                </div>
                <div>
                  <dt className="text-[12px] text-subtle">이메일</dt>
                  <dd className="mt-1 break-all text-ink-2">{hospital.email}</dd>
                </div>
                <div>
                  <dt className="text-[12px] text-subtle">{hospital.bedCount ? '병상 수' : '위치'}</dt>
                  <dd className="tabular mt-1 font-medium text-ink">
                    {hospital.bedCount ? `${hospital.bedCount.toLocaleString()}병상` : `${hospital.location} · ${hospital.district}`}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-[12px] text-subtle">인증</dt>
                  <dd className="mt-1 flex flex-wrap gap-1.5">
                    {hospital.accreditations.map((acc) => (
                      <span key={acc} className="rounded-sm border border-line px-1.5 py-0.5 text-[12px] font-medium text-ink-2">{acc}</span>
                    ))}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-[12px] text-subtle">지원 언어</dt>
                  <dd className="mt-1 text-ink-2">{hospital.languages.join(' · ')}</dd>
                </div>
              </dl>
            </div>

            {/* Action column */}
            <aside className="self-start rounded-lg border border-line p-5">
              {minPrice !== null && (
                <>
                  <p className="text-[12px] text-subtle">최저 시술비</p>
                  <p className="tabular mt-0.5 text-[24px] font-bold tracking-[-0.02em] text-ink">
                    {formatPrice(minPrice)}
                    <span className="ml-0.5 text-[15px] font-medium text-muted">~</span>
                  </p>
                  <p className="mt-1 text-[12px] text-subtle">실제 비용은 진료 후 확정됩니다</p>
                </>
              )}
              <div className="mt-4 grid gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('cost')}
                  className="h-11 rounded-md bg-brand text-[14px] font-semibold text-white transition-colors duration-150 hover:bg-brand-hover active:bg-brand-press"
                >
                  비용 · 견적 계산
                </button>
                <Link
                  href={`/checkout?hospitalId=${hospital.id}`}
                  className="inline-flex h-11 items-center justify-center rounded-md border border-line-strong text-[14px] font-medium text-ink transition-colors duration-150 hover:border-ink hover:bg-wash"
                >
                  매칭하기
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="z-30 border-b border-line bg-surface lg:sticky lg:top-16">
        <div role="tablist" aria-label="병원 정보" className="scroll-row mx-auto flex max-w-6xl overflow-x-auto px-4 sm:px-6 lg:px-8">
          {TABS.map((tab, i) => {
            const selected = activeTab === tab.id
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveTab(tab.id)}
                className={`relative shrink-0 whitespace-nowrap px-4 py-3.5 text-[14px] font-medium transition-colors duration-150 first:pl-0 ${
                  selected ? 'text-ink' : 'text-muted hover:text-ink'
                }`}
              >
                {tab.label}
                <span
                  aria-hidden
                  className={`absolute bottom-0 right-4 h-[2px] bg-ink transition-opacity duration-150 ${i === 0 ? 'left-0' : 'left-4'} ${
                    selected ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </button>
            )
          })}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-6 lg:px-8 lg:pt-10">
        <div className="rounded-lg border border-line bg-surface p-5 sm:p-8">
          {/* 소개 */}
          {activeTab === 'about' && (
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-16">
              <div>
                <h2 className={sectionTitle}>병원 소개</h2>
                <p className="mt-3 max-w-[42rem] text-[15px] leading-[1.8] text-ink-2">{hospital.description}</p>
              </div>
              <div className="space-y-8">
                <section>
                  <h3 className="border-b border-line pb-2 text-[13px] font-semibold text-muted">주요 진료과목</h3>
                  <ul className="divide-y divide-line">
                    {hospital.specialties.map((s) => (
                      <li key={s}>
                        <Link
                          href={`/hospitals?specialty=${encodeURIComponent(s)}`}
                          className="group flex items-center justify-between py-2.5 text-[14px] text-ink transition-colors duration-150 hover:text-brand"
                        >
                          {s}
                          <span aria-hidden className="text-subtle transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-brand">→</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
                <section>
                  <h3 className="border-b border-line pb-2 text-[13px] font-semibold text-muted">인증 현황</h3>
                  <ul className="divide-y divide-line">
                    {hospital.accreditations.map((acc) => (
                      <li key={acc} className="flex items-center gap-2.5 py-2.5 text-[14px] text-ink">
                        <svg aria-hidden width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-success">
                          <path d="m3 8.5 3 3 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {acc}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </div>
          )}

          {/* 의료진 */}
          {activeTab === 'doctors' && (
            <div>
              <h2 className={`mb-2 ${sectionTitle}`}>의료진</h2>
              <ul className="divide-y divide-line">
                {hospital.doctors.map((doctor, i) => (
                  <li key={i} className="grid gap-3 py-5 sm:grid-cols-[14rem_minmax(0,1fr)] sm:gap-8">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-wash text-[14px] font-semibold text-ink-2">
                        {doctor.name[0]}
                      </span>
                      <div>
                        <p className="text-[15px] font-semibold text-ink">{doctor.name}</p>
                        <p className="text-[13px] text-muted">{doctor.specialty}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[14px] leading-[1.7] text-ink-2">{doctor.career}</p>
                      <p className="mt-2 text-[12px] text-subtle">
                        진료 언어 <span className="ml-1 text-ink-2">{doctor.languages.join(', ')}</span>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 비용·견적 */}
          {activeTab === 'cost' && (
            <div>
              <h2 className={sectionTitle}>비용 · 견적 계산기</h2>
              <p className="mb-6 mt-1 text-[13px] text-muted">
                시술을 선택하고 부가 서비스를 추가하면 예상 총 비용을 확인할 수 있습니다.
                <span className="text-subtle"> ※ 실제 비용은 진료 후 확정됩니다.</span>
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
  )
}
