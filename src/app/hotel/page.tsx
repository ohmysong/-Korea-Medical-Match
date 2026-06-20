'use client'

import Link from 'next/link'
import {
  mockHotelGuests,
  mockCheckupApplications,
  mockVehicleAssignments,
  mockInterpreterAssignments,
  mockScheduleItems,
  mockHotelProfile,
} from '@/lib/hotel-mock-data'

const SCHEDULE_TYPE_STYLES: Record<string, string> = {
  hospital: 'bg-red-50 text-red-700',
  checkup: 'bg-blue-50 text-blue-700',
  vehicle: 'bg-purple-50 text-purple-700',
  interpreter: 'bg-green-50 text-green-700',
}
const SCHEDULE_TYPE_LABELS: Record<string, string> = {
  hospital: '병원',
  checkup: '검진',
  vehicle: '차량',
  interpreter: '통역',
}
const GUEST_STATUS_STYLES: Record<string, string> = {
  reserved: 'bg-blue-50 text-blue-700',
  checked_in: 'bg-green-50 text-green-700',
  checked_out: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-50 text-red-500',
}
const GUEST_STATUS_LABELS: Record<string, string> = {
  reserved: '예약',
  checked_in: '체크인',
  checked_out: '체크아웃',
  cancelled: '취소',
}

export default function HotelDashboard() {
  const checkedIn = mockHotelGuests.filter((g) => g.status === 'checked_in').length
  const todayCheckIn = mockHotelGuests.filter((g) => g.checkIn === '2026-06-18').length
  const todayCheckOut = mockHotelGuests.filter((g) => g.checkOut === '2026-06-18').length
  const pendingCheckups = mockCheckupApplications.filter((c) => c.status === 'draft' || c.status === 'submitted').length
  const activeVehicles = mockVehicleAssignments.filter((v) => v.status === 'scheduled' || v.status === 'en_route').length
  const activeInterpreters = mockInterpreterAssignments.filter((i) => i.status === 'scheduled' || i.status === 'active').length

  const todaySchedule = mockScheduleItems
    .filter((s) => s.date === '2026-06-18' && s.status === 'scheduled')
    .sort((a, b) => a.time.localeCompare(b.time))

  const currentGuests = mockHotelGuests.filter((g) => g.status === 'checked_in' || g.status === 'reserved').slice(0, 5)

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">대시보드</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {mockHotelProfile.name} — 오늘: 2026년 6월 18일 · 가용 객실 {mockHotelProfile.availableRooms}/{mockHotelProfile.totalRooms}개
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-6 gap-3 mb-6">
        {[
          { label: '현재 체크인', value: checkedIn, href: '/hotel/guests', color: 'text-green-600' },
          { label: '오늘 체크인', value: todayCheckIn, href: '/hotel/reservations', color: 'text-blue-600' },
          { label: '오늘 체크아웃', value: todayCheckOut, href: '/hotel/reservations', color: 'text-gray-600' },
          { label: '검진 신청 대기', value: pendingCheckups, href: '/hotel/checkup', color: 'text-amber-600' },
          { label: '운행 차량', value: activeVehicles, href: '/hotel/vehicles', color: 'text-purple-600' },
          { label: '통역 예정', value: activeInterpreters, href: '/hotel/interpreters', color: 'text-teal-600' },
        ].map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors"
          >
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Today's schedule */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-900">오늘 일정 (2026-06-18)</h2>
            <Link href="/hotel/schedule" className="text-xs text-amber-600 hover:underline">전체 보기</Link>
          </div>
          {todaySchedule.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-gray-400">오늘 예정된 일정이 없습니다.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {todaySchedule.map((item) => (
                <div key={item.id} className="px-4 py-3 flex items-start gap-3">
                  <div className="text-xs font-mono text-gray-500 w-12 flex-shrink-0 mt-0.5">{item.time}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${SCHEDULE_TYPE_STYLES[item.type]}`}>
                        {SCHEDULE_TYPE_LABELS[item.type]}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{item.guestName}</span>
                      <span className="text-xs text-gray-400">{item.nationality}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{item.details}</p>
                    <p className="text-xs text-gray-400 truncate">{item.location}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Current guests */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-900">현재 고객</h2>
            <Link href="/hotel/guests" className="text-xs text-amber-600 hover:underline">전체 보기</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {currentGuests.map((guest) => (
              <div key={guest.id} className="px-4 py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{guest.name}</p>
                    <span className="text-xs text-gray-400">{guest.nationality}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {guest.roomNumber}호 · {guest.treatmentPurpose}
                  </p>
                  <p className="text-xs text-gray-400">{guest.checkIn} ~ {guest.checkOut}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${GUEST_STATUS_STYLES[guest.status]}`}>
                  {GUEST_STATUS_LABELS[guest.status]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">빠른 실행</h2>
        <div className="grid grid-cols-4 gap-3">
          {[
            { href: '/hotel/guests', label: '고객 등록', desc: '신규 환자 고객 등록', color: 'border-amber-200 hover:bg-amber-50' },
            { href: '/hotel/checkup', label: '검진 신청', desc: `신청 대기 ${pendingCheckups}건`, color: 'border-blue-200 hover:bg-blue-50' },
            { href: '/hotel/vehicles', label: '차량 확인', desc: `운행 중 ${activeVehicles}건`, color: 'border-purple-200 hover:bg-purple-50' },
            { href: '/hotel/interpreters', label: '통역 확인', desc: `예정 ${activeInterpreters}건`, color: 'border-teal-200 hover:bg-teal-50' },
          ].map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className={`border rounded-lg p-3 transition-colors ${a.color}`}
            >
              <p className="text-sm font-medium text-gray-900">{a.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{a.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
