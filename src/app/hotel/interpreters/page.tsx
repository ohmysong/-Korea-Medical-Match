'use client'

import { useState, useMemo } from 'react'
import { mockInterpreterAssignments, type InterpreterAssignment, type InterpreterAssignmentStatus } from '@/lib/hotel-mock-data'

const STATUS_LABELS: Record<InterpreterAssignmentStatus, string> = {
  scheduled: '예정',
  active: '진행 중',
  completed: '완료',
  cancelled: '취소',
}
const STATUS_STYLES: Record<InterpreterAssignmentStatus, string> = {
  scheduled: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  active: 'bg-blue-50 text-blue-700',
  completed: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-50 text-red-400',
}
const LANGUAGE_STYLES: Record<string, string> = {
  '중국어': 'bg-red-50 text-red-700',
  '러시아어': 'bg-blue-50 text-blue-700',
  '일본어': 'bg-pink-50 text-pink-700',
  '영어': 'bg-green-50 text-green-700',
  '아랍어': 'bg-orange-50 text-orange-700',
}

function DetailModal({ item, onClose, onUpdateStatus }: {
  item: InterpreterAssignment
  onClose: () => void
  onUpdateStatus: (id: string, status: InterpreterAssignmentStatus) => void
}) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-gray-900">통역 배정 상세</h2>
            <p className="text-xs text-gray-400 mt-0.5">{item.id}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-400">고객</p>
              <p className="font-medium">{item.guestName} ({item.nationality})</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">날짜·시간</p>
              <p className="font-medium">{item.date} {item.time}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">통역 언어</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LANGUAGE_STYLES[item.language] ?? 'bg-gray-100 text-gray-700'}`}>
                {item.language}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-400">통역사</p>
              <p className="font-medium">{item.interpreterName}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-400">장소</p>
              <p className="font-medium">{item.location}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-400">통역 목적</p>
              <p className="font-medium">{item.purpose}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">현재 상태</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[item.status]}`}>
                {STATUS_LABELS[item.status]}
              </span>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            {item.status === 'scheduled' && (
              <button onClick={() => { onUpdateStatus(item.id, 'active'); onClose() }}
                className="flex-1 bg-blue-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-600">
                통역 시작
              </button>
            )}
            {item.status === 'active' && (
              <button onClick={() => { onUpdateStatus(item.id, 'completed'); onClose() }}
                className="flex-1 bg-amber-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-amber-600">
                통역 완료
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

export default function InterpretersPage() {
  const [items, setItems] = useState(mockInterpreterAssignments)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<InterpreterAssignmentStatus | ''>('')
  const [langFilter, setLangFilter] = useState('')
  const [selected, setSelected] = useState<InterpreterAssignment | null>(null)
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  function handleUpdateStatus(id: string, status: InterpreterAssignmentStatus) {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, status } : i))
    showToast(status === 'active' ? '통역이 시작되었습니다.' : '통역이 완료되었습니다.')
  }

  const languages = useMemo(() => Array.from(new Set(items.map((i) => i.language))), [items])

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const q = search.toLowerCase()
      const matchSearch = !search || i.guestName.toLowerCase().includes(q) || i.interpreterName.toLowerCase().includes(q) || i.location.toLowerCase().includes(q) || i.purpose.toLowerCase().includes(q)
      const matchStatus = !statusFilter || i.status === statusFilter
      const matchLang = !langFilter || i.language === langFilter
      return matchSearch && matchStatus && matchLang
    }).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
  }, [items, search, statusFilter, langFilter])

  const stats = [
    { label: '전체 배정', value: items.length },
    { label: '예정', value: items.filter((i) => i.status === 'scheduled').length },
    { label: '진행 중', value: items.filter((i) => i.status === 'active').length },
    { label: '완료', value: items.filter((i) => i.status === 'completed').length },
  ]

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {toast && <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg">{toast}</div>}
      {selected && (
        <DetailModal
          item={selected}
          onClose={() => setSelected(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">통역 현황</h1>
        <p className="text-sm text-gray-500 mt-0.5">투숙 고객 통역 배정 현황 및 진행 상태 관리</p>
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
        <input type="text" placeholder="고객명, 통역사, 장소, 목적 검색..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400" />
        <select value={langFilter} onChange={(e) => setLangFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white">
          <option value="">전체 언어</option>
          {languages.map((l) => <option key={l}>{l}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as InterpreterAssignmentStatus | '')}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white">
          <option value="">전체 상태</option>
          {(['scheduled', 'active', 'completed', 'cancelled'] as InterpreterAssignmentStatus[]).map((s) => (
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
                {['날짜·시간', '고객명', '국적', '언어', '통역사', '장소', '통역 목적', '상태', ''].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((i) => (
                <tr key={i.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelected(i)}>
                  <td className="py-3 px-4 text-xs text-gray-600 whitespace-nowrap font-mono">{i.date}<br />{i.time}</td>
                  <td className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap">{i.guestName}</td>
                  <td className="py-3 px-4 text-xs text-gray-500">{i.nationality}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LANGUAGE_STYLES[i.language] ?? 'bg-gray-100 text-gray-700'}`}>
                      {i.language}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-600 whitespace-nowrap">{i.interpreterName}</td>
                  <td className="py-3 px-4 text-xs text-gray-600 max-w-[160px] truncate">{i.location}</td>
                  <td className="py-3 px-4 text-xs text-gray-600 max-w-[160px] truncate">{i.purpose}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[i.status]}`}>
                      {STATUS_LABELS[i.status]}
                    </span>
                  </td>
                  <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <div className="whitespace-nowrap">
                      {i.status === 'scheduled' && (
                        <button onClick={() => handleUpdateStatus(i.id, 'active')}
                          className="text-xs bg-blue-500 text-white px-2.5 py-1 rounded hover:bg-blue-600">
                          시작
                        </button>
                      )}
                      {i.status === 'active' && (
                        <button onClick={() => handleUpdateStatus(i.id, 'completed')}
                          className="text-xs bg-amber-500 text-white px-2.5 py-1 rounded hover:bg-amber-600">
                          완료
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
