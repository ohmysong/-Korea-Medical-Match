'use client'

import { useState, useMemo } from 'react'
import { mockHospitalPricing, type HospitalPricingItem, type HospitalPricingCategory } from '@/lib/hospital-mock-data'

const CATEGORIES: HospitalPricingCategory[] = ['수술', '시술', '건강검진', '내과', '외과', '재생의학']

function fmt(n: number) {
  if (n >= 10000000) return `₩${(n / 10000000).toFixed(0)}천만`
  if (n >= 1000000) return `₩${(n / 1000000).toFixed(1)}백만`
  if (n >= 10000) return `₩${(n / 10000).toFixed(0)}만`
  return `₩${n.toLocaleString()}`
}

function EditModal({ item, onClose, onSave }: {
  item: HospitalPricingItem
  onClose: () => void
  onSave: (updated: HospitalPricingItem) => void
}) {
  const [form, setForm] = useState({ ...item })

  function set(field: keyof HospitalPricingItem, value: string | number | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-base font-bold text-gray-900">가격 항목 수정</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">진료명 (한국어)</label>
              <input
                value={form.treatmentName}
                onChange={(e) => set('treatmentName', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">진료명 (영문)</label>
              <input
                value={form.treatmentNameEn}
                onChange={(e) => set('treatmentNameEn', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">분류</label>
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400 bg-white"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">소요 시간</label>
              <input
                value={form.duration}
                onChange={(e) => set('duration', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">최소 금액 (원)</label>
              <input
                type="number"
                value={form.priceMin}
                onChange={(e) => set('priceMin', Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">최대 금액 (원)</label>
              <input
                type="number"
                value={form.priceMax}
                onChange={(e) => set('priceMax', Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">회복 기간</label>
              <input
                value={form.recovery}
                onChange={(e) => set('recovery', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => { onSave({ ...form, lastUpdated: '2026-06-18' }); onClose() }}
              className="flex-1 bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-700"
            >
              저장
            </button>
            <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50">
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PricingPage() {
  const [items, setItems] = useState(mockHospitalPricing)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<HospitalPricingCategory | ''>('')
  const [publishedFilter, setPublishedFilter] = useState<'published' | 'draft' | ''>('')
  const [editing, setEditing] = useState<HospitalPricingItem | null>(null)
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  function handleTogglePublish(id: string) {
    setItems((prev) => prev.map((p) => {
      if (p.id !== id) return p
      const next = !p.isPublished
      showToast(next ? '게시 처리되었습니다.' : '비공개 처리되었습니다.')
      return { ...p, isPublished: next }
    }))
  }

  function handleSave(updated: HospitalPricingItem) {
    setItems((prev) => prev.map((p) => p.id === updated.id ? updated : p))
    showToast('저장되었습니다.')
  }

  function handleDelete(id: string) {
    if (!confirm('이 항목을 삭제하시겠습니까?')) return
    setItems((prev) => prev.filter((p) => p.id !== id))
    showToast('삭제되었습니다.')
  }

  const stats = [
    { label: '전체 항목', value: items.length },
    { label: '게시 중', value: items.filter((p) => p.isPublished).length },
    { label: '비공개', value: items.filter((p) => !p.isPublished).length },
    { label: '진료 분류', value: CATEGORIES.filter((c) => items.some((p) => p.category === c)).length },
  ]

  const filtered = useMemo(() => {
    return items.filter((p) => {
      const q = search.toLowerCase()
      const matchSearch =
        !search ||
        p.treatmentName.toLowerCase().includes(q) ||
        p.treatmentNameEn.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      const matchCategory = !categoryFilter || p.category === categoryFilter
      const matchPublished =
        !publishedFilter || (publishedFilter === 'published' ? p.isPublished : !p.isPublished)
      return matchSearch && matchCategory && matchPublished
    })
  }, [items, search, categoryFilter, publishedFilter])

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      {editing && (
        <EditModal item={editing} onClose={() => setEditing(null)} onSave={handleSave} />
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">가격 관리</h1>
          <p className="text-sm text-gray-500 mt-0.5">진료 항목별 가격 설정 및 게시 여부 관리</p>
        </div>
        <button
          onClick={() => showToast('진료 항목 추가 모달 (백엔드 연동 필요)')}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
        >
          + 진료 항목 추가
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex gap-3">
        <input
          type="text"
          placeholder="진료명, 영문명, 분류 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as HospitalPricingCategory | '')}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white"
        >
          <option value="">전체 분류</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={publishedFilter}
          onChange={(e) => setPublishedFilter(e.target.value as 'published' | 'draft' | '')}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white"
        >
          <option value="">전체</option>
          <option value="published">게시 중</option>
          <option value="draft">비공개</option>
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm text-gray-500">총 <span className="font-semibold text-gray-900">{filtered.length}</span>항목</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['진료명', '영문명', '분류', '가격 범위', '소요 시간', '회복 기간', '게시 여부', '최종 수정', ''].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap">{item.treatmentName}</td>
                  <td className="py-3 px-4 text-xs text-gray-400 max-w-[160px] truncate">{item.treatmentNameEn}</td>
                  <td className="py-3 px-4">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{item.category}</span>
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                    {fmt(item.priceMin)} ~ {fmt(item.priceMax)}
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{item.duration}</td>
                  <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{item.recovery}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleTogglePublish(item.id)}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium cursor-pointer transition-colors ${
                        item.isPublished
                          ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {item.isPublished ? '게시 중' : '비공개'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-400 whitespace-nowrap">{item.lastUpdated}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2 whitespace-nowrap">
                      <button onClick={() => setEditing(item)} className="text-xs text-blue-600 hover:underline">수정</button>
                      <button
                        onClick={() => handleTogglePublish(item.id)}
                        className={`text-xs hover:underline ${item.isPublished ? 'text-orange-500' : 'text-green-600'}`}
                      >
                        {item.isPublished ? '비공개' : '게시'}
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="text-xs text-red-500 hover:underline">삭제</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-xs font-medium text-blue-800 mb-1">가격 안내 정책</p>
        <p className="text-xs text-blue-700">
          표시된 가격은 외국인 환자 기준 예상 범위입니다. 실제 진료비는 환자 상태, 추가 검사, 입원 기간에 따라 달라질 수 있으며,
          에이전트 수수료는 별도 적용됩니다. 가격 변경 시 당일 자정부터 반영됩니다.
        </p>
      </div>
    </div>
  )
}
