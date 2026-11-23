'use client'

import PortalShell, { type PortalNavGroup } from '@/components/layout/PortalShell'
import { useRouter } from 'next/navigation'
import { mockHospitalProfile } from '@/lib/hospital-mock-data'
import RequireRole from '@/components/auth/RequireRole'
import { useAuth } from '@/lib/auth-context'

const TYPE_LABELS: Record<string, string> = {
  general: 'General Hospital',
  premium: 'Premium Hospital',
  checkup: 'Checkup Center',
  regenerative: 'Regenerative Medicine',
}

const NAV_GROUPS: PortalNavGroup[] = [
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

function HospitalShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, logout } = useAuth()

  function handleLogout() {
    logout()
    router.push('/login')
  }

  return (
    <PortalShell
      code="Hospital"
      name="병원 포털"
      navGroups={NAV_GROUPS}
      context={
        <>
          <p className="truncate text-[13px] font-semibold text-ink">{mockHospitalProfile.name}</p>
          <p className="mt-0.5 text-[12px] text-muted">{TYPE_LABELS[mockHospitalProfile.type]}</p>
        </>
      }
      user={{
        name: user?.displayName ?? mockHospitalProfile.internationalDeptContact,
        sub: user?.email ?? mockHospitalProfile.internationalDeptEmail,
        initial: '병',
      }}
      onLogout={handleLogout}
    >
      {children}
    </PortalShell>
  )
}

export default function HospitalLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole role="hospital">
      <HospitalShell>{children}</HospitalShell>
    </RequireRole>
  )
}
