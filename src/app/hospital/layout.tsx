'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { mockHospitalProfile } from '@/lib/hospital-mock-data'

const TYPE_LABELS: Record<string, string> = {
  general: 'General Hospital',
  premium: 'Premium Hospital',
  checkup: 'Checkup Center',
  regenerative: 'Regenerative Medicine',
}

const NAV_GROUPS: { label: string | null; items: { href: string; label: string; icon: string; exact?: boolean }[] }[] = [
  {
    label: null,
    items: [{ href: '/hospital', label: '대시보드', icon: '⊞', exact: true }],
  },
  {
    label: '환자 관리',
    items: [
      { href: '/hospital/inquiries', label: '환자 문의', icon: '◎' },
      { href: '/hospital/appointments', label: '예약 관리', icon: '◉' },
    ],
  },
  {
    label: '서비스 요청',
    items: [
      { href: '/hospital/requests', label: '통역 / 차량 요청', icon: '◈' },
    ],
  },
  {
    label: '결과 관리',
    items: [
      { href: '/hospital/results', label: '결과지 업로드', icon: '◻' },
    ],
  },
  {
    label: '병원 설정',
    items: [
      { href: '/hospital/profile', label: '병원 프로필', icon: '✚' },
      { href: '/hospital/pricing', label: '가격 관리', icon: '◇' },
      { href: '/hospital/settlements', label: '정산 확인', icon: '▦' },
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
      {/* Hospital header */}
      <div className="px-4 py-4 border-b border-gray-200">
        <Link href="/" className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 bg-green-600 rounded-md flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs">H</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-900 leading-none">KMM Hospital</p>
            <p className="text-xs text-gray-400 mt-0.5">병원 포털</p>
          </div>
        </Link>
        <div className="bg-green-50 border border-green-100 rounded-lg px-3 py-2">
          <p className="text-xs font-semibold text-gray-900 truncate">{mockHospitalProfile.name}</p>
          <p className="text-xs text-green-700 mt-0.5">{TYPE_LABELS[mockHospitalProfile.type]}</p>
        </div>
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
                      ? 'bg-green-50 text-green-700 font-medium'
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
          <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs text-green-700 font-medium">병</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 truncate">{mockHospitalProfile.internationalDeptContact}</p>
            <p className="text-xs text-gray-400 truncate">{mockHospitalProfile.internationalDeptEmail}</p>
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

export default function HospitalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
