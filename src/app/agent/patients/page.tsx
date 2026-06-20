'use client'

import { useMemo, useState } from 'react'
import { mockAgentPatients, type AgentPatient, type LeadStatus } from '@/lib/agent-mock-data'

const STATUS_LABELS: Record<LeadStatus, string> = { new: '신규', matching: '매칭 중', completed: '완료', cancelled: '취소' }
const STATUS_STYLES: Record<LeadStatus, string> = {
  new: 'bg-gray-100 text-gray-600',
  matching: 'bg-blue-50 text-blue-700 border border-blue-200',
  completed: 'bg-green-50 text-green-700 border border-green-200',
  cancelled: 'bg-red-50 text-red-700 border border-red-200',
}

function fmt(n: number) {
  return `₩${n.toLocaleString()}`
}

function ProfileModal({ patient, onClose, onDownload }: {
  patient: AgentPatient
  onClose: () => void
  onDownload: (fileName: string) => void
}) {
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

        <div className="p-6 space-y-5">
          <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[patient.status]}`}>
            {STATUS_LABELS[patient.status]}
          </span>

          <div>
            <p className="text-xs font-semibold text-gray-900 mb-2">연락처</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-gray-500">이메일</p>
                <p className="font-medium text-gray-900 mt-0.5">{patient.email}</p>
              </div>
              <div>
                <p className="text-gray-500">전화번호</p>
                <p className="font-medium text-gray-900 mt-0.5">{patient.phone || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500">희망 진료/시술</p>
                <p className="font-medium text-gray-900 mt-0.5">{patient.treatmentInterest}</p>
              </div>
              <div>
                <p className="text-gray-500">예상 금액</p>
                <p className="font-medium text-gray-900 mt-0.5">{fmt(patient.estimatedAmount)}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-900 mb-2">진료 이력</p>
            {patient.treatmentHistory.length === 0 ? (
              <p className="text-xs text-gray-400">진료 이력이 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {patient.treatmentHistory.map((h, i) => (
                  <div key={i} className="border-l-2 border-indigo-200 pl-3">
                    <p className="text-xs text-gray-400">{h.date}</p>
                    <p className="text-sm font-medium text-gray-900">{h.hospital} · {h.treatment}</p>
                    {h.note && <p className="text-xs text-gray-500 mt-0.5">{h.note}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-900 mb-2">문서 다운로드</p>
            {patient.documents.length === 0 ? (
              <p className="text-xs text-gray-400">등록된 문서가 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {patient.documents.map((d) => (
                  <div key={d.id} className="flex items-center gap-3 border border-gray-200 rounded-lg p-3">
                    <div className="w-9 h-9 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-base">📎</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{d.name}</p>
                      <p className="text-xs text-gray-400">{d.type} · {d.fileSize} · {d.uploadedAt}</p>
                    </div>
                    <button
                      onClick={() => onDownload(d.fileName)}
                      className="flex-shrink-0 text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 font-medium"
                    >
                      다운로드
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AgentPatientsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<LeadStatus | ''>('')
  const [selected, setSelected] = useState<AgentPatient | null>(null)
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const stats = [
    { label: '전체 환자', value: mockAgentPatients.length },
    { label: '문서 보유', value: mockAgentPatients.filter((p) => p.documents.length > 0).length },
    { label: '진료 이력 보유', value: mockAgentPatients.filter((p) => p.treatmentHistory.length > 0).length },
    { label: '완료', value: mockAgentPatients.filter((p) => p.status === 'completed').length },
  ]

  const filtered = useMemo(() => {
    return mockAgentPatients.filter((p) => {
      const q = search.toLowerCase()
      const matchSearch = !search || p.name.toLowerCase().includes(q) || p.treatmentInterest.toLowerCase().includes(q)
      const matchStatus = !statusFilter || p.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [search, statusFilter])

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      {toast && <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg">{toast}</div>}
      {selected && (
        <ProfileModal
          patient={selected}
          onClose={() => setSelected(null)}
          onDownload={(fileName) => showToast(`'${fileName}' 다운로드를 시작합니다`)}
        />
      )}

      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">환자 관리</h1>
        <p className="text-sm text-gray-500 mt-0.5">내가 소개한 전체 환자의 연락처·진료 이력·문서를 확인하세요</p>
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
          placeholder="환자명, 희망 진료 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as LeadStatus | '')}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white">
          <option value="">전체 상태</option>
          {(['new', 'matching', 'completed', 'cancelled'] as LeadStatus[]).map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm text-gray-500">총 <span className="font-semibold text-gray-900">{filtered.length}</span>명</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['환자명', '국적', '연락처', '희망 진료', '상태', '문서', ''].map((h) => (
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
                  <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{p.phone || '-'}</td>
                  <td className="py-3 px-4 text-xs text-gray-700 whitespace-nowrap">{p.treatmentInterest}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[p.status]}`}>
                      {STATUS_LABELS[p.status]}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500">
                    {p.documents.length > 0 ? `${p.documents.length}건` : <span className="text-gray-300">-</span>}
                  </td>
                  <td className="py-3 px-4">
                    <button onClick={(e) => { e.stopPropagation(); setSelected(p) }} className="text-xs text-indigo-600 hover:underline">
                      상세 프로필
                    </button>
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
