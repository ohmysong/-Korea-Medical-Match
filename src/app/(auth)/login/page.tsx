'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { ApiError } from '@/lib/api/client'
import type { UserRole } from '@/lib/api/types'
import AuthShell, { FieldLabel, fieldCls } from '@/components/auth/AuthShell'

const ROLE_REDIRECT: Record<UserRole, string> = {
  admin: '/admin',
  hospital: '/client', // 백엔드 역할명 'hospital' = 의뢰사(기업)
  interpreter: '/interpreter',
}

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const user = await login(form.email, form.password)
      const dest = user.role ? ROLE_REDIRECT[user.role] : '/'
      router.push(dest ?? '/')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.status === 401
            ? '이메일 또는 비밀번호가 올바르지 않습니다.'
            : err.message
        )
      } else {
        setError('로그인 중 알 수 없는 오류가 발생했습니다.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="로그인"
      subtitle="OMNI 의뢰사·통역사·운영자 계정으로 계속하세요"
      footer={
        <div>
          <p className="text-[14px] text-muted">
            계정이 없으신가요?{' '}
            <Link href="/signup" className="font-semibold text-brand hover:text-brand-hover">
              회원가입
            </Link>
          </p>
        </div>
      }
    >
      {error && (
        <div role="alert" className="mb-5 flex gap-2.5 rounded-md border border-danger/25 bg-danger-soft px-3.5 py-3 text-[13px] text-danger">
          <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-px shrink-0">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M8 4.75v3.75M8 10.9v.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <FieldLabel htmlFor="login-email">이메일</FieldLabel>
          <input
            id="login-email"
            required
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="email@example.com"
            className={fieldCls()}
          />
        </div>

        <div>
          <FieldLabel htmlFor="login-password">비밀번호</FieldLabel>
          <input
            id="login-password"
            required
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => set('password', e.target.value)}
            placeholder="••••••••"
            className={fieldCls()}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-brand text-[15px] font-semibold text-white transition-colors duration-150 hover:bg-brand-hover active:bg-brand-press disabled:cursor-wait disabled:opacity-70"
        >
          {loading && <span aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </AuthShell>
  )
}
