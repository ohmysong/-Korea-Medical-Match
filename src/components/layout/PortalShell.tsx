'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export type PortalNavItem = { href: string; label: string; icon?: string; exact?: boolean }
export type PortalNavGroup = { label: string | null; items: PortalNavItem[] }

type Props = {
  /** e.g. "Admin" — shown next to the OMNI mark */
  code: string
  /** e.g. "운영자 포털" */
  name: string
  navGroups: PortalNavGroup[]
  /** Account / organisation context shown under the logo */
  context?: React.ReactNode
  /** Extra block above the user row (e.g. coordinator contact) */
  footerExtra?: React.ReactNode
  user?: { name: string; sub?: string; initial?: string }
  /** Either a handler (auth logout) or a plain link target */
  onLogout?: () => void
  logoutHref?: string
  children: React.ReactNode
}

function Mark() {
  return (
    <span aria-hidden className="grid h-7 w-7 shrink-0 place-items-center rounded-[5px] bg-ink">
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="4.6" stroke="#fff" strokeWidth="2.2" />
      </svg>
    </span>
  )
}

export default function PortalShell({
  code,
  name,
  navGroups,
  context,
  footerExtra,
  user,
  onLogout,
  logoutHref = '/login',
  children,
}: Props) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // trailingSlash: true → normalise "/admin/patients/" to "/admin/patients"
  const current = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname

  function isActive(href: string, exact = false) {
    if (exact) return current === href
    return current === href || current.startsWith(href + '/')
  }

  const activeLabel =
    navGroups.flatMap((g) => g.items).find((i) => isActive(i.href, i.exact))?.label ?? name

  const logoutCls =
    'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-[13px] text-muted transition-colors duration-150 hover:bg-wash hover:text-ink'

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-b border-line px-4 pb-4 pt-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Mark />
          <span className="min-w-0 leading-tight">
            <span className="block text-[13px] font-semibold tracking-[-0.01em] text-ink">OMNI {code}</span>
            <span className="block text-[12px] text-subtle">{name}</span>
          </span>
        </Link>
        {context && <div className="mt-4 border-l-2 border-ink pl-3">{context}</div>}
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4" aria-label={`${name} 메뉴`}>
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {group.label && (
              <p className="mb-1.5 px-2 text-[11px] font-semibold tracking-[0.02em] text-subtle">{group.label}</p>
            )}
            <ul className="space-y-px">
              {group.items.map((item) => {
                const active = isActive(item.href, item.exact)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      className={`relative flex items-center rounded-sm px-2 py-[7px] text-[14px] transition-colors duration-150 ${
                        active
                          ? 'bg-brand-soft font-semibold text-brand'
                          : 'text-ink-2 hover:bg-wash hover:text-ink'
                      }`}
                    >
                      {active && <span aria-hidden className="absolute -left-3 top-1.5 bottom-1.5 w-[2px] bg-brand" />}
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-line px-3 py-3">
        {footerExtra && <div className="mb-2 px-2 py-1">{footerExtra}</div>}
        {user && (
          <div className="flex items-center gap-2.5 px-2 py-2">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-wash text-[12px] font-semibold text-ink-2">
              {user.initial ?? user.name.slice(0, 1)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium text-ink">{user.name}</span>
              {user.sub && <span className="block truncate text-[12px] text-subtle">{user.sub}</span>}
            </span>
          </div>
        )}
        {onLogout ? (
          <button type="button" onClick={onLogout} className={logoutCls}>
            로그아웃
          </button>
        ) : (
          <Link href={logoutHref} className={logoutCls}>
            로그아웃
          </Link>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-canvas lg:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-line bg-surface lg:block">{sidebar}</aside>

      {/* Mobile top bar */}
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-surface px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="메뉴 열기"
          aria-expanded={open}
          className="-ml-2 grid h-10 w-10 place-items-center rounded-md text-ink hover:bg-wash"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <path d="M2.5 5h13M2.5 9h13M2.5 13h13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
        <span className="min-w-0 truncate text-[15px] font-semibold text-ink">{activeLabel}</span>
        <span className="ml-auto shrink-0 text-[12px] text-subtle">OMNI {code}</span>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label={`${name} 메뉴`}>
          <button
            type="button"
            aria-label="메뉴 닫기"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/30"
          />
          <aside className="absolute inset-y-0 left-0 w-[17rem] max-w-[85vw] bg-surface shadow-raise">{sidebar}</aside>
        </div>
      )}

      <div className="min-w-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  )
}
