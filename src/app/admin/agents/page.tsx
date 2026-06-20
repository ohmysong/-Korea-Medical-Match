'use client'

import { useState, useMemo } from 'react'
import { mockAgents, type AgentStatus } from '@/lib/admin-mock-data'

const STATUS_LABELS: Record<AgentStatus, string> = { active: '활성', inactive: '비활성' }
const STATUS_STYLES: Record<AgentStatus, string> = {
  active: 'bg-green-50 text-green-700 border border-green-200',
  inactive: 'bg-gray-100 text-gray-500',
}

export default function AgentsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<AgentStatus | ''>('')

  const stats = [
    { label: '전체 에이전트', value: mockAgents.length },
    { label: '활성', value: mockAgents.filter((a) => a.status === 'active').length },
    { label: '이번 달 환자', value: mockAgents.reduce((sum, a) => sum + a.thisMonthPatients, 0) },
    { label: '누적 환자', value: mockAgents.reduce((sum, a) => sum + a.totalPatients, 0).toLocaleString() },
  ]

  const filtered = useMemo(() => {
    return mockAgents.filter((a) => {
      const q = search.toLowerCase()
      const matchSearch = !search || a.name.toLowerCase().includes(q) || a.company.toLowerCase().includes(q) || a.country.includes(q)
      const matchStatus = !statusFilter || a.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [search, statusFilter])

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">에이전트 관리</h1>
          <p className="text-sm text-gray-500 mt-0.5">해외 파트너 에이전트 현황 · 실적 관리</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          + 에이전트 등록
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
        <input type="text" placeholder="이름, 회사, 국가 검색..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as AgentStatus | '')}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white">
          <option value="">전체 상태</option>
          <option value="active">활성</option>
          <option value="inactive">비활성</option>
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm text-gray-500">총 <span className="font-semibold text-gray-900">{filtered.length}</span>개사</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['담당자명', '회사명', '국가', '지원 언어', '이번 달 환자', '누적 환자', '상태', '계약일', '연락처', ''].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap">{a.name}</td>
                  <td className="py-3 px-4 text-gray-600 text-xs whitespace-nowrap">{a.company}</td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{a.country}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {a.languages.map((l) => (
                        <span key={l} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{l}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold text-blue-600">{a.thisMonthPatients}명</td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{a.totalPatients.toLocaleString()}명</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[a.status]}`}>
                      {STATUS_LABELS[a.status]}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-400 whitespace-nowrap">{a.contractDate}</td>
                  <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{a.phone}</td>
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
