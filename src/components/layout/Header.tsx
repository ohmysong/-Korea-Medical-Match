'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

const NAV_LINKS = [
  { href: '/#how', label: '이용 방법' },
  { href: '/#industries', label: '산업 분야' },
  { href: '/#pricing', label: '요금 안내' },
  { href: '/signup?role=interpreter', label: '통역사 등록' },
]

const PORTAL_LINKS = [
  { href: '/client', label: '의뢰사' },
  { href: '/interpreter', label: '통역사' },
  { href: '/admin', label: '운영자' },
]

/** 자체 사이드바를 가진 포털·인증 화면에서는 공용 헤더를 숨긴다 */
const HIDDEN_PREFIXES = ['/admin', '/client', '/interpreter', '/hospital', '/hotel', '/patient', '/agent']

export default function Header() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // trailingSlash: true → pathname may come back as "/login/"
  const current = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname

  if (HIDDEN_PREFIXES.some((p) => current === p || current.startsWith(p + '/')) || current === '/login' || current === '/signup') {
    return null
  }

  function isActive(href: string) {
    if (href.includes('#')) return false
    const [hrefPath, hrefQuery] = href.split('?')
    if (current !== hrefPath) return false
    const hrefParams = new URLSearchParams(hrefQuery ?? '')
    return [...hrefParams.entries()].every(([key, value]) => searchParams.get(key) === value)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center gap-8 lg:h-16">
          <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="OMNI 홈">
            <span aria-hidden className="grid h-7 w-7 place-items-center rounded-[5px] bg-ink">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="4.6" stroke="#fff" strokeWidth="2.2" />
              </svg>
            </span>
            <span className="text-[15px] font-semibold tracking-[-0.02em] text-ink">
              OMNI <span className="font-normal text-muted">옴니</span>
            </span>
          </Link>

          <nav className="hidden h-full items-stretch md:flex" aria-label="주요 메뉴">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative flex items-center px-3 text-[14px] font-medium transition-colors duration-150 ${
                    active ? 'text-ink' : 'text-muted hover:text-ink'
                  }`}
                >
                  {link.label}
                  <span
                    aria-hidden
                    className={`absolute inset-x-3 -bottom-px h-[2px] bg-ink transition-opacity duration-150 ${
                      active ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </Link>
              )
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <div className="mr-2 hidden items-center lg:flex" aria-label="포털 바로가기">
              <span className="mr-1.5 text-[12px] text-subtle">포털</span>
              {PORTAL_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-sm px-2 py-1 text-[12px] text-muted transition-colors duration-150 hover:bg-wash hover:text-ink"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <Link
              href="/login"
              className="inline-flex h-9 items-center rounded-md border border-line-strong px-3.5 text-[13px] font-medium text-ink transition-colors duration-150 hover:border-ink hover:bg-wash active:bg-line"
            >
              로그인
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile / tablet: primary nav + portals in one scrollable row */}
      <nav
        className="scroll-row -mb-px flex overflow-x-auto border-t border-line px-2 md:hidden"
        aria-label="주요 메뉴 (모바일)"
      >
        {NAV_LINKS.map((link) => {
          const active = isActive(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? 'page' : undefined}
              className={`relative shrink-0 px-3 py-3 text-[14px] font-medium ${active ? 'text-ink' : 'text-muted'}`}
            >
              {link.label}
              {active && <span aria-hidden className="absolute inset-x-3 bottom-0 h-[2px] bg-ink" />}
            </Link>
          )
        })}
        <span aria-hidden className="mx-2 my-3 w-px shrink-0 bg-line" />
        {PORTAL_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="shrink-0 px-2.5 py-3 text-[13px] text-subtle">
            {link.label}
          </Link>
        ))}
      </nav>
      {/* Tablet: portals row (nav already inline) */}
      <div className="scroll-row hidden overflow-x-auto border-t border-line px-6 md:flex lg:hidden" aria-label="포털 바로가기">
        <span className="mr-2 py-2 text-[12px] text-subtle">포털</span>
        {PORTAL_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="shrink-0 px-2 py-2 text-[12px] text-muted hover:text-ink">
            {link.label}
          </Link>
        ))}
      </div>
    </header>
  )
}
