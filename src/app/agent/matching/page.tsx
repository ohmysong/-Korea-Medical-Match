'use client'

import { useMemo, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { mockHospitals, ALL_TREATMENTS } from '@/lib/mock-data'
import { mockInterpreters } from '@/lib/admin-mock-data'
import { mockAgentPatients, mockAgentMatchingRequests, type AgentMatchingRequest, type MatchingRequestStatus } from '@/lib/agent-mock-data'

const TODAY = '2026-06-20'

const NATION_LANGUAGE: Record<string, string> = {
  중국: '중국어', 대만: '중국어', 홍콩: '중국어', 러시아: '러시아어', 몽골: '몽골어',
  UAE: '아랍어', 이집트: '아랍어', 일본: '일본어', 베트남: '베트남어', 미국: '영어', 키르기스스탄: '러시아어',
}

const MATCHING_STATUS_LABELS: Record<MatchingRequestStatus, string> = {
  requested: '요청됨', accepted: '수락됨', rejected: '거절됨', completed: '완료',
}
const MATCHING_STATUS_STYLES: Record<MatchingRequestStatus, string> = {
  requested: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  accepted: 'bg-blue-50 text-blue-700',
  rejected: 'bg-red-50 text-red-700',
  completed: 'bg-green-50 text-green-700',
}

function fmt(n: number) {
  return `₩${n.toLocaleString()}`
}

function estimateInterpreter(nationality: string) {
  const lang = NATION_LANGUAGE[nationality]
  const match = lang ? mockInterpreters.find((i) => i.languages.includes(lang) && i.status !== 'inactive') : undefined
  return match ? `${match.name} (${lang})` : '배정 가능 통역사 확인 중'
}

function MatchingContent() {
  const searchParams = useSearchParams()
  const initialPatientId = searchParams.get('patient') ?? ''
  const eligiblePatients = mockAgentPatients.filter((p) => p.status !== 'cancelled')

  const [patientId, setPatientId] = useState(
    eligiblePatients.some((p) => p.id === initialPatientId) ? initialPatientId : (eligiblePatients[0]?.id ?? '')
  )
  const [requests, setRequests] = useState(mockAgentMatchingRequests)
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const patient = eligiblePatients.find((p) => p.id === patientId)
  const treatment = patient ? ALL_TREATMENTS.find((t) => t.name === patient.treatmentInterest) : undefined

  const recommendedHospitals = useMemo(() => {
    if (!treatment) return []
    return mockHospitals
      .filter((h) => h.treatments.some((t) => t.id === treatment.id))
      .sort((a, b) => (Number(b.featured) - Number(a.featured)) || b.rating - a.rating)
  }, [treatment])

  function requestFor(hospitalName: string) {
    return requests.find((r) => r.patientId === patientId && r.hospital === hospitalName)
  }

  function handleMatch(hospitalName: string) {
    if (!patient || !treatment) return
    const newReq: AgentMatchingRequest = {
      id: `mr-${patient.id}-${hospitalName}-${requests.length}`,
      patientId: patient.id,
      patientName: patient.name,
      hospital: hospitalName,
      specialty: treatment.specialty,
      estimatedCost: treatment.priceMax,
      estimatedInterpreter: estimateInterpreter(patient.nationality),
      status: 'requested',
      requestedAt: TODAY,
    }
    setRequests((prev) => [newReq, ...prev])
    showToast(`${hospitalName}에 매칭을 요청했습니다.`)
  }

  const sortedHistory = useMemo(() => [...requests].sort((a, b) => b.requestedAt.localeCompare(a.requestedAt)), [requests])

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      {toast && <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg">{toast}</div>}

      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">병원 매칭</h1>
        <p className="text-sm text-gray-500 mt-0.5">환자를 선택하면 AI가 적합한 병원을 추천합니다 (주요 거래 병원 우선)</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5">
        <label className="block text-xs font-medium text-gray-700 mb-1.5">환자 선택</label>
        <select
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          className="w-full md:w-96 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 bg-white"
        >
          {eligiblePatients.map((p) => (
            <option key={p.id} value={p.id}>{p.name} · {p.treatmentInterest}</option>
          ))}
        </select>
      </div>

      {patient && treatment ? (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900">
              추천 병원 ({recommendedHospitals.length}) <span className="text-gray-400 font-normal">— {patient.name} · {treatment.name}</span>
            </h2>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">✦ AI 추천</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {recommendedHospitals.map((h) => {
              const existing = requestFor(h.name)
              return (
                <div key={h.id} className="bg-white border border-gray-200 rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold text-gray-900">{h.name}</p>
                        {h.featured && <span className="text-xs bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-medium">주요 거래 병원</span>}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{h.location} {h.district} · ★{h.rating}</p>
                    </div>
                  </div>
                  <p className="text-xs bg-gray-100 text-gray-600 inline-block px-2 py-0.5 rounded mb-2">{treatment.specialty}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <p className="text-gray-500">예상 비용</p>
                      <p className="font-bold text-gray-900 mt-0.5">{fmt(treatment.priceMin)} ~ {fmt(treatment.priceMax)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <p className="text-gray-500">예상 통역사</p>
                      <p className="font-bold text-gray-900 mt-0.5 truncate">{estimateInterpreter(patient.nationality)}</p>
                    </div>
                  </div>
                  {existing ? (
                    <span className={`block text-center text-xs px-3 py-2 rounded-lg font-medium ${MATCHING_STATUS_STYLES[existing.status]}`}>
                      {MATCHING_STATUS_LABELS[existing.status]}
                    </span>
                  ) : (
                    <button
                      onClick={() => handleMatch(h.name)}
                      className="w-full bg-indigo-600 text-white text-sm py-2 rounded-lg hover:bg-indigo-700 font-medium"
                    >
                      매칭 요청
                    </button>
                  )}
                </div>
              )
            })}
          </div>
          {recommendedHospitals.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-10">해당 진료를 제공하는 제휴 병원이 없습니다</p>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-10">매칭 가능한 환자가 없습니다</p>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">매칭 요청 히스토리</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['환자명', '병원', '전문과', '예상 비용', '통역사', '상태', '요청일'].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedHistory.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap">{r.patientName}</td>
                  <td className="py-3 px-4 text-xs text-gray-700 whitespace-nowrap">{r.hospital}</td>
                  <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{r.specialty}</td>
                  <td className="py-3 px-4 text-xs text-gray-700 whitespace-nowrap">{fmt(r.estimatedCost)}</td>
                  <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{r.estimatedInterpreter}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${MATCHING_STATUS_STYLES[r.status]}`}>
                      {MATCHING_STATUS_LABELS[r.status]}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-400 whitespace-nowrap">{r.requestedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function AgentMatchingPage() {
  return (
    <Suspense fallback={
      <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <MatchingContent />
    </Suspense>
  )
}
