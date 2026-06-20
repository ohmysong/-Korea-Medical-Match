'use client'

import { mockPatientVehicles, type PatientVehicleStatus } from '@/lib/patient-mock-data'

const STATUS_LABELS: Record<PatientVehicleStatus, string> = {
  scheduled: '배차 예정',
  en_route: '이동 중',
  arrived: '도착',
  completed: '완료',
  cancelled: '취소',
}
const STATUS_STYLES: Record<PatientVehicleStatus, string> = {
  scheduled: 'bg-teal-50 text-teal-700 border border-teal-200',
  en_route: 'bg-blue-50 text-blue-700',
  arrived: 'bg-green-50 text-green-700',
  completed: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-50 text-red-400',
}

export default function PatientVehiclesPage() {
  const upcoming = mockPatientVehicles
    .filter((v) => v.status === 'scheduled' || v.status === 'en_route' || v.status === 'arrived')
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
  const past = mockPatientVehicles
    .filter((v) => v.status === 'completed' || v.status === 'cancelled')
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="max-w-3xl mx-auto px-6 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">차량 확인</h1>
        <p className="text-sm text-gray-500 mt-0.5">공항 픽업, 병원 이동 등 차량 배차 현황</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: '예정 차량', value: upcoming.length },
          { label: '완료', value: mockPatientVehicles.filter((v) => v.status === 'completed').length },
          { label: '전체', value: mockPatientVehicles.length },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {upcoming.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">예정 차량 ({upcoming.length}건)</h2>
          <div className="space-y-3">
            {upcoming.map((v) => (
              <div key={v.id} className="bg-white border border-teal-200 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-teal-100">
                      <span className="text-lg">{v.vehicleType === 'VAN' ? '🚐' : '🚗'}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{v.date} {v.time}</p>
                      <p className="text-xs text-gray-500">{v.vehicleType} · {v.plateNumber} · {v.driver}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_STYLES[v.status]}`}>
                    {STATUS_LABELS[v.status]}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400">출발</p>
                    <p className="font-medium text-gray-800 truncate">{v.from}</p>
                  </div>
                  <div className="flex-shrink-0 text-gray-300 text-lg px-2">→</div>
                  <div className="flex-1 min-w-0 text-right">
                    <p className="text-xs text-gray-400">도착</p>
                    <p className="font-medium text-gray-800 truncate">{v.to}</p>
                  </div>
                </div>
                {v.notes && (
                  <div className="mt-3 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                    <p className="text-xs text-amber-700">📌 {v.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 mb-3">지난 차량 ({past.length}건)</h2>
          <div className="space-y-3">
            {past.map((v) => (
              <div key={v.id} className="bg-white border border-gray-200 rounded-2xl p-4 opacity-70">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-100">
                      <span className="text-base">{v.vehicleType === 'VAN' ? '🚐' : '🚗'}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{v.date} {v.time}</p>
                      <p className="text-xs text-gray-400">{v.vehicleType} · {v.plateNumber} · {v.driver}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_STYLES[v.status]}`}>
                    {STATUS_LABELS[v.status]}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="truncate">{v.from}</span>
                  <span className="flex-shrink-0">→</span>
                  <span className="truncate">{v.to}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
