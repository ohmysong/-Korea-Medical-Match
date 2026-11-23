'use client'

// 통역사 프로필·요금표 (명세 §3 통역사 프로필·가용일·가격표)
import { useState } from 'react'
import IndustryPicker from '@/components/omni/IndustryPicker'
import {
  Badge, ChipGroup, Field, Notice, Page, PageHeader, Section, Spinner, btnGhost, btnPrimary, errorMessage, inputCls, selectCls, textareaCls,
} from '@/components/omni/ui'
import { industryChildren } from '@/lib/omni/catalog'
import { emptyIndustry } from '@/lib/omni/candidate'
import {
  LANGUAGES, MODE_LABELS, PLACE_TYPE_LABELS, PURPOSE_LABELS, ROLE_LABELS, VERIFICATION_LABELS, WORKPLACE_LABELS, formatKrw, pairLabel,
} from '@/lib/omni/labels'
import { useInterpreterProfile } from '@/lib/omni/use-interpreter-profile'
import {
  MODES, PLACE_TYPES, PURPOSES, ROLES,
  type Employment, type InterpreterProfile, type Mode, type Pair, type PlaceType, type Purpose, type Rate, type Residence, type Role, type Workplace,
} from '@/lib/omni/types'

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`
const csv = (v: string) => v.split(',').map((x) => x.trim()).filter(Boolean)

function exampleRates(pair: Pair): Rate[] {
  return [
    { id: uid('rate'), pair, role: 'INTERPRET', mode: 'SIMULTANEOUS', allowed: false },
    { id: uid('rate'), pair, role: 'INTERPRET', mode: 'CONSECUTIVE', allowed: true, unit: 'HOUR', priceKrw: 50000, minMinutes: 120 },
    { id: uid('rate'), pair, role: 'INTERPRET', mode: 'CONSECUTIVE', purpose: 'BOOTH', placeType: 'EXHIBITION_CENTER', allowed: true, unit: 'HOUR', priceKrw: 40000, minMinutes: 240 },
  ]
}

function RateEditor({ rates, pairs, onChange }: { rates: Rate[]; pairs: Pair[]; onChange: (r: Rate[]) => void }) {
  const set = (id: string, patch: Partial<Rate>) => onChange(rates.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  const pairKey = (p: Pair) => `${p.from}|${p.to}|${p.direction}`
  return (
    <div className="space-y-3">
      {rates.length === 0 && <p className="text-[13px] text-muted">등록된 단가가 없습니다. 단가가 없으면 예산 상한이 있는 의뢰에 추천되지 않습니다.</p>}
      {rates.map((r) => (
        <div key={r.id} className={`rounded-md border p-3 ${r.allowed ? 'border-line' : 'border-danger/30 bg-danger-soft/40'}`}>
          <div className="grid gap-2 sm:grid-cols-5">
            <Field label="언어쌍">
              <select className={selectCls} value={pairKey(r.pair)} onChange={(e) => set(r.id, { pair: pairs.find((p) => pairKey(p) === e.target.value) ?? r.pair })}>
                {pairs.map((p) => <option key={pairKey(p)} value={pairKey(p)}>{pairLabel(p)}</option>)}
              </select>
            </Field>
            <Field label="역할">
              <select className={selectCls} value={r.role} onChange={(e) => set(r.id, { role: e.target.value as Role })}>
                {ROLES.map((x) => <option key={x} value={x}>{ROLE_LABELS[x]}</option>)}
              </select>
            </Field>
            <Field label="방식">
              <select className={selectCls} value={r.mode ?? ''} onChange={(e) => set(r.id, { mode: (e.target.value || null) as Mode | null })}>
                <option value="">모든 방식</option>
                {MODES.map((x) => <option key={x} value={x}>{MODE_LABELS[x]}</option>)}
              </select>
            </Field>
            <Field label="목적">
              <select className={selectCls} value={r.purpose ?? ''} onChange={(e) => set(r.id, { purpose: (e.target.value || null) as Purpose | null })}>
                <option value="">모든 목적</option>
                {PURPOSES.map((x) => <option key={x} value={x}>{PURPOSE_LABELS[x]}</option>)}
              </select>
            </Field>
            <Field label="장소 유형">
              <select className={selectCls} value={r.placeType ?? ''} onChange={(e) => set(r.id, { placeType: (e.target.value || null) as PlaceType | null })}>
                <option value="">모든 장소</option>
                {PLACE_TYPES.map((x) => <option key={x} value={x}>{PLACE_TYPE_LABELS[x]}</option>)}
              </select>
            </Field>
          </div>
          <div className="mt-2 grid items-end gap-2 sm:grid-cols-6">
            <Field label="수행">
              <select className={selectCls} value={r.allowed ? 'Y' : 'N'} onChange={(e) => set(r.id, e.target.value === 'Y' ? { allowed: true, unit: r.unit ?? 'HOUR', priceKrw: r.priceKrw ?? 0 } : { allowed: false })}>
                <option value="Y">가능</option>
                <option value="N">불가</option>
              </select>
            </Field>
            {r.allowed && (
              <>
                <Field label="단위">
                  <select className={selectCls} value={r.unit ?? 'HOUR'} onChange={(e) => set(r.id, { unit: e.target.value as Rate['unit'] })}>
                    <option value="HOUR">시급</option>
                    <option value="DAY">일급</option>
                    <option value="JOB">건당</option>
                  </select>
                </Field>
                <Field label="금액(원)">
                  <input inputMode="numeric" className={inputCls} value={r.priceKrw ?? ''} onChange={(e) => set(r.id, { priceKrw: Number(e.target.value.replace(/[^\d]/g, '')) || 0 })} />
                </Field>
                <Field label="최소 유급(분)">
                  <input type="number" min={0} className={inputCls} value={r.minMinutes ?? 0} onChange={(e) => set(r.id, { minMinutes: Number(e.target.value) || 0 })} />
                </Field>
                {r.unit === 'DAY' && (
                  <Field label="일급 포함(분)">
                    <input type="number" min={0} className={inputCls} value={r.includedMinutes ?? 480} onChange={(e) => set(r.id, { includedMinutes: Number(e.target.value) || 0 })} />
                  </Field>
                )}
                <Field label="연장 단위(분)·단가">
                  <div className="flex gap-1">
                    <input type="number" min={1} className={inputCls} value={r.overtimeUnitMinutes ?? ''} placeholder="30" onChange={(e) => set(r.id, { overtimeUnitMinutes: Number(e.target.value) || undefined })} />
                    <input inputMode="numeric" className={inputCls} value={r.overtimeKrw ?? ''} placeholder="원" onChange={(e) => set(r.id, { overtimeKrw: Number(e.target.value.replace(/[^\d]/g, '')) || undefined })} />
                  </div>
                </Field>
              </>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between text-[12px]">
            <span className="text-subtle">{r.allowed ? `${r.unit === 'DAY' ? '일급' : r.unit === 'JOB' ? '건당' : '시급'} ${formatKrw(r.priceKrw ?? 0)}` : '이 조건은 추천에서 제외됩니다'}</span>
            <button type="button" className={btnGhost} onClick={() => onChange(rates.filter((x) => x.id !== r.id))}>삭제</button>
          </div>
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <button type="button" className={btnGhost} onClick={() => onChange([...rates, { id: uid('rate'), pair: pairs[0], role: 'INTERPRET', mode: null, allowed: true, unit: 'HOUR', priceKrw: 50000 }])}>+ 단가 추가</button>
        {rates.length === 0 && <button type="button" className={btnGhost} onClick={() => onChange(exampleRates(pairs[0]))}>예시로 채우기 (동시 불가 · 순차 5만원 · 전시 부스 4만원)</button>}
      </div>
      <p className="text-[12px] text-subtle">명시적 ‘불가’가 먼저 적용되고, 가능한 단가 중 상세 조건이 가장 많이 일치하는 행을 씁니다. 같은 수준의 행끼리 금액이 다르면 견적 확인으로 넘어갑니다.</p>
    </div>
  )
}

function ProfileForm({ initial, onSave, verificationOf }: {
  initial: InterpreterProfile
  onSave: (p: InterpreterProfile) => Promise<unknown>
  verificationOf: (e: Employment) => string | undefined
}) {
  const [p, setP] = useState<InterpreterProfile>(initial)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null)
  const set = (patch: Partial<InterpreterProfile>) => setP((prev) => ({ ...prev, ...patch }))
  const roots = industryChildren(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const problems: string[] = []
    if (!p.languagePairs.length || p.languagePairs.some((x) => x.from === x.to)) problems.push('언어쌍을 확인해 주세요.')
    if (!p.roles.length) problems.push('역할을 하나 이상 선택해 주세요.')
    if (p.rates.some((r) => r.allowed && !(r.priceKrw && r.priceKrw > 0))) problems.push('가능 단가의 금액을 입력해 주세요.')
    if (problems.length) {
      setMsg({ tone: 'danger', text: problems.join(' ') })
      return
    }
    setSaving(true)
    setMsg(null)
    try {
      await onSave(p)
      setMsg({ tone: 'success', text: '저장했습니다. 수정한 경력 항목은 운영자 검토 후 추천에 반영됩니다.' })
    } catch (err) {
      setMsg({ tone: 'danger', text: errorMessage(err, '저장하지 못했습니다.') })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <Section title="기본 정보">
        <div className="grid gap-4">
          <Field label="표시 이름"><input className={inputCls} value={p.displayName ?? ''} onChange={(e) => set({ displayName: e.target.value })} /></Field>
          <Field label="자기소개" hint="양언어 음성·영상 소개 파일 업로드는 파일 API 연동 후 추가됩니다.">
            <textarea rows={3} className={textareaCls} value={p.introduction ?? ''} onChange={(e) => set({ introduction: e.target.value })} />
          </Field>
        </div>
      </Section>

      <Section title="언어·역할·방식" desc="단방향만 가능하면 → 단방향으로 등록하세요. 반대 방향 의뢰에는 추천되지 않습니다.">
        <div className="space-y-4">
          <div className="space-y-2">
            {p.languagePairs.map((pair, i) => (
              <div key={i} className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2">
                <select className={selectCls} value={pair.from} aria-label="출발어" onChange={(e) => set({ languagePairs: p.languagePairs.map((x, j) => (j === i ? { ...x, from: e.target.value } : x)) })}>
                  {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
                <select className={selectCls + ' w-28'} value={pair.direction} aria-label="방향" onChange={(e) => set({ languagePairs: p.languagePairs.map((x, j) => (j === i ? { ...x, direction: e.target.value as Pair['direction'] } : x)) })}>
                  <option value="BOTH">↔ 양방향</option>
                  <option value="ONE_WAY">→ 단방향</option>
                </select>
                <select className={selectCls} value={pair.to} aria-label="도착어" onChange={(e) => set({ languagePairs: p.languagePairs.map((x, j) => (j === i ? { ...x, to: e.target.value } : x)) })}>
                  {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
                <button type="button" className={btnGhost} disabled={p.languagePairs.length === 1} onClick={() => set({ languagePairs: p.languagePairs.filter((_, j) => j !== i) })}>삭제</button>
              </div>
            ))}
            <button type="button" className={btnGhost} onClick={() => set({ languagePairs: [...p.languagePairs, { from: 'ko', to: 'zh', direction: 'BOTH' }] })}>+ 언어쌍 추가</button>
          </div>
          <Field label="역할"><ChipGroup options={ROLES} value={p.roles} onChange={(roles) => set({ roles })} labels={ROLE_LABELS} /></Field>
          <Field label="통역 방식"><ChipGroup options={MODES} value={p.modes} onChange={(modes) => set({ modes })} labels={MODE_LABELS} /></Field>
          <Field label="근무 형태"><ChipGroup options={['ONSITE', 'REMOTE'] as const} value={p.workplaces} onChange={(workplaces) => set({ workplaces: workplaces as Workplace[] })} labels={WORKPLACE_LABELS} /></Field>
          <Field label="보유 자격" hint="쉼표로 구분 — 의뢰의 ‘필요 자격’과 정확히 일치해야 합니다.">
            <input className={inputCls} defaultValue={p.credentials.join(', ')} onBlur={(e) => set({ credentials: csv(e.target.value) })} />
          </Field>
        </div>
      </Section>

      <Section title="전문 산업 (자기신고)" desc="검색·프로필 표시에 쓰입니다. 필수 경력 판정에는 검증된 프로젝트 경력만 사용합니다.">
        <IndustryPicker value={p.industry} onChange={(industry) => set({ industry })} allowOther={false} question="주로 통역하는 산업을 고르세요." />
      </Section>

      <Section title="서비스 요금표" desc="통화 KRW. 언어 방향·역할·방식·목적·장소 유형별로 단가 또는 ‘불가’를 등록합니다.">
        <RateEditor rates={p.rates} pairs={p.languagePairs} onChange={(rates) => set({ rates })} />
      </Section>

      <Section title="출장·일정">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="기본 도시"><input className={inputCls} value={p.homeCity} onChange={(e) => set({ homeCity: e.target.value })} /></Field>
          <Field label="지방 출장 가능 지역" hint="쉼표로 구분 · ‘전국’ 가능">
            <input className={inputCls} defaultValue={p.domesticRegions.join(', ')} onBlur={(e) => set({ domesticRegions: csv(e.target.value) })} />
          </Field>
          <Field label="해외 출장 가능 국가" hint="국가 코드, 쉼표로 구분 (예: US, VN)">
            <input className={inputCls} defaultValue={p.overseasCountries.join(', ')} onBlur={(e) => set({ overseasCountries: csv(e.target.value).map((c) => c.toUpperCase()) })} />
          </Field>
          <label className="flex items-center gap-2 self-end pb-2 text-[13px] text-ink-2">
            <input type="checkbox" className="accent-brand" checked={p.multiDay} onChange={(e) => set({ multiDay: e.target.checked })} />
            연속 2일 이상 일정 가능
          </label>
        </div>
      </Section>

      <Section title="학력·전공">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="학위"><input className={inputCls} value={p.degree ?? ''} onChange={(e) => set({ degree: e.target.value })} placeholder="학사" /></Field>
          <Field label="전공"><input className={inputCls} value={p.major ?? ''} onChange={(e) => set({ major: e.target.value })} placeholder="화학공학" /></Field>
          <Field label="통번역 교육">
            <select className={selectCls} value={p.education} onChange={(e) => set({ education: e.target.value as InterpreterProfile['education'] })}>
              <option value="NONE">미등록</option>
              <option value="IN_PROGRESS">재학·이수 중</option>
              <option value="COMPLETED">이수 완료</option>
            </select>
          </Field>
        </div>
        <div className="mt-4">
          <p className="mb-1.5 text-[13px] font-medium text-ink-2">전공과 직접 관련된 대분류</p>
          <div className="flex flex-wrap gap-1.5">
            {roots.map((r) => {
              const on = p.majorRootCodes.includes(r.code)
              return (
                <button key={r.code} type="button" aria-pressed={on}
                  onClick={() => set({ majorRootCodes: on ? p.majorRootCodes.filter((c) => c !== r.code) : [...p.majorRootCodes, r.code] })}
                  className={`h-7 rounded-full border px-2.5 text-[12px] ${on ? 'border-brand bg-brand-soft font-semibold text-brand' : 'border-line-strong text-ink-2 hover:border-ink'}`}>
                  {r.label_ko}
                </button>
              )
            })}
          </div>
          <p className="mt-1 text-[12px] text-subtle">운영자가 관리하는 산업–전공 연관표로 대체될 예정입니다.</p>
        </div>
      </Section>

      <Section title="회사·직무 경력" desc="같은 기간이 겹치는 경력은 합집합으로만 계산합니다. 운영자 검증 후 ‘관련 회사·직무’ 점수에 반영됩니다.">
        <div className="space-y-3">
          {p.employment.map((emp, i) => {
            const v = verificationOf(emp)
            return (
              <div key={i} className="rounded-md border border-line p-3">
                <div className="grid gap-2 sm:grid-cols-4">
                  <Field label="회사"><input className={inputCls} value={emp.employer} onChange={(e) => set({ employment: p.employment.map((x, j) => (j === i ? { ...x, employer: e.target.value } : x)) })} /></Field>
                  <Field label="직무"><input className={inputCls} value={emp.job} onChange={(e) => set({ employment: p.employment.map((x, j) => (j === i ? { ...x, job: e.target.value } : x)) })} /></Field>
                  <Field label="시작"><input type="date" className={inputCls} value={emp.from} onChange={(e) => set({ employment: p.employment.map((x, j) => (j === i ? { ...x, from: e.target.value } : x)) })} /></Field>
                  <Field label="종료 (재직 중이면 비움)"><input type="date" className={inputCls} value={emp.to ?? ''} onChange={(e) => set({ employment: p.employment.map((x, j) => (j === i ? { ...x, to: e.target.value || null } : x)) })} /></Field>
                </div>
                <div className="mt-3">
                  <IndustryPicker value={emp.industry} allowOther={false} question="이 회사·직무의 산업" onChange={(industry) => set({ employment: p.employment.map((x, j) => (j === i ? { ...x, industry } : x)) })} />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <Badge tone={v === 'VERIFIED' ? 'success' : 'warning'}>{VERIFICATION_LABELS[(v as keyof typeof VERIFICATION_LABELS) ?? 'PENDING'] ?? '검토 중'}</Badge>
                  <button type="button" className={btnGhost} onClick={() => set({ employment: p.employment.filter((_, j) => j !== i) })}>삭제</button>
                </div>
              </div>
            )
          })}
          <button type="button" className={btnGhost} onClick={() => set({ employment: [...p.employment, { employer: '', job: '', from: '', to: null, industry: emptyIndustry(), verification: 'PENDING' }] })}>+ 경력 추가</button>
        </div>
      </Section>

      <Section title="언어권 체류" desc="해당 언어를 사용한 국가의 겹치지 않는 체류 기간이 24개월이면 만점입니다.">
        <div className="space-y-2">
          {p.residences.map((r, i) => {
            const upd = (patch: Partial<Residence>) => set({ residences: p.residences.map((x, j) => (j === i ? { ...x, ...patch } : x)) })
            return (
              <div key={i} className="grid grid-cols-2 items-end gap-2 sm:grid-cols-[6rem_1fr_1fr_1fr_auto]">
                <Field label="국가"><input className={inputCls} value={r.country} onChange={(e) => upd({ country: e.target.value.toUpperCase() })} placeholder="US" /></Field>
                <Field label="사용 언어">
                  <select className={selectCls} value={r.languages[0] ?? 'en'} onChange={(e) => upd({ languages: [e.target.value] })}>
                    {LANGUAGES.filter((l) => l.code !== 'ko').map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
                  </select>
                </Field>
                <Field label="시작"><input type="date" className={inputCls} value={r.from} onChange={(e) => upd({ from: e.target.value })} /></Field>
                <Field label="종료"><input type="date" className={inputCls} value={r.to ?? ''} onChange={(e) => upd({ to: e.target.value || null })} /></Field>
                <button type="button" className={btnGhost} onClick={() => set({ residences: p.residences.filter((_, j) => j !== i) })}>삭제</button>
              </div>
            )
          })}
          <button type="button" className={btnGhost} onClick={() => set({ residences: [...p.residences, { country: '', from: '', to: null, languages: ['en'] }] })}>+ 체류 추가</button>
        </div>
      </Section>

      <div className="sticky bottom-0 -mx-4 border-t border-line bg-canvas/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-lg sm:border">
        {msg && <div className="mb-2"><Notice tone={msg.tone}>{msg.text}</Notice></div>}
        <div className="flex items-center justify-between gap-3">
          <p className="text-[12px] text-subtle">세무 유형: {initial.taxProfile === 'KR_FREELANCE_33' ? '국내 거주 프리랜서 (3.3%)' : initial.taxProfile === 'NONE_CONFIRMED' ? '원천징수 비대상 확인' : '운영자 확인 전'}</p>
          <button type="submit" className={btnPrimary} disabled={saving}>{saving && <Spinner />}프로필 저장</button>
        </div>
      </div>
    </form>
  )
}

export default function InterpreterProfilePage() {
  const { profile, applicant, isLoading, error, save } = useInterpreterProfile()
  return (
    <Page>
      <PageHeader title="프로필·요금표" desc="추천 점수는 검증된 경력으로 계산됩니다. 자기신고 분야는 검색과 프로필 표시에만 쓰입니다." />
      {isLoading ? (
        <p className="text-[14px] text-muted">불러오는 중…</p>
      ) : (
        <>
          {error && <div className="mb-4"><Notice tone="warning">프로필을 불러오지 못했습니다 ({errorMessage(error, '')}). 새로 작성해 저장할 수 있습니다.</Notice></div>}
          <ProfileForm
            key={applicant?.id ?? 'new'}
            initial={profile}
            onSave={save}
            verificationOf={(e) => profile.employment.find((x) => x.employer === e.employer && x.from === e.from)?.verification}
          />
        </>
      )}
    </Page>
  )
}
