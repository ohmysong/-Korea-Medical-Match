'use client'

// 의뢰 등록 (명세 §3 의뢰사 화면). 입력값은 openapi RequestInput 구조로 만든다.
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import * as requestsApi from '@/lib/api/requests'
import * as companyApi from '@/lib/api/company'
import { useAuth } from '@/lib/auth-context'
import IndustryPicker from '@/components/omni/IndustryPicker'
import {
  ChipGroup, Field, Notice, Page, PageHeader, Section, Spinner, btnGhost, btnPrimary, btnSecondary, errorMessage,
  inputCls, selectCls, textareaCls,
} from '@/components/omni/ui'
import { emptyIndustry } from '@/lib/omni/candidate'
import {
  DELIVERY_LABELS, EXPENSE_KIND_LABELS, EXPENSE_PROVISION_LABELS, LANGUAGES, MODE_LABELS, MOVEMENT_LABELS,
  PLACE_TYPE_LABELS, PURPOSE_LABELS, REQUIRED_INDUSTRY_LABELS, ROLE_LABELS, SCHEDULE_LABELS, WORKPLACE_LABELS, formatKrw,
} from '@/lib/omni/labels'
import { maxWorkForCharge } from '@/lib/omni/pricing'
import { newRequestId, toCreateRequestDto } from '@/lib/omni/request-adapter'
import { TIMEZONES, zonedIso } from '@/lib/omni/time'
import {
  EXPENSE_KINDS, MODES, PLACE_TYPES, PURPOSES, ROLES,
  type Delivery, type ExpenseKind, type ExpensePolicy, type ExpenseProvision, type IndustrySelection, type Mode, type Movement,
  type Pair, type Place, type PlaceType, type Purpose, type RequestInput, type RequiredIndustry, type Role, type Schedule, type Task, type Workplace,
} from '@/lib/omni/types'

interface SessionDraft {
  id: string
  date: string
  start: string
  end: string
  timezone: string
  place: Place
}

const defaultPlace: Place = {
  workplace: 'ONSITE', delivery: 'IN_PERSON', type: 'EXHIBITION_CENTER', name: '', detail: '', country: 'KR', city: '서울', movement: 'FIXED',
}

const nextSessionId = () => `s-${Math.random().toString(36).slice(2, 8)}`

function tomorrow() {
  const d = new Date(Date.now() + 86400000)
  return d.toISOString().slice(0, 10)
}

export default function NewRequestPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { data: company } = useSWR('company/profile', () => companyApi.getCompanyProfile(), { shouldRetryOnError: false })

  const [pairs, setPairs] = useState<Pair[]>([{ from: 'ko', to: 'en', direction: 'BOTH' }])
  const [singleMultilingual, setSingleMultilingual] = useState(false)
  const [roles, setRoles] = useState<Role[]>(['INTERPRET'])
  const [modes, setModes] = useState<Mode[]>(['CONSECUTIVE'])
  const [modeAdvice, setModeAdvice] = useState(false)
  const [purposes, setPurposes] = useState<Purpose[]>([])
  const [industry, setIndustry] = useState<IndustrySelection>(emptyIndustry())
  const [requiredIndustry, setRequiredIndustry] = useState<RequiredIndustry>('NONE')
  const [schedule, setSchedule] = useState<Schedule>('ALL')
  const [headcount, setHeadcount] = useState(1)
  const [sessions, setSessions] = useState<SessionDraft[]>(() => [
    { id: 's1', date: tomorrow(), start: '09:00', end: '18:00', timezone: 'Asia/Seoul', place: { ...defaultPlace } },
  ])
  const [budgetKind, setBudgetKind] = useState<'NONE' | 'WORK' | 'TOTAL'>('TOTAL')
  const [budgetCap, setBudgetCap] = useState('')
  const [expenses, setExpenses] = useState<Record<ExpenseKind, ExpenseProvision>>({
    MEAL: 'DIRECT', GROUND: 'NONE', AIR: 'NONE', LODGING: 'NONE', OTHER: 'NONE',
  })
  const [tasks, setTasks] = useState<Task[]>([])
  const [brief, setBrief] = useState('')
  const [localResidence, setLocalResidence] = useState<'NONE' | 'PREFERRED' | 'REQUIRED'>('NONE')
  const [credentials, setCredentials] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')

  const [errors, setErrors] = useState<string[]>([])
  const [submitError, setSubmitError] = useState('')
  const [saving, setSaving] = useState(false)

  const interpreting = roles.includes('INTERPRET')
  const totalMinutes = useMemo(
    () => sessions.reduce((sum, s) => {
      const [sh, sm] = s.start.split(':').map(Number)
      const [eh, em] = s.end.split(':').map(Number)
      return sum + Math.max(0, eh * 60 + em - (sh * 60 + sm))
    }, 0),
    [sessions],
  )
  const cap = Number(budgetCap.replace(/[^\d]/g, '')) || 0
  const maxWork = budgetKind === 'TOTAL' ? maxWorkForCharge(cap) : budgetKind === 'WORK' ? cap : 0
  const impliedHourly = totalMinutes > 0 && maxWork > 0 ? Math.floor((maxWork * 60) / totalMinutes) : 0

  function updateSession(id: string, patch: Partial<SessionDraft>) {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }
  function updatePlace(id: string, patch: Partial<Place>) {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, place: { ...s.place, ...patch } } : s)))
  }
  function duplicateSession(s: SessionDraft) {
    const d = new Date(`${s.date}T00:00:00Z`)
    d.setUTCDate(d.getUTCDate() + 1)
    setSessions((prev) => [...prev, { ...s, id: nextSessionId(), date: d.toISOString().slice(0, 10), place: { ...s.place } }])
  }

  function build(): { input: RequestInput | null; problems: string[] } {
    const p: string[] = []
    if (pairs.some((x) => x.from === x.to)) p.push('출발어와 도착어가 같은 언어쌍이 있습니다.')
    if (!roles.length) p.push('역할을 하나 이상 선택해 주세요.')
    if (interpreting && !modes.length && !modeAdvice) p.push('통역 방식을 고르거나 ‘상담 필요’를 선택해 주세요.')
    if (!purposes.length) p.push('실제 업무·목적을 하나 이상 선택해 주세요.')
    if (!industry.primaryCode && !(industry.otherText ?? '').trim()) p.push('산업 분야를 고르거나 직접 입력해 주세요.')
    if (headcount < 1) p.push('필요 인원은 1명 이상입니다.')
    if (!brief.trim()) p.push('의뢰 설명을 입력해 주세요.')
    if (budgetKind !== 'NONE' && cap <= 0) p.push('예산 상한 금액을 입력해 주세요.')
    const built = sessions.map((s) => ({
      id: s.id,
      startsAt: zonedIso(s.date, s.start, s.timezone),
      endsAt: zonedIso(s.date, s.end, s.timezone),
      timezone: s.timezone,
      place: {
        ...s.place,
        name: s.place.name?.trim() || undefined,
        detail: s.place.detail?.trim() || undefined,
        type: (s.place.workplace === 'REMOTE' ? 'VIRTUAL' : s.place.type) as PlaceType,
      },
    }))
    built.forEach((s, i) => {
      if (!(Date.parse(s.startsAt) < Date.parse(s.endsAt))) p.push(`일정 ${i + 1}: 종료시각이 출근 예정시각보다 늦어야 합니다.`)
      if (!s.place.city.trim() || !s.place.country.trim()) p.push(`일정 ${i + 1}: 국가·도시를 입력해 주세요.`)
    })
    if (p.length) return { input: null, problems: p }
    const expensePolicies: ExpensePolicy[] = EXPENSE_KINDS.filter((k) => expenses[k] !== 'NONE').map((k) => ({
      kind: k, provision: expenses[k], unit: k === 'AIR' ? 'BOOKING' : 'DAY',
    }))
    const input: RequestInput = {
      languagePairs: pairs,
      singleMultilingual: pairs.length > 1 ? singleMultilingual : undefined,
      roles,
      modes: interpreting ? modes : [],
      modeAdvice: interpreting ? modeAdvice : false,
      purposes,
      industry: industry.primaryCode
        ? { version: industry.version, primaryCode: industry.primaryCode, secondaryCodes: industry.secondaryCodes }
        : { version: industry.version, primaryCode: null, secondaryCodes: [], otherText: (industry.otherText ?? '').trim() },
      requiredIndustry: industry.primaryCode ? requiredIndustry : 'NONE',
      schedule,
      sessions: built,
      headcount,
      budget: budgetKind === 'NONE' ? null : { kind: budgetKind, capKrw: cap },
      expenses: expensePolicies,
      tasks: tasks.filter((t) => t.name.trim()),
      brief: brief.trim(),
      localResidence,
      neededCredentials: credentials.split(',').map((c) => c.trim()).filter(Boolean),
    }
    return { input, problems: [] }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const { input, problems } = build()
    setErrors(problems)
    setSubmitError('')
    if (!input) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setSaving(true)
    try {
      const id = newRequestId()
      await requestsApi.createInterpretRequest(
        toCreateRequestDto(input, {
          id,
          companyName: company?.companyName ?? user?.displayName ?? null,
          contactName: contactName || company?.contactName || null,
          phone: contactPhone || company?.contactPhone || null,
        }),
      )
      router.push(`/client/requests/view?id=${encodeURIComponent(id)}`)
    } catch (err) {
      setSubmitError(errorMessage(err, '의뢰를 등록하지 못했습니다.'))
      setSaving(false)
    }
  }

  return (
    <Page>
      <PageHeader title="새 통역 의뢰" desc="예: 한영 순차, 부산 벡스코 배터리 전해액 수출 상담, 10시간" />

      {errors.length > 0 && (
        <div className="mb-4">
          <Notice tone="danger">
            <ul className="list-disc pl-4">{errors.map((x) => <li key={x}>{x}</li>)}</ul>
          </Notice>
        </div>
      )}

      <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[1fr_17rem]">
        <div className="min-w-0 space-y-5">
          <Section title="1. 언어" desc="단방향 ko→en 만 가능한 통역사는 en→ko 의뢰에 추천되지 않습니다.">
            <div className="space-y-2">
              {pairs.map((p, i) => (
                <div key={i} className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2">
                  <select className={selectCls} value={p.from} aria-label="출발어" onChange={(e) => setPairs(pairs.map((x, j) => (j === i ? { ...x, from: e.target.value } : x)))}>
                    {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
                  </select>
                  <select className={selectCls + ' w-28'} value={p.direction} aria-label="방향" onChange={(e) => setPairs(pairs.map((x, j) => (j === i ? { ...x, direction: e.target.value as Pair['direction'] } : x)))}>
                    <option value="BOTH">↔ 양방향</option>
                    <option value="ONE_WAY">→ 단방향</option>
                  </select>
                  <select className={selectCls} value={p.to} aria-label="도착어" onChange={(e) => setPairs(pairs.map((x, j) => (j === i ? { ...x, to: e.target.value } : x)))}>
                    {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
                  </select>
                  <button type="button" className={btnGhost} disabled={pairs.length === 1} onClick={() => setPairs(pairs.filter((_, j) => j !== i))}>삭제</button>
                </div>
              ))}
              <button type="button" className={btnGhost} onClick={() => setPairs([...pairs, { from: 'ko', to: 'zh', direction: 'BOTH' }])}>+ 언어쌍 추가</button>
              {pairs.length > 1 && (
                <label className="flex items-center gap-2 text-[13px] text-ink-2">
                  <input type="checkbox" className="accent-brand" checked={singleMultilingual} onChange={(e) => setSingleMultilingual(e.target.checked)} />
                  한 사람이 모든 언어를 담당해야 합니다 (해제 시 언어별로 자리를 나눌 수 있음)
                </label>
              )}
            </div>
          </Section>

          <Section title="2. 역할·통역 방식·업무" desc="주 역할을 먼저 고르세요. 화상·전화는 아래 일정의 진행 채널에서 선택합니다.">
            <div className="space-y-4">
              <Field label="역할" required>
                <ChipGroup options={ROLES} value={roles} onChange={setRoles} labels={ROLE_LABELS} />
              </Field>
              {interpreting && (
                <Field label="통역 방식" required>
                  <ChipGroup options={MODES} value={modes} onChange={setModes} labels={MODE_LABELS} />
                  <label className="mt-2 flex items-center gap-2 text-[13px] text-ink-2">
                    <input type="checkbox" className="accent-brand" checked={modeAdvice} onChange={(e) => setModeAdvice(e.target.checked)} />
                    잘 모르겠어요 · 상담 필요
                  </label>
                </Field>
              )}
              <Field label="실제 업무·목적" required>
                <ChipGroup options={PURPOSES} value={purposes} onChange={setPurposes} labels={PURPOSE_LABELS} />
              </Field>
              <Notice>
                의료기기 박람회·제약사 미팅은 이 화면에서 등록할 수 있습니다. <strong>환자 진료·진료동행</strong>은 별도 의료통역 서비스로 접수해 주세요.
              </Notice>
            </div>
          </Section>

          <Section title="3. 산업 분야" desc="‘필수 경력’과 ‘우대’는 별도로 설정합니다.">
            <div className="space-y-4">
              <IndustryPicker value={industry} onChange={setIndustry} />
              {industry.primaryCode && (
                <Field label="주산업 경력 조건" hint="필수로 정하면 검증된 직접 통역 경력이 1일 이상인 통역사만 추천합니다.">
                  <select className={selectCls} value={requiredIndustry} onChange={(e) => setRequiredIndustry(e.target.value as RequiredIndustry)}>
                    {(Object.keys(REQUIRED_INDUSTRY_LABELS) as RequiredIndustry[]).map((k) => <option key={k} value={k}>{REQUIRED_INDUSTRY_LABELS[k]}</option>)}
                  </select>
                </Field>
              )}
            </div>
          </Section>

          <Section title="4. 일정·근무 장소" desc="날짜별 출근 예정시각·종료시각. 연락처와 비공개 접속 링크는 확정 당사자에게만 공개됩니다.">
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <Field label="일정 조건">
                <select className={selectCls} value={schedule} onChange={(e) => setSchedule(e.target.value as Schedule)}>
                  {(Object.keys(SCHEDULE_LABELS) as Schedule[]).map((k) => <option key={k} value={k}>{SCHEDULE_LABELS[k]}</option>)}
                </select>
              </Field>
              <Field label="필요 인원">
                <input type="number" min={1} className={inputCls} value={headcount} onChange={(e) => setHeadcount(Math.max(1, Number(e.target.value) || 1))} />
              </Field>
            </div>
            <ol className="space-y-3">
              {sessions.map((s, i) => (
                <li key={s.id} className="rounded-md border border-line p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-ink">일정 {i + 1}</span>
                    <span className="flex gap-1">
                      <button type="button" className={btnGhost} onClick={() => duplicateSession(s)}>다음 날 복제</button>
                      <button type="button" className={btnGhost} disabled={sessions.length === 1} onClick={() => setSessions(sessions.filter((x) => x.id !== s.id))}>삭제</button>
                    </span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-4">
                    <Field label="날짜"><input type="date" className={inputCls} value={s.date} onChange={(e) => updateSession(s.id, { date: e.target.value })} /></Field>
                    <Field label="출근 예정"><input type="time" className={inputCls} value={s.start} onChange={(e) => updateSession(s.id, { start: e.target.value })} /></Field>
                    <Field label="종료"><input type="time" className={inputCls} value={s.end} onChange={(e) => updateSession(s.id, { end: e.target.value })} /></Field>
                    <Field label="현지 시간대">
                      <select className={selectCls} value={s.timezone} onChange={(e) => updateSession(s.id, { timezone: e.target.value })}>
                        {TIMEZONES.map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </Field>
                    <Field label="통역사 근무">
                      <select className={selectCls} value={s.place.workplace} onChange={(e) => updatePlace(s.id, { workplace: e.target.value as Workplace })}>
                        {(Object.keys(WORKPLACE_LABELS) as Workplace[]).map((k) => <option key={k} value={k}>{WORKPLACE_LABELS[k]}</option>)}
                      </select>
                    </Field>
                    <Field label="행사 채널">
                      <select className={selectCls} value={s.place.delivery} onChange={(e) => updatePlace(s.id, { delivery: e.target.value as Delivery })}>
                        {(Object.keys(DELIVERY_LABELS) as Delivery[]).map((k) => <option key={k} value={k}>{DELIVERY_LABELS[k]}</option>)}
                      </select>
                    </Field>
                    {s.place.workplace === 'ONSITE' && (
                      <>
                        <Field label="시설 유형">
                          <select className={selectCls} value={s.place.type} onChange={(e) => updatePlace(s.id, { type: e.target.value as PlaceType })}>
                            {PLACE_TYPES.filter((t) => t !== 'VIRTUAL').map((k) => <option key={k} value={k}>{PLACE_TYPE_LABELS[k]}</option>)}
                          </select>
                        </Field>
                        <Field label="이동 방식">
                          <select className={selectCls} value={s.place.movement} onChange={(e) => updatePlace(s.id, { movement: e.target.value as Movement })}>
                            {(Object.keys(MOVEMENT_LABELS) as Movement[]).map((k) => <option key={k} value={k}>{MOVEMENT_LABELS[k]}</option>)}
                          </select>
                        </Field>
                      </>
                    )}
                    <Field label="국가 코드"><input className={inputCls} value={s.place.country} onChange={(e) => updatePlace(s.id, { country: e.target.value.toUpperCase() })} placeholder="KR" /></Field>
                    <Field label="도시"><input className={inputCls} value={s.place.city} onChange={(e) => updatePlace(s.id, { city: e.target.value })} placeholder="부산" /></Field>
                    {s.place.workplace === 'ONSITE' && (
                      <>
                        <div className="sm:col-span-2"><Field label="시설명"><input className={inputCls} value={s.place.name ?? ''} onChange={(e) => updatePlace(s.id, { name: e.target.value })} placeholder="벡스코" /></Field></div>
                        <div className="sm:col-span-2"><Field label="층·홀·부스"><input className={inputCls} value={s.place.detail ?? ''} onChange={(e) => updatePlace(s.id, { detail: e.target.value })} placeholder="제1전시장 참가사 부스" /></Field></div>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ol>
            <button type="button" className={btnGhost + ' mt-2'} onClick={() => setSessions([...sessions, { id: nextSessionId(), date: tomorrow(), start: '09:00', end: '18:00', timezone: 'Asia/Seoul', place: { ...defaultPlace } }])}>
              + 일정 추가
            </button>
          </Section>

          <Section title="5. 예산·경비" desc="총액 상한은 옴니 수수료(30%)와 수수료 부가세(10%), 확정 경비까지 포함해 비교합니다.">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="예산 상한 기준">
                <select className={selectCls} value={budgetKind} onChange={(e) => setBudgetKind(e.target.value as typeof budgetKind)}>
                  <option value="TOTAL">총 카드결제액 상한</option>
                  <option value="WORK">통역료(보수) 상한</option>
                  <option value="NONE">상한 없음</option>
                </select>
              </Field>
              {budgetKind !== 'NONE' && (
                <Field label="상한 금액 (원)" hint={maxWork > 0 ? `통역료 최대 ${formatKrw(maxWork)}${impliedHourly ? ` · 총 ${totalMinutes / 60}시간 기준 시급 약 ${formatKrw(impliedHourly)}` : ''}` : undefined}>
                  <input inputMode="numeric" className={inputCls} value={budgetCap} onChange={(e) => setBudgetCap(e.target.value.replace(/[^\d]/g, ''))} placeholder="399000" />
                </Field>
              )}
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {EXPENSE_KINDS.map((k) => (
                <label key={k} className="grid grid-cols-[5rem_1fr] items-center gap-2 text-[13px] text-ink-2">
                  <span>{EXPENSE_KIND_LABELS[k]}</span>
                  <select className={selectCls} value={expenses[k]} onChange={(e) => setExpenses({ ...expenses, [k]: e.target.value as ExpenseProvision })}>
                    {(Object.keys(EXPENSE_PROVISION_LABELS) as ExpenseProvision[]).map((p) => <option key={p} value={p}>{EXPENSE_PROVISION_LABELS[p]}</option>)}
                  </select>
                </label>
              ))}
            </div>
            <p className="mt-2 text-[12px] text-subtle">미확정 실비는 예상 범위로만 표시하고, 추후 승인된 금액만 청구합니다.</p>
          </Section>

          <Section title="6. 의뢰 설명·자료">
            <div className="space-y-4">
              <Field label="의뢰 설명" required hint="통역사에게 공개되는 요약입니다. 비공개 브리핑 파일은 확정 후 전달합니다.">
                <textarea rows={4} className={textareaCls} value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="배터리 전해액 공급사의 수출 상담. 유급 통역 10시간으로 견적 요청." />
              </Field>
              <div>
                <p className="mb-1.5 text-[13px] font-medium text-ink-2">준비·부가 업무 (포함 여부와 유상 시간)</p>
                {tasks.map((t, i) => (
                  <div key={i} className="mb-2 grid grid-cols-[1fr_6rem_auto_auto] items-center gap-2">
                    <input className={inputCls} value={t.name} placeholder="리허설, 자료 검토, 상담일지 …" onChange={(e) => setTasks(tasks.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                    <input type="number" min={0} className={inputCls} value={t.estimatedMinutes ?? 0} aria-label="유상 시간(분)" onChange={(e) => setTasks(tasks.map((x, j) => (j === i ? { ...x, estimatedMinutes: Number(e.target.value) || 0 } : x)))} />
                    <label className="flex items-center gap-1 text-[12px] text-ink-2">
                      <input type="checkbox" className="accent-brand" checked={t.included} onChange={(e) => setTasks(tasks.map((x, j) => (j === i ? { ...x, included: e.target.checked } : x)))} />포함
                    </label>
                    <button type="button" className={btnGhost} onClick={() => setTasks(tasks.filter((_, j) => j !== i))}>삭제</button>
                  </div>
                ))}
                <button type="button" className={btnGhost} onClick={() => setTasks([...tasks, { name: '', included: true, estimatedMinutes: 0 }])}>+ 업무 추가</button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="현지 거주">
                  <select className={selectCls} value={localResidence} onChange={(e) => setLocalResidence(e.target.value as typeof localResidence)}>
                    <option value="NONE">조건 없음</option>
                    <option value="PREFERRED">현지 거주 우대</option>
                    <option value="REQUIRED">현지 거주 필수</option>
                  </select>
                </Field>
                <Field label="필요 자격" hint="쉼표로 구분 (예: 보안 서약, 통역사 자격증)">
                  <input className={inputCls} value={credentials} onChange={(e) => setCredentials(e.target.value)} />
                </Field>
                <Field label="현장 담당자"><input className={inputCls} value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder={company?.contactName ?? ''} /></Field>
                <Field label="담당자 연락처"><input className={inputCls} value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder={company?.contactPhone ?? ''} /></Field>
              </div>
            </div>
          </Section>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-lg border border-line bg-surface p-5">
            <p className="text-[13px] font-semibold text-ink">의뢰 요약</p>
            <dl className="mt-3 space-y-2 text-[13px]">
              <div className="flex justify-between gap-2"><dt className="text-muted">일정</dt><dd className="tabular text-ink">{sessions.length}개 · {Math.round((totalMinutes / 60) * 10) / 10}시간</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-muted">인원</dt><dd className="text-ink">{headcount}명</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-muted">예산</dt><dd className="tabular text-ink">{budgetKind === 'NONE' ? '상한 없음' : formatKrw(cap)}</dd></div>
              {budgetKind === 'TOTAL' && cap > 0 && (
                <div className="flex justify-between gap-2"><dt className="text-muted">통역료 최대</dt><dd className="tabular text-ink">{formatKrw(maxWork)}</dd></div>
              )}
            </dl>
            <p className="mt-4 border-t border-line pt-3 text-[12px] leading-relaxed text-subtle">
              결제 합계 = 약정 통역료 + 옴니 중개수수료 30% + 수수료 부가세 10% + 승인 경비. 통역사의 플랫폼 수수료는 0원입니다.
            </p>
            {submitError && <div className="mt-3"><Notice tone="danger">{submitError}</Notice></div>}
            <button type="submit" className={btnPrimary + ' mt-4 w-full'} disabled={saving}>
              {saving && <Spinner />}
              {saving ? '등록 중…' : '의뢰 등록하고 추천 받기'}
            </button>
            <button type="button" className={btnSecondary + ' mt-2 w-full'} onClick={() => router.push('/client')}>취소</button>
          </div>
        </aside>
      </form>
    </Page>
  )
}
