'use client'

import { useState, useMemo } from 'react'
import { mockHospitalInquiries, type HospitalInquiry, type InquiryStatus } from '@/lib/hospital-mock-data'

const STATUS_LABELS: Record<InquiryStatus, string> = {
  new: '신규',
  reviewed: '검토 중',
  responded: '답변 완료',
  converted: '예약 전환',
}
const STATUS_STYLES: Record<InquiryStatus, string> = {
  new: 'bg-red-50 text-red-700 border border-red-200',
  reviewed: 'bg-yellow-50 text-yellow-700',
  responded: 'bg-blue-50 text-blue-700',
  converted: 'bg-green-50 text-green-700',
}

function DetailModal({ inq, onClose, onRespond, onConvert }: {
  inq: HospitalInquiry
  onClose: () => void
  onRespond: (id: string, msg: string) => void
  onConvert: (id: string) => void
}) {
  const [replyMsg, setReplyMsg] = useState('')
  const [tab, setTab] = useState<'detail' | 'reply'>('detail')

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-start">
          <div>
            <h2 className="text-base font-bold text-gray-900">{inq.patientName}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{inq.nationality} · {inq.email} · {inq.phone}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none mt-0.5">×</button>
        </div>

        <div className="flex border-b border-gray-200">
          {(['detail', 'reply'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                tab === t ? 'border-b-2 border-green-600 text-green-700' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'detail' ? '문의 내용' : '답변 작성'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === 'detail' ? (
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">진료 관심사</p>
                <p className="text-sm font-medium text-gray-900">{inq.treatmentInterest}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">문의 내용</p>
                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3">{inq.message}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500">희망 방문일</span>
                  <p className="font-medium text-gray-900 mt-0.5">{inq.preferredDate ?? '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500">에이전트</span>
                  <p className="font-medium text-gray-900 mt-0.5">{inq.agentName ?? '직접 문의'}</p>
                </div>
                <div>
                  <span className="text-gray-500">접수일</span>
                  <p className="font-medium text-gray-900 mt-0.5">{inq.createdAt}</p>
                </div>
                <div>
                  <span className="text-gray-500">상태</span>
                  <span className={`inline-block mt-0.5 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[inq.status]}`}>
                    {STATUS_LABELS[inq.status]}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                value={replyMsg}
                onChange={(e) => setReplyMsg(e.target.value)}
                placeholder="환자에게 전달할 답변을 작성하세요. 작성 후 전송하면 이메일로 발송됩니다."
                rows={5}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-400 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { if (replyMsg.trim()) { onRespond(inq.id, replyMsg); onClose() } }}
                  disabled={!replyMsg.trim()}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-40"
                >
                  답변 전송
                </button>
                {inq.status !== 'converted' && (
                  <button
                    onClick={() => { onConvert(inq.id); onClose() }}
                    className="flex-1 border border-green-600 text-green-700 py-2 rounded-lg text-sm font-medium hover:bg-green-50"
                  >
                    예약으로 전환
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function InquiriesPage() {
  const [items, setItems] = useState(mockHospitalInquiries)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | ''>('')
  const [selected, setSelected] = useState<HospitalInquiry | null>(null)
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  function handleRespond(id: string, _msg: string) {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, status: 'responded' as InquiryStatus } : i))
    showToast('답변이 전송되었습니다.')
  }

  function handleConvert(id: string) {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, status: 'converted' as InquiryStatus } : i))
    showToast('예약으로 전환되었습니다.')
  }

  function handleReview(id: string) {
    setItems((prev) => prev.map((i) => i.id === id && i.status === 'new' ? { ...i, status: 'reviewed' as InquiryStatus } : i))
  }

  const stats = [
    { label: '전체 문의', value: items.length },
    { label: '신규', value: items.filter((i) => i.status === 'new').length },
    { label: '답변 대기', value: items.filter((i) => i.status === 'reviewed').length },
    { label: '예약 전환', value: items.filter((i) => i.status === 'converted').length },
  ]

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const q = search.toLowerCase()
      const matchSearch =
        !search ||
        i.patientName.toLowerCase().includes(q) ||
        i.treatmentInterest.toLowerCase().includes(q) ||
        (i.agentName ?? '').toLowerCase().includes(q)
      const matchStatus = !statusFilter || i.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [items, search, statusFilter])

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      {selected && (
        <DetailModal
          inq={selected}
          onClose={() => setSelected(null)}
          onRespond={handleRespond}
          onConvert={handleConvert}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">환자 문의</h1>
          <p className="text-sm text-gray-500 mt-0.5">환자 및 에이전트로부터 수신된 진료 문의</p>
        </div>
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
          placeholder="환자명, 진료 관심사, 에이전트 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as InquiryStatus | '')}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white"
        >
          <option value="">전체 상태</option>
          {(['new', 'reviewed', 'responded', 'converted'] as InquiryStatus[]).map((s) => (
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
                {['환자명', '국적', '진료 관심사', '에이전트', '희망 날짜', '상태', '접수일', ''].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((inq) => (
                <tr
                  key={inq.id}
                  className={`hover:bg-gray-50 cursor-pointer ${inq.status === 'new' ? 'bg-red-50/20' : ''}`}
                  onClick={() => { setSelected(inq); handleReview(inq.id) }}
                >
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900 whitespace-nowrap">{inq.patientName}</p>
                    <p className="text-xs text-gray-400">{inq.email}</p>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{inq.nationality}</td>
                  <td className="py-3 px-4">
                    <p className="text-xs font-medium text-gray-800 whitespace-nowrap">{inq.treatmentInterest}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[200px]">{inq.message}</p>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">
                    {inq.agentName
                      ? <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{inq.agentName}</span>
                      : <span className="text-gray-300">직접</span>}
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">
                    {inq.preferredDate ?? <span className="text-gray-300">-</span>}
                  </td>
                  <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[inq.status]}`}>
                      {STATUS_LABELS[inq.status]}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-400 whitespace-nowrap">{inq.createdAt}</td>
                  <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-2 whitespace-nowrap">
                      <button
                        onClick={() => { setSelected(inq); handleReview(inq.id) }}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        상세
                      </button>
                      {inq.status === 'new' || inq.status === 'reviewed' ? (
                        <button
                          onClick={() => { setSelected({ ...inq }); handleReview(inq.id) }}
                          className="text-xs text-gray-600 hover:underline"
                        >
                          답변
                        </button>
                      ) : null}
                      {inq.status !== 'converted' && (
                        <button
                          onClick={() => handleConvert(inq.id)}
                          className="text-xs text-green-600 hover:underline"
                        >
                          예약전환
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
