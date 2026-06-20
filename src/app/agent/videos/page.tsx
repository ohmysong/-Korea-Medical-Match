'use client'

import { useMemo, useState } from 'react'
import { mockAgentVideos } from '@/lib/agent-mock-data'

export default function AgentVideosPage() {
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return mockAgentVideos.filter((v) => !search || v.title.toLowerCase().includes(q) || v.target.toLowerCase().includes(q))
  }, [search])

  return (
    <div className="max-w-5xl mx-auto px-6 py-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">영상 다운로드</h1>
        <p className="text-sm text-gray-500 mt-0.5">병원 시설·시술 안내 영상을 다운로드해 환자 마케팅에 활용하세요</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
        <input
          type="text"
          placeholder="영상 제목, 대상 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {filtered.map((v) => (
          <div key={v.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-br from-indigo-500 to-violet-600 h-32 flex items-center justify-center relative">
              <span className="text-3xl">▶</span>
              <span className="absolute bottom-2 right-2 text-xs bg-black/50 text-white px-1.5 py-0.5 rounded">{v.duration}</span>
            </div>
            <div className="p-4">
              <p className="text-xs text-gray-400">{v.target}</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">{v.title}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                {v.languages.map((l) => (
                  <span key={l} className="text-xs bg-gray-50 text-gray-500 border border-gray-100 px-1.5 py-0.5 rounded">{l}</span>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">{v.fileName} · {v.fileSize} · 업데이트 {v.updatedAt}</p>
              <button
                onClick={() => showToast(`'${v.fileName}' 다운로드를 시작합니다`)}
                className="w-full mt-3 bg-indigo-600 text-white text-sm py-2 rounded-lg hover:bg-indigo-700 font-medium"
              >
                다운로드
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-16">검색 조건에 맞는 영상이 없습니다</p>
      )}
    </div>
  )
}
