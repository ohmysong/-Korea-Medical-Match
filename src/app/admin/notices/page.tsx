'use client'

import { useMemo, useState } from 'react'
import useSWR from 'swr'
import * as noticesApi from '@/lib/api/notices'
import { ApiError } from '@/lib/api/client'
import type { Notice, NoticeInput } from '@/lib/api/types'

const TARGET_OPTIONS = ['all', 'hospital', 'interpreter', 'patient', 'agent']
const TARGET_LABELS: Record<string, string> = {
  all: '전체',
  hospital: '병원',
  interpreter: '통역사',
  patient: '환자',
  agent: '에이전트',
}

function targetLabel(target?: string | null) {
  if (!target) return '-'
  return TARGET_LABELS[target] ?? target
}

function formatDate(iso?: string | null) {
  if (!iso) return '-'
  try {
    return new Date(iso).toLocaleString('ko-KR')
  } catch {
    return iso
  }
}

const EMPTY_FORM: NoticeInput = { title: '', content: '', target: 'all', pinned: false, marker: '' }

function NoticeForm({
  initial,
  onCancel,
  onSubmit,
  submitLabel,
  saving,
  error,
}: {
  initial: NoticeInput
  onCancel: () => void
  onSubmit: (form: NoticeInput) => void
  submitLabel: string
  saving: boolean
  error: string
}) {
  const [form, setForm] = useState<NoticeInput>(initial)

  function set<K extends keyof NoticeInput>(field: K, value: NoticeInput[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(form)
      }}
      className="p-6 space-y-3"
    >
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div>}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">제목</label>
        <input required value={form.title ?? ''} onChange={(e) => set('title', e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">내용</label>
        <textarea required value={form.content ?? ''} onChange={(e) => set('content', e.target.value)} rows={6}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">대상</label>
          <select value={form.target ?? 'all'} onChange={(e) => set('target', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white">
            {TARGET_OPTIONS.map((t) => (
              <option key={t} value={t}>{TARGET_LABELS[t]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">마커 (선택)</label>
          <input value={form.marker ?? ''} onChange={(e) => set('marker', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
        </div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer pt-1">
        <input type="checkbox" checked={form.pinned ?? false} onChange={(e) => set('pinned', e.target.checked)} className="rounded" />
        <span className="text-sm text-gray-600">상단 고정</span>
      </label>
      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50">취소</button>
        <button type="submit" disabled={saving} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
          {saving ? '저장 중...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

function CreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: (n: Notice) => void }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(form: NoticeInput) {
    setSaving(true)
    setError('')
    try {
      const id = `notice-${Date.now()}`
      const created = await noticesApi.createNotice({ id, ...form })
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
          <h2 className="text-base font-bold text-gray-900">공지 작성</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <NoticeForm initial={EMPTY_FORM} onCancel={onClose} onSubmit={handleSubmit} submitLabel="등록" saving={saving} error={error} />
      </div>
    </div>
  )
}

function EditModal({ notice, onClose, onUpdated }: { notice: Notice; onClose: () => void; onUpdated: (n: Notice) => void }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [images, setImages] = useState(notice.images)
  const [newImageUrl, setNewImageUrl] = useState('')

  async function handleSubmit(form: NoticeInput) {
    setSaving(true)
    setError('')
    try {
      const updated = await noticesApi.updateNotice(notice.id, form)
      onUpdated({ ...updated, images })
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '수정 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  async function addImage() {
    if (!newImageUrl.trim()) return
    try {
      const img = await noticesApi.createNoticeImage(notice.id, { imageUrl: newImageUrl.trim(), sortOrder: images.length })
      setImages((prev) => [...prev, img])
      setNewImageUrl('')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '이미지 추가 중 오류가 발생했습니다.')
    }
  }

  async function removeImage(imageId: number) {
    try {
      await noticesApi.deleteNoticeImage(notice.id, imageId)
      setImages((prev) => prev.filter((i) => i.id !== imageId))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '이미지 삭제 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-base font-bold text-gray-900">공지 수정</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <NoticeForm
          initial={{ title: notice.title, content: notice.content, target: notice.target ?? 'all', pinned: notice.pinned ?? false, marker: notice.marker ?? '' }}
          onCancel={onClose}
          onSubmit={handleSubmit}
          submitLabel="저장"
          saving={saving}
          error={error}
        />
        <div className="px-6 pb-6 -mt-2 space-y-2">
          <p className="text-xs font-medium text-gray-600">첨부 이미지</p>
          {images.length > 0 && (
            <ul className="space-y-1.5">
              {images.map((img) => (
                <li key={img.id} className="flex items-center gap-2 text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
                  <span className="flex-1 truncate text-gray-600">{img.imageUrl}</span>
                  <button onClick={() => removeImage(img.id)} className="text-red-500 hover:underline flex-shrink-0">삭제</button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <input
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="이미지 URL"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-blue-400"
            />
            <button onClick={addImage} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs hover:bg-gray-200 font-medium">추가</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function NoticesPage() {
  const { data: notices = [], error: loadError, isLoading: loading, mutate } = useSWR('admin/notices', () => noticesApi.listNotices())
  const [search, setSearch] = useState('')
  const [targetFilter, setTargetFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<Notice | null>(null)

  const error = loadError ? (loadError instanceof ApiError ? loadError.message : '공지 목록을 불러오지 못했습니다.') : ''

  async function handleDelete(id: string) {
    if (!confirm('이 공지를 삭제하시겠습니까?')) return
    try {
      await noticesApi.deleteNotice(id)
      mutate((prev) => (prev ?? []).filter((n) => n.id !== id), { revalidate: false })
    } catch (err) {
      alert(err instanceof ApiError ? err.message : '삭제 중 오류가 발생했습니다.')
    }
  }

  async function togglePin(n: Notice) {
    try {
      const updated = await noticesApi.updateNotice(n.id, { pinned: !n.pinned })
      mutate((prev) => (prev ?? []).map((x) => (x.id === n.id ? { ...updated, images: x.images } : x)), { revalidate: false })
    } catch (err) {
      alert(err instanceof ApiError ? err.message : '수정 중 오류가 발생했습니다.')
    }
  }

  const stats = [
    { label: '전체 공지', value: notices.length },
    { label: '고정 공지', value: notices.filter((n) => n.pinned).length },
    { label: '이미지 포함', value: notices.filter((n) => n.images.length > 0).length },
    { label: '총 조회수', value: notices.reduce((sum, n) => sum + (n.viewCount ?? 0), 0).toLocaleString() },
  ]

  const targets = useMemo(() => [...new Set(notices.map((n) => n.target).filter((t): t is string => !!t))], [notices])

  const filtered = useMemo(() => {
    return notices.filter((n) => {
      const q = search.toLowerCase()
      const matchSearch = !search || (n.title ?? '').toLowerCase().includes(q) || (n.content ?? '').toLowerCase().includes(q)
      const matchTarget = !targetFilter || n.target === targetFilter
      return matchSearch && matchTarget
    })
  }, [notices, search, targetFilter])

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreated={(n) => mutate((prev) => [n, ...(prev ?? [])], { revalidate: false })}
        />
      )}
      {editing && (
        <EditModal
          notice={editing}
          onClose={() => setEditing(null)}
          onUpdated={(n) => mutate((prev) => (prev ?? []).map((x) => (x.id === n.id ? n : x)), { revalidate: false })}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">공지 관리</h1>
          <p className="text-sm text-gray-500 mt-0.5">시스템 공지사항 작성 · 게시 · 대상 관리</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          + 공지 작성
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
        <input type="text" placeholder="제목, 내용 검색..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
        <select value={targetFilter} onChange={(e) => setTargetFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white">
          <option value="">전체 대상</option>
          {targets.map((t) => (
            <option key={t} value={t}>{targetLabel(t)}</option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm text-gray-500">총 <span className="font-semibold text-gray-900">{filtered.length}</span>건</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {['제목', '대상', '고정', '등록일', '조회수', '이미지', ''].map((h) => (
                <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={7} className="py-10 text-center text-gray-400 text-sm">불러오는 중...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="py-10 text-center text-gray-400 text-sm">공지가 없습니다.</td></tr>
            ) : (
              filtered.map((n) => (
                <tr key={n.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className={`font-medium ${n.pinned ? 'text-blue-700' : 'text-gray-900'}`}>{n.title ?? '(제목 없음)'}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{targetLabel(n.target)}</span>
                  </td>
                  <td className="py-3 px-4">
                    {n.pinned
                      ? <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">고정</span>
                      : <span className="text-xs text-gray-300">-</span>}
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-400 whitespace-nowrap">{formatDate(n.createdAt)}</td>
                  <td className="py-3 px-4 text-xs text-gray-600">{(n.viewCount ?? 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-xs text-gray-500">{n.images.length}장</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2 whitespace-nowrap">
                      <button onClick={() => setEditing(n)} className="text-xs text-blue-600 hover:underline">수정</button>
                      <button onClick={() => togglePin(n)} className="text-xs text-gray-500 hover:underline">{n.pinned ? '고정 해제' : '고정'}</button>
                      <button onClick={() => handleDelete(n.id)} className="text-xs text-red-500 hover:underline">삭제</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
