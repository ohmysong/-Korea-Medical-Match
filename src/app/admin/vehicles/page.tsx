'use client'

import { useState, useMemo } from 'react'
import { mockVehicles, type VehicleStatus } from '@/lib/admin-mock-data'

const STATUS_LABELS: Record<VehicleStatus, string> = { available: '대기 중', 'on-trip': '운행 중', maintenance: '정비 중' }
const STATUS_STYLES: Record<VehicleStatus, string> = {
  available: 'bg-green-50 text-green-700 border border-green-200',
  'on-trip': 'bg-blue-50 text-blue-700 border border-blue-200',
  maintenance: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
}

export default function VehiclesPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | ''>('')

  const stats = [
    { label: '전체 차량', value: mockVehicles.length },
    { label: '대기 중', value: mockVehicles.filter((v) => v.status === 'available').length },
    { label: '운행 중', value: mockVehicles.filter((v) => v.status === 'on-trip').length },
    { label: '정비 중', value: mockVehicles.filter((v) => v.status === 'maintenance').length },
  ]

  const filtered = useMemo(() => {
    return mockVehicles.filter((v) => {
      const q = search.toLowerCase()
      const matchSearch = !search || v.driverName.includes(q) || v.licensePlate.includes(q) || v.type.includes(q)
      const matchStatus = !statusFilter || v.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [search, statusFilter])

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">차량 관리</h1>
          <p className="text-sm text-gray-500 mt-0.5">공항 픽업 · 병원 이동 차량 현황 관리</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          + 차량 등록
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
        <input type="text" placeholder="기사명, 차량번호, 유형 검색..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as VehicleStatus | '')}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white">
          <option value="">전체 상태</option>
          <option value="available">대기 중</option>
          <option value="on-trip">운행 중</option>
          <option value="maintenance">정비 중</option>
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm text-gray-500">총 <span className="font-semibold text-gray-900">{filtered.length}</span>대</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {['차종', '차량번호', '기사명', '기사 연락처', '정원', '상태', '현재 배정', ''].map((h) => (
                <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((v) => (
              <tr key={v.id} className="hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-900">{v.type}</td>
                <td className="py-3 px-4 text-gray-600 font-mono text-xs">{v.licensePlate}</td>
                <td className="py-3 px-4 text-gray-700">{v.driverName}</td>
                <td className="py-3 px-4 text-xs text-gray-500">{v.driverPhone}</td>
                <td className="py-3 px-4 text-gray-600">{v.capacity}인승</td>
                <td className="py-3 px-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[v.status]}`}>
                    {STATUS_LABELS[v.status]}
                  </span>
                </td>
                <td className="py-3 px-4 text-xs text-gray-500">{v.currentAssignment || '-'}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button className="text-xs text-blue-600 hover:underline">배정</button>
                    <button className="text-xs text-gray-500 hover:underline">수정</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
