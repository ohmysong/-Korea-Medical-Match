'use client'

import { useState } from 'react'
import { mockPatientResults, type PatientResult, type PatientResultStatus } from '@/lib/patient-mock-data'

const STATUS_LABELS: Record<PatientResultStatus, string> = {
  pending: '업로드 대기',
  uploaded: '확인 가능',
  viewed: '확인 완료',
}
const STATUS_STYLES: Record<PatientResultStatus, string> = {
  pending: 'bg-gray-100 text-gray-500',
  uploaded: 'bg-teal-50 text-teal-700 border border-teal-200',
  viewed: 'bg-green-50 text-green-700',
}

function ResultDetailModal({ item, onClose, onView }: {
  item: PatientResult
  onClose: () => void
  onView: (id: string) => void
}) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-base font-bold text-gray-900">결과지 상세</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">병원</p>
            <p className="font-semibold text-gray-900">{item.hospital}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">결과 유형</p>
            <p className="font-medium text-gray-800">{item.resultType}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">검사일</p>
            <p className="font-medium text-gray-800">{item.date}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">내용 요약</p>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">{item.description}</p>
          </div>
          {item.fileName && (
            <div className="flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-xl p-3">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg">📄</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.fileName}</p>
                <p className="text-xs text-gray-400">{item.fileSize}</p>
              </div>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            {item.status === 'uploaded' && item.fileName && (
              <button onClick={() => { onView(item.id); onClose() }}
                className="flex-1 bg-teal-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-teal-700">
                결과지 열기
              </button>
            )}
            {item.status === 'viewed' && item.fileName && (
              <button className="flex-1 border border-teal-200 text-teal-600 py-2.5 rounded-lg text-sm font-medium hover:bg-teal-50">
                다시 열기
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

export default function PatientResultsPage() {
  const [items, setItems] = useState(mockPatientResults)
  const [selected, setSelected] = useState<PatientResult | null>(null)
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  function handleView(id: string) {
    setItems((prev) => prev.map((r) =>
      r.id === id ? { ...r, status: 'viewed' as PatientResultStatus, viewedAt: '2026-06-18' } : r
    ))
    showToast('결과지를 확인했습니다. (실제 환경에서는 파일이 열립니다)')
  }

  const newResults = items.filter((r) => r.status === 'uploaded')
  const stats = [
    { label: '새 결과지', value: newResults.length, accent: true },
    { label: '확인 완료', value: items.filter((r) => r.status === 'viewed').length },
    { label: '대기 중', value: items.filter((r) => r.status === 'pending').length },
  ]

  return (
    <div className="max-w-3xl mx-auto px-6 py-6">
      {toast && <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg">{toast}</div>}
      {selected && (
        <ResultDetailModal item={selected} onClose={() => setSelected(null)} onView={handleView} />
      )}

      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">결과 확인</h1>
        <p className="text-sm text-gray-500 mt-0.5">병원에서 업로드한 검사 결과지를 확인하세요</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className={`border rounded-xl p-4 ${s.accent ? 'bg-teal-50 border-teal-200' : 'bg-white border-gray-200'}`}>
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.accent ? 'text-teal-700' : 'text-gray-900'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {items.map((r) => (
          <div key={r.id}
            className={`bg-white border rounded-2xl p-5 transition-colors cursor-pointer ${
              r.status === 'uploaded' ? 'border-teal-200 hover:border-teal-300' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => { if (r.status === 'uploaded') handleView(r.id); setSelected(r) }}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                r.status === 'pending' ? 'bg-gray-50 border-gray-100' :
                r.status === 'uploaded' ? 'bg-teal-50 border-teal-100' : 'bg-green-50 border-green-100'
              }`}>
                <span className="text-xl">{r.status === 'pending' ? '⏳' : '📄'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[r.status]}`}>
                    {STATUS_LABELS[r.status]}
                  </span>
                  {r.status === 'uploaded' && (
                    <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">NEW</span>
                  )}
                </div>
                <p className="text-sm font-bold text-gray-900">{r.resultType}</p>
                <p className="text-xs text-gray-500 mt-0.5">{r.hospital} · 검사일 {r.date}</p>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{r.description}</p>
                {r.fileName && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-xs text-teal-600">📎</span>
                    <span className="text-xs text-teal-600 font-medium truncate">{r.fileName}</span>
                    <span className="text-xs text-gray-400">({r.fileSize})</span>
                  </div>
                )}
              </div>
              {r.status === 'uploaded' && (
                <button onClick={(e) => { e.stopPropagation(); handleView(r.id) }}
                  className="flex-shrink-0 bg-teal-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-teal-700 self-center">
                  열기
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
