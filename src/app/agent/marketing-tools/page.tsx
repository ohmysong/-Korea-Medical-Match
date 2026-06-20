'use client'

import { useState } from 'react'
import {
  mockShareableLinks, mockLandingPages, mockBanners, mockBrochures,
  type ShareableLink, type AgentLandingPage,
} from '@/lib/agent-mock-data'

const TABS = [
  { id: 'links', label: '공유 링크' },
  { id: 'landing', label: '랜딩페이지' },
  { id: 'banners', label: '배너' },
] as const
type TabId = (typeof TABS)[number]['id']

const TODAY = '2026-06-20'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
        copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {copied ? '복사됨 ✓' : '링크 복사'}
    </button>
  )
}

function NewLinkForm({ onCreate }: { onCreate: (link: ShareableLink) => void }) {
  const [target, setTarget] = useState(mockBrochures[0].target)

  function handleCreate() {
    const slug = target.toLowerCase().replace(/[^a-z0-9가-힣]+/g, '-')
    onCreate({
      id: `sl-${Date.now()}`,
      title: `${target} 소개 자료`,
      target,
      url: `kmm.co.kr/s/zhangwei/${slug}-${Date.now().toString().slice(-4)}`,
      clicks: 0,
      createdAt: TODAY,
    })
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex items-end gap-3">
      <div className="flex-1">
        <label className="block text-xs font-medium text-gray-700 mb-1">공유할 자료 선택</label>
        <select value={target} onChange={(e) => setTarget(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white">
          {Array.from(new Set(mockBrochures.map((b) => b.target))).map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <button onClick={handleCreate} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
        + 링크 생성
      </button>
    </div>
  )
}

function NewLandingForm({ onCreate }: { onCreate: (lp: AgentLandingPage) => void }) {
  const [name, setName] = useState('')

  function handleCreate() {
    if (!name.trim()) return
    const slug = `zhangwei-${name.toLowerCase().replace(/[^a-z0-9가-힣]+/g, '-')}`.slice(0, 40)
    onCreate({
      id: `lp-${Date.now()}`, name, slug, visits: 0, leads: 0, isActive: true, createdAt: TODAY,
    })
    setName('')
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex items-end gap-3">
      <div className="flex-1">
        <label className="block text-xs font-medium text-gray-700 mb-1">랜딩페이지 이름</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)}
          placeholder="예: 여름 건강검진 프로모션"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400" />
      </div>
      <button onClick={handleCreate} disabled={!name.trim()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-40">
        + 새 랜딩페이지
      </button>
    </div>
  )
}

export default function AgentMarketingToolsPage() {
  const [tab, setTab] = useState<TabId>('links')
  const [links, setLinks] = useState(mockShareableLinks)
  const [landingPages, setLandingPages] = useState(mockLandingPages)
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  function toggleLandingActive(id: string) {
    setLandingPages((prev) => prev.map((lp) => lp.id === id ? { ...lp, isActive: !lp.isActive } : lp))
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-6">
      {toast && <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg">{toast}</div>}

      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">마케팅 도구</h1>
        <p className="text-sm text-gray-500 mt-0.5">공유 링크·랜딩페이지·배너로 환자 유치 채널을 관리하세요</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="border-b border-gray-100 flex">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-6 py-3.5 text-sm font-medium transition-colors border-b-2 ${
                tab === t.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === 'links' && (
            <div>
              <NewLinkForm onCreate={(l) => { setLinks((prev) => [l, ...prev]); showToast('공유 링크가 생성되었습니다.') }} />
              <div className="space-y-2">
                {links.map((l) => (
                  <div key={l.id} className="border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900">{l.title}</p>
                      <p className="text-xs text-indigo-600 truncate">{l.url}</p>
                      <p className="text-xs text-gray-400 mt-0.5">클릭 {l.clicks}회 · 생성일 {l.createdAt}</p>
                    </div>
                    <CopyButton text={`https://${l.url}`} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'landing' && (
            <div>
              <NewLandingForm onCreate={(lp) => { setLandingPages((prev) => [lp, ...prev]); showToast('랜딩페이지가 생성되었습니다.') }} />
              <div className="space-y-2">
                {landingPages.map((lp) => (
                  <div key={lp.id} className="border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-gray-900">{lp.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${lp.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                          {lp.isActive ? '운영 중' : '비활성'}
                        </span>
                      </div>
                      <p className="text-xs text-indigo-600 truncate">kmm.co.kr/lp/{lp.slug}</p>
                      <p className="text-xs text-gray-400 mt-0.5">방문 {lp.visits.toLocaleString()}회 · 리드 전환 {lp.leads}건 · 생성일 {lp.createdAt}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <CopyButton text={`https://kmm.co.kr/lp/${lp.slug}`} />
                      <button onClick={() => toggleLandingActive(lp.id)}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium bg-gray-100 text-gray-600 hover:bg-gray-200">
                        {lp.isActive ? '비활성화' : '활성화'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'banners' && (
            <div className="grid grid-cols-3 gap-4">
              {mockBanners.map((b) => (
                <div key={b.id} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gradient-to-br from-indigo-100 to-violet-100 h-28 flex items-center justify-center">
                    <span className="text-xs text-indigo-400 font-medium">{b.size}</span>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-gray-900 truncate">{b.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{b.format} · {b.fileSize}</p>
                    <button
                      onClick={() => showToast(`'${b.fileName}' 다운로드를 시작합니다`)}
                      className="w-full mt-2.5 bg-indigo-600 text-white text-xs py-1.5 rounded-lg hover:bg-indigo-700 font-medium"
                    >
                      다운로드
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
