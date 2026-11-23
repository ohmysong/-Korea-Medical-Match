'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ApiError } from '@/lib/api/client'
import { submitPublicApplication } from '@/lib/api/applicants'
import AuthShell, { FieldError, FieldLabel, fieldCls } from '@/components/auth/AuthShell'

type Role = 'client' | 'interpreter'

const ROLES: { id: Role; label: string; desc: string }[] = [
  { id: 'client', label: '의뢰사 (기업·기관)', desc: '통역 의뢰 등록 · 추천 통역사 선택 · 결제' },
  { id: 'interpreter', label: '통역사', desc: '프로필·요금표 등록 · 매칭 제안 수락 · 플랫폼 수수료 0원' },
]

export default function SignupPage() {
  const [step, setStep] = useState<1 | 2>(1)
  const [role, setRole] = useState<Role>('client')
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    country: '',
    agreeTerms: false,
    agreePrivacy: false,
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [done, setDone] = useState('')
  const [submitError, setSubmitError] = useState('')

  function set(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name) e.name = '이름을 입력해주세요'
    if (!form.email) e.email = '이메일을 입력해주세요'
    if (role === 'client' && !form.organization) e.organization = '회사·기관명을 입력해주세요'
    if (!form.agreeTerms) e.agreeTerms = '이용약관에 동의해주세요'
    if (!form.agreePrivacy) e.agreePrivacy = '개인정보처리방침에 동의해주세요'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitError('')
    if (role === 'client') {
      // 기업 셀프 가입 API 가 아직 없다. 계정은 운영자가 발급한다(Admin → 기업 승인).
      setDone('기업 계정은 현재 운영자가 승인 후 발급합니다. 담당자가 입력하신 연락처로 안내드립니다.')
      return
    }
    setLoading(true)
    try {
      await submitPublicApplication({
        nameKr: form.name,
        email: form.email,
        phone: form.phone || null,
        country: form.country || null,
        agreePrivacy: form.agreePrivacy,
        payload: { source: 'omni-signup', role: 'interpreter' },
      })
      setDone('통역사 지원서가 접수되었습니다. 운영자 검토·승인 후 로그인 계정이 발급되며, 이후 프로필·요금표·경력을 등록할 수 있습니다.')
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : '지원서를 제출하지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const selectedRole = ROLES.find((r) => r.id === role)!

  return (
    <AuthShell
      title="회원가입"
      subtitle={step === 1 ? '어떤 목적으로 이용하시나요?' : `${selectedRole.label} 정보를 입력해주세요`}
      footer={
        <p className="text-[14px] text-muted">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="font-semibold text-brand hover:text-brand-hover">
            로그인
          </Link>
        </p>
      }
    >
      {/* Step indicator */}
      <ol className="mb-7 grid grid-cols-2 gap-2" aria-label="가입 단계">
        {[1, 2].map((s) => {
          const reached = step >= s
          return (
            <li key={s} aria-current={step === s ? 'step' : undefined}>
              <span className={`block h-[3px] rounded-full transition-colors duration-200 ${reached ? 'bg-brand' : 'bg-line'}`} />
              <span className={`mt-2 block text-[12px] font-medium ${reached ? 'text-ink' : 'text-subtle'}`}>
                {s}. {s === 1 ? '역할 선택' : '정보 입력'}
              </span>
            </li>
          )
        })}
      </ol>

      {done ? (
        <div role="status" className="rounded-md border border-success/25 bg-success-soft px-4 py-4 text-[14px] leading-relaxed text-success">
          {done}
          <div className="mt-4">
            <Link href="/login" className="font-semibold text-brand hover:text-brand-hover">로그인 화면으로 →</Link>
          </div>
        </div>
      ) : step === 1 ? (
        <div>
          <fieldset>
            <legend className="sr-only">회원 유형을 선택해주세요</legend>
            <div className="divide-y divide-line overflow-hidden rounded-lg border border-line">
              {ROLES.map((r) => {
                const on = role === r.id
                return (
                  <label
                    key={r.id}
                    className={`relative flex cursor-pointer items-center gap-3.5 px-4 py-4 transition-colors duration-150 ${
                      on ? 'bg-brand-soft' : 'hover:bg-canvas'
                    }`}
                  >
                    {on && <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-brand" />}
                    <input
                      type="radio"
                      name="role"
                      value={r.id}
                      checked={on}
                      onChange={() => setRole(r.id)}
                      className="h-4 w-4 shrink-0 accent-brand"
                    />
                    <span>
                      <span className={`block text-[15px] font-semibold ${on ? 'text-brand' : 'text-ink'}`}>{r.label}</span>
                      <span className="mt-0.5 block text-[13px] text-muted">{r.desc}</span>
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>
          <button
            onClick={() => setStep(2)}
            className="mt-6 h-12 w-full rounded-md bg-brand text-[15px] font-semibold text-white transition-colors duration-150 hover:bg-brand-hover active:bg-brand-press"
          >
            다음
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2 sm:gap-3">
            <div>
              <FieldLabel htmlFor="su-name" required>이름</FieldLabel>
              <input
                id="su-name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="홍길동"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'su-name-err' : undefined}
                className={fieldCls(!!errors.name)}
              />
              <FieldError id="su-name-err">{errors.name}</FieldError>
            </div>
            <div>
              <FieldLabel htmlFor="su-country">국가</FieldLabel>
              <input
                id="su-country"
                type="text"
                autoComplete="country-name"
                value={form.country}
                onChange={(e) => set('country', e.target.value)}
                placeholder="대한민국"
                className={fieldCls()}
              />
            </div>
          </div>

          <div>
            <FieldLabel htmlFor="su-email" required>이메일</FieldLabel>
            <input
              id="su-email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="email@example.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'su-email-err' : undefined}
              className={fieldCls(!!errors.email)}
            />
            <FieldError id="su-email-err">{errors.email}</FieldError>
          </div>

          <div>
            <FieldLabel htmlFor="su-phone">연락처</FieldLabel>
            <input
              id="su-phone"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="+82-10-1234-5678"
              className={fieldCls()}
            />
          </div>

          {role === 'client' && (
            <div>
              <FieldLabel htmlFor="su-org" required>회사·기관명</FieldLabel>
              <input
                id="su-org"
                type="text"
                autoComplete="organization"
                value={form.organization}
                onChange={(e) => set('organization', e.target.value)}
                placeholder="(주)옴니배터리"
                aria-invalid={!!errors.organization}
                aria-describedby={errors.organization ? 'su-org-err' : undefined}
                className={fieldCls(!!errors.organization)}
              />
              <FieldError id="su-org-err">{errors.organization}</FieldError>
            </div>
          )}

          <div className="space-y-1 rounded-md border border-line p-3">
            {([
              ['agreeTerms', '이용약관'],
              ['agreePrivacy', '개인정보처리방침'],
            ] as const).map(([key, label]) => (
              <div key={key}>
                <label className="flex cursor-pointer items-center gap-2.5 rounded-sm px-1 py-1.5 text-[14px] text-ink-2">
                  <input
                    type="checkbox"
                    checked={form[key]}
                    onChange={(e) => set(key, e.target.checked)}
                    aria-invalid={!!errors[key]}
                    className="h-4 w-4 shrink-0 accent-brand"
                  />
                  <span>
                    <span className="font-medium text-ink underline decoration-line-strong underline-offset-2">{label}</span>에 동의합니다
                    <span className="ml-1.5 text-[12px] text-subtle">필수</span>
                  </span>
                </label>
                <FieldError id={`su-${key}-err`}>{errors[key]}</FieldError>
              </div>
            ))}
          </div>

          {submitError && (
            <div role="alert" className="rounded-md border border-danger/25 bg-danger-soft px-3.5 py-3 text-[13px] text-danger">{submitError}</div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="h-12 rounded-md border border-line-strong px-5 text-[15px] font-medium text-ink transition-colors duration-150 hover:border-ink hover:bg-wash"
            >
              이전
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-md bg-brand text-[15px] font-semibold text-white transition-colors duration-150 hover:bg-brand-hover active:bg-brand-press disabled:cursor-wait disabled:opacity-70"
            >
              {loading && <span aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
              {loading ? '처리 중...' : role === 'interpreter' ? '지원서 제출' : '가입 신청'}
            </button>
          </div>
        </form>
      )}
    </AuthShell>
  )
}
