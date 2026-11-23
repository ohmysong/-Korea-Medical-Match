import type { Metadata } from 'next'
import { Suspense } from 'react'
import './globals.css'
import Header from '@/components/layout/Header'
import { AuthProvider } from '@/lib/auth-context'

export const metadata: Metadata = {
  title: 'OMNI 옴니 — 일반·비즈니스 통역 매칭 플랫폼',
  description: '언어·업무·산업·일정 조건으로 검증된 통역사를 최대 3명 추천 · 투명한 수수료 · 예약부터 정산까지',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen bg-canvas text-ink antialiased">
        <AuthProvider>
          <Suspense fallback={<div className="h-16 border-b border-line bg-surface" />}>
            <Header />
          </Suspense>
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}
