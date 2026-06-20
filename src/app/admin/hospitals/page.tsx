'use client'

import { useState, useMemo } from 'react'
import { mockHospitals } from '@/lib/mock-data'

type ContractType = 'exclusive' | 'non-exclusive' | 'referral'
type HospitalAdminStatus = 'active' | 'inactive' | 'pending'

const CONTRACT_LABELS: Record<ContractType, string> = { exclusive: '독점', 'non-exclusive': '비독점', referral: '레퍼럴' }
const CONTRACT_STYLES: Record<ContractType, string> = { exclusive: 'bg-blue-50 text-blue-700', 'non-exclusive': 'bg-gray-100 text-gray-600', referral: 'bg-purple-50 text-purple-700' }
const STATUS_LABELS: Record<HospitalAdminStatus, string> = { active: '계약 중', inactive: '계약 종료', pending: '검토 중' }
const STATUS_STYLES: Record<HospitalAdminStatus, string> = { active: 'bg-green-50 text-green-700 border border-green-200', inactive: 'bg-gray-100 text-gray-500', pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200' }

const ADMIN_META: Record<string, { contract: ContractType; status: HospitalAdminStatus; commission: number; joinedAt: string }> = {
  '1': { contract: 'exclusive', status: 'active', commission: 15, joinedAt: '2022-01-15' },
  '2': { contract: 'exclusive', status: 'active', commission: 15, joinedAt: '2021-08-01' },
  '3': { contract: 'exclusive', status: 'active', commission: 15, joinedAt: '2021-11-20' },
  '4': { contract: 'non-exclusive', status: 'active', commission: 12, joinedAt: '2022-05-10' },
  '5': { contract: 'referral', status: 'active', commission: 10, joinedAt: '2023-02-01' },
  '6': { contract: 'non-exclusive', status: 'active', commission: 10, joinedAt: '2022-09-15' },
  '7': { contract: 'referral', status: 'pending', commission: 10, joinedAt: '2024-03-01' },
  '8': { contract: 'non-exclusive', status: 'active', commission: 12, joinedAt: '2023-06-01' },
  '9': { contract: 'referral', status: 'active', commission: 10, joinedAt: '2023-07-20' },
  '10': { contract: 'referral', status: 'inactive', commission: 10, joinedAt: '2023-01-10' },
}

function Badge({ label, style }: { label: string; style: string }) {
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style}`}>{label}</span>
}

export default function AdminHospitalsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<HospitalAdminStatus | ''>('')
  const [contractFilter, setContractFilter] = useState<ContractType | ''>('')

  const stats = [
    { label: '전체 파트너 병원', value: mockHospitals.length },
    { label: '계약 중', value: Object.values(ADMIN_META).filter((m) => m.status === 'active').length },
    { label: '검토 중', value: Object.values(ADMIN_META).filter((m) => m.status === 'pending').length },
    { label: '국제진료팀 보유', value: mockHospitals.filter((h) => h.internationalDept).length },
  ]

  const filtered = useMemo(() => {
    return mockHospitals.filter((h) => {
      const meta = ADMIN_META[h.id] || { status: 'active', contract: 'referral' }
      const q = search.toLowerCase()
      const matchSearch = !search || h.name.toLowerCase().includes(q) || h.location.includes(q) || h.type.includes(q)
      const matchStatus = !statusFilter || meta.status === statusFilter
      const matchContract = !contractFilter || meta.contract === contractFilter
      return matchSearch && matchStatus && matchContract
    })
  }, [search, statusFilter, contractFilter])

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">병원 관리</h1>
          <p className="text-sm text-gray-500 mt-0.5">파트너 병원 계약 · 수수료 · 상태 관리</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          + 병원 등록
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
        <input
          type="text"
          placeholder="병원명, 지역, 유형 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as HospitalAdminStatus | '')} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white">
          <option value="">전체 상태</option>
          <option value="active">계약 중</option>
          <option value="pending">검토 중</option>
          <option value="inactive">계약 종료</option>
        </select>
        <select value={contractFilter} onChange={(e) => setContractFilter(e.target.value as ContractType | '')} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white">
          <option value="">전체 계약</option>
          <option value="exclusive">독점</option>
          <option value="non-exclusive">비독점</option>
          <option value="referral">레퍼럴</option>
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
          <p className="text-sm text-gray-500">총 <span className="font-semibold text-gray-900">{filtered.length}</span>개 병원</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['병원명', '유형', '지역', '진료과목', '계약 유형', '수수료', '국제진료팀', '상태', '등록일', ''].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((h) => {
                const meta = ADMIN_META[h.id] || { contract: 'referral' as ContractType, status: 'active' as HospitalAdminStatus, commission: 10, joinedAt: '-' }
                return (
                  <tr key={h.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap">{h.name}</td>
                    <td className="py-3 px-4 text-xs text-gray-600 whitespace-nowrap">{h.type}</td>
                    <td className="py-3 px-4 text-xs text-gray-500">{h.location}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 flex-wrap">
                        {h.specialties.slice(0, 2).map((s) => (
                          <span key={s} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{s}</span>
                        ))}
                        {h.specialties.length > 2 && <span className="text-xs text-gray-400">+{h.specialties.length - 2}</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge label={CONTRACT_LABELS[meta.contract]} style={CONTRACT_STYLES[meta.contract]} />
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{meta.commission}%</td>
                    <td className="py-3 px-4">
                      {h.internationalDept
                        ? <span className="text-xs text-green-600 font-medium">✓ 보유</span>
                        : <span className="text-xs text-gray-400">-</span>}
                    </td>
                    <td className="py-3 px-4">
                      <Badge label={STATUS_LABELS[meta.status]} style={STATUS_STYLES[meta.status]} />
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-400 whitespace-nowrap">{meta.joinedAt}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2 whitespace-nowrap">
                        <button className="text-xs text-blue-600 hover:underline">상세</button>
                        <button className="text-xs text-gray-500 hover:underline">수정</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
