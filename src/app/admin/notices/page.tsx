'use client'

import { useState, useMemo } from 'react'
import { mockNotices, type NoticeType, type NoticeTarget } from '@/lib/admin-mock-data'

const TYPE_LABELS: Record<NoticeType, string> = { general: '일반', urgent: '긴급', maintenance: '점검' }
const TYPE_STYLES: Record<NoticeType, string> = {
  general: 'bg-gray-100 text-gray-600',
  urgent: 'bg-red-50 text-red-700 border border-red-200',
  maintenance: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
}
const TARGET_LABELS: Record<NoticeTarget, string> = { all: '전체', hospital: '병원', agent: '에이전트', patient: '환자' }

export default function NoticesPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<NoticeType | ''>('')
  const [publishedFilter, setPublishedFilter] = useState<'published' | 'draft' | ''>('')

  const stats = [
    { label: '전체 공지', value: mockNotices.length },
    { label: '게시 중', value: mockNotices.filter((n) => n.isPublished).length },
    { label: '임시저장', value: mockNotices.filter((n) => !n.isPublished).length },
    { label: '긴급 공지', value: mockNotices.filter((n) => n.type === 'urgent').length },
  ]

  const filtered = useMemo(() => {
    return mockNotices.filter((n) => {
      const q = search.toLowerCase()
      const matchSearch = !search || n.title.toLowerCase().includes(q) || n.author.includes(q)
      const matchType = !typeFilter || n.type === typeFilter
      const matchPublished = !publishedFilter || (publishedFilter === 'published' ? n.isPublished : !n.isPublished)
      return matchSearch && matchType && matchPublished
    })
  }, [search, typeFilter, publishedFilter])

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">공지 관리</h1>
          <p className="text-sm text-gray-500 mt-0.5">시스템 공지사항 작성 · 게시 · 대상 관리</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          + 공지 작성
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
        <input type="text" placeholder="제목, 작성자 검색..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as NoticeType | '')}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white">
          <option value="">전체 유형</option>
          {(['general', 'urgent', 'maintenance'] as NoticeType[]).map((t) => (
            <option key={t} value={t}>{TYPE_LABELS[t]}</option>
          ))}
        </select>
        <select value={publishedFilter} onChange={(e) => setPublishedFilter(e.target.value as 'published' | 'draft' | '')}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white">
          <option value="">전체</option>
          <option value="published">게시 중</option>
          <option value="draft">임시저장</option>
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm text-gray-500">총 <span className="font-semibold text-gray-900">{filtered.length}</span>건</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {['제목', '유형', '대상', '작성자', '등록일', '조회수', '게시 여부', ''].map((h) => (
                <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((n) => (
              <tr key={n.id} className="hover:bg-gray-50">
                <td className="py-3 px-4">
                  <p className={`font-medium ${n.type === 'urgent' ? 'text-red-700' : 'text-gray-900'}`}>{n.title}</p>
                </td>
                <td className="py-3 px-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_STYLES[n.type]}`}>
                    {TYPE_LABELS[n.type]}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    {TARGET_LABELS[n.target]}
                  </span>
                </td>
                <td className="py-3 px-4 text-xs text-gray-500">{n.author}</td>
                <td className="py-3 px-4 text-xs text-gray-400 whitespace-nowrap">{n.createdAt}</td>
                <td className="py-3 px-4 text-xs text-gray-600">{n.views.toLocaleString()}</td>
                <td className="py-3 px-4">
                  {n.isPublished
                    ? <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">게시 중</span>
                    : <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">임시저장</span>}
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2 whitespace-nowrap">
                    <button className="text-xs text-blue-600 hover:underline">수정</button>
                    {n.isPublished
                      ? <button className="text-xs text-orange-500 hover:underline">내리기</button>
                      : <button className="text-xs text-green-600 hover:underline">게시</button>}
                    <button className="text-xs text-red-500 hover:underline">삭제</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
