'use client'

import PortalShell, { type PortalNavGroup } from '@/components/layout/PortalShell'
import { mockHotelProfile } from '@/lib/hotel-mock-data'

const NAV_GROUPS: PortalNavGroup[] = [
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

export default function HotelLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell
      code="Hotel"
      name="호텔 파트너 포털"
      navGroups={NAV_GROUPS}
      context={
        <>
          <p className="truncate text-[13px] font-semibold text-ink">{mockHotelProfile.name}</p>
          <p className="mt-0.5 text-[12px] text-muted">
            <span className="text-accent" aria-label={`${mockHotelProfile.starRating}성급`}>{'★'.repeat(mockHotelProfile.starRating)}</span>
            {' '}· 객실 {mockHotelProfile.totalRooms}개
          </p>
        </>
      }
      user={{ name: mockHotelProfile.managerName, sub: mockHotelProfile.managerEmail, initial: '호' }}
    >
      {children}
    </PortalShell>
  )
}
