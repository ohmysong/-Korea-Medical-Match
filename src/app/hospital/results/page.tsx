'use client'

import { useState, useMemo, useRef } from 'react'
import { mockMedicalResults, type MedicalResult, type ResultUploadStatus } from '@/lib/hospital-mock-data'

const STATUS_LABELS: Record<ResultUploadStatus, string> = {
  pending: '업로드 대기',
  uploaded: '업로드 완료',
  sent: '환자 전송 완료',
}
const STATUS_STYLES: Record<ResultUploadStatus, string> = {
  pending: 'bg-orange-50 text-orange-700 border border-orange-200',
  uploaded: 'bg-blue-50 text-blue-700',
  sent: 'bg-green-50 text-green-700',
}

export default function ResultsPage() {
  const [items, setItems] = useState(mockMedicalResults)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ResultUploadStatus | ''>('')
  const [toast, setToast] = useState('')
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pendingUploadId = useRef<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  function handleUploadClick(id: string) {
    pendingUploadId.current = id
    setUploadingId(id)
    fileInputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    const id = pendingUploadId.current
    if (file && id) {
      setItems((prev) => prev.map((r) =>
        r.id === id
          ? { ...r, status: 'uploaded' as ResultUploadStatus, fileName: file.name, uploadedAt: '2026-06-18' }
          : r
      ))
      showToast(`'${file.name}' 업로드 완료`)
    }
    setUploadingId(null)
    pendingUploadId.current = null
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleSend(id: string) {
    const item = items.find((r) => r.id === id)
    setItems((prev) => prev.map((r) =>
      r.id === id ? { ...r, status: 'sent' as ResultUploadStatus, sentAt: '2026-06-18' } : r
    ))
    showToast(`${item?.patientName}에게 결과지를 전송했습니다.`)
  }

  const stats = [
    { label: '전체', value: items.length },
    { label: '업로드 대기', value: items.filter((r) => r.status === 'pending').length },
    { label: '업로드 완료', value: items.filter((r) => r.status === 'uploaded').length },
    { label: '전송 완료', value: items.filter((r) => r.status === 'sent').length },
  ]

  const filtered = useMemo(() => {
    return items.filter((r) => {
      const q = search.toLowerCase()
      const matchSearch =
        !search ||
        r.patientName.toLowerCase().includes(q) ||
        r.treatment.toLowerCase().includes(q) ||
        r.doctor.toLowerCase().includes(q)
      const matchStatus = !statusFilter || r.status === statusFilter
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

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">결과지 업로드</h1>
          <p className="text-sm text-gray-500 mt-0.5">진료 결과지 업로드 및 환자 전송 관리</p>
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
          placeholder="환자명, 진료명, 담당 의사 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ResultUploadStatus | '')}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white"
        >
          <option value="">전체 상태</option>
          {(['pending', 'uploaded', 'sent'] as ResultUploadStatus[]).map((s) => (
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
                {['환자명', '국적', '진료', '담당 의사', '진료일', '파일명', '업로드일', '전송일', '상태', ''].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((res) => (
                <tr key={res.id} className={`hover:bg-gray-50 ${res.status === 'pending' ? 'bg-orange-50/20' : ''}`}>
                  <td className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap">{res.patientName}</td>
                  <td className="py-3 px-4 text-xs text-gray-500">{res.nationality}</td>
                  <td className="py-3 px-4 text-xs text-gray-700">{res.treatment}</td>
                  <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{res.doctor}</td>
                  <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{res.visitDate}</td>
                  <td className="py-3 px-4 text-xs text-gray-500">
                    {res.fileName ? (
                      <button
                        onClick={() => showToast(`${res.fileName} 다운로드 시작`)}
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <span>📄</span>
                        <span className="truncate max-w-[130px]">{res.fileName}</span>
                      </button>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-400 whitespace-nowrap">
                    {res.uploadedAt ?? <span className="text-gray-300">-</span>}
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-400 whitespace-nowrap">
                    {res.sentAt ?? <span className="text-gray-300">-</span>}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[res.status]}`}>
                      {STATUS_LABELS[res.status]}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2 whitespace-nowrap">
                      {res.status === 'pending' && (
                        <button
                          onClick={() => handleUploadClick(res.id)}
                          disabled={uploadingId === res.id}
                          className="text-xs bg-green-600 text-white px-2.5 py-1 rounded hover:bg-green-700 disabled:opacity-60"
                        >
                          {uploadingId === res.id ? '선택 중...' : '업로드'}
                        </button>
                      )}
                      {res.status === 'uploaded' && (
                        <>
                          <button
                            onClick={() => handleSend(res.id)}
                            className="text-xs bg-blue-600 text-white px-2.5 py-1 rounded hover:bg-blue-700"
                          >
                            전송
                          </button>
                          <button
                            onClick={() => handleUploadClick(res.id)}
                            className="text-xs border border-gray-200 text-gray-600 px-2.5 py-1 rounded hover:bg-gray-50"
                          >
                            재업로드
                          </button>
                        </>
                      )}
                      {res.status === 'sent' && (
                        <button
                          onClick={() => showToast(`${res.fileName} 다운로드 시작`)}
                          className="text-xs text-gray-500 hover:underline"
                        >
                          다운로드
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

      <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-2">업로드 안내</h2>
        <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
          <div className="flex items-start gap-2">
            <span className="text-green-600 font-bold mt-0.5 flex-shrink-0">1</span>
            <div>
              <p className="font-medium text-gray-800">파일 준비</p>
              <p className="text-gray-500 mt-0.5">PDF, JPG, PNG 지원 · 최대 50MB · 환자 개인정보 포함 파일은 암호화 필수</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 font-bold mt-0.5 flex-shrink-0">2</span>
            <div>
              <p className="font-medium text-gray-800">업로드</p>
              <p className="text-gray-500 mt-0.5">업로드 버튼 클릭 → 파일 선택 → 완료 시 상태 자동 변경</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 font-bold mt-0.5 flex-shrink-0">3</span>
            <div>
              <p className="font-medium text-gray-800">환자 전송</p>
              <p className="text-gray-500 mt-0.5">전송 버튼 클릭 시 환자 이메일로 보안 링크 자동 발송</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
