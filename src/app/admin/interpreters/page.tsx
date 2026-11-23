'use client'

import { useMemo, useState } from 'react'
import useSWR from 'swr'
import * as applicantsApi from '@/lib/api/applicants'
import { ApiError } from '@/lib/api/client'
import type { Applicant, ApplicantInput, ApplicantStatus } from '@/lib/api/types'

const STATUS_LABELS: Record<ApplicantStatus, string> = {
  new: '신규',
  reviewed: '검토됨',
  interview_requested: '인터뷰 요청',
  approved: '승인',
}
const STATUS_STYLES: Record<ApplicantStatus, string> = {
  new: 'bg-blue-50 text-blue-700 border border-blue-200',
  reviewed: 'bg-gray-100 text-gray-600',
  interview_requested: 'bg-orange-50 text-orange-700 border border-orange-200',
  approved: 'bg-green-50 text-green-700 border border-green-200',
}
const STATUS_ORDER: ApplicantStatus[] = ['new', 'reviewed', 'interview_requested', 'approved']

function StatusBadge({ status }: { status?: ApplicantStatus | null }) {
  if (!status) return <span className="text-xs text-gray-300">-</span>
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[status]}`}>{STATUS_LABELS[status]}</span>
}

function formatDate(iso?: string | null) {
  if (!iso) return '-'
  try {
    return new Date(iso).toLocaleDateString('ko-KR')
  } catch {
    return iso
  }
}

const EMPTY_FORM: ApplicantInput = {
  nameKr: '',
  nameEn: '',
  phone: '',
  email: '',
  birthYear: undefined,
  gender: '',
  country: '',
  nationalityType: '',
  proficiency: '',
  medicalEnvExp: '',
  agreePrivacy: false,
}

function CreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: (a: Applicant) => void }) {
  const [form, setForm] = useState<ApplicantInput>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set<K extends keyof ApplicantInput>(field: K, value: ApplicantInput[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const id = `applicant-${Date.now()}`
      const created = await applicantsApi.createApplicant({ id, ...form, status: 'new' })
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
          <h2 className="text-base font-bold text-gray-900">지원자 등록</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">이름 (국문)</label>
              <input value={form.nameKr ?? ''} onChange={(e) => set('nameKr', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">이름 (영문)</label>
              <input value={form.nameEn ?? ''} onChange={(e) => set('nameEn', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">연락처</label>
              <input value={form.phone ?? ''} onChange={(e) => set('phone', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">이메일</label>
              <input type="email" value={form.email ?? ''} onChange={(e) => set('email', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">출생년도</label>
              <input type="number" value={form.birthYear ?? ''} onChange={(e) => set('birthYear', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">성별</label>
              <input value={form.gender ?? ''} onChange={(e) => set('gender', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">국가</label>
              <input value={form.country ?? ''} onChange={(e) => set('country', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">국적 유형</label>
              <input value={form.nationalityType ?? ''} onChange={(e) => set('nationalityType', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">언어 능력</label>
              <input value={form.proficiency ?? ''} onChange={(e) => set('proficiency', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">의료 환경 경력</label>
              <textarea value={form.medicalEnvExp ?? ''} onChange={(e) => set('medicalEnvExp', e.target.value)} rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input type="checkbox" checked={form.agreePrivacy ?? false} onChange={(e) => set('agreePrivacy', e.target.checked)} className="rounded" />
            <span className="text-sm text-gray-600">개인정보 수집·이용에 동의</span>
          </label>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50">취소</button>
            <button type="submit" disabled={saving} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
              {saving ? '등록 중...' : '등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DetailModal({
  applicant,
  onClose,
  onUpdated,
  onDeleted,
}: {
  applicant: Applicant
  onClose: () => void
  onUpdated: (a: Applicant) => void
  onDeleted: (id: string) => void
}) {
  const [memo, setMemo] = useState(applicant.adminMemo ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function patch(input: ApplicantInput) {
    setSaving(true)
    setError('')
    try {
      const updated = await applicantsApi.updateApplicant(applicant.id, input)
      onUpdated(updated)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '수정 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('이 지원자를 삭제하시겠습니까?')) return
    setSaving(true)
    setError('')
    try {
      await applicantsApi.deleteApplicant(applicant.id)
      onDeleted(applicant.id)
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '삭제 중 오류가 발생했습니다.')
      setSaving(false)
    }
  }

  const rows: [string, React.ReactNode][] = [
    ['ID', applicant.id],
    ['이름 (국/영)', `${applicant.nameKr ?? '-'} / ${applicant.nameEn ?? '-'}`],
    ['연락처', applicant.phone ?? '-'],
    ['이메일', applicant.email ?? '-'],
    ['출생년도', applicant.birthYear ?? '-'],
    ['성별', applicant.gender ?? '-'],
    ['국가', applicant.country ?? '-'],
    ['국적 유형', applicant.nationalityType ?? '-'],
    ['언어 능력', applicant.proficiency ?? '-'],
    ['의료 환경 경력', applicant.medicalEnvExp ?? '-'],
    ['개인정보 동의', applicant.agreePrivacy ? '동의' : '미동의'],
    ['등록일', formatDate(applicant.createdAt)],
    ['연결된 사용자 ID', applicant.linkedUserId ?? '-'],
  ]

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-base font-bold text-gray-900">지원자 상세</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div className="p-6 space-y-4 text-sm">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div>}

          <div>
            <p className="text-xs text-gray-500 mb-1.5">상태</p>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_ORDER.map((s) => (
                <button
                  key={s}
                  disabled={saving}
                  onClick={() => patch({ status: s })}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium border transition-colors disabled:opacity-50 ${
                    applicant.status === s ? STATUS_STYLES[s] : 'border-gray-200 text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {rows.map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-gray-900 mt-0.5 break-words">{value}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1.5">관리자 메모</p>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none"
            />
            <button
              disabled={saving}
              onClick={() => patch({ adminMemo: memo })}
              className="mt-1.5 text-xs text-blue-600 hover:underline disabled:opacity-50"
            >
              메모 저장
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <button
              disabled={saving}
              onClick={() => patch({ blocked: !applicant.blocked })}
              className={`text-xs px-3 py-1.5 rounded-lg border disabled:opacity-50 ${
                applicant.blocked ? 'border-green-200 text-green-700 hover:bg-green-50' : 'border-orange-200 text-orange-600 hover:bg-orange-50'
              }`}
            >
              {applicant.blocked ? '차단 해제' : '차단하기'}
            </button>
            <button disabled={saving} onClick={handleDelete} className="text-xs text-red-500 hover:underline disabled:opacity-50">
              지원자 삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function InterpretersPage() {
  const { data: applicants = [], error: loadError, isLoading: loading, mutate } = useSWR('admin/interpreters', () =>
    applicantsApi.listApplicants()
  )
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ApplicantStatus | ''>('')
  const [showCreate, setShowCreate] = useState(false)
  const [selected, setSelected] = useState<Applicant | null>(null)

  const error = loadError ? (loadError instanceof ApiError ? loadError.message : '지원자 목록을 불러오지 못했습니다.') : ''

  const stats = [
    { label: '전체 지원자', value: applicants.length },
    { label: '신규', value: applicants.filter((a) => a.status === 'new').length },
    { label: '인터뷰 요청', value: applicants.filter((a) => a.status === 'interview_requested').length },
    { label: '승인', value: applicants.filter((a) => a.status === 'approved').length },
  ]

  const filtered = useMemo(() => {
    return applicants.filter((a) => {
      const q = search.toLowerCase()
      const matchSearch =
        !search ||
        (a.nameKr ?? '').toLowerCase().includes(q) ||
        (a.nameEn ?? '').toLowerCase().includes(q) ||
        (a.email ?? '').toLowerCase().includes(q) ||
        (a.phone ?? '').includes(q)
      const matchStatus = !statusFilter || a.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [applicants, search, statusFilter])

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreated={(a) => mutate((prev) => [a, ...(prev ?? [])], { revalidate: false })}
        />
      )}
      {selected && (
        <DetailModal
          applicant={selected}
          onClose={() => setSelected(null)}
          onUpdated={(a) => {
            mutate((prev) => (prev ?? []).map((x) => (x.id === a.id ? a : x)), { revalidate: false })
            setSelected(a)
          }}
          onDeleted={(id) => mutate((prev) => (prev ?? []).filter((x) => x.id !== id), { revalidate: false })}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">지원자 관리</h1>
          <p className="text-sm text-gray-500 mt-0.5">통역사 지원자 등록 · 심사 · 상태 관리</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          + 지원자 등록
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
        <input type="text" placeholder="이름, 이메일, 연락처 검색..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ApplicantStatus | '')}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white">
          <option value="">전체 상태</option>
          {STATUS_ORDER.map((s) => (
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
                {['이름', '국가', '언어 능력', '연락처', '상태', '차단', '등록일', ''].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={8} className="py-10 text-center text-gray-400 text-sm">불러오는 중...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="py-10 text-center text-gray-400 text-sm">지원자가 없습니다.</td></tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap">
                      {a.nameKr || a.nameEn || a.id}
                      {a.nameKr && a.nameEn && <span className="text-xs text-gray-400 font-normal ml-1.5">{a.nameEn}</span>}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600">{a.country ?? '-'}</td>
                    <td className="py-3 px-4 text-xs text-gray-600">{a.proficiency ?? '-'}</td>
                    <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{a.phone ?? '-'}</td>
                    <td className="py-3 px-4"><StatusBadge status={a.status} /></td>
                    <td className="py-3 px-4">
                      {a.blocked ? <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full">차단됨</span> : <span className="text-xs text-gray-300">-</span>}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-400">{formatDate(a.createdAt)}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button onClick={() => setSelected(a)} className="text-xs text-blue-600 hover:underline">상세</button>
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
