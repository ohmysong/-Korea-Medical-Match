'use client'

import { useState, useMemo } from 'react'
import { mockVehicleAssignments, type VehicleAssignment, type VehicleAssignmentStatus } from '@/lib/hotel-mock-data'

const STATUS_LABELS: Record<VehicleAssignmentStatus, string> = {
  scheduled: '배차 예정',
  en_route: '이동 중',
  arrived: '도착',
  completed: '완료',
  cancelled: '취소',
}
const STATUS_STYLES: Record<VehicleAssignmentStatus, string> = {
  scheduled: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  en_route: 'bg-blue-50 text-blue-700',
  arrived: 'bg-green-50 text-green-700',
  completed: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-50 text-red-400',
}
const VEHICLE_TYPE_STYLES: Record<string, string> = {
  SEDAN: 'bg-purple-50 text-purple-700',
  VAN: 'bg-indigo-50 text-indigo-700',
}

function DetailModal({ item, onClose, onUpdateStatus }: {
  item: VehicleAssignment
  onClose: () => void
  onUpdateStatus: (id: string, status: VehicleAssignmentStatus) => void
}) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-gray-900">차량 배차 상세</h2>
            <p className="text-xs text-gray-400 mt-0.5">{item.id}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-400">고객</p>
              <p className="font-medium">{item.guestName} ({item.nationality})</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">날짜·시간</p>
              <p className="font-medium">{item.date} {item.time}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">차량 종류</p>
              <p className="font-medium">{item.vehicleType}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">차량 번호</p>
              <p className="font-medium font-mono">{item.plateNumber}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">운전기사</p>
              <p className="font-medium">{item.driver}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">현재 상태</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[item.status]}`}>
                {STATUS_LABELS[item.status]}
              </span>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-400">출발지</p>
              <p className="font-medium">{item.from}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-400">목적지</p>
              <p className="font-medium">{item.to}</p>
            </div>
            {item.notes && (
              <div className="col-span-2">
                <p className="text-xs text-gray-400">메모</p>
                <p className="text-sm text-gray-600">{item.notes}</p>
              </div>
            )}
          </div>
          <div className="flex gap-2 pt-2">
            {item.status === 'scheduled' && (
              <button onClick={() => { onUpdateStatus(item.id, 'en_route'); onClose() }}
                className="flex-1 bg-blue-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-600">
                이동 시작
              </button>
            )}
            {item.status === 'en_route' && (
              <button onClick={() => { onUpdateStatus(item.id, 'arrived'); onClose() }}
                className="flex-1 bg-green-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-600">
                도착 확인
              </button>
            )}
            {item.status === 'arrived' && (
              <button onClick={() => { onUpdateStatus(item.id, 'completed'); onClose() }}
                className="flex-1 bg-amber-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-amber-600">
                운행 완료
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

export default function VehiclesPage() {
  const [items, setItems] = useState(mockVehicleAssignments)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<VehicleAssignmentStatus | ''>('')
  const [selected, setSelected] = useState<VehicleAssignment | null>(null)
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  function handleUpdateStatus(id: string, status: VehicleAssignmentStatus) {
    setItems((prev) => prev.map((v) => v.id === id ? { ...v, status } : v))
    const labels: Record<VehicleAssignmentStatus, string> = {
      scheduled: '배차 예정으로 변경되었습니다.',
      en_route: '이동 시작 처리되었습니다.',
      arrived: '도착 확인되었습니다.',
      completed: '운행 완료 처리되었습니다.',
      cancelled: '취소 처리되었습니다.',
    }
    showToast(labels[status])
  }

  const filtered = useMemo(() => {
    return items.filter((v) => {
      const q = search.toLowerCase()
      const matchSearch = !search || v.guestName.toLowerCase().includes(q) || v.driver.toLowerCase().includes(q) || v.plateNumber.includes(q) || v.from.toLowerCase().includes(q) || v.to.toLowerCase().includes(q)
      const matchStatus = !statusFilter || v.status === statusFilter
      return matchSearch && matchStatus
    }).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
  }, [items, search, statusFilter])

  const stats = [
    { label: '전체 배차', value: items.length },
    { label: '배차 예정', value: items.filter((v) => v.status === 'scheduled').length },
    { label: '이동 중', value: items.filter((v) => v.status === 'en_route' || v.status === 'arrived').length },
    { label: '완료', value: items.filter((v) => v.status === 'completed').length },
  ]

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {toast && <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg">{toast}</div>}
      {selected && (
        <DetailModal
          item={selected}
          onClose={() => setSelected(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">차량 현황</h1>
        <p className="text-sm text-gray-500 mt-0.5">투숙 고객 차량 배차 현황 및 운행 상태 관리</p>
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
        <input type="text" placeholder="고객명, 기사, 차량번호, 출발지/목적지 검색..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as VehicleAssignmentStatus | '')}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white">
          <option value="">전체 상태</option>
          {(['scheduled', 'en_route', 'arrived', 'completed', 'cancelled'] as VehicleAssignmentStatus[]).map((s) => (
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
                {['날짜·시간', '고객명', '국적', '차량', '차량번호', '기사', '출발지', '목적지', '메모', '상태', ''].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelected(v)}>
                  <td className="py-3 px-4 text-xs text-gray-600 whitespace-nowrap font-mono">{v.date}<br />{v.time}</td>
                  <td className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap">{v.guestName}</td>
                  <td className="py-3 px-4 text-xs text-gray-500">{v.nationality}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${VEHICLE_TYPE_STYLES[v.vehicleType] ?? 'bg-gray-100 text-gray-600'}`}>
                      {v.vehicleType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs font-mono text-gray-600 whitespace-nowrap">{v.plateNumber}</td>
                  <td className="py-3 px-4 text-xs text-gray-600 whitespace-nowrap">{v.driver}</td>
                  <td className="py-3 px-4 text-xs text-gray-600 max-w-[140px] truncate">{v.from}</td>
                  <td className="py-3 px-4 text-xs text-gray-600 max-w-[140px] truncate">{v.to}</td>
                  <td className="py-3 px-4 text-xs text-gray-400 max-w-[120px] truncate">{v.notes ?? '-'}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[v.status]}`}>
                      {STATUS_LABELS[v.status]}
                    </span>
                  </td>
                  <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <div className="whitespace-nowrap">
                      {v.status === 'scheduled' && (
                        <button onClick={() => handleUpdateStatus(v.id, 'en_route')}
                          className="text-xs bg-blue-500 text-white px-2.5 py-1 rounded hover:bg-blue-600">
                          이동 시작
                        </button>
                      )}
                      {v.status === 'en_route' && (
                        <button onClick={() => handleUpdateStatus(v.id, 'arrived')}
                          className="text-xs bg-green-500 text-white px-2.5 py-1 rounded hover:bg-green-600">
                          도착
                        </button>
                      )}
                      {v.status === 'arrived' && (
                        <button onClick={() => handleUpdateStatus(v.id, 'completed')}
                          className="text-xs bg-amber-500 text-white px-2.5 py-1 rounded hover:bg-amber-600">
                          완료
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
