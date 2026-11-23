'use client'

// 통역사 프로젝트 경력 (명세 §3 프로젝트 경력). FTA 협상을 5일 했으면 프로젝트 1건 · 수행 5일.
import { useState } from 'react'
import IndustryPicker from '@/components/omni/IndustryPicker'
import { Badge, ChipGroup, Empty, Field, Notice, Page, PageHeader, Section, Spinner, btnGhost, btnPrimary, btnSecondary, errorMessage, inputCls, selectCls, textareaCls } from '@/components/omni/ui'
import { industryPathLabel } from '@/lib/omni/catalog'
import { emptyIndustry } from '@/lib/omni/candidate'
import { MODE_LABELS, PURPOSE_LABELS, ROLE_LABELS, VERIFICATION_LABELS, pairLabel } from '@/lib/omni/labels'
import { useInterpreterProfile } from '@/lib/omni/use-interpreter-profile'
import { MODES, PURPOSES, ROLES, type Pair, type Project } from '@/lib/omni/types'

function blank(pair: Pair): Project {
  return {
    id: `prj-${Math.random().toString(36).slice(2, 10)}`,
    title: '', organizer: '', from: '', to: '', workedDates: [], pair, roles: ['INTERPRET'], modes: ['CONSECUTIVE'],
    purposes: [], industry: emptyIndustry(), interpreted: true, publicSummary: '', verification: 'PENDING',
  }
}

function datesBetween(from: string, to: string): string[] {
  const out: string[] = []
  const a = Date.parse(`${from}T00:00:00Z`)
  const b = Date.parse(`${to}T00:00:00Z`)
  if (!Number.isFinite(a) || !Number.isFinite(b) || b < a || b - a > 366 * 86400000) return out
  for (let t = a; t <= b; t += 86400000) out.push(new Date(t).toISOString().slice(0, 10))
  return out
}

function ProjectEditor({ initial, pairs, onCancel, onSave }: { initial: Project; pairs: Pair[]; onCancel: () => void; onSave: (p: Project) => Promise<void> }) {
  const [p, setP] = useState<Project>(initial)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const set = (patch: Partial<Project>) => setP((prev) => ({ ...prev, ...patch }))
  const range = p.from && p.to ? datesBetween(p.from, p.to) : []
  const pairKey = (x: Pair) => `${x.from}|${x.to}|${x.direction}`

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const problems: string[] = []
    if (!p.title.trim() || !p.organizer.trim()) problems.push('프로젝트명과 주최/의뢰기관을 입력해 주세요.')
    if (!p.workedDates.length) problems.push('실제 수행일을 하나 이상 선택해 주세요.')
    if (!p.purposes.length) problems.push('목적을 선택해 주세요.')
    if (!p.industry.primaryCode) problems.push('주산업을 선택해 주세요.')
    if (!p.publicSummary.trim()) problems.push('공개 요약을 입력해 주세요.')
    if (problems.length) return setErr(problems.join(' '))
    setSaving(true)
    setErr('')
    try {
      await onSave({ ...p, title: p.title.trim(), organizer: p.organizer.trim(), publicSummary: p.publicSummary.trim() })
    } catch (e2) {
      setErr(errorMessage(e2, '저장하지 못했습니다.'))
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit}>
      <Section title={initial.title ? '프로젝트 수정' : '프로젝트 추가'} desc="저장하면 운영자 증빙 검토(검토 중 → 검증 완료) 후 추천 점수에 반영됩니다.">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="프로젝트명" required><input className={inputCls} value={p.title} onChange={(e) => set({ title: e.target.value })} placeholder="2026 인터배터리 전해액 바이어 상담" /></Field>
            <Field label="주최/의뢰기관" required><input className={inputCls} value={p.organizer} onChange={(e) => set({ organizer: e.target.value })} /></Field>
            <Field label="시작"><input type="date" className={inputCls} value={p.from} onChange={(e) => set({ from: e.target.value, workedDates: p.workedDates.filter((d) => d >= e.target.value) })} /></Field>
            <Field label="종료"><input type="date" className={inputCls} value={p.to} onChange={(e) => set({ to: e.target.value, workedDates: p.workedDates.filter((d) => d <= e.target.value) })} /></Field>
          </div>
          {range.length > 0 && (
            <Field label={`실제 수행일 (${p.workedDates.length}일)`} hint="같은 날짜를 여러 프로젝트에 등록해도 분야 일수는 한 번만 계산됩니다.">
              <div className="flex flex-wrap gap-1">
                {range.map((d) => {
                  const on = p.workedDates.includes(d)
                  return (
                    <button key={d} type="button" aria-pressed={on}
                      onClick={() => set({ workedDates: on ? p.workedDates.filter((x) => x !== d) : [...p.workedDates, d].sort() })}
                      className={`tabular h-7 rounded-sm border px-2 text-[12px] ${on ? 'border-brand bg-brand-soft font-semibold text-brand' : 'border-line-strong text-ink-2'}`}>
                      {d.slice(5)}
                    </button>
                  )
                })}
                <button type="button" className={btnGhost} onClick={() => set({ workedDates: range })}>전체</button>
              </div>
            </Field>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="언어·방향">
              <select className={selectCls} value={pairKey(p.pair)} onChange={(e) => set({ pair: pairs.find((x) => pairKey(x) === e.target.value) ?? p.pair })}>
                {pairs.map((x) => <option key={pairKey(x)} value={pairKey(x)}>{pairLabel(x)}</option>)}
              </select>
            </Field>
            <label className="flex items-center gap-2 self-end pb-2 text-[13px] text-ink-2">
              <input type="checkbox" className="accent-brand" checked={p.interpreted} onChange={(e) => set({ interpreted: e.target.checked })} />
              직접 통역을 수행했습니다
            </label>
          </div>
          <Field label="역할"><ChipGroup options={ROLES} value={p.roles} onChange={(roles) => set({ roles })} labels={ROLE_LABELS} /></Field>
          <Field label="방식"><ChipGroup options={MODES} value={p.modes} onChange={(modes) => set({ modes })} labels={MODE_LABELS} /></Field>
          <Field label="목적" required><ChipGroup options={PURPOSES} value={p.purposes} onChange={(purposes) => set({ purposes })} labels={PURPOSE_LABELS} /></Field>
          <IndustryPicker value={p.industry} allowOther={false} question="이 프로젝트의 산업 (주산업 1개 + 보조 최대 3개)" onChange={(industry) => set({ industry })} />
          <Field label="공개 요약" required hint="의뢰사에게 보이는 문장입니다. 고객사 비밀은 쓰지 마세요. 증빙 파일은 업로드 연동 후 첨부합니다.">
            <textarea rows={2} className={textareaCls} value={p.publicSummary} onChange={(e) => set({ publicSummary: e.target.value })} />
          </Field>
          {err && <Notice tone="danger">{err}</Notice>}
          <div className="flex justify-end gap-2">
            <button type="button" className={btnSecondary} onClick={onCancel}>취소</button>
            <button type="submit" className={btnPrimary} disabled={saving}>{saving && <Spinner />}저장</button>
          </div>
        </div>
      </Section>
    </form>
  )
}

export default function ProjectsPage() {
  const { profile, isLoading, save } = useInterpreterProfile()
  const [editing, setEditing] = useState<Project | null>(null)
  const [msg, setMsg] = useState('')

  async function upsert(p: Project) {
    const exists = profile.projects.some((x) => x.id === p.id)
    await save({ ...profile, projects: exists ? profile.projects.map((x) => (x.id === p.id ? p : x)) : [...profile.projects, p] })
    setEditing(null)
    setMsg('저장했습니다. 운영자 검토 후 추천에 반영됩니다.')
  }

  async function remove(id: string) {
    await save({ ...profile, projects: profile.projects.filter((x) => x.id !== id) })
  }

  return (
    <Page>
      <PageHeader
        title="프로젝트 경력"
        desc="검증 완료된 직접 수행 사례만 ‘유사 프로젝트(30점)’와 ‘해당 분야 직접 통역(25점)’에 반영됩니다."
        actions={!editing && <button type="button" className={btnPrimary} onClick={() => setEditing(blank(profile.languagePairs[0]))}>+ 프로젝트 추가</button>}
      />
      {msg && !editing && <div className="mb-4"><Notice tone="success">{msg}</Notice></div>}
      {isLoading ? (
        <p className="text-[14px] text-muted">불러오는 중…</p>
      ) : editing ? (
        <ProjectEditor key={editing.id} initial={editing} pairs={profile.languagePairs} onCancel={() => setEditing(null)} onSave={upsert} />
      ) : profile.projects.length === 0 ? (
        <Empty title="등록된 프로젝트가 없습니다">박람회 부스 상담, 기술회의, 협상 등 직접 수행한 통역을 날짜별로 등록하세요.</Empty>
      ) : (
        <ul className="space-y-3">
          {profile.projects.map((p) => (
            <li key={p.id} className="rounded-lg border border-line bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge tone={p.verification === 'VERIFIED' ? 'success' : p.verification === 'REJECTED' ? 'danger' : 'warning'}>{VERIFICATION_LABELS[p.verification]}</Badge>
                    {!p.interpreted && <Badge>직접 통역 아님</Badge>}
                  </div>
                  <p className="mt-1.5 text-[15px] font-semibold text-ink">{p.title}</p>
                  <p className="text-[13px] text-muted">{p.organizer} · {p.from} ~ {p.to} · 수행 {p.workedDates.length}일 · {pairLabel(p.pair)}</p>
                  <p className="mt-1 text-[13px] text-ink-2">{p.purposes.map((x) => PURPOSE_LABELS[x]).join(' · ')} · {p.modes.map((m) => MODE_LABELS[m]).join('·')}</p>
                  {p.industry.primaryCode && <p className="mt-0.5 text-[12px] text-subtle">{industryPathLabel(p.industry.primaryCode)}</p>}
                </div>
                <div className="flex gap-1">
                  <button type="button" className={btnGhost} onClick={() => setEditing(p)}>수정</button>
                  <button type="button" className={btnGhost} onClick={() => remove(p.id)}>삭제</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Page>
  )
}
