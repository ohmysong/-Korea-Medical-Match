'use client'

import { useRouter } from 'next/navigation'
import PortalShell, { type PortalNavGroup } from '@/components/layout/PortalShell'
import RequireRole from '@/components/auth/RequireRole'
import { useAuth } from '@/lib/auth-context'

const NAV_GROUPS: PortalNavGroup[] = [
  { label: null, items: [{ href: '/interpreter', label: '매칭 제안', exact: true }] },
  {
    label: '내 프로필',
    items: [
      { href: '/interpreter/profile', label: '프로필·요금표' },
      { href: '/interpreter/projects', label: '프로젝트 경력' },
      { href: '/interpreter/availability', label: '가능 일정' },
    ],
  },
]

function InterpreterShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, logout } = useAuth()
  return (
    <PortalShell
      code="Interpreter"
      name="통역사 포털"
      navGroups={NAV_GROUPS}
      context={
        <>
          <p className="truncate text-[13px] font-semibold text-ink">{user?.displayName ?? '통역사'}</p>
          <p className="mt-0.5 text-[12px] text-muted">플랫폼 수수료 0원</p>
        </>
      }
      user={{ name: user?.displayName ?? '통역사', sub: user?.email ?? '', initial: '통' }}
      onLogout={() => {
        logout()
        router.push('/login')
      }}
    >
      {children}
    </PortalShell>
  )
}

export default function InterpreterLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole role="interpreter">
      <InterpreterShell>{children}</InterpreterShell>
    </RequireRole>
  )
}
