'use client'

import { useState, useMemo } from 'react'
import { mockPatients, type PatientStatus } from '@/lib/admin-mock-data'

const STATUS_LABELS: Record<string, string> = {
  inquiry: '문의', consultation: '상담 중', scheduled: '예약 완료',
  'in-treatment': '치료 중', completed: '완료', cancelled: '취소',
}
const STATUS_STYLES: Record<string, string> = {
  inquiry: 'bg-gray-100 text-gray-600',
  consultation: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  scheduled: 'bg-blue-50 text-blue-700 border border-blue-200',
  'in-treatment': 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  completed: 'bg-green-50 text-green-700 border border-green-200',
  cancelled: 'bg-red-50 text-red-700 border border-red-200',
}

const STATUSES: PatientStatus[] = ['inquiry', 'consultation', 'scheduled', 'in-treatment', 'completed', 'cancelled']

function Badge({ status }: { status: string }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-600'}`}>
      {STATUS_LABELS[status] || status}
    </span>
  )
}

export default function PatientsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<PatientStatus | ''>('')

  const stats = [
    { label: '전체 환자', value: mockPatients.length },
    { label: '이번 달 신규', value: mockPatients.filter((p) => p.createdAt >= '2026-06-01').length },
    { label: '치료 진행 중', value: mockPatients.filter((p) => p.status === 'in-treatment').length },
    { label: '응답 대기', value: mockPatients.filter((p) => p.status === 'inquiry').length },
  ]

  const filtered = useMemo(() => {
    return mockPatients.filter((p) => {
      const q = search.toLowerCase()
      const matchSearch = !search || p.name.toLowerCase().includes(q) || p.nationality.includes(q) || p.treatment.includes(q) || p.hospital.includes(q)
      const matchStatus = !statusFilter || p.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [search, statusFilter])

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">전체 환자</h1>
          <p className="text-sm text-gray-500 mt-0.5">환자 조회 · 상태 관리 · 배정</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          + 환자 등록
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex gap-3">
        <input
          type="text"
          placeholder="이름, 국적, 진료, 병원 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as PatientStatus | '')}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white"
        >
          <option value="">전체 상태</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
          <p className="text-sm text-gray-500">
            총 <span className="font-semibold text-gray-900">{filtered.length}</span>명
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['환자명', '국적', '관심 진료', '배정 병원', '상태', '담당 코디', '에이전트', '등록일', '방문일', ''].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap">{p.name}</td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{p.nationality}</td>
                  <td className="py-3 px-4 text-gray-600 text-xs whitespace-nowrap">{p.treatment || '-'}</td>
                  <td className="py-3 px-4 text-gray-600 text-xs whitespace-nowrap">{p.hospital || '-'}</td>
                  <td className="py-3 px-4 whitespace-nowrap"><Badge status={p.status} /></td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{p.coordinator || '-'}</td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{p.agent || '-'}</td>
                  <td className="py-3 px-4 text-gray-400 text-xs">{p.createdAt}</td>
                  <td className="py-3 px-4 text-gray-400 text-xs">{p.visitDate || '-'}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2 whitespace-nowrap">
                      <button className="text-xs text-blue-600 hover:underline">상세</button>
                      <button className="text-xs text-gray-500 hover:underline">수정</button>
                      <button className="text-xs text-red-500 hover:underline">삭제</button>
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
