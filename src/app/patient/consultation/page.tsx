'use client'

import { useState, useMemo } from 'react'
import { mockConsultations, type ConsultationRequest, type ConsultationStatus } from '@/lib/patient-mock-data'

const STATUS_LABELS: Record<ConsultationStatus, string> = {
  draft: '임시저장',
  submitted: '접수됨',
  reviewing: '검토 중',
  replied: '답변 완료',
  closed: '종료',
}
const STATUS_STYLES: Record<ConsultationStatus, string> = {
  draft: 'bg-gray-100 text-gray-500',
  submitted: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  reviewing: 'bg-blue-50 text-blue-700',
  replied: 'bg-teal-50 text-teal-700',
  closed: 'bg-gray-100 text-gray-400',
}

const TREATMENT_CATEGORIES = ['척추·관절', '암·종양', '심장·혈관', '건강검진', '안과', '성형·피부', '재생의학', '기타']

function NewConsultationModal({ onClose, onSave }: {
  onClose: () => void
  onSave: (c: ConsultationRequest) => void
}) {
  const [form, setForm] = useState({
    treatmentCategory: '척추·관절',
    treatmentDetail: '',
    description: '',
    medicalHistory: '',
    preferredDate: '',
    budget: '',
    asDraft: false,
  })

  function set(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSave(asDraft: boolean) {
    if (!form.treatmentDetail.trim() || !form.description.trim()) return
    const newC: ConsultationRequest = {
      id: `con-${Date.now()}`,
      treatmentCategory: form.treatmentCategory,
      treatmentDetail: form.treatmentDetail,
      description: form.description,
      medicalHistory: form.medicalHistory || undefined,
      preferredDate: form.preferredDate || undefined,
      budget: form.budget || undefined,
      status: asDraft ? 'draft' : 'submitted',
      createdAt: '2026-06-18',
      updatedAt: '2026-06-18',
    }
    onSave(newC)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-base font-bold text-gray-900">상담 신청</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">치료 분야 *</label>
              <select value={form.treatmentCategory} onChange={(e) => set('treatmentCategory', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-400 bg-white">
                {TREATMENT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">희망 일정</label>
              <input type="date" value={form.preferredDate} onChange={(e) => set('preferredDate', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">치료명·증상 *</label>
            <input type="text" value={form.treatmentDetail} onChange={(e) => set('treatmentDetail', e.target.value)}
              placeholder="예: 허리 디스크, 무릎 인공관절, PET-CT 건강검진"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">상세 증상 및 요청 사항 *</label>
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)}
              rows={4} placeholder="증상, 기간, 치료 목표, 요청 사항을 자세히 적어주세요."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-400 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">기저 질환·복용 약물</label>
            <textarea value={form.medicalHistory} onChange={(e) => set('medicalHistory', e.target.value)}
              rows={2} placeholder="당뇨, 고혈압, 알레르기 등 의사가 알아야 할 사항"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-400 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">예산 범위</label>
            <input type="text" value={form.budget} onChange={(e) => set('budget', e.target.value)}
              placeholder="예: $5,000~$15,000"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-400" />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => handleSave(false)}
              disabled={!form.treatmentDetail.trim() || !form.description.trim()}
              className="flex-1 bg-teal-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-40">
              신청 제출
            </button>
            <button onClick={() => handleSave(true)}
              disabled={!form.treatmentDetail.trim() || !form.description.trim()}
              className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40">
              임시저장
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailModal({ item, onClose, onSubmit }: {
  item: ConsultationRequest
  onClose: () => void
  onSubmit: (id: string) => void
}) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <div>
            <h2 className="text-base font-bold text-gray-900">{item.treatmentDetail}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{item.treatmentCategory} · {item.id}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[item.status]}`}>
              {STATUS_LABELS[item.status]}
            </span>
            <span className="text-xs text-gray-400">신청일: {item.createdAt}</span>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">상세 내용</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.description}</p>
          </div>
          {item.medicalHistory && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">기저 질환·복용 약물</p>
              <p className="text-sm text-gray-700">{item.medicalHistory}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {item.preferredDate && (
              <div>
                <p className="text-xs text-gray-400">희망 일정</p>
                <p className="font-medium">{item.preferredDate}</p>
              </div>
            )}
            {item.budget && (
              <div>
                <p className="text-xs text-gray-400">예산</p>
                <p className="font-medium">{item.budget}</p>
              </div>
            )}
            {item.preferredHospitals && (
              <div className="col-span-2">
                <p className="text-xs text-gray-400">희망 병원</p>
                <p className="font-medium">{item.preferredHospitals.join(', ')}</p>
              </div>
            )}
          </div>
          {item.coordinatorReply && (
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-teal-700 mb-1">코디네이터 답변</p>
              <p className="text-sm text-gray-700">{item.coordinatorReply}</p>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            {item.status === 'draft' && (
              <button onClick={() => { onSubmit(item.id); onClose() }}
                className="flex-1 bg-teal-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-teal-700">
                신청 제출
              </button>
            )}
            <button onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50">
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ConsultationPage() {
  const [items, setItems] = useState(mockConsultations)
  const [showNew, setShowNew] = useState(false)
  const [selected, setSelected] = useState<ConsultationRequest | null>(null)
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  function handleSave(c: ConsultationRequest) {
    setItems((prev) => [c, ...prev])
    showToast(c.status === 'draft' ? '임시저장되었습니다.' : '상담 신청이 접수되었습니다.')
  }

  function handleSubmit(id: string) {
    setItems((prev) => prev.map((c) => c.id === id ? { ...c, status: 'submitted' as ConsultationStatus } : c))
    showToast('상담 신청이 제출되었습니다.')
  }

  const stats = [
    { label: '전체', value: items.length },
    { label: '접수·검토', value: items.filter((c) => c.status === 'submitted' || c.status === 'reviewing').length },
    { label: '답변 완료', value: items.filter((c) => c.status === 'replied').length },
    { label: '임시저장', value: items.filter((c) => c.status === 'draft').length },
  ]

  const sorted = useMemo(() => [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [items])

  return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      {toast && <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg">{toast}</div>}
      {showNew && <NewConsultationModal onClose={() => setShowNew(false)} onSave={handleSave} />}
      {selected && <DetailModal item={selected} onClose={() => setSelected(null)} onSubmit={handleSubmit} />}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">상담 신청</h1>
          <p className="text-sm text-gray-500 mt-0.5">치료 문의를 접수하면 담당 코디네이터가 검토 후 답변드립니다</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700">
          + 새 상담 신청
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

      <div className="space-y-3">
        {sorted.map((item) => (
          <div key={item.id}
            className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 cursor-pointer transition-colors"
            onClick={() => setSelected(item)}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">{item.treatmentCategory}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[item.status]}`}>
                    {STATUS_LABELS[item.status]}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{item.treatmentDetail}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-gray-400">{item.createdAt}</p>
                {item.coordinatorReply && (
                  <p className="text-xs text-teal-600 font-medium mt-1">답변 있음</p>
                )}
              </div>
            </div>
            {item.coordinatorReply && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-teal-700 font-medium">코디네이터 답변:</p>
                <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{item.coordinatorReply}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
