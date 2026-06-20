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
const CATEGORY_STYLE: Record<string, string> = {
  disease: 'bg-orange-50 text-orange-700',
  procedure: 'bg-purple-50 text-purple-700',
  surgery: 'bg-red-50 text-red-700',
  checkup: 'bg-green-50 text-green-700',
}
const CARD_GRADIENTS = [
  'from-blue-500 to-blue-700',
  'from-teal-500 to-emerald-700',
  'from-indigo-500 to-violet-700',
  'from-sky-500 to-blue-700',
  'from-emerald-500 to-teal-700',
  'from-violet-500 to-purple-700',
]

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

function HospitalCard({ hospital, index }: { hospital: Hospital; index: number }) {
  const router = useRouter()
  const minPrice = formatMinPrice(hospital)
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length]

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 group">
      <Link href={`/hospitals/${hospital.id}`} className="block">
        {/* Image / gradient banner */}
        <div className={`h-28 bg-gradient-to-br ${gradient} relative overflow-hidden flex items-end`}>
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white font-bold text-6xl opacity-10 select-none">
            {hospital.name[0]}
          </span>
          <div className="relative z-10 p-3 w-full flex items-end justify-between">
            <div>
              <h3 className="text-white font-bold text-base leading-tight">{hospital.name}</h3>
              <p className="text-white/70 text-xs">{hospital.nameEn}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1 bg-black/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                <span className="text-yellow-300 text-xs">★</span>
                <span className="text-white text-xs font-bold">{hospital.rating}</span>
                <span className="text-white/50 text-xs">({hospital.reviewCount.toLocaleString()})</span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      <div className="p-4">
        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
            {hospital.type}
          </span>
          {hospital.internationalDept && (
            <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100">
              국제진료팀
            </span>
          )}
          {hospital.accreditations.slice(0, 1).map((acc) => (
            <span key={acc} className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100">
              {acc}
            </span>
          ))}
        </div>

        {/* Description */}
        <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">{hospital.description}</p>

        {/* Location + Languages */}
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
          <span>📍 {hospital.location} · {hospital.district}</span>
          {hospital.bedCount && <span>🛏 {hospital.bedCount.toLocaleString()}병상</span>}
        </div>

        {/* Specialties */}
        <div className="flex flex-wrap gap-1 mb-3">
          {hospital.specialties.slice(0, 4).map((s) => (
            <span key={s} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{s}</span>
          ))}
          {hospital.specialties.length > 4 && (
            <span className="text-xs text-gray-400 self-center">+{hospital.specialties.length - 4}</span>
          )}
        </div>

        {/* Treatments preview */}
        {hospital.treatments.length > 0 && (
          <div className="border-t border-gray-100 pt-3 mb-3">
            <p className="text-xs text-gray-400 mb-1.5">주요 시술</p>
            <div className="flex flex-wrap gap-1.5">
              {hospital.treatments.slice(0, 3).map((t) => (
                <div key={t.id} className="flex items-center gap-1 text-xs bg-gray-50 border border-gray-100 rounded-md px-2 py-1">
                  <span className={`px-1 py-0.5 rounded text-xs ${CATEGORY_STYLE[t.category]}`}>
                    {CATEGORY_LABEL[t.category]}
                  </span>
                  <span className="text-gray-700">{t.name}</span>
                </div>
              ))}
              {hospital.treatments.length > 3 && (
                <span className="text-xs text-gray-400 self-center">+{hospital.treatments.length - 3}</span>
              )}
            </div>
          </div>
        )}

        {/* Bottom: price + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            {minPrice && (
              <div>
                <span className="text-xs text-gray-400">최저 시술비</span>
                <p className="text-sm font-bold text-blue-700">{minPrice}~</p>
              </div>
            )}
          </div>
          <button
            onClick={() => router.push(`/checkout?hospitalId=${hospital.id}`)}
            className="bg-blue-600 text-white text-xs px-5 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors"
          >
            매칭하기
          </button>
        </div>
      </div>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search toolbar */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            {SEARCH_TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors whitespace-nowrap ${
                  tab === t.id ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {t.label}
              </button>
            ))}
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="병원명, 질환, 시술, 수술 검색..."
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 min-w-0"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:border-blue-400 flex-shrink-0"
            >
              <option value="recommended">추천순</option>
              <option value="rating">평점순</option>
              <option value="reviewCount">리뷰순</option>
              <option value="priceAsc">가격 낮은순</option>
              <option value="priceDesc">가격 높은순</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar filters */}
        <aside className="w-52 flex-shrink-0">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-5 sticky top-32">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">필터</p>
              {hasActiveFilters && (
                <button onClick={resetFilters} className="text-xs text-blue-600 hover:underline">
                  초기화
                </button>
              )}
            </div>

            {/* International dept */}
            <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                checked={intlOnly}
                onChange={(e) => setIntlOnly(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span className="text-sm text-gray-700">국제진료팀 보유</span>
            </label>

            <div className="border-t border-gray-100" />

            {/* Price range */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">가격대</h3>
              <div className="space-y-1">
                {PRICE_RANGES.map((r, i) => (
                  <label key={r.label} className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-gray-50">
                    <input
                      type="radio"
                      name="price"
                      checked={selectedPriceRange === i}
                      onChange={() => setSelectedPriceRange(i)}
                      className="text-blue-600"
                    />
                    <span className="text-sm text-gray-700">{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Location */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">지역</h3>
              <div className="space-y-1">
                {['', ...LOCATIONS].map((loc) => (
                  <label key={loc} className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-gray-50">
                    <input
                      type="radio"
                      name="location"
                      value={loc}
                      checked={selectedLocation === loc}
                      onChange={() => setSelectedLocation(loc)}
                      className="text-blue-600"
                    />
                    <span className="text-sm text-gray-700">{loc || '전체'}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Specialty */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">전문과</h3>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-blue-400"
              >
                <option value="">전체</option>
                {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Language */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">언어 지원</h3>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-blue-400"
              >
                <option value="">전체</option>
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            {/* Hospital type */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">병원 유형</h3>
              <div className="space-y-1">
                {['', ...HOSPITAL_TYPES].map((t) => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-gray-50">
                    <input
                      type="radio"
                      name="type"
                      value={t}
                      checked={selectedType === t}
                      onChange={() => setSelectedType(t)}
                      className="text-blue-600"
                    />
                    <span className="text-sm text-gray-700">{t || '전체'}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Results */}
        <main className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              검색 결과{' '}
              <span className="font-bold text-gray-900">{filteredHospitals.length}개</span> 병원
              {hasActiveFilters && <span className="text-blue-600 ml-2 text-xs">· 필터 적용 중</span>}
            </p>
          </div>

          {filteredHospitals.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
              <p className="text-gray-400 text-3xl mb-4">🔍</p>
              <p className="text-gray-600 font-medium">검색 결과가 없습니다</p>
              <p className="text-sm text-gray-400 mt-1">검색어 또는 필터를 변경해 보세요</p>
              <button onClick={resetFilters} className="mt-4 text-sm text-blue-600 hover:underline">
                필터 초기화
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredHospitals.map((hospital, i) => (
                <HospitalCard key={hospital.id} hospital={hospital} index={i} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default function HospitalsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <HospitalsContent />
    </Suspense>
  )
}
