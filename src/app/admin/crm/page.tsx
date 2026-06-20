'use client'

import { useState, useMemo } from 'react'
import { mockCrmRecords, type CrmType } from '@/lib/admin-mock-data'

const TYPE_LABELS: Record<CrmType, string> = { call: '전화', email: '이메일', chat: '채팅', visit: '방문' }
const TYPE_STYLES: Record<CrmType, string> = {
  call: 'bg-green-50 text-green-700',
  email: 'bg-blue-50 text-blue-700',
  chat: 'bg-purple-50 text-purple-700',
  visit: 'bg-orange-50 text-orange-700',
}

export default function CrmPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<CrmType | ''>('')

  const stats = [
    { label: '전체 인터랙션', value: mockCrmRecords.length },
    { label: '후속 조치 필요', value: mockCrmRecords.filter((c) => c.followUpDate).length },
    { label: '전화 상담', value: mockCrmRecords.filter((c) => c.type === 'call').length },
    { label: '이메일 발송', value: mockCrmRecords.filter((c) => c.type === 'email').length },
  ]

  const filtered = useMemo(() => {
    return mockCrmRecords.filter((c) => {
      const q = search.toLowerCase()
      const matchSearch = !search || c.patientName.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q) || c.coordinator.includes(q)
      const matchType = !typeFilter || c.type === typeFilter
      return matchSearch && matchType
    })
  }, [search, typeFilter])

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">CRM 관리</h1>
          <p className="text-sm text-gray-500 mt-0.5">환자 상담 이력 · 후속 조치 · 코디네이터 관리</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          + 상담 기록 추가
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
        <input type="text" placeholder="환자명, 내용, 담당자 검색..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as CrmType | '')}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white">
          <option value="">전체 유형</option>
          {(['call', 'email', 'chat', 'visit'] as CrmType[]).map((t) => (
            <option key={t} value={t}>{TYPE_LABELS[t]}</option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm text-gray-500">총 <span className="font-semibold text-gray-900">{filtered.length}</span>건</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['환자명', '국적', '유형', '상담 내용', '담당 코디', '일시', '후속 조치일', ''].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap">{c.patientName}</td>
                  <td className="py-3 px-4 text-xs text-gray-500">{c.nationality}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_STYLES[c.type]}`}>
                      {TYPE_LABELS[c.type]}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-600 max-w-xs truncate">{c.summary}</td>
                  <td className="py-3 px-4 text-xs text-gray-500">{c.coordinator}</td>
                  <td className="py-3 px-4 text-xs text-gray-400 whitespace-nowrap">{c.createdAt}</td>
                  <td className="py-3 px-4">
                    {c.followUpDate
                      ? <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded">{c.followUpDate}</span>
                      : <span className="text-xs text-gray-300">-</span>}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button className="text-xs text-blue-600 hover:underline">상세</button>
                      <button className="text-xs text-gray-500 hover:underline">수정</button>
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
