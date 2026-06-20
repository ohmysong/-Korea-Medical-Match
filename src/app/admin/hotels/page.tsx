'use client'

import { useState, useMemo } from 'react'
import { mockHotels } from '@/lib/admin-mock-data'

export default function HotelsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | ''>('')

  const stats = [
    { label: '전체 호텔', value: mockHotels.length },
    { label: '계약 중', value: mockHotels.filter((h) => h.status === 'active').length },
    { label: '전체 객실', value: mockHotels.reduce((sum, h) => sum + h.totalRooms, 0) },
    { label: '가용 객실', value: mockHotels.reduce((sum, h) => sum + h.availableRooms, 0) },
  ]

  const filtered = useMemo(() => {
    return mockHotels.filter((h) => {
      const q = search.toLowerCase()
      const matchSearch = !search || h.name.toLowerCase().includes(q) || h.location.includes(q)
      const matchStatus = !statusFilter || h.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [search, statusFilter])

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">호텔 관리</h1>
          <p className="text-sm text-gray-500 mt-0.5">파트너 호텔 · 객실 현황 · 인근 병원 연결</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          + 호텔 등록
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
        <input type="text" placeholder="호텔명, 위치 검색..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'active' | 'inactive' | '')}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white">
          <option value="">전체</option>
          <option value="active">계약 중</option>
          <option value="inactive">계약 종료</option>
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm text-gray-500">총 <span className="font-semibold text-gray-900">{filtered.length}</span>개 호텔</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['호텔명', '위치', '전체 객실', '가용 객실', '1박 요금', '인근 병원', '담당자', '연락처', '상태', ''].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((h) => (
                <tr key={h.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap">{h.name}</td>
                  <td className="py-3 px-4 text-xs text-gray-600 whitespace-nowrap">{h.location}</td>
                  <td className="py-3 px-4 text-gray-700">{h.totalRooms}개</td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${h.availableRooms === 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {h.availableRooms}개
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700 whitespace-nowrap">
                    ₩{h.pricePerNight.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {h.nearbyHospitals.map((hospital) => (
                        <span key={hospital} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded whitespace-nowrap">{hospital}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500">{h.contactName}</td>
                  <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{h.phone}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${h.status === 'active' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500'}`}>
                      {h.status === 'active' ? '계약 중' : '계약 종료'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button className="text-xs text-blue-600 hover:underline">수정</button>
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
