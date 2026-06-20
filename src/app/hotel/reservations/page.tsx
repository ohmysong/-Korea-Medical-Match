'use client'

import { useState, useMemo } from 'react'
import { mockHotelReservations, type HotelReservation, type ReservationStatus } from '@/lib/hotel-mock-data'

const STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: '대기',
  confirmed: '확정',
  checked_in: '체크인',
  checked_out: '체크아웃',
  cancelled: '취소',
}
const STATUS_STYLES: Record<ReservationStatus, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  confirmed: 'bg-blue-50 text-blue-700',
  checked_in: 'bg-green-50 text-green-700',
  checked_out: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-50 text-red-500',
}
const PAYMENT_LABELS = { pending: '미결제', partial: '일부결제', paid: '결제완료' }
const PAYMENT_STYLES = {
  pending: 'text-red-600',
  partial: 'text-yellow-600',
  paid: 'text-green-600',
}

function DetailModal({ item, onClose, onCheckIn, onCheckOut }: {
  item: HotelReservation
  onClose: () => void
  onCheckIn: (id: string) => void
  onCheckOut: (id: string) => void
}) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-gray-900">{item.guestName}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{item.nationality} · 예약번호 {item.id}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-400">객실</p>
              <p className="font-medium">{item.roomNumber}호 ({item.roomType})</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">숙박</p>
              <p className="font-medium">{item.checkIn} ~ {item.checkOut} ({item.nights}박)</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">담당 병원</p>
              <p className="font-medium">{item.hospital}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">진료 목적</p>
              <p className="font-medium">{item.treatmentPurpose}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">1박 요금</p>
              <p className="font-medium">{item.pricePerNight.toLocaleString()}원</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">총 요금</p>
              <p className="font-semibold text-gray-900">{item.totalAmount.toLocaleString()}원</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">결제 상태</p>
              <p className={`font-medium ${PAYMENT_STYLES[item.paymentStatus]}`}>{PAYMENT_LABELS[item.paymentStatus]}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">예약 상태</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[item.status]}`}>
                {STATUS_LABELS[item.status]}
              </span>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            {item.status === 'confirmed' && (
              <button onClick={() => { onCheckIn(item.id); onClose() }}
                className="flex-1 bg-amber-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-amber-600">
                체크인 처리
              </button>
            )}
            {item.status === 'checked_in' && (
              <button onClick={() => { onCheckOut(item.id); onClose() }}
                className="flex-1 bg-gray-700 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800">
                체크아웃 처리
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

export default function ReservationsPage() {
  const [items, setItems] = useState(mockHotelReservations)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | ''>('')
  const [selected, setSelected] = useState<HotelReservation | null>(null)
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  function handleCheckIn(id: string) {
    setItems((prev) => prev.map((r) => r.id === id ? { ...r, status: 'checked_in' as ReservationStatus } : r))
    showToast('체크인 처리되었습니다.')
  }

  function handleCheckOut(id: string) {
    setItems((prev) => prev.map((r) => r.id === id ? { ...r, status: 'checked_out' as ReservationStatus } : r))
    showToast('체크아웃 처리되었습니다.')
  }

  const filtered = useMemo(() => {
    return items.filter((r) => {
      const q = search.toLowerCase()
      const matchSearch = !search || r.guestName.toLowerCase().includes(q) || r.nationality.toLowerCase().includes(q) || r.roomNumber.includes(q) || r.treatmentPurpose.toLowerCase().includes(q)
      const matchStatus = !statusFilter || r.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [items, search, statusFilter])

  const stats = [
    { label: '전체 예약', value: items.length },
    { label: '현재 체크인', value: items.filter((r) => r.status === 'checked_in').length },
    { label: '예약 확정', value: items.filter((r) => r.status === 'confirmed').length },
    { label: '총 매출', value: items.reduce((s, r) => s + r.totalAmount, 0).toLocaleString() + '원' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {toast && <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg">{toast}</div>}
      {selected && (
        <DetailModal
          item={selected}
          onClose={() => setSelected(null)}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
        />
      )}

      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">예약 현황</h1>
        <p className="text-sm text-gray-500 mt-0.5">투숙 고객 예약 상태 및 체크인·체크아웃 관리</p>
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
        <input type="text" placeholder="고객명, 국적, 객실번호, 진료 목적 검색..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ReservationStatus | '')}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white">
          <option value="">전체 상태</option>
          {(['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'] as ReservationStatus[]).map((s) => (
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
                {['고객명', '국적', '객실', '체크인', '체크아웃', '박수', '진료 목적', '총 금액', '결제', '상태', ''].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelected(r)}>
                  <td className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap">{r.guestName}</td>
                  <td className="py-3 px-4 text-xs text-gray-500">{r.nationality}</td>
                  <td className="py-3 px-4 text-xs font-mono">{r.roomNumber}호 <span className="text-gray-400">({r.roomType})</span></td>
                  <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{r.checkIn}</td>
                  <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{r.checkOut}</td>
                  <td className="py-3 px-4 text-xs text-gray-600">{r.nights}박</td>
                  <td className="py-3 px-4 text-xs text-gray-600 whitespace-nowrap">{r.treatmentPurpose}</td>
                  <td className="py-3 px-4 text-xs font-medium text-gray-900 whitespace-nowrap">{r.totalAmount.toLocaleString()}원</td>
                  <td className="py-3 px-4 text-xs whitespace-nowrap">
                    <span className={`font-medium ${PAYMENT_STYLES[r.paymentStatus]}`}>{PAYMENT_LABELS[r.paymentStatus]}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[r.status]}`}>
                      {STATUS_LABELS[r.status]}
                    </span>
                  </td>
                  <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-2 whitespace-nowrap">
                      {r.status === 'confirmed' && (
                        <button onClick={() => handleCheckIn(r.id)}
                          className="text-xs bg-amber-500 text-white px-2.5 py-1 rounded hover:bg-amber-600">
                          체크인
                        </button>
                      )}
                      {r.status === 'checked_in' && (
                        <button onClick={() => handleCheckOut(r.id)}
                          className="text-xs bg-gray-600 text-white px-2.5 py-1 rounded hover:bg-gray-700">
                          체크아웃
                        </button>
                      )}
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
