import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Geist } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Korea Medical Match — 외국인 환자 의료 매칭 플랫폼',
  description: '한국 120개 이상 병원 검색 · 질환·시술·수술 비교 · 전문 코디네이터 상담',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={geist.className}>
      <body className="min-h-screen bg-gray-50 antialiased">
        <Suspense fallback={<div className="h-16 border-b border-gray-200 bg-white" />}>
          <Header />
        </Suspense>
        <main>{children}</main>
      </body>
    </html>
  )
}
