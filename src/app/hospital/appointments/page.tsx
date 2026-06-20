'use client'

import { useState, useMemo } from 'react'
import { mockHospitalAppointments, type HospitalAppointment, type AppointmentStatus } from '@/lib/hospital-mock-data'

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: '확정 대기',
  confirmed: '예약 확정',
  rejected: '거절',
  completed: '진료 완료',
  cancelled: '취소',
}
const STATUS_STYLES: Record<AppointmentStatus, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  confirmed: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-gray-100 text-gray-400',
}

function DetailModal({ apt, onClose, onConfirm, onReject }: {
  apt: HospitalAppointment
  onClose: () => void
  onConfirm: (id: string) => void
  onReject: (id: string, reason: string) => void
}) {
  const [rejectReason, setRejectReason] = useState('')
  const [showReject, setShowReject] = useState(false)

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-start">
          <div>
            <h2 className="text-base font-bold text-gray-900">예약 상세</h2>
            <p className="text-xs text-gray-400 mt-0.5">{apt.patientName} · {apt.nationality}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none mt-0.5">×</button>
        </div>

        <div className="p-6 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-500">진료</p>
              <p className="font-medium text-gray-900 mt-0.5">{apt.treatment}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">담당 의사</p>
              <p className="font-medium text-gray-900 mt-0.5">{apt.doctor}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">희망 날짜</p>
              <p className="font-medium text-gray-900 mt-0.5">{apt.requestedDate}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">확정 날짜</p>
              <p className="font-medium text-gray-900 mt-0.5">{apt.confirmedDate ?? '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">통역 필요</p>
              <p className="font-medium mt-0.5">{apt.needsInterpreter ? <span className="text-purple-700">필요</span> : '불필요'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">차량 필요</p>
              <p className="font-medium mt-0.5">{apt.needsVehicle ? <span className="text-blue-700">필요</span> : '불필요'}</p>
            </div>
          </div>
          {apt.note && (
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-xs text-yellow-800">
              <span className="font-semibold">메모: </span>{apt.note}
            </div>
          )}

          {apt.status === 'pending' && !showReject && (
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => { onConfirm(apt.id); onClose() }}
                className="flex-1 bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-700"
              >
                예약 확정
              </button>
              <button
                onClick={() => setShowReject(true)}
                className="flex-1 border border-red-200 text-red-600 py-2.5 rounded-lg text-sm font-medium hover:bg-red-50"
              >
                거절
              </button>
            </div>
          )}

          {showReject && (
            <div className="space-y-2 pt-2">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="거절 사유를 입력하세요 (환자에게 전달됩니다)"
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { onReject(apt.id, rejectReason); onClose() }}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700"
                >
                  거절 확정
                </button>
                <button onClick={() => setShowReject(false)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm">
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AppointmentsPage() {
  const [items, setItems] = useState(mockHospitalAppointments)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | ''>('')
  const [selected, setSelected] = useState<HospitalAppointment | null>(null)
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  function handleConfirm(id: string) {
    setItems((prev) => prev.map((a) =>
      a.id === id ? { ...a, status: 'confirmed' as AppointmentStatus, confirmedDate: '2026-06-18' } : a
    ))
    showToast('예약이 확정되었습니다.')
  }

  function handleReject(id: string, reason: string) {
    setItems((prev) => prev.map((a) =>
      a.id === id ? { ...a, status: 'rejected' as AppointmentStatus, note: reason || '일정 조율 불가' } : a
    ))
    showToast('예약이 거절되었습니다.')
  }

  const stats = [
    { label: '전체', value: items.length },
    { label: '확정 대기', value: items.filter((a) => a.status === 'pending').length },
    { label: '예약 확정', value: items.filter((a) => a.status === 'confirmed').length },
    { label: '진료 완료', value: items.filter((a) => a.status === 'completed').length },
  ]

  const filtered = useMemo(() => {
    return items.filter((a) => {
      const q = search.toLowerCase()
      const matchSearch =
        !search ||
        a.patientName.toLowerCase().includes(q) ||
        a.treatment.toLowerCase().includes(q) ||
        a.doctor.toLowerCase().includes(q)
      const matchStatus = !statusFilter || a.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [items, search, statusFilter])

  const pending = filtered.filter((a) => a.status === 'pending')
  const others = filtered.filter((a) => a.status !== 'pending')

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      {selected && (
        <DetailModal
          apt={selected}
          onClose={() => setSelected(null)}
          onConfirm={handleConfirm}
          onReject={handleReject}
        />
      )}

      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">예약 관리</h1>
        <p className="text-sm text-gray-500 mt-0.5">예약 확정 · 거절 및 일정 관리</p>
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
        <input
          type="text"
          placeholder="환자명, 진료, 의사 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | '')}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white"
        >
          <option value="">전체 상태</option>
          {(['pending', 'confirmed', 'rejected', 'completed', 'cancelled'] as AppointmentStatus[]).map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {/* Pending — needs immediate action */}
      {!statusFilter && pending.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-sm font-semibold text-gray-900">확정 대기</h2>
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">{pending.length}건 조치 필요</span>
          </div>
          <div className="bg-white border border-yellow-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-yellow-50 border-b border-yellow-100">
                    {['환자명', '국적', '진료', '희망 날짜', '담당 의사', '서비스', '요청일', ''].map((h) => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-yellow-50">
                  {pending.map((apt) => (
                    <tr key={apt.id} className="hover:bg-yellow-50/50">
                      <td className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap">{apt.patientName}</td>
                      <td className="py-3 px-4 text-xs text-gray-500">{apt.nationality}</td>
                      <td className="py-3 px-4 text-xs text-gray-700 max-w-[160px] truncate">{apt.treatment}</td>
                      <td className="py-3 px-4 text-xs text-gray-600 whitespace-nowrap">{apt.requestedDate}</td>
                      <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{apt.doctor}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          {apt.needsInterpreter && <span className="text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">통역</span>}
                          {apt.needsVehicle && <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">차량</span>}
                          {!apt.needsInterpreter && !apt.needsVehicle && <span className="text-xs text-gray-300">-</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-400 whitespace-nowrap">{apt.createdAt}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2 whitespace-nowrap">
                          <button
                            onClick={() => handleConfirm(apt.id)}
                            className="text-xs bg-green-600 text-white px-2.5 py-1 rounded hover:bg-green-700"
                          >
                            확정
                          </button>
                          <button
                            onClick={() => setSelected(apt)}
                            className="text-xs border border-red-200 text-red-600 px-2.5 py-1 rounded hover:bg-red-50"
                          >
                            거절
                          </button>
                          <button onClick={() => setSelected(apt)} className="text-xs text-gray-500 hover:underline">상세</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div>
        {!statusFilter && pending.length > 0 && (
          <h2 className="text-sm font-semibold text-gray-900 mb-2">전체 예약</h2>
        )}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm text-gray-500">총 <span className="font-semibold text-gray-900">{filtered.length}</span>건</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {['환자명', '국적', '진료', '희망 날짜', '확정 날짜', '담당 의사', '서비스', '상태', ''].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(statusFilter ? filtered : others).map((apt) => (
                  <tr key={apt.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap">{apt.patientName}</td>
                    <td className="py-3 px-4 text-xs text-gray-500">{apt.nationality}</td>
                    <td className="py-3 px-4 text-xs text-gray-700 max-w-[160px] truncate">{apt.treatment}</td>
                    <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{apt.requestedDate}</td>
                    <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">
                      {apt.confirmedDate ?? <span className="text-gray-300">-</span>}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{apt.doctor}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        {apt.needsInterpreter && <span className="text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">통역</span>}
                        {apt.needsVehicle && <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">차량</span>}
                        {!apt.needsInterpreter && !apt.needsVehicle && <span className="text-xs text-gray-300">-</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[apt.status]}`}>
                        {STATUS_LABELS[apt.status]}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2 whitespace-nowrap">
                        <button onClick={() => setSelected(apt)} className="text-xs text-blue-600 hover:underline">상세</button>
                        {apt.status === 'pending' && (
                          <>
                            <button onClick={() => handleConfirm(apt.id)} className="text-xs text-green-600 hover:underline">확정</button>
                            <button onClick={() => setSelected(apt)} className="text-xs text-red-500 hover:underline">거절</button>
                          </>
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
    </div>
  )
}
