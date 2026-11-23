'use client'

import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import PortalShell, { type PortalNavGroup } from '@/components/layout/PortalShell'
import RequireRole from '@/components/auth/RequireRole'
import { useAuth } from '@/lib/auth-context'
import * as companyApi from '@/lib/api/company'

// 의뢰사 포털. 백엔드 역할명은 아직 'hospital' 이지만 화면에서는 '의뢰사'로 부른다.
const NAV_GROUPS: PortalNavGroup[] = [
  { label: null, items: [{ href: '/client', label: '내 의뢰', exact: true }] },
  {
    label: '통역 의뢰',
    items: [{ href: '/client/requests/new', label: '새 의뢰 등록' }],
  },
  { label: '설정', items: [{ href: '/client/profile', label: '기업 프로필' }] },
]

function ClientShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, logout } = useAuth()
  const { data: company } = useSWR('company/profile', () => companyApi.getCompanyProfile(), { shouldRetryOnError: false })

  return (
    <PortalShell
      code="Client"
      name="의뢰사 포털"
      navGroups={NAV_GROUPS}
      context={
        <>
          <p className="truncate text-[13px] font-semibold text-ink">{company?.companyName || user?.displayName || '기업 정보 미등록'}</p>
          <p className="mt-0.5 text-[12px] text-muted">일반·비즈니스 통역 의뢰</p>
        </>
      }
      user={{ name: user?.displayName ?? '담당자', sub: user?.email ?? '', initial: '의' }}
      onLogout={() => {
        logout()
        router.push('/login')
      }}
    >
      {children}
    </PortalShell>
  )
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole role="hospital">
      <ClientShell>{children}</ClientShell>
    </RequireRole>
  )
}
