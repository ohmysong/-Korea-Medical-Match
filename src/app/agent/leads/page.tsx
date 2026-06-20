'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  mockAgentPatients, mockAgentMatchingRequests,
  type AgentPatient, type LeadStatus,
} from '@/lib/agent-mock-data'

const STATUS_LABELS: Record<LeadStatus, string> = { new: '신규', matching: '매칭 중', completed: '완료', cancelled: '취소' }
const STATUS_STYLES: Record<LeadStatus, string> = {
  new: 'bg-gray-100 text-gray-600',
  matching: 'bg-blue-50 text-blue-700 border border-blue-200',
  completed: 'bg-green-50 text-green-700 border border-green-200',
  cancelled: 'bg-red-50 text-red-700 border border-red-200',
}
const STATUSES: LeadStatus[] = ['new', 'matching', 'completed', 'cancelled']
const MATCHING_STATUS_LABELS: Record<string, string> = { requested: '요청됨', accepted: '수락됨', rejected: '거절됨', completed: '완료' }

const TODAY = '2026-06-20'

function fmt(n: number) {
  return `₩${n.toLocaleString()}`
}

function RegisterModal({ onClose, onSave }: { onClose: () => void; onSave: (p: AgentPatient) => void }) {
  const [form, setForm] = useState({
    name: '', nationality: '', gender: '남' as '남' | '여', birthDate: '',
    email: '', phone: '', treatmentInterest: '', hospitalPreference: '', estimatedAmount: '', notes: '',
  })

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const canSave = form.name.trim() && form.nationality.trim() && form.treatmentInterest.trim() && form.email.trim()

  function handleSave() {
    if (!canSave) return
    const newPatient: AgentPatient = {
      id: `ap-${Date.now()}`,
      name: form.name,
      nationality: form.nationality,
      gender: form.gender,
      birthDate: form.birthDate,
      email: form.email,
      phone: form.phone,
      treatmentInterest: form.treatmentInterest,
      hospitalPreference: form.hospitalPreference || undefined,
      estimatedAmount: Number(form.estimatedAmount) || 0,
      notes: form.notes || undefined,
      status: 'new',
      registeredAt: TODAY,
      treatmentHistory: [],
      documents: [],
    }
    onSave(newPatient)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-base font-bold text-gray-900">새 리드 등록</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">환자명 *</label>
              <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)}
                placeholder="예: Wang Wei"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">국적 *</label>
              <input type="text" value={form.nationality} onChange={(e) => set('nationality', e.target.value)}
                placeholder="예: 중국"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">성별</label>
              <select value={form.gender} onChange={(e) => set('gender', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 bg-white">
                <option value="남">남</option>
                <option value="여">여</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">생년월일</label>
              <input type="date" value={form.birthDate} onChange={(e) => set('birthDate', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">이메일 *</label>
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">연락처</label>
              <input type="text" value={form.phone} onChange={(e) => set('phone', e.target.value)}
                placeholder="+86-138-0000-0000"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">희망 진료/시술 *</label>
            <input type="text" value={form.treatmentInterest} onChange={(e) => set('treatmentInterest', e.target.value)}
              placeholder="예: 인공관절치환술"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">희망 병원</label>
              <input type="text" value={form.hospitalPreference} onChange={(e) => set('hospitalPreference', e.target.value)}
                placeholder="예: 세브란스병원 (선택)"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">예상 금액 (₩)</label>
              <input type="number" value={form.estimatedAmount} onChange={(e) => set('estimatedAmount', e.target.value)}
                placeholder="예: 9000000"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">참고 사항</label>
            <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)}
              rows={3} placeholder="통역 필요 언어, 동반자, 특이사항 등"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 resize-none" />
          </div>
          <button onClick={handleSave} disabled={!canSave}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-40">
            리드 등록
          </button>
        </div>
      </div>
    </div>
  )
}

function DetailModal({ patient, onClose }: { patient: AgentPatient; onClose: () => void }) {
  const history = mockAgentMatchingRequests.filter((m) => m.patientId === patient.id)
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-start sticky top-0 bg-white">
          <div>
            <h2 className="text-base font-bold text-gray-900">{patient.name}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{patient.nationality} · {patient.gender} · {patient.birthDate || '생년월일 미입력'}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none mt-0.5">×</button>
        </div>
        <div className="p-6 space-y-4">
          <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[patient.status]}`}>
            {STATUS_LABELS[patient.status]}
          </span>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-gray-500">이메일</p>
              <p className="font-medium text-gray-900 mt-0.5">{patient.email}</p>
            </div>
            <div>
              <p className="text-gray-500">연락처</p>
              <p className="font-medium text-gray-900 mt-0.5">{patient.phone || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">희망 진료/시술</p>
              <p className="font-medium text-gray-900 mt-0.5">{patient.treatmentInterest}</p>
            </div>
            <div>
              <p className="text-gray-500">희망 병원</p>
              <p className="font-medium text-gray-900 mt-0.5">{patient.hospitalPreference ?? '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">예상 금액</p>
              <p className="font-medium text-gray-900 mt-0.5">{fmt(patient.estimatedAmount)}</p>
            </div>
            <div>
              <p className="text-gray-500">등록일</p>
              <p className="font-medium text-gray-900 mt-0.5">{patient.registeredAt}</p>
            </div>
          </div>
          {patient.notes && (
            <div>
              <p className="text-xs text-gray-500 mb-1">참고 사항</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{patient.notes}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold text-gray-900 mb-2">매칭 이력</p>
            {history.length === 0 ? (
              <p className="text-xs text-gray-400">아직 병원 매칭 요청이 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {history.map((h) => (
                  <div key={h.id} className="border border-gray-200 rounded-lg p-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-medium text-gray-900">{h.hospital}</p>
                      <p className="text-gray-400">{h.specialty} · {h.requestedAt}</p>
                    </div>
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                      {MATCHING_STATUS_LABELS[h.status]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Link
            href={`/agent/matching?patient=${patient.id}`}
            className="block text-center bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            병원 추천 요청
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function AgentLeadsPage() {
  const [items, setItems] = useState(mockAgentPatients)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<LeadStatus | ''>('')
  const [nationalityFilter, setNationalityFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [selected, setSelected] = useState<AgentPatient | null>(null)
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  function handleSave(p: AgentPatient) {
    setItems((prev) => [p, ...prev])
    showToast(`${p.name} 리드가 등록되었습니다.`)
  }

  const nationalities = useMemo(() => Array.from(new Set(items.map((p) => p.nationality))), [items])

  const stats = [
    { label: '전체 리드', value: items.length },
    { label: '매칭 중', value: items.filter((p) => p.status === 'matching').length },
    { label: '완료', value: items.filter((p) => p.status === 'completed').length },
    { label: '이번 달 신규', value: items.filter((p) => p.registeredAt >= '2026-06-01').length },
  ]

  const filtered = useMemo(() => {
    return items.filter((p) => {
      const q = search.toLowerCase()
      const matchSearch = !search || p.name.toLowerCase().includes(q) || p.treatmentInterest.toLowerCase().includes(q)
      const matchStatus = !statusFilter || p.status === statusFilter
      const matchNationality = !nationalityFilter || p.nationality === nationalityFilter
      const matchDateFrom = !dateFrom || p.registeredAt >= dateFrom
      const matchDateTo = !dateTo || p.registeredAt <= dateTo
      const matchMin = !minAmount || p.estimatedAmount >= Number(minAmount)
      const matchMax = !maxAmount || p.estimatedAmount <= Number(maxAmount)
      return matchSearch && matchStatus && matchNationality && matchDateFrom && matchDateTo && matchMin && matchMax
    })
  }, [items, search, statusFilter, nationalityFilter, dateFrom, dateTo, minAmount, maxAmount])

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {toast && <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg">{toast}</div>}
      {showNew && <RegisterModal onClose={() => setShowNew(false)} onSave={handleSave} />}
      {selected && <DetailModal patient={selected} onClose={() => setSelected(null)} />}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Leads</h1>
          <p className="text-sm text-gray-500 mt-0.5">내가 등록한 환자 리드의 매칭 상태를 추적·관리하세요</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          + 새 리드 등록
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

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 space-y-3">
        <input
          type="text"
          placeholder="환자명, 희망 진료 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400"
        />
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">상태</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as LeadStatus | '')}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white">
              <option value="">전체</option>
              {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">국적</label>
            <select value={nationalityFilter} onChange={(e) => setNationalityFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white">
              <option value="">전체</option>
              {nationalities.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">등록 기간</label>
            <div className="flex items-center gap-1.5">
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                className="border border-gray-200 rounded-lg px-2 py-2 text-sm outline-none focus:border-indigo-400" />
              <span className="text-gray-400 text-xs">~</span>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                className="border border-gray-200 rounded-lg px-2 py-2 text-sm outline-none focus:border-indigo-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">예상 금액 (₩)</label>
            <div className="flex items-center gap-1.5">
              <input type="number" placeholder="최소" value={minAmount} onChange={(e) => setMinAmount(e.target.value)}
                className="w-24 border border-gray-200 rounded-lg px-2 py-2 text-sm outline-none focus:border-indigo-400" />
              <span className="text-gray-400 text-xs">~</span>
              <input type="number" placeholder="최대" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)}
                className="w-24 border border-gray-200 rounded-lg px-2 py-2 text-sm outline-none focus:border-indigo-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm text-gray-500">총 <span className="font-semibold text-gray-900">{filtered.length}</span>명</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['환자명', '국적', '증상/시술', '등록일', '예상금액', '상태', ''].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelected(p)}>
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900 whitespace-nowrap">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.email}</p>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{p.nationality}</td>
                  <td className="py-3 px-4 text-xs text-gray-700 whitespace-nowrap">{p.treatmentInterest}</td>
                  <td className="py-3 px-4 text-xs text-gray-400 whitespace-nowrap">{p.registeredAt}</td>
                  <td className="py-3 px-4 text-xs text-gray-700 whitespace-nowrap">{fmt(p.estimatedAmount)}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[p.status]}`}>
                      {STATUS_LABELS[p.status]}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => setSelected(p)} className="text-xs text-indigo-600 hover:underline">상세보기</button>
                      <Link href={`/agent/matching?patient=${p.id}`} className="text-xs text-gray-600 hover:underline">병원추천요청</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-12">검색 조건에 맞는 리드가 없습니다</p>
        )}
      </div>
    </div>
  )
}
