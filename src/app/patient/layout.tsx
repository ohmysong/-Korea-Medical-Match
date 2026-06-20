'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { mockPatientProfile } from '@/lib/patient-mock-data'

const NAV_GROUPS: { label: string | null; items: { href: string; label: string; icon: string; exact?: boolean }[] }[] = [
  {
    label: null,
    items: [{ href: '/patient', label: '대시보드', icon: '⊞', exact: true }],
  },
  {
    label: '상담·제안',
    items: [
      { href: '/patient/consultation', label: '상담 신청', icon: '◎' },
      { href: '/patient/proposals', label: '병원 제안 확인', icon: '◉' },
    ],
  },
  {
    label: '일정·서비스',
    items: [
      { href: '/patient/schedule', label: '예약 일정 확인', icon: '◻' },
      { href: '/patient/vehicles', label: '차량 확인', icon: '▷' },
      { href: '/patient/interpreters', label: '통역 확인', icon: '◈' },
    ],
  },
  {
    label: '진료 결과',
    items: [
      { href: '/patient/results', label: '결과 확인', icon: '◇' },
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
          <div className="w-7 h-7 bg-teal-600 rounded-md flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs">P</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-900 leading-none">KMM Patient</p>
            <p className="text-xs text-gray-400 mt-0.5">환자 포털</p>
          </div>
        </Link>
        <div className="bg-teal-50 border border-teal-100 rounded-lg px-3 py-2">
          <p className="text-xs font-semibold text-gray-900 truncate">{mockPatientProfile.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs text-teal-600">{mockPatientProfile.nationality}</span>
            <span className="text-xs text-gray-300">·</span>
            <span className="text-xs text-gray-400 truncate">{mockPatientProfile.treatmentPurpose}</span>
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
                      ? 'bg-teal-50 text-teal-700 font-medium'
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
        <div className="px-2 py-2 rounded-lg bg-gray-50 mb-2">
          <p className="text-xs font-medium text-gray-700">담당 코디네이터</p>
          <p className="text-xs text-teal-700 font-medium mt-0.5">{mockPatientProfile.coordinatorName}</p>
          <p className="text-xs text-gray-400">{mockPatientProfile.coordinatorPhone}</p>
        </div>
        <Link
          href="/login"
          className="flex items-center gap-2 px-2 py-1.5 text-xs text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-50"
        >
          <span>↩</span>
          <span>로그아웃</span>
        </Link>
      </div>
    </aside>
  )
}

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
