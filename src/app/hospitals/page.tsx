'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { mockHospitals, LOCATIONS, SPECIALTIES, LANGUAGES } from '@/lib/mock-data'
import type { Hospital, SearchTab, SortOption } from '@/types'

const HOSPITAL_TYPES = ['상급종합병원', '종합병원', '전문병원', '의원', '한방병원']

const PRICE_RANGES = [
  { label: '전체', min: 0, max: Infinity },
  { label: '~100만원', min: 0, max: 1000000 },
  { label: '100~500만원', min: 1000000, max: 5000000 },
  { label: '500만원~1천만원', min: 5000000, max: 10000000 },
  { label: '1천만원 이상', min: 10000000, max: Infinity },
]

const SEARCH_TABS: { id: SearchTab; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'disease', label: '질환' },
  { id: 'procedure', label: '시술' },
  { id: 'surgery', label: '수술' },
  { id: 'checkup', label: '건강검진' },
]

const VALID_TABS: SearchTab[] = ['all', 'disease', 'procedure', 'surgery', 'checkup']

const CATEGORY_LABEL: Record<string, string> = {
  disease: '질환', procedure: '시술', surgery: '수술', checkup: '검진',
}

function formatPrice(n: number) {
  if (n >= 10000000) return `${(n / 10000000).toFixed(0)}천만원`
  if (n >= 1000000) return `${(n / 1000000).toFixed(0)}백만원`
  if (n >= 10000) return `${(n / 10000).toFixed(0)}만원`
  return `${n.toLocaleString()}원`
}

function formatMinPrice(hospital: Hospital) {
  const prices = hospital.treatments.map((t) => t.priceMin)
  if (prices.length === 0) return null
  return formatPrice(Math.min(...prices))
}

/* ───────────────────────── Presentation ───────────────────────── */

function Star() {
  return (
    <svg aria-hidden width="12" height="12" viewBox="0 0 12 12" className="text-accent">
      <path fill="currentColor" d="M6 .8l1.55 3.25 3.55.45-2.6 2.45.66 3.52L6 8.75 2.84 10.47l.66-3.52L.9 4.5l3.55-.45z" />
    </svg>
  )
}

function HospitalRow({ hospital }: { hospital: Hospital }) {
  const router = useRouter()
  const minPrice = formatMinPrice(hospital)
  const extraSpecialties = hospital.specialties.length - 4
  const extraTreatments = hospital.treatments.length - 3

  return (
    <article className="group grid gap-5 rounded-lg border border-line bg-surface p-5 transition-[border-color,box-shadow] duration-200 hover:border-line-strong hover:shadow-raise sm:p-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_11rem] lg:gap-8">
      {/* 1 · Identity */}
      <div className="min-w-0">
        <p className="text-[12px] font-medium text-muted">
          {hospital.type} · {hospital.location} {hospital.district}
          {hospital.bedCount && <span className="tabular"> · {hospital.bedCount.toLocaleString()}병상</span>}
        </p>
        <h2 className="mt-2 text-[18px] font-bold leading-snug tracking-[-0.025em] text-ink">
          <Link href={`/hospitals/${hospital.id}`} className="hover:text-brand">
            {hospital.name}
          </Link>
        </h2>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[13px]">
          <span className="text-subtle">{hospital.nameEn}</span>
          <span className="tabular inline-flex items-center gap-1">
            <Star />
            <span className="font-semibold text-ink">{hospital.rating}</span>
            <span className="text-subtle">({hospital.reviewCount.toLocaleString()})</span>
          </span>
        </div>
        <p className="mt-3 line-clamp-2 text-[14px] leading-[1.65] text-ink-2">{hospital.description}</p>
        {(hospital.internationalDept || hospital.accreditations.length > 0) && (
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]">
            {hospital.internationalDept && (
              <span className="inline-flex items-center gap-1.5 font-medium text-success">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-success" />
                국제진료팀
              </span>
            )}
            {hospital.accreditations.slice(0, 1).map((acc) => (
              <span key={acc} className="rounded-sm border border-line px-1.5 py-px font-medium text-ink-2">
                {acc}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 2 · What they treat */}
      <dl className="min-w-0 space-y-3 border-t border-line pt-4 text-[13px] lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
        <div>
          <dt className="text-[12px] text-subtle">전문 분야</dt>
          <dd className="mt-1 text-ink-2">
            {hospital.specialties.slice(0, 4).join(' · ')}
            {extraSpecialties > 0 && <span className="text-subtle"> 외 {extraSpecialties}</span>}
          </dd>
        </div>
        {hospital.treatments.length > 0 && (
          <div>
            <dt className="text-[12px] text-subtle">주요 시술</dt>
            <dd className="mt-1">
              <ul className="space-y-1">
                {hospital.treatments.slice(0, 3).map((t) => (
                  <li key={t.id} className="flex items-baseline gap-2">
                    <span className="w-7 shrink-0 text-[11px] font-semibold text-muted">{CATEGORY_LABEL[t.category]}</span>
                    <span className="truncate text-ink">{t.name}</span>
                  </li>
                ))}
                {extraTreatments > 0 && (
                  <li className="pl-9 text-[12px] text-subtle">외 {extraTreatments}개</li>
                )}
              </ul>
            </dd>
          </div>
        )}
      </dl>

      {/* 3 · Price + actions */}
      <div className="flex items-end justify-between gap-4 border-t border-line pt-4 lg:flex-col lg:items-stretch lg:justify-between lg:border-t-0 lg:pt-0">
        <div className="lg:text-right">
          {minPrice ? (
            <>
              <p className="text-[12px] text-subtle">최저 시술비</p>
              <p className="tabular mt-0.5 text-[20px] font-bold tracking-[-0.02em] text-ink">
                {minPrice}
                <span className="ml-0.5 text-[14px] font-medium text-muted">~</span>
              </p>
            </>
          ) : (
            <p className="text-[12px] text-subtle">가격 문의</p>
          )}
        </div>
        <div className="flex shrink-0 gap-2 lg:flex-col">
          <button
            onClick={() => router.push(`/checkout?hospitalId=${hospital.id}`)}
            className="h-10 rounded-md bg-brand px-5 text-[14px] font-semibold text-white transition-colors duration-150 hover:bg-brand-hover active:bg-brand-press"
          >
            매칭하기
          </button>
          <Link
            href={`/hospitals/${hospital.id}`}
            className="inline-flex h-10 items-center justify-center rounded-md border border-line-strong px-4 text-[14px] font-medium text-ink transition-colors duration-150 hover:border-ink hover:bg-wash"
          >
            상세 보기
          </Link>
        </div>
      </div>
    </article>
  )
}

type FilterProps = {
  idPrefix: string
  intlOnly: boolean
  setIntlOnly: (v: boolean) => void
  selectedPriceRange: number
  setSelectedPriceRange: (v: number) => void
  selectedLocation: string
  setSelectedLocation: (v: string) => void
  selectedSpecialty: string
  setSelectedSpecialty: (v: string) => void
  selectedLanguage: string
  setSelectedLanguage: (v: string) => void
  selectedType: string
  setSelectedType: (v: string) => void
}

const selectCls =
  'h-10 w-full rounded-md border border-line-strong bg-surface px-3 text-[14px] text-ink outline-none transition-colors duration-150 hover:border-subtle focus:border-brand focus:shadow-[0_0_0_3px_var(--color-brand-soft)]'

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-line py-4 first:border-t-0 first:pt-0">
      <legend className="float-left mb-2 w-full text-[12px] font-semibold text-muted">{title}</legend>
      <div className="clear-left">{children}</div>
    </fieldset>
  )
}

function RadioList({
  name,
  options,
  value,
  onChange,
  columns = 1,
}: {
  columns?: 1 | 2
  name: string
  options: { value: string | number; label: string }[]
  value: string | number
  onChange: (v: string | number) => void
}) {
  return (
    <div className={columns === 2 ? 'grid grid-cols-2 gap-px' : 'space-y-px'}>
      {options.map((o) => {
        const checked = value === o.value
        return (
          <label
            key={String(o.value)}
            className={`flex cursor-pointer items-center gap-2.5 rounded-sm px-2 py-1.5 text-[14px] transition-colors duration-150 ${
              checked ? 'bg-brand-soft font-medium text-brand' : 'text-ink-2 hover:bg-wash'
            }`}
          >
            <input
              type="radio"
              name={name}
              checked={checked}
              onChange={() => onChange(o.value)}
              className="h-4 w-4 accent-brand"
            />
            {o.label}
          </label>
        )
      })}
    </div>
  )
}

function FilterPanel(p: FilterProps) {
  return (
    <div>
      <FilterGroup title="국제진료">
        <label className="flex cursor-pointer items-center gap-2.5 rounded-sm px-2 py-1.5 text-[14px] text-ink-2 hover:bg-wash">
          <input
            type="checkbox"
            checked={p.intlOnly}
            onChange={(e) => p.setIntlOnly(e.target.checked)}
            className="h-4 w-4 accent-brand"
          />
          국제진료팀 보유
        </label>
      </FilterGroup>

      <FilterGroup title="가격대 (최저 시술비)">
        <RadioList
          name={`${p.idPrefix}-price`}
          options={PRICE_RANGES.map((r, i) => ({ value: i, label: r.label }))}
          value={p.selectedPriceRange}
          onChange={(v) => p.setSelectedPriceRange(v as number)}
        />
      </FilterGroup>

      <FilterGroup title="지역">
        <RadioList
          name={`${p.idPrefix}-location`}
          options={['', ...LOCATIONS].map((loc) => ({ value: loc, label: loc || '전체' }))}
          value={p.selectedLocation}
          onChange={(v) => p.setSelectedLocation(v as string)}
          columns={2}
        />
      </FilterGroup>

      <FilterGroup title="전문과">
        <select
          aria-label="전문과"
          value={p.selectedSpecialty}
          onChange={(e) => p.setSelectedSpecialty(e.target.value)}
          className={selectCls}
        >
          <option value="">전체</option>
          {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </FilterGroup>

      <FilterGroup title="언어 지원">
        <select
          aria-label="언어 지원"
          value={p.selectedLanguage}
          onChange={(e) => p.setSelectedLanguage(e.target.value)}
          className={selectCls}
        >
          <option value="">전체</option>
          {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </FilterGroup>

      <FilterGroup title="병원 유형">
        <RadioList
          name={`${p.idPrefix}-type`}
          options={['', ...HOSPITAL_TYPES].map((t) => ({ value: t, label: t || '전체' }))}
          value={p.selectedType}
          onChange={(v) => p.setSelectedType(v as string)}
        />
      </FilterGroup>
    </div>
  )
}

function HospitalsContent() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<SearchTab>('all')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedPriceRange, setSelectedPriceRange] = useState(0)
  const [sortBy, setSortBy] = useState<SortOption>('rating')
  const [intlOnly, setIntlOnly] = useState(false)

  useEffect(() => {
    const q = searchParams.get('q')
    const tabParam = searchParams.get('tab')
    const specialtyParam = searchParams.get('specialty')
    setQuery(q ?? '')
    setTab(VALID_TABS.includes(tabParam as SearchTab) ? (tabParam as SearchTab) : 'all')
    setSelectedSpecialty(specialtyParam && SPECIALTIES.includes(specialtyParam) ? specialtyParam : '')
  }, [searchParams])

  const filteredHospitals = useMemo(() => {
    let result = [...mockHospitals]

    if (query) {
      const q = query.toLowerCase()
      result = result.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.nameEn.toLowerCase().includes(q) ||
          h.specialties.some((s) => s.toLowerCase().includes(q)) ||
          h.treatments.some((t) => t.name.toLowerCase().includes(q) || t.nameEn.toLowerCase().includes(q)),
      )
    }

    if (tab !== 'all') result = result.filter((h) => h.treatments.some((t) => t.category === tab))
    if (selectedLocation) result = result.filter((h) => h.location === selectedLocation)
    if (selectedSpecialty) result = result.filter((h) => h.specialties.includes(selectedSpecialty))
    if (selectedLanguage) result = result.filter((h) => h.languages.includes(selectedLanguage))
    if (selectedType) result = result.filter((h) => h.type === selectedType)
    if (intlOnly) result = result.filter((h) => h.internationalDept)

    const priceRange = PRICE_RANGES[selectedPriceRange]
    if (priceRange && selectedPriceRange > 0) {
      result = result.filter((h) => {
        if (h.treatments.length === 0) return false
        const min = Math.min(...h.treatments.map((t) => t.priceMin))
        return min >= priceRange.min && min < priceRange.max
      })
    }

    result.sort((a, b) => {
      if (sortBy === 'recommended') return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
      if (sortBy === 'rating') return b.rating - a.rating
      if (sortBy === 'reviewCount') return b.reviewCount - a.reviewCount
      if (sortBy === 'priceAsc') {
        const aMin = a.treatments.length ? Math.min(...a.treatments.map((t) => t.priceMin)) : Infinity
        const bMin = b.treatments.length ? Math.min(...b.treatments.map((t) => t.priceMin)) : Infinity
        return aMin - bMin
      }
      if (sortBy === 'priceDesc') {
        const aMin = a.treatments.length ? Math.min(...a.treatments.map((t) => t.priceMin)) : 0
        const bMin = b.treatments.length ? Math.min(...b.treatments.map((t) => t.priceMin)) : 0
        return bMin - aMin
      }
      return 0
    })

    return result
  }, [query, tab, selectedLocation, selectedSpecialty, selectedLanguage, selectedType, selectedPriceRange, sortBy, intlOnly])

  function resetFilters() {
    setSelectedLocation('')
    setSelectedSpecialty('')
    setSelectedLanguage('')
    setSelectedType('')
    setSelectedPriceRange(0)
    setIntlOnly(false)
    setQuery('')
    setTab('all')
  }

  const hasActiveFilters =
    query || selectedLocation || selectedSpecialty || selectedLanguage || selectedType || selectedPriceRange > 0 || intlOnly

  // ── presentation-only state ──
  const [sheetOpen, setSheetOpen] = useState(false)
  const activeFilterCount =
    [selectedLocation, selectedSpecialty, selectedLanguage, selectedType].filter(Boolean).length +
    (selectedPriceRange > 0 ? 1 : 0) +
    (intlOnly ? 1 : 0)

  const filterProps: Omit<FilterProps, 'idPrefix'> = {
    intlOnly, setIntlOnly,
    selectedPriceRange, setSelectedPriceRange,
    selectedLocation, setSelectedLocation,
    selectedSpecialty, setSelectedSpecialty,
    selectedLanguage, setSelectedLanguage,
    selectedType, setSelectedType,
  }

  return (
    <div className="min-h-screen bg-canvas">
      {/* Search toolbar */}
      <div className="z-40 border-b border-line bg-surface lg:sticky lg:top-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 py-3 md:flex-row md:items-center md:gap-4">
            <div role="tablist" aria-label="검색 범위" className="scroll-row -mx-1 flex shrink-0 overflow-x-auto">
              {SEARCH_TABS.map((t) => {
                const selected = tab === t.id
                return (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setTab(t.id)}
                    className={`h-9 shrink-0 whitespace-nowrap rounded-md px-3 text-[14px] font-medium transition-colors duration-150 ${
                      selected ? 'bg-ink text-white' : 'text-muted hover:bg-wash hover:text-ink'
                    }`}
                  >
                    {t.label}
                  </button>
                )
              })}
            </div>
            <div className="flex min-w-0 flex-1 gap-2">
              <label className="group relative flex h-10 min-w-0 flex-1 items-center rounded-md border border-line-strong bg-surface transition-[border-color,box-shadow] duration-150 hover:border-subtle focus-within:border-brand focus-within:shadow-[0_0_0_3px_var(--color-brand-soft)]">
                <span className="sr-only">검색어</span>
                <svg aria-hidden width="16" height="16" viewBox="0 0 20 20" fill="none" className="ml-3 shrink-0 text-subtle group-focus-within:text-brand">
                  <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
                  <path d="m13.5 13.5 3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="병원명, 질환, 시술, 수술 검색"
                  className="h-full w-full min-w-0 bg-transparent px-2.5 text-[14px] text-ink outline-none placeholder:text-subtle"
                />
              </label>
              <select
                aria-label="정렬"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="hidden h-10 shrink-0 rounded-md border border-line-strong bg-surface px-3 text-[14px] text-ink outline-none hover:border-subtle focus:border-brand sm:block"
              >
                <option value="recommended">추천순</option>
                <option value="rating">평점순</option>
                <option value="reviewCount">리뷰순</option>
                <option value="priceAsc">가격 낮은순</option>
                <option value="priceDesc">가격 높은순</option>
              </select>
              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-md border border-line-strong px-3 text-[14px] font-medium text-ink hover:bg-wash lg:hidden"
              >
                필터
                {activeFilterCount > 0 && (
                  <span className="tabular grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] font-semibold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl gap-10 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Desktop filters */}
        <aside className="hidden w-56 shrink-0 lg:block" aria-label="필터">
          <div className="sticky top-[8.5rem]">
            <div className="mb-4 flex h-6 items-center justify-between">
              <p className="text-[14px] font-semibold text-ink">필터</p>
              {hasActiveFilters && (
                <button onClick={resetFilters} className="text-[13px] font-medium text-brand hover:text-brand-hover">
                  초기화
                </button>
              )}
            </div>
            <FilterPanel idPrefix="d" {...filterProps} />
          </div>
        </aside>

        {/* Results */}
        <section className="min-w-0 flex-1" aria-label="검색 결과">
          <div className="mb-4 flex h-6 items-center justify-between gap-3">
            <p className="text-[14px] text-muted" aria-live="polite">
              <span className="tabular font-semibold text-ink">{filteredHospitals.length}</span>개 병원
              {hasActiveFilters && <span className="ml-2 text-[13px] text-brand">필터 적용 중</span>}
            </p>
            <select
              aria-label="정렬"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-8 rounded-sm bg-transparent pr-1 text-[13px] font-medium text-ink-2 outline-none sm:hidden"
            >
              <option value="recommended">추천순</option>
              <option value="rating">평점순</option>
              <option value="reviewCount">리뷰순</option>
              <option value="priceAsc">가격 낮은순</option>
              <option value="priceDesc">가격 높은순</option>
            </select>
          </div>

          {filteredHospitals.length === 0 ? (
            <div className="rounded-lg border border-dashed border-line-strong bg-surface px-6 py-16 text-center">
              <p className="text-[16px] font-semibold text-ink">조건에 맞는 병원이 없습니다</p>
              <p className="mt-1.5 text-[14px] text-muted">검색어 또는 필터를 변경해 보세요</p>
              <button
                onClick={resetFilters}
                className="mt-5 inline-flex h-10 items-center rounded-md border border-line-strong px-4 text-[14px] font-medium text-ink hover:bg-wash"
              >
                필터 초기화
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHospitals.map((hospital) => (
                <HospitalRow key={hospital.id} hospital={hospital} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Mobile filter sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="필터">
          <button type="button" aria-label="닫기" onClick={() => setSheetOpen(false)} className="absolute inset-0 bg-ink/30" />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col rounded-t-lg bg-surface">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <p className="text-[16px] font-semibold text-ink">필터</p>
              <button type="button" onClick={() => setSheetOpen(false)} className="text-[14px] font-medium text-muted hover:text-ink">
                닫기
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-4">
              <FilterPanel idPrefix="m" {...filterProps} />
            </div>
            <div className="flex gap-2 border-t border-line px-5 py-3">
              <button
                type="button"
                onClick={resetFilters}
                className="h-12 rounded-md border border-line-strong px-4 text-[15px] font-medium text-ink hover:bg-wash"
              >
                초기화
              </button>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="tabular h-12 flex-1 rounded-md bg-brand text-[15px] font-semibold text-white hover:bg-brand-hover"
              >
                {filteredHospitals.length}개 병원 보기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function HospitalsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    }>
      <HospitalsContent />
    </Suspense>
  )
}
