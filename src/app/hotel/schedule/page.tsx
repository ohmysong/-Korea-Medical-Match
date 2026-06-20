'use client'

import { useState, useMemo } from 'react'
import { mockScheduleItems, type ScheduleType, type ScheduleStatus } from '@/lib/hotel-mock-data'

const TYPE_LABELS: Record<ScheduleType, string> = {
  hospital: '병원 진료',
  checkup: '건강검진',
  vehicle: '차량',
  interpreter: '통역',
}
const TYPE_STYLES: Record<ScheduleType, string> = {
  hospital: 'bg-red-50 text-red-700',
  checkup: 'bg-blue-50 text-blue-700',
  vehicle: 'bg-purple-50 text-purple-700',
  interpreter: 'bg-green-50 text-green-700',
}
const STATUS_STYLES: Record<ScheduleStatus, string> = {
  scheduled: 'bg-yellow-50 text-yellow-700',
  completed: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-50 text-red-400',
}

export default function SchedulePage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<ScheduleType | ''>('')
  const [dateFilter, setDateFilter] = useState('')

  const filtered = useMemo(() => {
    return mockScheduleItems
      .filter((s) => {
        const q = search.toLowerCase()
        const matchSearch = !search || s.guestName.toLowerCase().includes(q) || s.details.toLowerCase().includes(q) || s.location.toLowerCase().includes(q)
        const matchType = !typeFilter || s.type === typeFilter
        const matchDate = !dateFilter || s.date === dateFilter
        return matchSearch && matchType && matchDate
      })
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
  }, [search, typeFilter, dateFilter])

  // Group by date
  const grouped = useMemo(() => {
    const map: Record<string, typeof filtered> = {}
    filtered.forEach((s) => {
      if (!map[s.date]) map[s.date] = []
      map[s.date].push(s)
    })
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
  }, [filtered])

  const stats = [
    { label: '전체 일정', value: mockScheduleItems.length },
    { label: '예정', value: mockScheduleItems.filter((s) => s.status === 'scheduled').length },
    { label: '병원·검진', value: mockScheduleItems.filter((s) => s.type === 'hospital' || s.type === 'checkup').length },
    { label: '차량·통역', value: mockScheduleItems.filter((s) => s.type === 'vehicle' || s.type === 'interpreter').length },
  ]

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">일정 확인</h1>
        <p className="text-sm text-gray-500 mt-0.5">투숙 고객의 병원 진료, 검진, 차량, 통역 일정 통합 조회</p>
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
        <input type="text" placeholder="고객명, 일정 내용, 장소 검색..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400" />
        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400" />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as ScheduleType | '')}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white">
          <option value="">전체 유형</option>
          {(['hospital', 'checkup', 'vehicle', 'interpreter'] as ScheduleType[]).map((t) => (
            <option key={t} value={t}>{TYPE_LABELS[t]}</option>
          ))}
        </select>
        {dateFilter && (
          <button onClick={() => setDateFilter('')}
            className="text-xs text-gray-400 hover:text-gray-600 px-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            날짜 초기화
          </button>
        )}
      </div>

      <div className="space-y-4">
        {grouped.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-8 text-center text-sm text-gray-400">
            조건에 맞는 일정이 없습니다.
          </div>
        )}
        {grouped.map(([date, items]) => (
          <div key={date} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-800">{date}</span>
              {date === '2026-06-18' && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">오늘</span>
              )}
              <span className="text-xs text-gray-400">{items.length}건</span>
            </div>
            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="px-4 py-3 flex items-start gap-4">
                  <div className="text-xs font-mono text-gray-500 w-12 flex-shrink-0 pt-0.5">{item.time}</div>
                  <div className="flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_STYLES[item.type]}`}>
                      {TYPE_LABELS[item.type]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">{item.guestName}</p>
                      <span className="text-xs text-gray-400">{item.nationality}</span>
                    </div>
                    <p className="text-xs text-gray-700 mt-0.5">{item.details}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.location}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[item.status]}`}>
                      {item.status === 'scheduled' ? '예정' : item.status === 'completed' ? '완료' : '취소'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
