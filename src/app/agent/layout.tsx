'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { mockAgents } from '@/lib/admin-mock-data'

const mockCurrentAgent = mockAgents[0]

const NAV_GROUPS: { label: string | null; items: { href: string; label: string; icon: string; exact?: boolean }[] }[] = [
  {
    label: null,
    items: [{ href: '/agent', label: '대시보드', icon: '⊞', exact: true }],
  },
  {
    label: '환자 관리',
    items: [
      { href: '/agent/leads', label: 'My Leads', icon: '🧑' },
      { href: '/agent/patients', label: '환자 관리', icon: '📋' },
    ],
  },
  {
    label: '병원 매칭',
    items: [
      { href: '/agent/matching', label: '병원 매칭', icon: '🏥' },
    ],
  },
  {
    label: '자료실',
    items: [
      { href: '/agent/products', label: '의료상품 조회', icon: '💊' },
      { href: '/agent/brochures', label: '브로셔 다운로드', icon: '📄' },
      { href: '/agent/videos', label: '영상 다운로드', icon: '🎬' },
    ],
  },
  {
    label: '마케팅',
    items: [
      { href: '/agent/marketing', label: 'AI 마케팅 에이전트', icon: '✦' },
      { href: '/agent/marketing-tools', label: '마케팅 도구', icon: '🔗' },
    ],
  },
  {
    label: '실적',
    items: [
      { href: '/agent/commissions', label: '수수료 확인', icon: '💰' },
      { href: '/agent/reports', label: '리포트·분석', icon: '📊' },
    ],
  },
]

function Sidebar() {
  const pathname = usePathname()

  function isActive(href: string, exact = false) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-56 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-screen overflow-y-auto">
      <div className="px-4 py-4 border-b border-gray-200">
        <Link href="/" className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs">A</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-900 leading-none">KMM Agent</p>
            <p className="text-xs text-gray-400 mt-0.5">에이전트 포털</p>
          </div>
        </Link>
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
          <p className="text-xs font-semibold text-gray-900 truncate">{mockCurrentAgent.company}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs text-indigo-600">{mockCurrentAgent.name}</span>
            <span className="text-xs text-gray-300">·</span>
            <span className="text-xs text-gray-400 truncate">{mockCurrentAgent.country}</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-4">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi}>
            {group.label && (
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-2 mb-1">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm transition-colors ${
                    isActive(item.href, item.exact)
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="text-base w-5 text-center leading-none">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-gray-200">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
          <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs text-indigo-700 font-medium">에</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 truncate">{mockCurrentAgent.email}</p>
            <p className="text-xs text-gray-400 truncate">{mockCurrentAgent.phone}</p>
          </div>
        </div>
        <Link
          href="/login"
          className="flex items-center gap-2 px-2 py-1.5 text-xs text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-50 mt-1"
        >
          <span>↩</span>
          <span>로그아웃</span>
        </Link>
      </div>
    </aside>
  )
}

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
