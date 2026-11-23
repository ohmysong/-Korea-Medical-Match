'use client'

import PortalShell, { type PortalNavGroup } from '@/components/layout/PortalShell'
import { mockAgents } from '@/lib/admin-mock-data'

const mockCurrentAgent = mockAgents[0]

const NAV_GROUPS: PortalNavGroup[] = [
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

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell
      code="Agent"
      name="에이전트 포털"
      navGroups={NAV_GROUPS}
      context={
        <>
          <p className="truncate text-[13px] font-semibold text-ink">{mockCurrentAgent.company}</p>
          <p className="mt-0.5 truncate text-[12px] text-muted">
            {mockCurrentAgent.name} · {mockCurrentAgent.country}
          </p>
        </>
      }
      user={{ name: mockCurrentAgent.email, sub: mockCurrentAgent.phone, initial: '에' }}
    >
      {children}
    </PortalShell>
  )
}
