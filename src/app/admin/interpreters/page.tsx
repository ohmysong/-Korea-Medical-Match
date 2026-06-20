'use client'

import { useState, useMemo } from 'react'
import { mockInterpreters, type InterpreterStatus } from '@/lib/admin-mock-data'

const STATUS_LABELS: Record<InterpreterStatus, string> = { available: '가능', busy: '배정 중', inactive: '비활성' }
const STATUS_STYLES: Record<InterpreterStatus, string> = {
  available: 'bg-green-50 text-green-700 border border-green-200',
  busy: 'bg-orange-50 text-orange-700 border border-orange-200',
  inactive: 'bg-gray-100 text-gray-500',
}

function Badge({ status }: { status: InterpreterStatus }) {
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[status]}`}>{STATUS_LABELS[status]}</span>
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-1">
      <span className="text-yellow-400 text-xs">★</span>
      <span className="text-sm font-semibold text-gray-900">{rating}</span>
    </span>
  )
}

export default function InterpretersPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<InterpreterStatus | ''>('')
  const [langFilter, setLangFilter] = useState('')

  const stats = [
    { label: '전체 통역사', value: mockInterpreters.length },
    { label: '현재 가능', value: mockInterpreters.filter((i) => i.status === 'available').length },
    { label: '배정 중', value: mockInterpreters.filter((i) => i.status === 'busy').length },
    { label: '총 완료 건수', value: mockInterpreters.reduce((sum, i) => sum + i.completedCases, 0).toLocaleString() },
  ]

  const allLanguages = [...new Set(mockInterpreters.flatMap((i) => i.languages))]

  const filtered = useMemo(() => {
    return mockInterpreters.filter((i) => {
      const q = search.toLowerCase()
      const matchSearch = !search || i.name.toLowerCase().includes(q) || i.specialties.some((s) => s.includes(q))
      const matchStatus = !statusFilter || i.status === statusFilter
      const matchLang = !langFilter || i.languages.includes(langFilter)
      return matchSearch && matchStatus && matchLang
    })
  }, [search, statusFilter, langFilter])

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">통역사 관리</h1>
          <p className="text-sm text-gray-500 mt-0.5">통역사 등록 · 언어 · 배정 상태 관리</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          + 통역사 등록
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
        <input type="text" placeholder="이름, 전문분야 검색..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as InterpreterStatus | '')}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white">
          <option value="">전체 상태</option>
          {(['available', 'busy', 'inactive'] as InterpreterStatus[]).map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
        <select value={langFilter} onChange={(e) => setLangFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white">
          <option value="">전체 언어</option>
          {allLanguages.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm text-gray-500">총 <span className="font-semibold text-gray-900">{filtered.length}</span>명</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['통역사명', '지원 언어', '전문분야', '상태', '평점', '완료 건수', '연락처', '등록일', ''].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((i) => (
                <tr key={i.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap">{i.name}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {i.languages.map((l) => (
                        <span key={l} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">{l}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-600">{i.specialties.join(', ')}</td>
                  <td className="py-3 px-4"><Badge status={i.status} /></td>
                  <td className="py-3 px-4"><Stars rating={i.rating} /></td>
                  <td className="py-3 px-4 text-gray-700 font-medium">{i.completedCases.toLocaleString()}건</td>
                  <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{i.phone}</td>
                  <td className="py-3 px-4 text-xs text-gray-400">{i.joinedAt}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button className="text-xs text-blue-600 hover:underline">상세</button>
                      <button className="text-xs text-gray-500 hover:underline">수정</button>
                      <button className="text-xs text-red-500 hover:underline">삭제</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
