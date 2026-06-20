'use client'

import { mockPatientInterpreters, type PatientInterpreterStatus } from '@/lib/patient-mock-data'

const STATUS_LABELS: Record<PatientInterpreterStatus, string> = {
  scheduled: '예정',
  active: '진행 중',
  completed: '완료',
  cancelled: '취소',
}
const STATUS_STYLES: Record<PatientInterpreterStatus, string> = {
  scheduled: 'bg-teal-50 text-teal-700 border border-teal-200',
  active: 'bg-blue-50 text-blue-700',
  completed: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-50 text-red-400',
}

export default function PatientInterpretersPage() {
  const upcoming = mockPatientInterpreters
    .filter((i) => i.status === 'scheduled' || i.status === 'active')
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
  const past = mockPatientInterpreters
    .filter((i) => i.status === 'completed' || i.status === 'cancelled')
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="max-w-3xl mx-auto px-6 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">통역 확인</h1>
        <p className="text-sm text-gray-500 mt-0.5">진료 시 배정된 통역사 일정을 확인하세요</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: '예정 통역', value: upcoming.length },
          { label: '완료', value: mockPatientInterpreters.filter((i) => i.status === 'completed').length },
          { label: '전체', value: mockPatientInterpreters.length },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {upcoming.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">예정 통역 ({upcoming.length}건)</h2>
          <div className="space-y-3">
            {upcoming.map((i) => (
              <div key={i.id} className="bg-white border border-teal-200 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-teal-100">
                      <span className="text-lg">🌐</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{i.date} {i.time}</p>
                      <p className="text-xs text-gray-500">{i.language} 통역 · {i.interpreterName}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_STYLES[i.status]}`}>
                    {STATUS_LABELS[i.status]}
                  </span>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex gap-2">
                    <span className="text-xs text-gray-400 w-12 flex-shrink-0">목적</span>
                    <span className="text-gray-700">{i.purpose}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-xs text-gray-400 w-12 flex-shrink-0">장소</span>
                    <span className="text-gray-600 text-xs">{i.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 mb-3">지난 통역 ({past.length}건)</h2>
          <div className="space-y-3">
            {past.map((i) => (
              <div key={i.id} className="bg-white border border-gray-200 rounded-2xl p-4 opacity-70">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-100">
                      <span className="text-base">🌐</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{i.date} {i.time}</p>
                      <p className="text-xs text-gray-400">{i.language} · {i.interpreterName}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_STYLES[i.status]}`}>
                    {STATUS_LABELS[i.status]}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{i.purpose}</p>
                <p className="text-xs text-gray-400 mt-0.5">{i.location}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
