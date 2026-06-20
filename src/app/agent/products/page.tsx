'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ALL_TREATMENTS, mockHospitals, SPECIALTIES } from '@/lib/mock-data'
import type { Treatment, TreatmentCategory } from '@/types'

const CATEGORY_LABELS: Record<TreatmentCategory, string> = {
  disease: '질환', procedure: '시술', surgery: '수술', checkup: '건강검진',
}

const CATEGORIES = Array.from(new Set(ALL_TREATMENTS.map((t) => t.category)))

function fmt(n: number) {
  return `₩${n.toLocaleString()}`
}

function hospitalsFor(treatment: Treatment) {
  return mockHospitals.filter((h) => h.treatments.some((t) => t.id === treatment.id))
}

function DetailModal({ treatment, onClose }: { treatment: Treatment; onClose: () => void }) {
  const hospitals = hospitalsFor(treatment)
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-start">
          <div>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">{CATEGORY_LABELS[treatment.category]}</span>
            <h2 className="text-base font-bold text-gray-900 mt-1.5">{treatment.name}</h2>
            <p className="text-xs text-gray-400">{treatment.nameEn}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500">가격대</p>
              <p className="font-bold text-gray-900 mt-0.5">{fmt(treatment.priceMin)} ~ {fmt(treatment.priceMax)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500">소요 시간</p>
              <p className="font-bold text-gray-900 mt-0.5">{treatment.duration}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500">회복 기간</p>
              <p className="font-bold text-gray-900 mt-0.5">{treatment.recovery}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900 mb-2">취급 병원 ({hospitals.length})</p>
            <div className="space-y-2">
              {hospitals.map((h) => (
                <div key={h.id} className="border border-gray-200 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{h.name}</p>
                    <p className="text-xs text-gray-400">{h.location} {h.district} · ★{h.rating} · {h.languages.join(', ')}</p>
                  </div>
                  <Link href="/agent/brochures" className="text-xs text-indigo-600 hover:underline whitespace-nowrap">자료 보기</Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AgentProductsPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<TreatmentCategory | ''>('')
  const [specialty, setSpecialty] = useState('')
  const [selected, setSelected] = useState<Treatment | null>(null)

  const filtered = useMemo(() => {
    return ALL_TREATMENTS.filter((t) => {
      const q = search.toLowerCase()
      const matchSearch = !search || t.name.toLowerCase().includes(q) || t.nameEn.toLowerCase().includes(q)
      const matchCategory = !category || t.category === category
      const matchSpecialty = !specialty || t.specialty === specialty
      return matchSearch && matchCategory && matchSpecialty
    })
  }, [search, category, specialty])

  const stats = [
    { label: '전체 의료상품', value: ALL_TREATMENTS.length },
    { label: '제휴 병원', value: mockHospitals.length },
    { label: '진료과목', value: SPECIALTIES.length },
    { label: '검색 결과', value: filtered.length },
  ]

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      {selected && <DetailModal treatment={selected} onClose={() => setSelected(null)} />}

      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">의료상품 조회</h1>
        <p className="text-sm text-gray-500 mt-0.5">제휴 병원의 진료·시술·수술 상품을 조회하고 환자에게 안내하세요</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 space-y-3">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="상품명, 영문명 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400"
          />
          <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white">
            <option value="">전체 진료과</option>
            {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCategory('')}
            className={`text-sm px-3.5 py-1.5 rounded-full border font-medium transition-colors ${
              category === '' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
            }`}
          >
            전체
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`text-sm px-3.5 py-1.5 rounded-full border font-medium transition-colors ${
                category === c ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
              }`}
            >
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {filtered.map((t) => {
          const hospitals = hospitalsFor(t)
          return (
            <button
              key={t.id}
              onClick={() => setSelected(t)}
              className="text-left bg-white border border-gray-200 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">{CATEGORY_LABELS[t.category]}</span>
                <span className="text-xs text-gray-400">{t.specialty}</span>
              </div>
              <p className="text-sm font-bold text-gray-900">{t.name}</p>
              <p className="text-xs text-gray-400">{t.nameEn}</p>
              <p className="text-sm font-semibold text-indigo-600 mt-2">{fmt(t.priceMin)} ~ {fmt(t.priceMax)}</p>
              <p className="text-xs text-gray-500 mt-1">{t.duration} · 회복 {t.recovery}</p>
              <div className="flex flex-wrap gap-1 mt-3">
                {hospitals.slice(0, 3).map((h) => (
                  <span key={h.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{h.name}</span>
                ))}
                {hospitals.length > 3 && (
                  <span className="text-xs text-gray-400 px-1">+{hospitals.length - 3}개 병원</span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-16">검색 조건에 맞는 의료상품이 없습니다</p>
      )}
    </div>
  )
}
