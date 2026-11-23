'use client'

import { useMemo, useState } from 'react'
import useSWR from 'swr'
import { mockServiceRequests, type ServiceRequest } from '@/lib/hospital-mock-data'
import * as requestsApi from '@/lib/api/requests'
import { ApiError } from '@/lib/api/client'
import type { InterpretRequest, InterpretRequestInput } from '@/lib/api/types'

type RowType = 'interpreter' | 'vehicle'

interface Row {
  id: string
  type: RowType
  patientLabel: string
  nationality: string
  scheduleLabel: string
  detailLabel: string
  detailSub?: string
  assignedName: string | null
  statusLabel: string
  statusStyle: string
  createdAt: string
  canAssign: boolean
  canCancel: boolean
  source: { kind: 'api'; data: InterpretRequest } | { kind: 'mock'; data: ServiceRequest }
}

function formatDate(iso?: string | null) {
  if (!iso) return '-'
  try {
    return new Date(iso).toLocaleString('ko-KR', { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return iso
  }
}

function interpretRequestToRow(r: InterpretRequest): Row {
  const cancelled = r.status === 'cancelled'
  const assigned = !!r.assignedInterpreterId
  return {
    id: r.id,
    type: 'interpreter',
    patientLabel: r.contactName ?? r.hospitalName ?? r.id,
    nationality: r.patientNationality ?? '-',
    scheduleLabel: formatDate(r.startTime),
    detailLabel: r.language ?? '-',
    detailSub: r.department ?? undefined,
    assignedName: r.assignedInterpreterId ?? null,
    statusLabel: cancelled ? '취소됨' : assigned ? '배정 완료' : r.adminAssigned ? '배정 요청됨' : '배정 대기',
    statusStyle: cancelled
      ? 'bg-gray-100 text-gray-400'
      : assigned
        ? 'bg-green-50 text-green-700'
        : r.adminAssigned
          ? 'bg-blue-50 text-blue-700'
          : 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    createdAt: formatDate(r.createdAt),
    canAssign: !cancelled && !assigned && !r.adminAssigned,
    canCancel: !cancelled,
    source: { kind: 'api', data: r },
  }
}

const VEHICLE_STATUS_LABELS: Record<ServiceRequest['status'], string> = {
  pending: '배정 대기',
  assigned: '배정 완료',
  completed: '완료',
  cancelled: '취소',
}
const VEHICLE_STATUS_STYLES: Record<ServiceRequest['status'], string> = {
  pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  assigned: 'bg-blue-50 text-blue-700',
  completed: 'bg-green-50 text-green-700',
  cancelled: 'bg-gray-100 text-gray-400',
}

function vehicleRequestToRow(r: ServiceRequest): Row {
  return {
    id: r.id,
    type: 'vehicle',
    patientLabel: r.patientName,
    nationality: r.nationality,
    scheduleLabel: r.requestedDate,
    detailLabel: r.vehicleType ?? '-',
    detailSub: r.pickupLocation,
    assignedName: r.assignedName ?? null,
    statusLabel: VEHICLE_STATUS_LABELS[r.status],
    statusStyle: VEHICLE_STATUS_STYLES[r.status],
    createdAt: r.createdAt,
    canAssign: r.status === 'pending',
    canCancel: r.status === 'pending',
    source: { kind: 'mock', data: r },
  }
}

const EMPTY_FORM: InterpretRequestInput = {
  hospitalName: '',
  contactName: '',
  phone: '',
  language: '',
  level: undefined,
  preferredInterpreterGender: '',
  requireMedicalCert: false,
  interpreterStyle: '',
  department: '',
  startTime: '',
  endTime: '',
  procedureContent: '',
  patientNationality: '',
  notes: '',
}

function CreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: (r: InterpretRequest) => void }) {
  const [form, setForm] = useState<InterpretRequestInput>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set<K extends keyof InterpretRequestInput>(field: K, value: InterpretRequestInput[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const id = `request-${Date.now()}`
      const payload: InterpretRequestInput = {
        ...form,
        startTime: form.startTime ? new Date(form.startTime).toISOString() : undefined,
        endTime: form.endTime ? new Date(form.endTime).toISOString() : undefined,
      }
      const created = await requestsApi.createInterpretRequest({ id, ...payload })
      onCreated(created)
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '등록 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-base font-bold text-gray-900">통역 요청 등록</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">담당자명</label>
              <input value={form.contactName ?? ''} onChange={(e) => set('contactName', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">연락처</label>
              <input value={form.phone ?? ''} onChange={(e) => set('phone', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">희망 언어</label>
              <input value={form.language ?? ''} onChange={(e) => set('language', e.target.value)} placeholder="예: English"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">희망 등급</label>
              <input type="number" min={1} value={form.level ?? ''} onChange={(e) => set('level', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">진료과</label>
              <input value={form.department ?? ''} onChange={(e) => set('department', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">환자 국적</label>
              <input value={form.patientNationality ?? ''} onChange={(e) => set('patientNationality', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">시작 시간</label>
              <input type="datetime-local" value={form.startTime ?? ''} onChange={(e) => set('startTime', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">종료 시간</label>
              <input type="datetime-local" value={form.endTime ?? ''} onChange={(e) => set('endTime', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">선호 통역사 성별</label>
              <input value={form.preferredInterpreterGender ?? ''} onChange={(e) => set('preferredInterpreterGender', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">통역 스타일</label>
              <input value={form.interpreterStyle ?? ''} onChange={(e) => set('interpreterStyle', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">시술/진료 내용</label>
            <textarea value={form.procedureContent ?? ''} onChange={(e) => set('procedureContent', e.target.value)} rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">메모</label>
            <textarea value={form.notes ?? ''} onChange={(e) => set('notes', e.target.value)} rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400 resize-none" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input type="checkbox" checked={form.requireMedicalCert ?? false} onChange={(e) => set('requireMedicalCert', e.target.checked)} className="rounded" />
            <span className="text-sm text-gray-600">의료 통역 자격증 필수</span>
          </label>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50">취소</button>
            <button type="submit" disabled={saving} className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-60">
              {saving ? '등록 중...' : '등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DetailModal({ row, onClose }: { row: Row; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-base font-bold text-gray-900">
            {row.type === 'interpreter' ? '통역 요청 상세' : '차량 요청 상세 (미리보기)'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div className="p-6 space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500">{row.type === 'interpreter' ? '담당자' : '환자명'}</p>
              <p className="font-medium text-gray-900 mt-0.5">{row.patientLabel}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">국적</p>
              <p className="font-medium text-gray-900 mt-0.5">{row.nationality}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-500">일정</p>
              <p className="font-medium text-gray-900 mt-0.5">{row.scheduleLabel}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">상태</p>
              <span className={`inline-block mt-0.5 text-xs px-2 py-0.5 rounded-full font-medium ${row.statusStyle}`}>
                {row.statusLabel}
              </span>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-500">{row.type === 'interpreter' ? '요청 언어' : '차량 유형'}</p>
              <p className="font-medium text-purple-700 mt-0.5">{row.detailLabel}</p>
              {row.detailSub && <p className="text-gray-500 text-xs mt-0.5">{row.detailSub}</p>}
            </div>
            {row.assignedName && (
              <div className="col-span-2">
                <p className="text-xs text-gray-500">배정 통역사 ID</p>
                <p className="font-medium text-blue-700 mt-0.5">{row.assignedName}</p>
              </div>
            )}
          </div>
          {row.source.kind === 'api' && row.source.data.notes && (
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-xs text-yellow-800">
              <span className="font-semibold">메모: </span>{row.source.data.notes}
            </div>
          )}
          {row.source.kind === 'mock' && row.source.data.note && (
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-xs text-yellow-800">
              <span className="font-semibold">메모: </span>{row.source.data.note}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RequestsPage() {
  const {
    data: interpretRequests = [],
    error: loadError,
    isLoading: loading,
    mutate,
  } = useSWR('hospital/requests', () => requestsApi.listInterpretRequests())
  const [vehicleItems, setVehicleItems] = useState<ServiceRequest[]>(mockServiceRequests.filter((r) => r.type === 'vehicle'))
  const [typeTab, setTypeTab] = useState<RowType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Row | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const error = loadError ? (loadError instanceof ApiError ? loadError.message : '통역 요청 목록을 불러오지 못했습니다.') : ''

  const rows: Row[] = useMemo(
    () => [...interpretRequests.map(interpretRequestToRow), ...vehicleItems.map(vehicleRequestToRow)],
    [interpretRequests, vehicleItems]
  )

  async function handleAssign(row: Row) {
    if (row.source.kind === 'api') {
      try {
        const updated = await requestsApi.updateInterpretRequest(row.id, { adminAssigned: true })
        mutate((prev) => (prev ?? []).map((r) => (r.id === row.id ? updated : r)), { revalidate: false })
        showToast('KMM 운영팀에 배정을 요청했습니다.')
      } catch (err) {
        showToast(err instanceof ApiError ? err.message : '배정 요청에 실패했습니다.')
      }
    } else {
      setVehicleItems((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: 'assigned', assignedName: 'KMM 배정 대기 중' } : r)))
      showToast('KMM 운영팀에 배정을 요청했습니다.')
    }
  }

  async function handleCancel(row: Row) {
    if (row.source.kind === 'api') {
      try {
        const updated = await requestsApi.updateInterpretRequest(row.id, { status: 'cancelled' })
        mutate((prev) => (prev ?? []).map((r) => (r.id === row.id ? updated : r)), { revalidate: false })
        showToast('요청이 취소되었습니다.')
      } catch (err) {
        showToast(err instanceof ApiError ? err.message : '취소에 실패했습니다.')
      }
    } else {
      setVehicleItems((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: 'cancelled' } : r)))
      showToast('요청이 취소되었습니다.')
    }
  }

  const stats = [
    { label: '전체 요청', value: rows.length },
    { label: '통역 요청', value: interpretRequests.length },
    { label: '차량 요청 (미리보기)', value: vehicleItems.length },
    { label: '배정 대기', value: rows.filter((r) => r.statusLabel.includes('대기')).length },
  ]

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const q = search.toLowerCase()
      const matchSearch =
        !search ||
        r.patientLabel.toLowerCase().includes(q) ||
        r.detailLabel.toLowerCase().includes(q) ||
        (r.assignedName ?? '').toLowerCase().includes(q)
      const matchType = typeTab === 'all' || r.type === typeTab
      const matchStatus = !statusFilter || r.statusLabel === statusFilter
      return matchSearch && matchType && matchStatus
    })
  }, [rows, search, typeTab, statusFilter])

  const statusOptions = useMemo(() => [...new Set(rows.map((r) => r.statusLabel))], [rows])

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      {selected && <DetailModal row={selected} onClose={() => setSelected(null)} />}
      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreated={(r) => mutate((prev) => [r, ...(prev ?? [])], { revalidate: false })}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">통역 / 차량 요청</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            통역 요청은 실시간 연동됩니다 · 차량 요청은 백엔드 연동 전 미리보기입니다
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
          + 통역 요청
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => mutate()} className="text-xs underline">다시 시도</button>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4 mb-5">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex gap-3">
        <div className="flex border border-gray-200 rounded-lg overflow-hidden text-sm">
          {(['all', 'interpreter', 'vehicle'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeTab(t)}
              className={`px-3 py-2 font-medium transition-colors ${
                typeTab === t ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t === 'all' ? '전체' : t === 'interpreter' ? '통역' : '차량'}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="담당자명, 언어, 배정 대상 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white"
        >
          <option value="">전체 상태</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
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
                {['유형', '담당자/환자', '국적', '일정', '세부 정보', '배정', '상태', '등록일', ''].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={9} className="py-10 text-center text-gray-400 text-sm">불러오는 중...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="py-10 text-center text-gray-400 text-sm">요청이 없습니다.</td></tr>
              ) : (
                filtered.map((row) => (
                  <tr key={`${row.type}-${row.id}`} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        row.type === 'interpreter' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {row.type === 'interpreter' ? '통역' : '차량'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap">{row.patientLabel}</td>
                    <td className="py-3 px-4 text-xs text-gray-500">{row.nationality}</td>
                    <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{row.scheduleLabel}</td>
                    <td className="py-3 px-4 text-xs text-gray-600">
                      <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded">{row.detailLabel}</span>
                      {row.detailSub && <p className="text-gray-400 truncate max-w-[160px] mt-0.5">{row.detailSub}</p>}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500">
                      {row.assignedName ?? <span className="text-gray-300">미배정</span>}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${row.statusStyle}`}>
                        {row.statusLabel}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-400 whitespace-nowrap">{row.createdAt}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2 whitespace-nowrap">
                        <button onClick={() => setSelected(row)} className="text-xs text-blue-600 hover:underline">상세</button>
                        {row.canAssign && (
                          <button
                            onClick={() => handleAssign(row)}
                            className="text-xs bg-green-600 text-white px-2.5 py-1 rounded hover:bg-green-700"
                          >
                            배정 요청
                          </button>
                        )}
                        {row.canCancel && (
                          <button onClick={() => handleCancel(row)} className="text-xs text-red-500 hover:underline">취소</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
