'use client'

import { useState, useMemo } from 'react'
import { mockServiceRequests, type ServiceRequest, type ServiceRequestType, type ServiceRequestStatus } from '@/lib/hospital-mock-data'

const STATUS_LABELS: Record<ServiceRequestStatus, string> = {
  pending: '배정 대기',
  assigned: '배정 완료',
  completed: '완료',
  cancelled: '취소',
}
const STATUS_STYLES: Record<ServiceRequestStatus, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  assigned: 'bg-blue-50 text-blue-700',
  completed: 'bg-green-50 text-green-700',
  cancelled: 'bg-gray-100 text-gray-400',
}

function DetailModal({ req, onClose }: { req: ServiceRequest; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-base font-bold text-gray-900">
            {req.type === 'interpreter' ? '통역 요청 상세' : '차량 요청 상세'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div className="p-6 space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500">환자명</p>
              <p className="font-medium text-gray-900 mt-0.5">{req.patientName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">국적</p>
              <p className="font-medium text-gray-900 mt-0.5">{req.nationality}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">요청 날짜</p>
              <p className="font-medium text-gray-900 mt-0.5">{req.requestedDate}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">상태</p>
              <span className={`inline-block mt-0.5 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[req.status]}`}>
                {STATUS_LABELS[req.status]}
              </span>
            </div>
            {req.type === 'interpreter' && req.language && (
              <div className="col-span-2">
                <p className="text-xs text-gray-500">요청 언어</p>
                <p className="font-medium text-purple-700 mt-0.5">{req.language}</p>
              </div>
            )}
            {req.type === 'vehicle' && (
              <>
                <div>
                  <p className="text-xs text-gray-500">차량 유형</p>
                  <p className="font-medium text-gray-900 mt-0.5">{req.vehicleType}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">탑승 위치</p>
                  <p className="font-medium text-gray-900 mt-0.5">{req.pickupLocation}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">목적지</p>
                  <p className="font-medium text-gray-900 mt-0.5">{req.destination}</p>
                </div>
              </>
            )}
            {req.assignedName && (
              <div className="col-span-2">
                <p className="text-xs text-gray-500">배정 담당</p>
                <p className="font-medium text-blue-700 mt-0.5">{req.assignedName}</p>
              </div>
            )}
          </div>
          {req.note && (
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-xs text-yellow-800">
              <span className="font-semibold">메모: </span>{req.note}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RequestsPage() {
  const [items, setItems] = useState(mockServiceRequests)
  const [typeTab, setTypeTab] = useState<ServiceRequestType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<ServiceRequestStatus | ''>('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<ServiceRequest | null>(null)
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  function handleRequestAssign(id: string) {
    setItems((prev) => prev.map((r) =>
      r.id === id ? { ...r, status: 'assigned' as ServiceRequestStatus, assignedName: 'KMM 배정 대기 중' } : r
    ))
    showToast('KMM 운영팀에 배정을 요청했습니다.')
  }

  function handleCancel(id: string) {
    setItems((prev) => prev.map((r) =>
      r.id === id ? { ...r, status: 'cancelled' as ServiceRequestStatus } : r
    ))
    showToast('요청이 취소되었습니다.')
  }

  const interpreterReqs = items.filter((r) => r.type === 'interpreter')
  const vehicleReqs = items.filter((r) => r.type === 'vehicle')

  const stats = [
    { label: '전체 요청', value: items.length },
    { label: '통역 요청', value: interpreterReqs.length },
    { label: '차량 요청', value: vehicleReqs.length },
    { label: '배정 대기', value: items.filter((r) => r.status === 'pending').length },
  ]

  const filtered = useMemo(() => {
    return items.filter((r) => {
      const q = search.toLowerCase()
      const matchSearch =
        !search ||
        r.patientName.toLowerCase().includes(q) ||
        (r.language ?? '').toLowerCase().includes(q) ||
        (r.assignedName ?? '').toLowerCase().includes(q) ||
        (r.pickupLocation ?? '').toLowerCase().includes(q)
      const matchType = typeTab === 'all' || r.type === typeTab
      const matchStatus = !statusFilter || r.status === statusFilter
      return matchSearch && matchType && matchStatus
    })
  }, [items, search, typeTab, statusFilter])

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      {selected && <DetailModal req={selected} onClose={() => setSelected(null)} />}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">통역 / 차량 요청</h1>
          <p className="text-sm text-gray-500 mt-0.5">환자 진료를 위한 통역사 및 차량 서비스 요청 관리</p>
        </div>
        <button
          onClick={() => showToast('새 서비스 요청 기능은 예약 관리에서 진행해주세요.')}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
        >
          + 서비스 요청
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
        <div className="flex border border-gray-200 rounded-lg overflow-hidden text-sm">
          {(['all', 'interpreter', 'vehicle'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeTab(t)}
              className={`px-3 py-2 font-medium transition-colors ${
                typeTab === t ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t === 'all' ? '전체' : t === 'interpreter' ? '통역' : '차량'}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="환자명, 언어, 담당자, 장소 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ServiceRequestStatus | '')}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white"
        >
          <option value="">전체 상태</option>
          {(['pending', 'assigned', 'completed', 'cancelled'] as ServiceRequestStatus[]).map((s) => (
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
                {['유형', '환자명', '국적', '요청 날짜', '세부 정보', '배정 담당', '상태', '요청일', ''].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      req.type === 'interpreter' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {req.type === 'interpreter' ? '통역' : '차량'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap">{req.patientName}</td>
                  <td className="py-3 px-4 text-xs text-gray-500">{req.nationality}</td>
                  <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{req.requestedDate}</td>
                  <td className="py-3 px-4 text-xs text-gray-600">
                    {req.type === 'interpreter' ? (
                      <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded">{req.language}</span>
                    ) : (
                      <div>
                        <p className="font-medium text-gray-800">{req.vehicleType}</p>
                        <p className="text-gray-400 truncate max-w-[160px]">{req.pickupLocation}</p>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500">
                    {req.assignedName ?? <span className="text-gray-300">미배정</span>}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[req.status]}`}>
                      {STATUS_LABELS[req.status]}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-400 whitespace-nowrap">{req.createdAt}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2 whitespace-nowrap">
                      <button onClick={() => setSelected(req)} className="text-xs text-blue-600 hover:underline">상세</button>
                      {req.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleRequestAssign(req.id)}
                            className="text-xs bg-green-600 text-white px-2.5 py-1 rounded hover:bg-green-700"
                          >
                            배정 요청
                          </button>
                          <button onClick={() => handleCancel(req.id)} className="text-xs text-red-500 hover:underline">취소</button>
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
  )
}
