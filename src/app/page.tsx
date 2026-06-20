'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { mockHospitals } from '@/lib/mock-data'
import type { SearchTab } from '@/types'

const SEARCH_TABS: { id: SearchTab; label: string; placeholder: string }[] = [
  { id: 'all', label: '전체', placeholder: '병원명, 질환, 시술, 수술을 검색하세요' },
  { id: 'disease', label: '질환', placeholder: '질환명을 입력하세요 (예: 위암, 당뇨, 고혈압)' },
  { id: 'procedure', label: '시술', placeholder: '시술명을 입력하세요 (예: 보톡스, 라식, PRP)' },
  { id: 'surgery', label: '수술', placeholder: '수술명을 입력하세요 (예: 인공관절, 척추, 심장우회)' },
]

const POPULAR_SEARCHES = ['라식 수술', '종합검진', '위암', '척추 디스크', '보톡스', '인공관절', '줄기세포', '심장수술']

const POPULAR_CATEGORIES = [
  { icon: '🔬', label: '건강검진', sub: '정밀검진 패키지', from: '50만원~', specialty: '건강검진', gradient: 'from-emerald-500 to-teal-600' },
  { icon: '✨', label: '피부·성형', sub: '레이저 · 성형시술', from: '15만원~', specialty: '피부과', gradient: 'from-pink-500 to-rose-600' },
  { icon: '🦴', label: '척추·관절', sub: '디스크 · 관절치환', from: '400만원~', specialty: '척추', gradient: 'from-blue-500 to-indigo-600' },
  { icon: '🎗️', label: '암·종양', sub: '암 수술 · 치료', from: '800만원~', specialty: '암센터', gradient: 'from-orange-500 to-red-600' },
  { icon: '❤️', label: '심장·혈관', sub: '우회술 · 스텐트', from: '1500만원~', specialty: '심장·혈관', gradient: 'from-red-500 to-rose-700' },
  { icon: '👁️', label: '안과', sub: '라식 · 라섹', from: '150만원~', specialty: '안과', gradient: 'from-cyan-500 to-sky-600' },
  { icon: '🌿', label: '재생의학', sub: '줄기세포 · PRP', from: '100만원~', specialty: '재생의학', gradient: 'from-green-500 to-emerald-700' },
  { icon: '🌸', label: '산부인과', sub: '여성 정밀검진', from: '60만원~', specialty: '산부인과', gradient: 'from-purple-500 to-violet-600' },
]

const FEATURED_BANNERS = [
  {
    badge: 'K-Beauty 특집',
    title: '피부과·미용 클리닉',
    desc: '보톡스, 레이저 토닝, 피코슈어 등 K-뷰티 시술 전문 병원 엄선',
    count: '18개 병원',
    emoji: '✨',
    bg: 'bg-gradient-to-br from-pink-50 to-rose-50',
    border: 'border-pink-200',
    badgeCls: 'bg-pink-100 text-pink-700',
    btnCls: 'bg-pink-600 hover:bg-pink-700',
    specialty: '피부과',
  },
  {
    badge: '척추·정형 특화',
    title: '척추·관절 센터',
    desc: '최소침습 수술, 관절치환, 인공관절 전문. JCI 인증 병원 포함',
    count: '9개 병원',
    emoji: '🦴',
    bg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    border: 'border-blue-200',
    badgeCls: 'bg-blue-100 text-blue-700',
    btnCls: 'bg-blue-600 hover:bg-blue-700',
    specialty: '척추',
  },
  {
    badge: 'VIP 검진 패키지',
    title: '프리미엄 건강검진',
    desc: 'PET-CT 포함 전신 정밀검진. 당일 영문 리포트 제공',
    count: '12개 병원',
    emoji: '🔬',
    bg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
    border: 'border-emerald-200',
    badgeCls: 'bg-emerald-100 text-emerald-700',
    btnCls: 'bg-emerald-600 hover:bg-emerald-700',
    specialty: '건강검진',
  },
]

const STATS = [
  { value: '120+', label: '등록 병원' },
  { value: '50,000+', label: '누적 환자' },
  { value: '15개', label: '지원 언어' },
  { value: '98%', label: '만족도' },
]

const SERVICES = [
  { icon: '🏥', title: '병원 매칭', desc: '100개 이상 병원 DB' },
  { icon: '🗣️', title: '의료 통역', desc: '15개 언어 지원' },
  { icon: '🏨', title: '호텔 연계', desc: '의료 특화 숙소' },
  { icon: '🚗', title: '차량 지원', desc: '공항·병원 픽업' },
  { icon: '💊', title: '재생의학', desc: '줄기세포·PRP' },
  { icon: '🌐', title: '해외 에이전트', desc: '현지 파트너 네트워크' },
  { icon: '📋', title: '환자 CRM', desc: '진료 이력 관리' },
  { icon: '✦', title: 'AI 매칭', desc: '최적 병원 자동 추천' },
]

export default function HomePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<SearchTab>('all')
  const [query, setQuery] = useState('')

  const featuredHospitals = mockHospitals.filter((h) => h.featured).slice(0, 3)
  const currentTab = SEARCH_TABS.find((t) => t.id === activeTab)!

  function handleSearch(q = query) {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (activeTab !== 'all') params.set('tab', activeTab)
    router.push(`/hospitals?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full -translate-y-40 translate-x-40 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-300/10 rounded-full translate-y-24 -translate-x-24 pointer-events-none" />
        <div className="absolute top-1/3 right-1/3 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 py-20 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-xs px-4 py-1.5 rounded-full mb-6 border border-white/20">
            <span className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-pulse"></span>
            JCI 인증 병원 포함 · 외국인 환자 전담 코디네이터 운영
          </div>

          <h1 className="text-5xl font-bold text-white mb-4 leading-tight tracking-tight">
            한국 의료를<br />쉽고 안전하게
          </h1>
          <p className="text-blue-200 text-base mb-10 max-w-xl mx-auto leading-relaxed">
            병원 검색부터 통역, 숙박, 차량까지<br />
            의료 여행 전 과정을 한 곳에서 지원합니다
          </p>

          {/* Search box */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl mx-auto">
            <div className="flex border-b border-gray-100">
              {SEARCH_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex p-3 gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={currentTab.placeholder}
                className="flex-1 px-4 py-3 text-sm outline-none text-gray-700 placeholder-gray-400"
              />
              <button
                onClick={() => handleSearch()}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
              >
                검색
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <span className="text-blue-300 text-xs self-center mr-1">인기 검색</span>
            {POPULAR_SEARCHES.map((term) => (
              <button
                key={term}
                onClick={() => { setQuery(term); handleSearch(term) }}
                className="text-xs bg-white/10 text-white/80 px-3 py-1.5 rounded-full hover:bg-white/20 transition-colors border border-white/10"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-5 grid grid-cols-4 divide-x divide-gray-100">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center px-4">
              <div className="text-2xl font-bold text-blue-600">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-14">

        {/* ── AI 피부과 플래너 배너 ── */}
        <section>
          <Link
            href="/dermatology-planner"
            className="group block bg-gradient-to-br from-pink-600 to-rose-600 rounded-2xl p-7 sm:p-8 relative overflow-hidden hover:shadow-xl transition-all duration-200"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-24 translate-x-24 pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between gap-6 flex-wrap">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-white/15 text-white/90 text-xs px-3 py-1 rounded-full mb-3 border border-white/20">
                  ✦ NEW · AI 피부과 플래너
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5">고민과 예산만 알려주세요, AI가 시술 조합을 짜드려요</h2>
                <p className="text-pink-100 text-sm">얼굴 부위 · 고민 · 예산 · 우선순위 입력 → 추천 시술 + 예상 비용 + 조합 플랜까지 한 번에</p>
              </div>
              <span className="bg-white text-rose-700 font-bold px-6 py-3 rounded-xl text-sm group-hover:bg-pink-50 transition-colors whitespace-nowrap">
                AI 추천 받기 →
              </span>
            </div>
          </Link>
        </section>

        {/* ── 인기 시술 카테고리 ── */}
        <section>
          <div className="flex items-baseline justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900">인기 시술 카테고리</h2>
              <p className="text-sm text-gray-500 mt-0.5">전문 분야별 병원을 빠르게 찾아보세요</p>
            </div>
            <Link href="/hospitals" className="text-sm text-blue-600 hover:underline">전체 보기 →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {POPULAR_CATEGORIES.map((cat) => (
              <Link
                key={cat.specialty}
                href={`/hospitals?specialty=${encodeURIComponent(cat.specialty)}`}
                className={`bg-gradient-to-br ${cat.gradient} rounded-2xl p-5 text-white hover:scale-[1.03] hover:shadow-xl transition-all duration-200`}
              >
                <div className="text-3xl mb-3">{cat.icon}</div>
                <h3 className="font-bold text-base leading-tight">{cat.label}</h3>
                <p className="text-white/70 text-xs mt-0.5">{cat.sub}</p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/20">
                  <span className="text-white/60 text-xs">바로가기 →</span>
                  <span className="text-white font-semibold text-sm">{cat.from}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── 특별관리 병원 배너 ── */}
        <section>
          <div className="flex items-baseline justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900">특별관리 병원</h2>
              <p className="text-sm text-gray-500 mt-0.5">KMM이 직접 엄선한 분야별 특화 병원</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FEATURED_BANNERS.map((b) => (
              <div key={b.title} className={`${b.bg} border ${b.border} rounded-2xl p-5 flex flex-col justify-between`}>
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${b.badgeCls}`}>{b.badge}</span>
                    <span className="text-3xl">{b.emoji}</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1.5">{b.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{b.desc}</p>
                </div>
                <div className="flex items-center justify-between mt-5">
                  <span className="text-xs text-gray-500 font-medium">{b.count}</span>
                  <Link
                    href={`/hospitals?specialty=${encodeURIComponent(b.specialty)}`}
                    className={`${b.btnCls} text-white text-xs px-4 py-2 rounded-lg font-semibold transition-colors`}
                  >
                    지금 보기 →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 추천 병원 ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900">추천 병원</h2>
              <p className="text-sm text-gray-500 mt-0.5">외국인 환자 이용률 상위 병원</p>
            </div>
            <Link href="/hospitals" className="text-sm text-blue-600 hover:underline font-medium">전체 보기 →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featuredHospitals.map((hospital, i) => {
              const gradients = ['from-blue-600 to-blue-800', 'from-teal-600 to-emerald-700', 'from-indigo-600 to-violet-700']
              return (
                <Link
                  key={hospital.id}
                  href={`/hospitals/${hospital.id}`}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-200 group"
                >
                  <div className={`h-36 bg-gradient-to-br ${gradients[i % 3]} relative overflow-hidden flex items-center justify-center`}>
                    <span className="text-white font-bold text-7xl opacity-10 select-none">{hospital.name[0]}</span>
                    <div className="absolute inset-0 flex flex-col justify-between p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/30 backdrop-blur-sm">
                          {hospital.type}
                        </span>
                        <div className="flex items-center gap-1 bg-black/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                          <span className="text-yellow-300 text-xs">★</span>
                          <span className="text-white text-xs font-bold">{hospital.rating}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-white font-bold text-base leading-tight">{hospital.name}</p>
                        <p className="text-white/70 text-xs">{hospital.nameEn}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">{hospital.description}</p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {hospital.specialties.slice(0, 3).map((s) => (
                        <span key={s} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-400">📍 {hospital.location} · {hospital.district}</span>
                      <span className="text-xs font-semibold text-blue-600 group-hover:underline">상세 보기 →</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* ── 플랫폼 서비스 ── */}
        <section className="bg-white border border-gray-200 rounded-2xl p-7">
          <h2 className="text-xl font-bold text-gray-900 mb-1">플랫폼 지원 서비스</h2>
          <p className="text-sm text-gray-500 mb-6">의료 여행 전 과정을 한 곳에서</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SERVICES.map((s) => (
              <div key={s.title} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors group">
                <span className="text-xl">{s.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">{s.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Footer CTA */}
      <div className="bg-blue-600 mt-6">
        <div className="max-w-4xl mx-auto px-4 py-10 text-center">
          <h3 className="text-2xl font-bold text-white mb-2">지금 바로 시작하세요</h3>
          <p className="text-blue-200 text-sm mb-6">전담 코디네이터가 최적의 병원을 찾아드립니다</p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/hospitals"
              className="bg-white text-blue-700 font-bold px-8 py-3 rounded-xl text-sm hover:bg-blue-50 transition-colors"
            >
              병원 검색하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
