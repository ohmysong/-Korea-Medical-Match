'use client'

import { useState, useMemo } from 'react'
import { mockSettlements, type SettlementStatus } from '@/lib/admin-mock-data'

const STATUS_LABELS: Record<SettlementStatus, string> = { pending: '미처리', processing: '처리 중', completed: '완료', cancelled: '취소' }
const STATUS_STYLES: Record<SettlementStatus, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  processing: 'bg-blue-50 text-blue-700 border border-blue-200',
  completed: 'bg-green-50 text-green-700 border border-green-200',
  cancelled: 'bg-red-50 text-red-700 border border-red-200',
}

function fmt(n: number) {
  if (n === 0) return '-'
  if (n >= 100000000) return `₩${(n / 100000000).toFixed(1)}억`
  if (n >= 10000000) return `₩${(n / 10000000).toFixed(0)}천만`
  if (n >= 1000000) return `₩${(n / 1000000).toFixed(0)}백만`
  return `₩${n.toLocaleString()}`
}

export default function SettlementsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<SettlementStatus | ''>('')

  const totalCommission = mockSettlements.filter((s) => s.status === 'completed').reduce((sum, s) => sum + s.commissionAmount, 0)
  const pendingCommission = mockSettlements.filter((s) => s.status === 'pending').reduce((sum, s) => sum + s.commissionAmount, 0)

  const stats = [
    { label: '전체 건수', value: mockSettlements.length },
    { label: '미처리', value: mockSettlements.filter((s) => s.status === 'pending').length },
    { label: '완료 수수료', value: fmt(totalCommission) },
    { label: '미수금 수수료', value: fmt(pendingCommission) },
  ]

  const filtered = useMemo(() => {
    return mockSettlements.filter((s) => {
      const q = search.toLowerCase()
      const matchSearch = !search || s.patientName.toLowerCase().includes(q) || s.hospital.includes(q) || s.treatment.includes(q)
      const matchStatus = !statusFilter || s.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [search, statusFilter])

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">정산 관리</h1>
          <p className="text-sm text-gray-500 mt-0.5">진료비 수수료 정산 처리 및 내역 조회</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          + 정산 등록
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
        <input type="text" placeholder="환자명, 병원, 진료 검색..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as SettlementStatus | '')}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white">
          <option value="">전체 상태</option>
          {(['pending', 'processing', 'completed', 'cancelled'] as SettlementStatus[]).map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
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
                {['환자명', '병원', '진료', '진료비', '수수료율', '수수료', '상태', '지급예정일', '지급일', ''].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap">{s.patientName}</td>
                  <td className="py-3 px-4 text-xs text-gray-600 whitespace-nowrap">{s.hospital}</td>
                  <td className="py-3 px-4 text-xs text-gray-600 whitespace-nowrap">{s.treatment}</td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900 whitespace-nowrap">{fmt(s.totalAmount)}</td>
                  <td className="py-3 px-4 text-gray-600">{s.commissionRate}%</td>
                  <td className="py-3 px-4 text-sm font-semibold text-blue-600 whitespace-nowrap">{fmt(s.commissionAmount)}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[s.status]}`}>
                      {STATUS_LABELS[s.status]}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-400 whitespace-nowrap">{s.dueDate}</td>
                  <td className="py-3 px-4 text-xs text-gray-400 whitespace-nowrap">{s.paidDate || '-'}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      {s.status === 'pending' && <button className="text-xs text-blue-600 hover:underline">처리</button>}
                      <button className="text-xs text-gray-500 hover:underline">상세</button>
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
