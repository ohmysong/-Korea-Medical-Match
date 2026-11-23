'use client'

import PortalShell, { type PortalNavGroup } from '@/components/layout/PortalShell'
import { useRouter } from 'next/navigation'
import RequireRole from '@/components/auth/RequireRole'
import { useAuth } from '@/lib/auth-context'

const NAV_GROUPS: PortalNavGroup[] = [
  {
    label: null,
    items: [{ href: '/admin', label: '대시보드', icon: '⊞', exact: true }],
  },
  {
    label: '매칭',
    items: [{ href: '/admin/matching', label: '의뢰 매칭', icon: '✦' }],
  },
  {
    label: '통역사',
    items: [{ href: '/admin/interpreters', label: '통역사 지원자 관리', icon: '◎' }],
  },
  {
    label: '시스템',
    items: [{ href: '/admin/notices', label: '공지 관리', icon: '◆' }],
  },
]

function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, logout } = useAuth()

  function handleLogout() {
    logout()
    router.push('/login')
  }

  return (
    <PortalShell
      code="Admin"
      name="운영자 포털"
      navGroups={NAV_GROUPS}
      user={{ name: user?.displayName ?? '관리자', sub: user?.email ?? '', initial: '관' }}
      onLogout={handleLogout}
    >
      {children}
    </PortalShell>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole role="admin">
      <AdminShell>{children}</AdminShell>
    </RequireRole>
  )
}
