'use client'

import { useState, useMemo } from 'react'
import { mockHospitalSettlements, type HospitalSettlementStatus } from '@/lib/hospital-mock-data'

const STATUS_LABELS: Record<HospitalSettlementStatus, string> = {
  pending: '정산 대기',
  processing: '처리 중',
  completed: '지급 완료',
}
const STATUS_STYLES: Record<HospitalSettlementStatus, string> = {
  pending: 'bg-yellow-50 text-yellow-700',
  processing: 'bg-blue-50 text-blue-700',
  completed: 'bg-green-50 text-green-700',
}

function fmt(n: number) {
  return `₩${n.toLocaleString()}`
}

export default function HospitalSettlementsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<HospitalSettlementStatus | ''>('')

  const totalNet = mockHospitalSettlements.reduce((sum, s) => sum + s.netAmount, 0)
  const completedNet = mockHospitalSettlements
    .filter((s) => s.status === 'completed')
    .reduce((sum, s) => sum + s.netAmount, 0)
  const pendingNet = mockHospitalSettlements
    .filter((s) => s.status !== 'completed')
    .reduce((sum, s) => sum + s.netAmount, 0)

  const stats = [
    { label: '전체 건수', value: mockHospitalSettlements.length },
    { label: '누적 수취 금액', value: fmt(totalNet) },
    { label: '지급 완료', value: fmt(completedNet) },
    { label: '지급 대기', value: fmt(pendingNet) },
  ]

  const filtered = useMemo(() => {
    return mockHospitalSettlements.filter((s) => {
      const q = search.toLowerCase()
      const matchSearch =
        !search ||
        s.patientName.toLowerCase().includes(q) ||
        s.treatment.toLowerCase().includes(q) ||
        s.nationality.toLowerCase().includes(q)
      const matchStatus = !statusFilter || s.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [search, statusFilter])

  const filteredNet = filtered.reduce((sum, s) => sum + s.netAmount, 0)

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">정산 확인</h1>
        <p className="text-sm text-gray-500 mt-0.5">진료비 정산 내역 및 수수료 공제 후 수취 금액 확인</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1 leading-tight">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex gap-3">
        <input
          type="text"
          placeholder="환자명, 진료, 국적 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as HospitalSettlementStatus | '')}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white"
        >
          <option value="">전체 상태</option>
          {(['pending', 'processing', 'completed'] as HospitalSettlementStatus[]).map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
          <p className="text-sm text-gray-500">총 <span className="font-semibold text-gray-900">{filtered.length}</span>건</p>
          {filtered.length > 0 && (
            <p className="text-sm text-gray-700">
              조회 수취 합계: <span className="font-bold text-green-700">{fmt(filteredNet)}</span>
            </p>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['환자명', '국적', '진료', '진료일', '총 진료비', '수수료율', '수수료', '수취 금액', '예정 지급일', '실지급일', '상태'].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap">{s.patientName}</td>
                  <td className="py-3 px-4 text-xs text-gray-500">{s.nationality}</td>
                  <td className="py-3 px-4 text-xs text-gray-700">{s.treatment}</td>
                  <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{s.visitDate}</td>
                  <td className="py-3 px-4 text-sm text-gray-700 whitespace-nowrap">{fmt(s.totalAmount)}</td>
                  <td className="py-3 px-4">
                    <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded font-medium">{s.commissionRate}%</span>
                  </td>
                  <td className="py-3 px-4 text-sm text-red-600 whitespace-nowrap">-{fmt(s.commissionAmount)}</td>
                  <td className="py-3 px-4 text-sm font-bold text-green-700 whitespace-nowrap">{fmt(s.netAmount)}</td>
                  <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{s.expectedPayDate}</td>
                  <td className="py-3 px-4 text-xs whitespace-nowrap">
                    {s.paidDate
                      ? <span className="text-green-600 font-medium">{s.paidDate}</span>
                      : <span className="text-gray-300">-</span>}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[s.status]}`}>
                      {STATUS_LABELS[s.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Commission explanation */}
      <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">수수료 안내</h2>
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="font-medium text-gray-800">Exclusive 계약</p>
            <p className="text-gray-500 mt-0.5">수수료율: <span className="font-bold text-gray-800">15%</span></p>
            <p className="text-gray-400 mt-0.5">매월 말일 정산 · 익월 10일 지급</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="font-medium text-gray-800">Non-exclusive 계약</p>
            <p className="text-gray-500 mt-0.5">수수료율: <span className="font-bold text-gray-800">12%</span></p>
            <p className="text-gray-400 mt-0.5">매월 말일 정산 · 익월 10일 지급</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="font-medium text-gray-800">Referral 계약</p>
            <p className="text-gray-500 mt-0.5">수수료율: <span className="font-bold text-gray-800">10%</span></p>
            <p className="text-gray-400 mt-0.5">건별 정산 · 진료 완료 후 30일 이내</p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          * 정산 관련 문의: 운영팀 02-1234-5678 | settlement@kmm.co.kr
        </p>
      </div>
    </div>
  )
}
