'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

const NAV_LINKS = [
  { href: '/hospitals', label: '병원 검색' },
  { href: '/hospitals?tab=checkup', label: '건강검진' },
  { href: '/hospitals?tab=procedure', label: '시술·성형' },
  { href: '/hospitals?specialty=%EC%9E%AC%EC%83%9D%EC%9D%98%ED%95%99', label: '재생의학' },
]

export default function Header() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (pathname.startsWith('/admin') || pathname === '/hospital' || pathname.startsWith('/hospital/') || pathname.startsWith('/hotel') || pathname.startsWith('/patient') || pathname.startsWith('/agent') || pathname === '/login' || pathname === '/signup') {
    return null
  }

  function isActive(href: string) {
    const [hrefPath, hrefQuery] = href.split('?')
    if (pathname !== hrefPath) return false
    const hrefParams = new URLSearchParams(hrefQuery ?? '')
    if ([...hrefParams.keys()].length === 0) {
      return !searchParams.get('tab') && !searchParams.get('specialty')
    }
    return [...hrefParams.entries()].every(([key, value]) => searchParams.get(key) === value)
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <div>
              <span className="font-bold text-gray-900 text-sm">Korea Medical Match</span>
              <span className="hidden sm:inline text-xs text-gray-400 ml-1">| 외국인 의료 매칭</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 text-sm rounded-md font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/patient"
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100"
            >
              환자
            </Link>
            <Link
              href="/hotel"
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100"
            >
              호텔
            </Link>
            <Link
              href="/hospital"
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100"
            >
              병원
            </Link>
            <Link
              href="/agent"
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100"
            >
              에이전트
            </Link>
            <Link
              href="/admin"
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100"
            >
              관리자
            </Link>
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-50"
            >
              로그인
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
