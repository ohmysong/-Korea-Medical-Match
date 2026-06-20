'use client'

import { useMemo, useState } from 'react'
import {
  mockAgentCommissions, AGENT_CURRENT_COMMISSION_RATE, mockAgentRateRequests,
  type AgentCommissionStatus, type AgentCommissionRateRequest,
} from '@/lib/agent-mock-data'

const STATUS_LABELS: Record<AgentCommissionStatus, string> = {
  pending: '정산 대기', processing: '처리 중', completed: '지급 완료', cancelled: '취소',
}
const STATUS_STYLES: Record<AgentCommissionStatus, string> = {
  pending: 'bg-yellow-50 text-yellow-700',
  processing: 'bg-blue-50 text-blue-700',
  completed: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
}
const RATE_REQUEST_LABELS: Record<string, string> = { pending: '승인 대기', approved: '승인됨', rejected: '거절됨' }
const RATE_REQUEST_STYLES: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700',
  approved: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
}

const TODAY = '2026-06-20'

function fmt(n: number) {
  return `₩${n.toLocaleString()}`
}

function RateRequestModal({ onClose, onSave }: { onClose: () => void; onSave: (rate: number, reason: string) => void }) {
  const [rate, setRate] = useState(String(AGENT_CURRENT_COMMISSION_RATE + 1))
  const [reason, setReason] = useState('')
  const canSave = Number(rate) > 0 && reason.trim().length > 0

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-base font-bold text-gray-900">수수료율 변경 요청</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-xs text-gray-500">현재 수수료율: <span className="font-bold text-gray-900">{AGENT_CURRENT_COMMISSION_RATE}%</span> · 변경 요청은 관리자 승인이 필요합니다.</p>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">요청 수수료율 (%)</label>
            <input type="number" value={rate} onChange={(e) => setRate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">변경 요청 사유 *</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)}
              rows={3} placeholder="예: 연 300명 이상 환자 추천 달성"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 resize-none" />
          </div>
          <button onClick={() => { if (canSave) { onSave(Number(rate), reason); onClose() } }} disabled={!canSave}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-40">
            변경 요청 제출
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AgentCommissionsPage() {
  const [items, setItems] = useState(mockAgentCommissions)
  const [rateRequests, setRateRequests] = useState(mockAgentRateRequests)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<AgentCommissionStatus | ''>('')
  const [showRateModal, setShowRateModal] = useState(false)
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  function handleSettlementRequest(id: string) {
    setItems((prev) => prev.map((c) => c.id === id ? { ...c, settlementRequested: true } : c))
    showToast('정산을 요청했습니다. 운영팀 확인 후 처리됩니다.')
  }

  function handleRateRequest(rate: number, reason: string) {
    const newReq: AgentCommissionRateRequest = {
      id: `rr-${Date.now()}`, requestedRate: rate, reason, status: 'pending', requestedAt: TODAY,
    }
    setRateRequests((prev) => [newReq, ...prev])
    showToast('수수료율 변경을 요청했습니다. 관리자 승인 대기 중입니다.')
  }

  const totalCommission = items.reduce((sum, c) => sum + c.commissionAmount, 0)
  const completedCommission = items.filter((c) => c.status === 'completed').reduce((sum, c) => sum + c.commissionAmount, 0)
  const pendingCommission = items.filter((c) => c.status === 'pending' || c.status === 'processing').reduce((sum, c) => sum + c.commissionAmount, 0)
  const thisMonthCommission = items.filter((c) => c.expectedPayDate >= '2026-06-01' && c.expectedPayDate < '2026-07-01').reduce((sum, c) => sum + c.commissionAmount, 0)

  const stats = [
    { label: '이번 달 정산 예정', value: fmt(thisMonthCommission) },
    { label: '누적 수수료', value: fmt(totalCommission) },
    { label: '지급 완료', value: fmt(completedCommission) },
    { label: '지급 대기', value: fmt(pendingCommission) },
  ]

  const filtered = useMemo(() => {
    return items.filter((c) => {
      const q = search.toLowerCase()
      const matchSearch = !search || c.patientName.toLowerCase().includes(q) || c.hospital.toLowerCase().includes(q) || c.treatment.toLowerCase().includes(q)
      const matchStatus = !statusFilter || c.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [items, search, statusFilter])

  const filteredCommission = filtered.reduce((sum, c) => sum + c.commissionAmount, 0)

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      {toast && <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg">{toast}</div>}
      {showRateModal && <RateRequestModal onClose={() => setShowRateModal(false)} onSave={handleRateRequest} />}

      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">수수료 확인</h1>
        <p className="text-sm text-gray-500 mt-0.5">환자 추천 진료비에 대한 수수료 내역과 지급 일정을 확인하세요</p>
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
          placeholder="환자명, 병원, 진료 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as AgentCommissionStatus | '')}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white">
          <option value="">전체 상태</option>
          {(['pending', 'processing', 'completed', 'cancelled'] as AgentCommissionStatus[]).map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-5">
        <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
          <p className="text-sm text-gray-500">총 <span className="font-semibold text-gray-900">{filtered.length}</span>건</p>
          {filtered.length > 0 && (
            <p className="text-sm text-gray-700">
              조회 수수료 합계: <span className="font-bold text-indigo-700">{fmt(filteredCommission)}</span>
            </p>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['환자명', '병원', '진료', '총 진료비', '수수료율', '수수료', '예정 지급일', '실지급일', '상태', ''].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap">{c.patientName}</td>
                  <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{c.hospital}</td>
                  <td className="py-3 px-4 text-xs text-gray-700 whitespace-nowrap">{c.treatment}</td>
                  <td className="py-3 px-4 text-sm text-gray-700 whitespace-nowrap">{fmt(c.totalAmount)}</td>
                  <td className="py-3 px-4">
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium">{c.commissionRate}%</span>
                  </td>
                  <td className="py-3 px-4 text-sm font-bold text-indigo-700 whitespace-nowrap">{fmt(c.commissionAmount)}</td>
                  <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{c.expectedPayDate}</td>
                  <td className="py-3 px-4 text-xs whitespace-nowrap">
                    {c.paidDate ? <span className="text-green-600 font-medium">{c.paidDate}</span> : <span className="text-gray-300">-</span>}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[c.status]}`}>
                      {STATUS_LABELS[c.status]}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {c.status === 'pending' && (
                      c.settlementRequested ? (
                        <span className="text-xs text-gray-400">요청됨</span>
                      ) : (
                        <button onClick={() => handleSettlementRequest(c.id)} className="text-xs bg-indigo-600 text-white px-2.5 py-1 rounded hover:bg-indigo-700 whitespace-nowrap">
                          정산 요청
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-semibold text-gray-900">커미션율 설정</h2>
          <button onClick={() => setShowRateModal(true)} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 font-medium">
            수수료율 변경 요청
          </button>
        </div>
        <p className="text-sm text-gray-700 mb-3">현재 적용 수수료율: <span className="font-bold text-indigo-700">{AGENT_CURRENT_COMMISSION_RATE}%</span></p>
        {rateRequests.length > 0 && (
          <div className="space-y-2">
            {rateRequests.map((r) => (
              <div key={r.id} className="flex items-center justify-between border border-gray-100 rounded-lg p-3 text-xs">
                <div>
                  <p className="font-medium text-gray-900">{AGENT_CURRENT_COMMISSION_RATE}% → {r.requestedRate}%</p>
                  <p className="text-gray-400 mt-0.5">{r.reason} · {r.requestedAt}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full font-medium ${RATE_REQUEST_STYLES[r.status]}`}>
                  {RATE_REQUEST_LABELS[r.status]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-2">수수료 안내</h2>
        <p className="text-xs text-gray-500">환자 진료가 완료되면 병원 정산 후 익월 10일에 일괄 지급됩니다. 진료 취소 시 수수료는 지급되지 않습니다.</p>
        <p className="text-xs text-gray-400 mt-2">* 정산 관련 문의: 운영팀 02-1234-5678 | settlement@kmm.co.kr</p>
      </div>
    </div>
  )
}
