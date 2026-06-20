'use client'

import { useMemo, useState } from 'react'
import { mockBrochures, type BrochureCategory } from '@/lib/agent-mock-data'

const CATEGORY_LABELS: Record<BrochureCategory, string> = { hospital: '병원 소개', treatment: '시술/수술 안내' }

export default function AgentBrochuresPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<BrochureCategory | ''>('')
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const filtered = useMemo(() => {
    return mockBrochures.filter((b) => {
      const q = search.toLowerCase()
      const matchSearch = !search || b.title.toLowerCase().includes(q) || b.target.toLowerCase().includes(q)
      const matchCategory = !category || b.category === category
      return matchSearch && matchCategory
    })
  }, [search, category])

  return (
    <div className="max-w-5xl mx-auto px-6 py-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">브로셔 다운로드</h1>
        <p className="text-sm text-gray-500 mt-0.5">병원·시술 소개 자료를 다운로드해 환자 상담에 활용하세요</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex gap-3">
        <input
          type="text"
          placeholder="자료명, 대상 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value as BrochureCategory | '')} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white">
          <option value="">전체 분류</option>
          <option value="hospital">병원 소개</option>
          <option value="treatment">시술/수술 안내</option>
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map((b) => (
          <div key={b.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-xl">📄</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{CATEGORY_LABELS[b.category]}</span>
                <span className="text-xs text-gray-400">{b.target}</span>
              </div>
              <p className="text-sm font-bold text-gray-900 truncate">{b.title}</p>
              <div className="flex items-center gap-1.5 mt-1">
                {b.languages.map((l) => (
                  <span key={l} className="text-xs bg-gray-50 text-gray-500 border border-gray-100 px-1.5 py-0.5 rounded">{l}</span>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">{b.fileName} · {b.fileSize} · 업데이트 {b.updatedAt}</p>
            </div>
            <button
              onClick={() => showToast(`'${b.fileName}' 다운로드를 시작합니다`)}
              className="flex-shrink-0 bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium"
            >
              다운로드
            </button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-16">검색 조건에 맞는 자료가 없습니다</p>
      )}
    </div>
  )
}
