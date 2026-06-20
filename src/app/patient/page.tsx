'use client'

import Link from 'next/link'
import {
  mockPatientProfile,
  mockConsultations,
  mockProposals,
  mockPatientAppointments,
  mockPatientVehicles,
  mockPatientInterpreters,
  mockPatientResults,
} from '@/lib/patient-mock-data'

export default function PatientDashboard() {
  const pendingProposals = mockProposals.filter((p) => p.status === 'sent').length
  const upcomingAppointments = mockPatientAppointments.filter((a) => a.status === 'confirmed').length
  const scheduledVehicles = mockPatientVehicles.filter((v) => v.status === 'scheduled').length
  const scheduledInterpreters = mockPatientInterpreters.filter((i) => i.status === 'scheduled').length
  const newResults = mockPatientResults.filter((r) => r.status === 'uploaded').length

  const nextAppointment = mockPatientAppointments
    .filter((a) => a.status === 'confirmed')
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))[0]

  const unreadProposal = mockProposals.find((p) => p.status === 'sent')

  return (
    <div className="max-w-5xl mx-auto px-6 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">안녕하세요, {mockPatientProfile.name}님</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          담당 코디네이터: {mockPatientProfile.coordinatorName} · {mockPatientProfile.coordinatorPhone}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {[
          { label: '미확인 제안', value: pendingProposals, href: '/patient/proposals', color: 'text-teal-600', urgent: pendingProposals > 0 },
          { label: '예정 진료', value: upcomingAppointments, href: '/patient/schedule', color: 'text-blue-600', urgent: false },
          { label: '예정 차량', value: scheduledVehicles, href: '/patient/vehicles', color: 'text-purple-600', urgent: false },
          { label: '예정 통역', value: scheduledInterpreters, href: '/patient/interpreters', color: 'text-orange-500', urgent: false },
          { label: '새 결과지', value: newResults, href: '/patient/results', color: 'text-green-600', urgent: newResults > 0 },
        ].map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className={`bg-white border rounded-xl p-4 hover:border-gray-300 transition-colors ${s.urgent ? 'border-teal-200 bg-teal-50' : 'border-gray-200'}`}
          >
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Next appointment */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-900">다음 진료 일정</h2>
            <Link href="/patient/schedule" className="text-xs text-teal-600 hover:underline">전체 보기</Link>
          </div>
          {nextAppointment ? (
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-teal-50 rounded-xl flex flex-col items-center justify-center flex-shrink-0 border border-teal-100">
                  <span className="text-xs text-teal-700 font-bold leading-none">{nextAppointment.date.slice(5, 7)}월</span>
                  <span className="text-lg font-bold text-teal-700 leading-none">{nextAppointment.date.slice(8, 10)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{nextAppointment.hospital}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{nextAppointment.doctor} · {nextAppointment.specialty}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{nextAppointment.time} · {nextAppointment.purpose}</p>
                  {nextAppointment.notes && (
                    <p className="text-xs text-amber-600 mt-1 bg-amber-50 px-2 py-1 rounded">⚠ {nextAppointment.notes}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="px-4 py-6 text-center text-xs text-gray-400">예정된 진료 일정이 없습니다.</div>
          )}
        </div>

        {/* Unread proposal alert */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-900">병원 제안</h2>
            <Link href="/patient/proposals" className="text-xs text-teal-600 hover:underline">전체 보기</Link>
          </div>
          {unreadProposal ? (
            <div className="p-4">
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-3">
                <p className="text-xs font-semibold text-teal-700 mb-1">새 제안서가 도착했습니다</p>
                <p className="text-sm font-bold text-gray-900">{unreadProposal.hospitalName}</p>
                <p className="text-xs text-gray-600 mt-0.5">{unreadProposal.doctorName} · {unreadProposal.doctorSpecialty}</p>
                <p className="text-xs text-gray-500 mt-0.5">예상 비용: {unreadProposal.estimatedCost}</p>
                <Link href="/patient/proposals"
                  className="inline-block mt-2 text-xs bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700">
                  제안서 확인하기
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-gray-400">미확인 제안이 없습니다.</div>
          )}
        </div>
      </div>

      {/* Journey status */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">나의 의료 여정</h2>
        <div className="flex items-center gap-2">
          {[
            { label: '상담 신청', done: true, href: '/patient/consultation' },
            { label: '병원 제안 수령', done: true, href: '/patient/proposals' },
            { label: '병원 선택', done: true, href: '/patient/proposals' },
            { label: '진료 예약', done: true, href: '/patient/schedule' },
            { label: '진료·수술', done: false, href: '/patient/schedule' },
            { label: '결과 확인', done: false, href: '/patient/results' },
          ].map((step, i, arr) => (
            <div key={step.label} className="flex items-center gap-2 flex-1 min-w-0">
              <Link href={step.href} className="flex flex-col items-center min-w-0 flex-1 group">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  step.done ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-400'
                } group-hover:opacity-80`}>
                  {step.done ? '✓' : i + 1}
                </div>
                <p className={`text-xs mt-1 text-center truncate w-full ${step.done ? 'text-teal-700 font-medium' : 'text-gray-400'}`}>
                  {step.label}
                </p>
              </Link>
              {i < arr.length - 1 && (
                <div className={`h-px flex-1 ${step.done ? 'bg-teal-300' : 'bg-gray-200'} mb-4 flex-shrink-0`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">빠른 실행</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { href: '/patient/consultation', label: '새 상담 신청', desc: '치료 문의 접수', color: 'border-teal-200 hover:bg-teal-50' },
            { href: '/patient/proposals', label: '제안 확인', desc: `미확인 ${pendingProposals}건`, color: 'border-blue-200 hover:bg-blue-50' },
            { href: '/patient/results', label: '결과 확인', desc: `새 결과지 ${newResults}건`, color: 'border-green-200 hover:bg-green-50' },
          ].map((a) => (
            <Link key={a.href} href={a.href}
              className={`border rounded-lg p-3 transition-colors ${a.color}`}>
              <p className="text-sm font-medium text-gray-900">{a.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{a.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
