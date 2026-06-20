'use client'

import { useState, useMemo } from 'react'
import { mockCheckupApplications, mockHotelGuests, type CheckupApplication, type CheckupStatus } from '@/lib/hotel-mock-data'

const STATUS_LABELS: Record<CheckupStatus, string> = {
  draft: '임시저장',
  submitted: '제출됨',
  confirmed: '확정',
  completed: '완료',
  cancelled: '취소',
}
const STATUS_STYLES: Record<CheckupStatus, string> = {
  draft: 'bg-gray-100 text-gray-500',
  submitted: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  confirmed: 'bg-green-50 text-green-700',
  completed: 'bg-blue-50 text-blue-700',
  cancelled: 'bg-red-50 text-red-500',
}

const CHECKUP_TYPES = [
  '전신 정밀 검진 패키지',
  '암 정밀 검진 (PET-CT 포함)',
  '심장 정밀 검진 패키지',
  '뇌 MRI 정밀 검진',
  '당뇨 합병증 정밀 검사',
  '위내시경 검사 (수면)',
  '대장내시경 (수면)',
  '유방암 수술 전 검진',
  '척추 MRI 정밀 검진',
]
const HOSPITALS = ['세브란스병원', '삼성서울병원', '서울아산병원', '강남세란병원']

function ApplyModal({ onClose, onSave }: {
  onClose: () => void
  onSave: (app: CheckupApplication) => void
}) {
  const activeGuests = mockHotelGuests.filter((g) => g.status === 'checked_in' || g.status === 'reserved')
  const [form, setForm] = useState({
    guestId: activeGuests[0]?.id ?? '',
    hospital: '세브란스병원',
    checkupType: '전신 정밀 검진 패키지',
    preferredDate: '',
    notes: '',
    asDraft: false,
  })

  function set(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const selectedGuest = activeGuests.find((g) => g.id === form.guestId)

  function handleSave() {
    if (!form.guestId || !form.preferredDate) return
    const newApp: CheckupApplication = {
      id: `ca-${Date.now()}`,
      guestId: form.guestId,
      guestName: selectedGuest?.name ?? '',
      nationality: selectedGuest?.nationality ?? '',
      hospital: form.hospital,
      checkupType: form.checkupType,
      preferredDate: form.preferredDate,
      status: form.asDraft ? 'draft' : 'submitted',
      notes: form.notes || undefined,
      createdAt: '2026-06-18',
    }
    onSave(newApp)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-base font-bold text-gray-900">검진 신청</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">고객 선택 *</label>
            <select value={form.guestId} onChange={(e) => set('guestId', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400 bg-white">
              {activeGuests.map((g) => (
                <option key={g.id} value={g.id}>{g.name} ({g.nationality}) — {g.roomNumber}호</option>
              ))}
            </select>
            {selectedGuest && (
              <p className="text-xs text-gray-400 mt-1">담당 병원: {selectedGuest.hospital} · 진료 목적: {selectedGuest.treatmentPurpose}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">검진 병원</label>
              <select value={form.hospital} onChange={(e) => set('hospital', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400 bg-white">
                {HOSPITALS.map((h) => <option key={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">희망 날짜 *</label>
              <input type="date" value={form.preferredDate} onChange={(e) => set('preferredDate', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">검진 유형</label>
            <select value={form.checkupType} onChange={(e) => set('checkupType', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400 bg-white">
              {CHECKUP_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">요청 사항</label>
            <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)}
              rows={2} placeholder="통역사 필요, 식이 제한 등"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400 resize-none" />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => { set('asDraft', false); handleSave() }}
              disabled={!form.guestId || !form.preferredDate}
              className="flex-1 bg-amber-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-amber-600 disabled:opacity-40">
              제출
            </button>
            <button onClick={() => { set('asDraft', true); handleSave() }}
              disabled={!form.guestId || !form.preferredDate}
              className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40">
              임시저장
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckupPage() {
  const [items, setItems] = useState(mockCheckupApplications)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<CheckupStatus | ''>('')
  const [showApply, setShowApply] = useState(false)
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  function handleSubmit(id: string) {
    setItems((prev) => prev.map((a) => a.id === id ? { ...a, status: 'submitted' as CheckupStatus } : a))
    showToast('검진 신청이 제출되었습니다.')
  }

  function handleCancel(id: string) {
    setItems((prev) => prev.map((a) => a.id === id ? { ...a, status: 'cancelled' as CheckupStatus } : a))
    showToast('신청이 취소되었습니다.')
  }

  function handleSave(app: CheckupApplication) {
    setItems((prev) => [app, ...prev])
    showToast(`${app.guestName} 검진 신청이 ${app.status === 'draft' ? '임시저장' : '제출'}되었습니다.`)
  }

  const stats = [
    { label: '전체', value: items.length },
    { label: '제출됨', value: items.filter((a) => a.status === 'submitted').length },
    { label: '확정', value: items.filter((a) => a.status === 'confirmed').length },
    { label: '완료', value: items.filter((a) => a.status === 'completed').length },
  ]

  const filtered = useMemo(() => {
    return items.filter((a) => {
      const q = search.toLowerCase()
      const matchSearch = !search || a.guestName.toLowerCase().includes(q) || a.checkupType.toLowerCase().includes(q) || a.hospital.toLowerCase().includes(q)
      const matchStatus = !statusFilter || a.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [items, search, statusFilter])

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {toast && <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg">{toast}</div>}
      {showApply && <ApplyModal onClose={() => setShowApply(false)} onSave={handleSave} />}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">검진 신청</h1>
          <p className="text-sm text-gray-500 mt-0.5">투숙 고객 대신 병원 건강검진 신청 및 현황 관리</p>
        </div>
        <button onClick={() => setShowApply(true)}
          className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-600">
          + 검진 신청
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
        <input type="text" placeholder="고객명, 검진 유형, 병원 검색..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as CheckupStatus | '')}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white">
          <option value="">전체 상태</option>
          {(['draft', 'submitted', 'confirmed', 'completed', 'cancelled'] as CheckupStatus[]).map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm text-gray-500">총 <span className="font-semibold text-gray-900">{filtered.length}</span>건</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['고객명', '국적', '병원', '검진 유형', '희망 날짜', '확정 날짜', '요청 사항', '상태', '신청일', ''].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap">{app.guestName}</td>
                  <td className="py-3 px-4 text-xs text-gray-500">{app.nationality}</td>
                  <td className="py-3 px-4 text-xs text-gray-600 whitespace-nowrap">{app.hospital}</td>
                  <td className="py-3 px-4 text-xs text-gray-700">{app.checkupType}</td>
                  <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{app.preferredDate}</td>
                  <td className="py-3 px-4 text-xs whitespace-nowrap">
                    {app.confirmedDate
                      ? <span className="text-green-600 font-medium">{app.confirmedDate}</span>
                      : <span className="text-gray-300">-</span>}
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-400 max-w-[140px] truncate">{app.notes ?? '-'}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[app.status]}`}>
                      {STATUS_LABELS[app.status]}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-400 whitespace-nowrap">{app.createdAt}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2 whitespace-nowrap">
                      {app.status === 'draft' && (
                        <button onClick={() => handleSubmit(app.id)}
                          className="text-xs bg-amber-500 text-white px-2.5 py-1 rounded hover:bg-amber-600">
                          제출
                        </button>
                      )}
                      {(app.status === 'draft' || app.status === 'submitted') && (
                        <button onClick={() => handleCancel(app.id)}
                          className="text-xs text-red-500 hover:underline">
                          취소
                        </button>
                      )}
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
