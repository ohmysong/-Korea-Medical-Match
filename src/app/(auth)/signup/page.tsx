'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Role = 'patient' | 'agent' | 'hospital'

const ROLES: { id: Role; label: string; desc: string }[] = [
  { id: 'patient', label: '환자 / 보호자', desc: '병원 검색 및 상담 신청' },
  { id: 'agent', label: '해외 에이전트', desc: '환자 의뢰 및 파트너십' },
  { id: 'hospital', label: '병원 관계자', desc: '병원 등록 및 환자 관리' },
]

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [role, setRole] = useState<Role>('patient')
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    organization: '',
    country: '',
    agreeTerms: false,
    agreePrivacy: false,
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function set(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name) e.name = '이름을 입력해주세요'
    if (!form.email) e.email = '이메일을 입력해주세요'
    if (!form.password || form.password.length < 8) e.password = '비밀번호는 8자 이상이어야 합니다'
    if (form.password !== form.confirmPassword) e.confirmPassword = '비밀번호가 일치하지 않습니다'
    if (!form.agreeTerms) e.agreeTerms = '이용약관에 동의해주세요'
    if (!form.agreePrivacy) e.agreePrivacy = '개인정보처리방침에 동의해주세요'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    // Backend: POST /api/auth/signup  body: { role, ...form }
    await new Promise((r) => setTimeout(r, 1000))
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold">M</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">회원가입</h1>
            <p className="text-sm text-gray-500 mt-1">Korea Medical Match</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    step >= s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {s}
                </div>
                <span className={`text-xs ${step >= s ? 'text-gray-700' : 'text-gray-400'}`}>
                  {s === 1 ? '역할 선택' : '정보 입력'}
                </span>
                {s === 1 && <div className="flex-1 h-px bg-gray-200" />}
              </div>
            ))}
          </div>

          {step === 1 ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700 mb-3">회원 유형을 선택해주세요</p>
              {ROLES.map((r) => (
                <label
                  key={r.id}
                  className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${
                    role === r.id
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r.id}
                    checked={role === r.id}
                    onChange={() => setRole(r.id)}
                    className="mt-0.5"
                  />
                  <div>
                    <p className={`font-medium text-sm ${role === r.id ? 'text-blue-700' : 'text-gray-900'}`}>
                      {r.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{r.desc}</p>
                  </div>
                </label>
              ))}
              <button
                onClick={() => setStep(2)}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 mt-2"
              >
                다음
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    placeholder="홍길동"
                    className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">국가</label>
                  <input
                    type="text"
                    value={form.country}
                    onChange={(e) => set('country', e.target.value)}
                    placeholder="Mongolia"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이메일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="email@example.com"
                  className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="+82-10-1234-5678"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                />
              </div>

              {(role === 'agent' || role === 'hospital') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {role === 'agent' ? '에이전시명' : '병원명'}
                  </label>
                  <input
                    type="text"
                    value={form.organization}
                    onChange={(e) => set('organization', e.target.value)}
                    placeholder={role === 'agent' ? 'Beijing Health Tourism' : '세브란스병원'}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    비밀번호 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => set('password', e.target.value)}
                    placeholder="8자 이상"
                    className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 ${errors.password ? 'border-red-300' : 'border-gray-300'}`}
                  />
                  {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호 확인</label>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => set('confirmPassword', e.target.value)}
                    placeholder="••••••••"
                    className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'}`}
                  />
                  {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.agreeTerms}
                    onChange={(e) => set('agreeTerms', e.target.checked)}
                    className="mt-0.5 rounded"
                  />
                  <span className="text-sm text-gray-600">
                    <span className="text-blue-600 hover:underline cursor-pointer">이용약관</span>에 동의합니다{' '}
                    <span className="text-red-500">*</span>
                  </span>
                </label>
                {errors.agreeTerms && <p className="text-xs text-red-500">{errors.agreeTerms}</p>}

                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.agreePrivacy}
                    onChange={(e) => set('agreePrivacy', e.target.checked)}
                    className="mt-0.5 rounded"
                  />
                  <span className="text-sm text-gray-600">
                    <span className="text-blue-600 hover:underline cursor-pointer">개인정보처리방침</span>에 동의합니다{' '}
                    <span className="text-red-500">*</span>
                  </span>
                </label>
                {errors.agreePrivacy && <p className="text-xs text-red-500">{errors.agreePrivacy}</p>}
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-50"
                >
                  이전
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-60"
                >
                  {loading ? '처리 중...' : '회원가입'}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-5">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
