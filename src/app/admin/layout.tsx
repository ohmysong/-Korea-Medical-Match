'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_GROUPS: { label: string | null; items: { href: string; label: string; icon: string; exact?: boolean }[] }[] = [
  {
    label: null,
    items: [{ href: '/admin', label: '대시보드', icon: '⊞', exact: true }],
  },
  {
    label: '환자 · 리드',
    items: [
      { href: '/admin/patients', label: '전체 환자', icon: '◎' },
      { href: '/admin/crm', label: 'CRM 관리', icon: '◉' },
    ],
  },
  {
    label: '파트너',
    items: [
      { href: '/admin/hospitals', label: '병원 관리', icon: '✚' },
      { href: '/admin/agents', label: '에이전트 관리', icon: '◈' },
    ],
  },
  {
    label: '서비스',
    items: [
      { href: '/admin/interpreters', label: '통역사 관리', icon: '◎' },
      { href: '/admin/hotels', label: '호텔 관리', icon: '◻' },
      { href: '/admin/vehicles', label: '차량 관리', icon: '▷' },
    ],
  },
  {
    label: '재무 · 운영',
    items: [
      { href: '/admin/settlements', label: '정산 관리', icon: '◇' },
      { href: '/admin/reports', label: '리포트', icon: '▦' },
    ],
  },
  {
    label: '파트너 승인',
    items: [
      { href: '/admin/approvals', label: '승인 관리', icon: '✅' },
    ],
  },
  {
    label: 'AI 기능',
    items: [
      { href: '/admin/ai-matching', label: 'AI 매칭 엔진', icon: '✦' },
      { href: '/admin/ai-settings', label: '알고리즘 설정', icon: '⚙' },
    ],
  },
  {
    label: '시스템',
    items: [
      { href: '/admin/notices', label: '공지 관리', icon: '◆' },
      { href: '/admin/banners', label: '배너 관리', icon: '▣' },
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
      {/* Logo */}
      <div className="px-4 py-4 border-b border-gray-200">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs">M</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-900 leading-none">KMM Admin</p>
            <p className="text-xs text-gray-400 mt-0.5">운영자 포털</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
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
                      ? 'bg-blue-50 text-blue-700 font-medium'
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

      {/* User area */}
      <div className="px-3 py-3 border-t border-gray-200">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
          <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs text-gray-600 font-medium">관</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 truncate">관리자</p>
            <p className="text-xs text-gray-400 truncate">admin@mak.com</p>
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
