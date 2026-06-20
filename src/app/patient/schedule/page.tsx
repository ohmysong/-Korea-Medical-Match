'use client'

import { mockPatientAppointments, type PatientAppointmentStatus } from '@/lib/patient-mock-data'

const STATUS_LABELS: Record<PatientAppointmentStatus, string> = {
  confirmed: '예약 확정',
  completed: '진료 완료',
  cancelled: '취소됨',
}
const STATUS_STYLES: Record<PatientAppointmentStatus, string> = {
  confirmed: 'bg-teal-50 text-teal-700 border border-teal-200',
  completed: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-50 text-red-400',
}

export default function PatientSchedulePage() {
  const upcoming = mockPatientAppointments
    .filter((a) => a.status === 'confirmed')
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
  const past = mockPatientAppointments
    .filter((a) => a.status !== 'confirmed')
    .sort((a, b) => b.date.localeCompare(a.date))

  const stats = [
    { label: '예정 진료', value: upcoming.length },
    { label: '완료', value: mockPatientAppointments.filter((a) => a.status === 'completed').length },
    { label: '총 예약', value: mockPatientAppointments.length },
  ]

  return (
    <div className="max-w-3xl mx-auto px-6 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">예약 일정 확인</h1>
        <p className="text-sm text-gray-500 mt-0.5">병원 예약 및 진료 일정을 확인하세요</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {upcoming.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">예정 일정 ({upcoming.length}건)</h2>
          <div className="space-y-3">
            {upcoming.map((appt) => (
              <div key={appt.id} className="bg-white border border-teal-200 rounded-2xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-teal-50 rounded-xl flex flex-col items-center justify-center flex-shrink-0 border border-teal-100">
                    <span className="text-xs text-teal-600 font-medium leading-none">{appt.date.slice(5, 7)}월</span>
                    <span className="text-xl font-bold text-teal-700 leading-none mt-0.5">{appt.date.slice(8, 10)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[appt.status]}`}>
                        {STATUS_LABELS[appt.status]}
                      </span>
                    </div>
                    <p className="text-base font-bold text-gray-900">{appt.hospital}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{appt.doctor} · {appt.specialty}</p>
                    <p className="text-sm text-gray-700 mt-1">{appt.purpose}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span>🕐 {appt.time}</span>
                      <span>📍 {appt.location}</span>
                    </div>
                    {appt.notes && (
                      <div className="mt-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                        <p className="text-xs text-amber-700">⚠ {appt.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 mb-3">지난 일정 ({past.length}건)</h2>
          <div className="space-y-3">
            {past.map((appt) => (
              <div key={appt.id} className="bg-white border border-gray-200 rounded-2xl p-5 opacity-70">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gray-50 rounded-xl flex flex-col items-center justify-center flex-shrink-0 border border-gray-100">
                    <span className="text-xs text-gray-400 font-medium leading-none">{appt.date.slice(5, 7)}월</span>
                    <span className="text-xl font-bold text-gray-500 leading-none mt-0.5">{appt.date.slice(8, 10)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[appt.status]}`}>
                        {STATUS_LABELS[appt.status]}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-gray-700">{appt.hospital}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{appt.doctor} · {appt.specialty}</p>
                    <p className="text-xs text-gray-600 mt-1">{appt.purpose}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span>🕐 {appt.time}</span>
                      <span>📍 {appt.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
