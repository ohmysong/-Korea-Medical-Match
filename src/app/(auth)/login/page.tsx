'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    // Backend: POST /api/auth/login  body: { email, password }
    await new Promise((r) => setTimeout(r, 800))
    if (form.email === 'admin@mak.com') {
      router.push('/admin')
    } else {
      router.push('/')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          {/* Logo */}
          <div className="text-center mb-7">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Korea Medical Match</h1>
            <p className="text-sm text-gray-500 mt-1">계정에 로그인하세요</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="email@example.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-gray-700">비밀번호</label>
                <button type="button" className="text-xs text-blue-600 hover:underline">
                  비밀번호 찾기
                </button>
              </div>
              <input
                required
                type="password"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.remember}
                onChange={(e) => set('remember', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-600">로그인 상태 유지</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 text-center">
            <p className="text-sm text-gray-500">
              계정이 없으신가요?{' '}
              <Link href="/signup" className="text-blue-600 hover:underline font-medium">
                회원가입
              </Link>
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="flex-1 h-px bg-gray-200"></span>
              <span>또는</span>
              <span className="flex-1 h-px bg-gray-200"></span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {[
                { label: '환자 포털 →', href: '/patient' },
                { label: '호텔 포털 →', href: '/hotel' },
                { label: '병원 포털 →', href: '/hospital' },
                { label: '관리자 포털 →', href: '/admin' },
              ].map((p) => (
                <button
                  key={p.href}
                  type="button"
                  onClick={async () => {
                    setLoading(true)
                    await new Promise((r) => setTimeout(r, 400))
                    router.push(p.href)
                  }}
                  className="text-sm border border-gray-200 text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center mt-4">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
            ← 홈으로 돌아가기
          </Link>
        </p>
      </div>
    </div>
  )
}
