'use client'

import PortalShell, { type PortalNavGroup } from '@/components/layout/PortalShell'
import { mockPatientProfile } from '@/lib/patient-mock-data'

const NAV_GROUPS: PortalNavGroup[] = [
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

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell
      code="Patient"
      name="환자 포털"
      navGroups={NAV_GROUPS}
      context={
        <>
          <p className="truncate text-[13px] font-semibold text-ink">{mockPatientProfile.name}</p>
          <p className="mt-0.5 truncate text-[12px] text-muted">
            {mockPatientProfile.nationality} · {mockPatientProfile.treatmentPurpose}
          </p>
        </>
      }
      footerExtra={
        <>
          <p className="text-[11px] font-semibold text-subtle">담당 코디네이터</p>
          <p className="mt-1 text-[13px] font-medium text-ink">{mockPatientProfile.coordinatorName}</p>
          <p className="tabular text-[12px] text-muted">{mockPatientProfile.coordinatorPhone}</p>
        </>
      }
    >
      {children}
    </PortalShell>
  )
}
