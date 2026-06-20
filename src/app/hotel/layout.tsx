'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { mockHotelProfile } from '@/lib/hotel-mock-data'

const NAV_GROUPS: { label: string | null; items: { href: string; label: string; icon: string; exact?: boolean }[] }[] = [
  {
    label: null,
    items: [{ href: '/hotel', label: '대시보드', icon: '⊞', exact: true }],
  },
  {
    label: '고객 관리',
    items: [
      { href: '/hotel/guests', label: '고객 등록', icon: '◎' },
      { href: '/hotel/reservations', label: '예약 현황', icon: '◉' },
    ],
  },
  {
    label: '진료 연계',
    items: [
      { href: '/hotel/checkup', label: '검진 신청', icon: '✚' },
      { href: '/hotel/schedule', label: '일정 확인', icon: '◻' },
    ],
  },
  {
    label: '서비스 현황',
    items: [
      { href: '/hotel/vehicles', label: '차량 현황', icon: '▷' },
      { href: '/hotel/interpreters', label: '통역 현황', icon: '◈' },
    ],
  },
  {
    label: '재무',
    items: [
      { href: '/hotel/settlements', label: '정산 확인', icon: '◇' },
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
          <div className="w-7 h-7 bg-amber-500 rounded-md flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs">H</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-900 leading-none">KMM Hotel</p>
            <p className="text-xs text-gray-400 mt-0.5">호텔 파트너 포털</p>
          </div>
        </Link>
        <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          <p className="text-xs font-semibold text-gray-900 truncate">{mockHotelProfile.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs text-amber-600">{'★'.repeat(mockHotelProfile.starRating)}</span>
            <span className="text-xs text-gray-400">객실 {mockHotelProfile.totalRooms}개</span>
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
                      ? 'bg-amber-50 text-amber-700 font-medium'
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
          <div className="w-7 h-7 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs text-amber-700 font-medium">호</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 truncate">{mockHotelProfile.managerName}</p>
            <p className="text-xs text-gray-400 truncate">{mockHotelProfile.managerEmail}</p>
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

export default function HotelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
