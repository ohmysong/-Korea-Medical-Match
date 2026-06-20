'use client'

import { useState, useMemo } from 'react'
import { mockHotelSettlements, type HotelSettlement, type HotelSettlementStatus } from '@/lib/hotel-mock-data'

const STATUS_LABELS: Record<HotelSettlementStatus, string> = {
  pending: '정산 대기',
  processing: '정산 중',
  completed: '정산 완료',
}
const STATUS_STYLES: Record<HotelSettlementStatus, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  processing: 'bg-blue-50 text-blue-700',
  completed: 'bg-green-50 text-green-700',
}

function DetailModal({ item, onClose, onComplete }: {
  item: HotelSettlement
  onClose: () => void
  onComplete: (id: string) => void
}) {
  const rows = [
    { label: '객실 수익', value: item.roomRevenue },
    { label: '소개 수수료', value: item.referralCommission },
    { label: '패키지 수익', value: item.packageRevenue },
  ]
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-gray-900">정산 상세</h2>
            <p className="text-xs text-gray-400 mt-0.5">{item.id}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm mb-2">
            <div>
              <p className="text-xs text-gray-400">고객명</p>
              <p className="font-medium">{item.guestName} ({item.nationality})</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">숙박 기간</p>
              <p className="font-medium">{item.checkIn} ~ {item.checkOut} ({item.nights}박)</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            {rows.map((r) => (
              <div key={r.label} className="flex justify-between text-sm">
                <span className="text-gray-500">{r.label}</span>
                <span className="font-medium text-gray-900">{r.value.toLocaleString()}원</span>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-2 flex justify-between text-sm">
              <span className="font-semibold text-gray-800">총 수익</span>
              <span className="font-bold text-amber-600 text-base">{item.totalRevenue.toLocaleString()}원</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-400">예상 지급일</p>
              <p className="font-medium">{item.expectedPayDate}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">실제 지급일</p>
              <p className={`font-medium ${item.paidDate ? 'text-green-600' : 'text-gray-300'}`}>{item.paidDate ?? '미지급'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">정산 상태</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[item.status]}`}>
                {STATUS_LABELS[item.status]}
              </span>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            {item.status === 'processing' && (
              <button onClick={() => { onComplete(item.id); onClose() }}
                className="flex-1 bg-amber-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-amber-600">
                정산 완료 처리
              </button>
            )}
            <button onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50">
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SettlementsPage() {
  const [items, setItems] = useState(mockHotelSettlements)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<HotelSettlementStatus | ''>('')
  const [selected, setSelected] = useState<HotelSettlement | null>(null)
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  function handleComplete(id: string) {
    setItems((prev) => prev.map((s) =>
      s.id === id ? { ...s, status: 'completed' as HotelSettlementStatus, paidDate: '2026-06-18' } : s
    ))
    showToast('정산 완료 처리되었습니다.')
  }

  const filtered = useMemo(() => {
    return items.filter((s) => {
      const q = search.toLowerCase()
      const matchSearch = !search || s.guestName.toLowerCase().includes(q) || s.nationality.toLowerCase().includes(q)
      const matchStatus = !statusFilter || s.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [items, search, statusFilter])

  const totalRevenue = items.reduce((s, i) => s + i.totalRevenue, 0)
  const completedRevenue = items.filter((i) => i.status === 'completed').reduce((s, i) => s + i.totalRevenue, 0)
  const pendingRevenue = items.filter((i) => i.status !== 'completed').reduce((s, i) => s + i.totalRevenue, 0)

  const stats = [
    { label: '전체 정산 건수', value: items.length + '건' },
    { label: '총 수익', value: totalRevenue.toLocaleString() + '원', accent: true },
    { label: '정산 완료', value: completedRevenue.toLocaleString() + '원' },
    { label: '정산 대기', value: pendingRevenue.toLocaleString() + '원' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {toast && <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg">{toast}</div>}
      {selected && (
        <DetailModal
          item={selected}
          onClose={() => setSelected(null)}
          onComplete={handleComplete}
        />
      )}

      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">정산 확인</h1>
        <p className="text-sm text-gray-500 mt-0.5">투숙 고객별 수익 및 KMM 정산 현황</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5">
        {stats.map((s) => (
          <div key={s.label} className={`border rounded-xl p-4 ${s.accent ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200'}`}>
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.accent ? 'text-amber-700' : 'text-gray-900'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex gap-3">
        <input type="text" placeholder="고객명, 국적 검색..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as HotelSettlementStatus | '')}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white">
          <option value="">전체 상태</option>
          {(['pending', 'processing', 'completed'] as HotelSettlementStatus[]).map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm text-gray-500">총 <span className="font-semibold text-gray-900">{filtered.length}</span>건 · 세부 수익은 행 클릭 시 확인</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['고객명', '국적', '숙박 기간', '박수', '총 수익', '예상 지급일', '지급일', '상태', ''].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelected(s)}>
                  <td className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap">{s.guestName}</td>
                  <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{s.nationality}</td>
                  <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{s.checkIn} ~ {s.checkOut}</td>
                  <td className="py-3 px-4 text-xs text-gray-600 whitespace-nowrap">{s.nights}박</td>
                  <td className="py-3 px-4 text-sm font-semibold text-amber-700 whitespace-nowrap">{s.totalRevenue.toLocaleString()}원</td>
                  <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{s.expectedPayDate}</td>
                  <td className="py-3 px-4 text-xs whitespace-nowrap">
                    {s.paidDate
                      ? <span className="text-green-600 font-medium">{s.paidDate}</span>
                      : <span className="text-gray-300">-</span>}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[s.status]}`}>
                      {STATUS_LABELS[s.status]}
                    </span>
                  </td>
                  <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    {s.status === 'processing' && (
                      <button onClick={() => handleComplete(s.id)}
                        className="text-xs bg-amber-500 text-white px-2.5 py-1 rounded hover:bg-amber-600 whitespace-nowrap">
                        완료 처리
                      </button>
                    )}
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
