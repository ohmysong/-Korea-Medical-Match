'use client'

import { useState } from 'react'
import useSWR from 'swr'
import * as companyApi from '@/lib/api/company'
import type { CompanyProfile } from '@/lib/api/company'
import { Field, Notice, Page, PageHeader, Section, Spinner, btnPrimary, errorMessage, inputCls } from '@/components/omni/ui'

const FIELDS: { key: keyof CompanyProfile; label: string; placeholder?: string; required?: boolean }[] = [
  { key: 'companyName', label: '회사명', required: true },
  { key: 'businessNumber', label: '사업자등록번호', placeholder: '000-00-00000' },
  { key: 'representativeName', label: '대표자' },
  { key: 'businessType', label: '업태' },
  { key: 'businessItem', label: '종목' },
  { key: 'address', label: '주소' },
  { key: 'contactName', label: '담당자' },
  { key: 'contactPhone', label: '담당자 연락처' },
  { key: 'billingEmail', label: '세금계산서·증빙 수신 이메일' },
]

function ProfileForm({ initial }: { initial: Partial<CompanyProfile> }) {
  const [form, setForm] = useState<Partial<CompanyProfile>>(initial)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null)

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!form.companyName?.trim()) {
      setMsg({ tone: 'danger', text: '회사명을 입력해 주세요.' })
      return
    }
    setSaving(true)
    setMsg(null)
    try {
      await companyApi.saveCompanyProfile({ ...form, companyName: form.companyName.trim() } as CompanyProfile)
      setMsg({ tone: 'success', text: '저장했습니다.' })
    } catch (err) {
      setMsg({ tone: 'danger', text: errorMessage(err, '저장하지 못했습니다.') })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save}>
      <Section title="기업 정보" desc="옴니 명의 세금계산서 발행 대상이면 옴니 수수료 공급가액과 그 부가세가 이 정보로 발행됩니다.">
        <div className="grid gap-4 sm:grid-cols-2">
          {FIELDS.map((f) => (
            <Field key={f.key} label={f.label} required={f.required}>
              <input className={inputCls} value={form[f.key] ?? ''} placeholder={f.placeholder} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
            </Field>
          ))}
        </div>
        {msg && <div className="mt-4"><Notice tone={msg.tone}>{msg.text}</Notice></div>}
        <div className="mt-5 flex justify-end">
          <button type="submit" className={btnPrimary} disabled={saving}>{saving && <Spinner />}저장</button>
        </div>
      </Section>
    </form>
  )
}

export default function ClientProfilePage() {
  const { data, error, isLoading } = useSWR('company/profile', () => companyApi.getCompanyProfile(), { shouldRetryOnError: false })
  return (
    <Page>
      <PageHeader title="기업 프로필" />
      {isLoading ? (
        <p className="text-[14px] text-muted">불러오는 중…</p>
      ) : (
        <>
          {error && <div className="mb-4"><Notice tone="warning">아직 등록된 기업 정보가 없거나 불러오지 못했습니다. 아래에서 새로 입력해 주세요.</Notice></div>}
          <ProfileForm initial={data ?? {}} />
        </>
      )}
    </Page>
  )
}
