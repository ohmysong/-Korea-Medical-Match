'use client'

import { useState } from 'react'
import { mockProposals, type HospitalProposal, type ProposalStatus } from '@/lib/patient-mock-data'

const STATUS_LABELS: Record<ProposalStatus, string> = {
  sent: '미확인',
  viewed: '확인함',
  accepted: '선택함',
  rejected: '거절함',
}
const STATUS_STYLES: Record<ProposalStatus, string> = {
  sent: 'bg-teal-50 text-teal-700 border border-teal-200',
  viewed: 'bg-blue-50 text-blue-700',
  accepted: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-500',
}

function ProposalCard({ item, onAccept, onReject, onView }: {
  item: HospitalProposal
  onAccept: (id: string) => void
  onReject: (id: string) => void
  onView: (id: string) => void
}) {
  const isNew = item.status === 'sent'
  const isAccepted = item.status === 'accepted'

  return (
    <div className={`bg-white border rounded-2xl p-5 transition-colors ${isNew ? 'border-teal-200 shadow-sm' : isAccepted ? 'border-green-200' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[item.status]}`}>
              {STATUS_LABELS[item.status]}
            </span>
            <span className="text-xs text-gray-400">{item.hospitalType}</span>
            {isNew && <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">NEW</span>}
          </div>
          <h3 className="text-base font-bold text-gray-900">{item.hospitalName}</h3>
          <p className="text-sm text-gray-600 mt-0.5">{item.doctorName} · {item.doctorSpecialty}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-gray-400">발송일</p>
          <p className="text-xs font-medium text-gray-600">{item.sentAt}</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
        <div>
          <p className="text-xs font-medium text-gray-500 mb-0.5">치료 계획</p>
          <p className="text-sm text-gray-800">{item.treatmentPlan}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
          <div>
            <p className="text-xs text-gray-400">예상 비용</p>
            <p className="text-sm font-semibold text-teal-700">{item.estimatedCost}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">예상 기간</p>
            <p className="text-sm font-semibold text-gray-900">{item.estimatedDuration}</p>
          </div>
        </div>
      </div>

      {item.features.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {item.features.map((f) => (
            <span key={f} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{f}</span>
          ))}
        </div>
      )}

      {item.notes && (
        <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-4">
          <p className="text-xs text-amber-700">📌 {item.notes}</p>
        </div>
      )}

      {(item.status === 'sent' || item.status === 'viewed') && (
        <div className="flex gap-2">
          <button
            onClick={() => { if (item.status === 'sent') onView(item.id); onAccept(item.id) }}
            className="flex-1 bg-teal-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-teal-700">
            이 병원 선택
          </button>
          <button
            onClick={() => { if (item.status === 'sent') onView(item.id); onReject(item.id) }}
            className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50">
            거절
          </button>
        </div>
      )}
      {item.status === 'accepted' && (
        <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
          <span>✓</span> 선택하셨습니다 {item.respondedAt && <span className="text-xs text-gray-400">({item.respondedAt})</span>}
        </div>
      )}
      {item.status === 'rejected' && (
        <p className="text-sm text-gray-400">거절하셨습니다 {item.respondedAt && `(${item.respondedAt})`}</p>
      )}
    </div>
  )
}

export default function ProposalsPage() {
  const [items, setItems] = useState(mockProposals)
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  function handleView(id: string) {
    setItems((prev) => prev.map((p) =>
      p.id === id && p.status === 'sent' ? { ...p, status: 'viewed' as ProposalStatus, viewedAt: '2026-06-18' } : p
    ))
  }

  function handleAccept(id: string) {
    setItems((prev) => prev.map((p) =>
      p.id === id ? { ...p, status: 'accepted' as ProposalStatus, respondedAt: '2026-06-18' } : p
    ))
    showToast('병원을 선택하셨습니다. 코디네이터가 예약을 진행합니다.')
  }

  function handleReject(id: string) {
    setItems((prev) => prev.map((p) =>
      p.id === id ? { ...p, status: 'rejected' as ProposalStatus, respondedAt: '2026-06-18' } : p
    ))
    showToast('거절 처리되었습니다.')
  }

  const pending = items.filter((p) => p.status === 'sent' || p.status === 'viewed')
  const decided = items.filter((p) => p.status === 'accepted' || p.status === 'rejected')

  return (
    <div className="max-w-3xl mx-auto px-6 py-6">
      {toast && <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg">{toast}</div>}

      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">병원 제안 확인</h1>
        <p className="text-sm text-gray-500 mt-0.5">코디네이터가 선별한 병원 제안서를 검토하고 선택하세요</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: '전체 제안', value: items.length },
          { label: '미확인·검토 중', value: pending.length },
          { label: '선택 완료', value: items.filter((p) => p.status === 'accepted').length },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {pending.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">검토 필요 ({pending.length}건)</h2>
          <div className="space-y-4">
            {pending.map((p) => (
              <ProposalCard key={p.id} item={p}
                onView={handleView} onAccept={handleAccept} onReject={handleReject} />
            ))}
          </div>
        </div>
      )}

      {decided.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 mb-3">결정 완료 ({decided.length}건)</h2>
          <div className="space-y-4 opacity-75">
            {decided.map((p) => (
              <ProposalCard key={p.id} item={p}
                onView={handleView} onAccept={handleAccept} onReject={handleReject} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
