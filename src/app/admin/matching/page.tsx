'use client'

// 운영자 매칭 콘솔 — 명세 §5 추천 엔진(matching.ts)으로 최대 3명을 계산하고 오퍼를 생성한다.
// 명세상 추천은 서버(`POST /v1/requests/{id}/recommendations`) 책임이다. 그 API 가 생기기 전까지
// 운영자가 같은 산식으로 계산해 `POST /admin/requests/{id}/offers` 에 점수·근거를 함께 저장한다.
import { useMemo, useState } from 'react'
import useSWR from 'swr'
import * as requestsApi from '@/lib/api/requests'
import * as applicantsApi from '@/lib/api/applicants'
import * as offersApi from '@/lib/api/offers'
import * as interpreterApi from '@/lib/api/interpreter'
import type { Applicant, InterpretRequest } from '@/lib/api/types'
import FactorBars from '@/components/omni/FactorBars'
import { Badge, Empty, Notice, Page, PageHeader, Section, Spinner, btnGhost, btnPrimary, errorMessage } from '@/components/omni/ui'
import { INDUSTRY_VERSION, industryPathLabel, industryTree } from '@/lib/omni/catalog'
import { sessionDateRange, slotStates, type AvailabilityRow } from '@/lib/omni/availability'
import { buildCandidate, evidenceSummaries, readProfile, toMatchRequest, type CandidateBuild } from '@/lib/omni/candidate'
import { FACTOR_LABELS, MATCH_VERSION, WEIGHTS, recommend, type FactorKey, type Ranked } from '@/lib/omni/matching'
import { MODE_LABELS, PURPOSE_LABELS, VERIFICATION_LABELS, formatKrw, pairLabel } from '@/lib/omni/labels'
import type { OmniCard } from '@/lib/omni/offer'
import { quote } from '@/lib/omni/pricing'
import { readOmniRequest, summarizeRequest } from '@/lib/omni/request-adapter'
import { hoursFromNow } from '@/lib/omni/time'
import type { InterpreterProfile, RequestInput, Verification } from '@/lib/omni/types'

const OFFER_TTL_HOURS = 24 // 응답 시간 초기값 제안 (명세 §1 개발 기본값: 버전으로 관리)

interface Row {
  applicant: Applicant
  profile: InterpreterProfile
  build: CandidateBuild
}

function nameOf(a: Applicant, p: InterpreterProfile) {
  return p.displayName || a.nameKr || a.nameEn || a.email || a.id
}

function topReasons(r: Ranked): string[] {
  return (Object.entries(r.factors) as [FactorKey, number | null][])
    .filter(([, v]) => v !== null && (v as number) > 0)
    .sort((a, b) => (b[1] as number) * WEIGHTS[b[0]] - (a[1] as number) * WEIGHTS[a[0]])
    .slice(0, 2)
    .map(([k, v]) => `${FACTOR_LABELS[k]} ${Math.round((v as number) * 100)}%`)
}

function toCard(r: Ranked, row: Row, req: RequestInput): OmniCard {
  const eligible = row.build.estimates.filter((e) => r.eligibleSlotIds.includes(e.sessionId))
  const chosen = req.schedule === 'ALL' ? eligible : eligible.slice(0, 1)
  const workKrw = chosen.length && chosen.every((e) => e.workKrw !== null) ? chosen.reduce((s, e) => s + (e.workKrw as number), 0) : null
  return {
    schema: 'OMNI-Card-v1',
    version: MATCH_VERSION,
    taxonomyVersion: INDUSTRY_VERSION,
    factors: r.factors,
    eligibleSlotIds: r.eligibleSlotIds,
    certainSlotIds: r.certainSlotIds,
    availability: r.certain ? 'CONFIRMED' : 'CHECK_REQUIRED',
    bookingMode: 'REQUEST',
    workKrw,
    estimatedChargeKrw: workKrw === null ? null : quote({ workKrw }).chargeKrw,
    pricePerSlot: row.build.estimates.map((e) => ({ slotId: e.sessionId, workKrw: e.workKrw })),
    reasons: topReasons(r),
    evidenceSummaries: evidenceSummaries(row.profile, req),
    displayName: nameOf(row.applicant, row.profile),
    request: req,
  }
}

function VerifyPanel({ row, onSaved }: { row: Row; onSaved: (a: Applicant) => void }) {
  const [busy, setBusy] = useState('')
  const [err, setErr] = useState('')
  const { applicant, profile } = row

  async function setVerification(kind: 'project' | 'employment', idx: number, v: Verification) {
    setBusy(`${kind}${idx}`)
    setErr('')
    const next: InterpreterProfile = kind === 'project'
      ? { ...profile, projects: profile.projects.map((p, i) => (i === idx ? { ...p, verification: v } : p)) }
      : { ...profile, employment: profile.employment.map((e, i) => (i === idx ? { ...e, verification: v } : e)) }
    try {
      const saved = await applicantsApi.updateApplicant(applicant.id, { payload: { ...(applicant.payload ?? {}), omni: next } })
      onSaved(saved)
    } catch (e) {
      setErr(errorMessage(e, '검증 상태를 저장하지 못했습니다.'))
    } finally {
      setBusy('')
    }
  }

  const buttons = (kind: 'project' | 'employment', idx: number, current?: Verification) => (
    <span className="flex shrink-0 gap-1">
      {(['VERIFIED', 'CHANGES_REQUESTED', 'REJECTED'] as Verification[]).map((v) => (
        <button key={v} type="button" disabled={busy === `${kind}${idx}` || current === v} onClick={() => setVerification(kind, idx, v)}
          className={`h-7 rounded-sm border px-2 text-[12px] ${current === v ? 'border-ink bg-ink text-white' : 'border-line-strong text-ink-2 hover:border-ink'}`}>
          {VERIFICATION_LABELS[v]}
        </button>
      ))}
    </span>
  )

  return (
    <div className="mt-3 space-y-3 border-t border-line pt-3 text-[13px]">
      {err && <Notice tone="danger">{err}</Notice>}
      <div>
        <p className="mb-1 font-semibold text-ink">프로젝트 경력 ({profile.projects.length})</p>
        {profile.projects.length === 0 && <p className="text-muted">없음</p>}
        <ul className="space-y-1.5">
          {profile.projects.map((p, i) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-sm bg-canvas px-2 py-1.5">
              <span className="min-w-0">
                <span className="font-medium text-ink">{p.title}</span>
                <span className="text-muted"> · {p.organizer} · {p.workedDates.length}일 · {p.interpreted ? '직접 통역' : '간접'} · {p.industry.primaryCode ?? '-'}</span>
                <span className="ml-1 text-subtle">[{VERIFICATION_LABELS[p.verification]}]</span>
              </span>
              {buttons('project', i, p.verification)}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="mb-1 font-semibold text-ink">회사·직무 경력 ({profile.employment.length})</p>
        {profile.employment.length === 0 && <p className="text-muted">없음</p>}
        <ul className="space-y-1.5">
          {profile.employment.map((e, i) => (
            <li key={i} className="flex flex-wrap items-center justify-between gap-2 rounded-sm bg-canvas px-2 py-1.5">
              <span className="min-w-0">
                <span className="font-medium text-ink">{e.employer}</span>
                <span className="text-muted"> · {e.job} · {e.from} ~ {e.to ?? '재직 중'} · {e.industry.primaryCode ?? '-'}</span>
                <span className="ml-1 text-subtle">[{VERIFICATION_LABELS[e.verification ?? 'PENDING']}]</span>
              </span>
              {buttons('employment', i, e.verification)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function RequestMatcher({ request, omni, applicants, onApplicantSaved }: {
  request: InterpretRequest
  omni: RequestInput
  applicants: Applicant[]
  onApplicantSaved: (a: Applicant) => void
}) {
  const offers = useSWR(['request-offers', request.id], () => offersApi.listRequestOffers(request.id), { shouldRetryOnError: false })
  // 가능 일정 — 계정이 연결된 통역사만 조회 (오퍼 interpreterId 와 같은 계정 id)
  const accountIds = useMemo(() => applicants.map((a) => a.linkedUserId).filter((x): x is string => !!x).sort(), [applicants])
  const range = useMemo(() => sessionDateRange(omni.sessions), [omni.sessions])
  const avail = useSWR(
    accountIds.length && range ? ['admin-availability', request.id, range.from, range.to, accountIds.join(',')] : null,
    () => interpreterApi.listAvailabilityForAdmin(accountIds, range?.from, range?.to),
    { shouldRetryOnError: false },
  )
  const [creating, setCreating] = useState('')
  const [msg, setMsg] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null)
  const [open, setOpen] = useState<string | null>(null)

  const { ranked, rows, failure } = useMemo(() => {
    const byInterpreter = new Map<string, AvailabilityRow[]>()
    for (const row of avail.data ?? []) {
      const list = byInterpreter.get(row.interpreterId) ?? []
      list.push(row)
      byInterpreter.set(row.interpreterId, list)
    }
    const rows: Row[] = applicants.map((a) => {
      const profile = readProfile((a.payload as Record<string, unknown> | null)?.omni)
      const mine = a.linkedUserId ? byInterpreter.get(a.linkedUserId) ?? [] : []
      return {
        applicant: a,
        profile,
        build: buildCandidate(profile, omni, {
          id: a.id,
          // 계정이 연결되지 않은 지원자는 오퍼를 받을 수 없어 추천에서 제외
          active: a.status === 'approved' && !a.blocked && !!a.linkedUserId,
          availability: slotStates(omni.sessions, mine),
        }),
      }
    })
    try {
      return { rows, ranked: recommend(toMatchRequest(omni), rows.map((r) => r.build.candidate), industryTree), failure: '' }
    } catch (e) {
      return { rows, ranked: [] as Ranked[], failure: errorMessage(e, '추천 계산 실패') }
    }
  }, [applicants, omni, avail.data])

  const offeredIds = new Set((offers.data ?? []).map((o) => o.interpreterId))
  const rankedIds = new Set(ranked.map((r) => r.id))

  async function propose(r: Ranked, row: Row) {
    const interpreterId = row.applicant.linkedUserId as string
    setCreating(r.id)
    setMsg(null)
    try {
      await offersApi.createOffer(request.id, {
        interpreterId,
        matchScore: r.score,
        scoreBreakdown: toCard(r, row, omni) as unknown as Record<string, unknown>,
        expiresAt: hoursFromNow(OFFER_TTL_HOURS),
      })
      setMsg({ tone: 'success', text: `${nameOf(row.applicant, row.profile)} 님에게 제안을 보냈습니다.` })
      offers.mutate()
    } catch (e) {
      setMsg({ tone: 'danger', text: errorMessage(e, '제안을 만들지 못했습니다.') })
    } finally {
      setCreating('')
    }
  }

  const excluded = rows.filter((r) => !rankedIds.has(r.applicant.id))

  return (
    <div className="space-y-5">
      <Section title="의뢰 조건" desc={<span className="tabular">{request.id} · {request.hospitalName ?? ''}</span>}>
        <p className="text-[14px] font-semibold text-ink">{omni.languagePairs.map(pairLabel).join(', ')} · {summarizeRequest(omni)}</p>
        <p className="mt-1 text-[13px] text-muted">
          {omni.industry.primaryCode ? industryPathLabel(omni.industry.primaryCode) : `직접 입력: ${omni.industry.otherText}`}
          {omni.industry.secondaryCodes.length > 0 && ` (+보조 ${omni.industry.secondaryCodes.length})`} · 경력 조건 {omni.requiredIndustry}
          · 일정 {omni.schedule} {omni.sessions.length}개 · 예산 {omni.budget ? `${omni.budget.kind} ${formatKrw(omni.budget.capKrw)}` : '없음'}
        </p>
        <p className="mt-2 text-[12px] text-subtle">
          가능 일정은 운영자 화면에서 조회할 수 없어 모든 슬롯을 ‘확인 필요’로 계산합니다. 확정 전 통역사 수락 단계에서 일정을 다시 검증합니다.
        </p>
      </Section>

      <Section title={`추천 결과 · ${ranked.length}명`} desc={`${MATCH_VERSION} · 사전 ${INDUSTRY_VERSION} · 후보 ${rows.length}명 중`}>
        {failure && <Notice tone="danger">{failure}</Notice>}
        {msg && <div className="mb-3"><Notice tone={msg.tone}>{msg.text}</Notice></div>}
        {ranked.length === 0 && !failure ? (
          <Empty title="조건을 충족하는 통역사가 없습니다">아래 ‘제외된 후보’에서 불충족 조건을 확인하고, 의뢰사에 날짜·지역·예산 변경을 제안하세요.</Empty>
        ) : (
          <ol className="space-y-3">
            {ranked.map((r, i) => {
              const row = rows.find((x) => x.applicant.id === r.id) as Row
              const card = toCard(r, row, omni)
              const already = offeredIds.has(row.applicant.linkedUserId ?? row.applicant.id)
              return (
                <li key={r.id} className="rounded-md border border-line p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[12px] text-subtle">{i + 1}순위</p>
                      <p className="text-[15px] font-semibold text-ink">{card.displayName}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <Badge tone={r.certain ? 'success' : 'warning'}>{r.certain ? '일정 확정' : '일정 확인 필요'}</Badge>
                        <Badge tone={r.priced ? 'neutral' : 'warning'}>{r.priced ? `예상 결제 ${formatKrw(card.estimatedChargeKrw)}` : '견적 확인 필요'}</Badge>
                        {already && <Badge tone="brand">제안 발송됨</Badge>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="tabular text-[22px] font-bold text-brand">{r.score}</p>
                      <button type="button" className={btnPrimary + ' mt-1 h-9'} disabled={already || creating === r.id} onClick={() => propose(r, row)}>
                        {creating === r.id && <Spinner />}제안 보내기
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-4 md:grid-cols-2">
                    <FactorBars factors={r.factors} />
                    <ul className="space-y-1 text-[13px] text-ink-2">
                      {[...card.reasons, ...card.evidenceSummaries].map((x) => <li key={x}>· {x}</li>)}
                      {card.workKrw !== null && <li className="text-muted">약정 통역료 {formatKrw(card.workKrw)}</li>}
                    </ul>
                  </div>
                  <button type="button" className={btnGhost + ' mt-2'} onClick={() => setOpen(open === r.id ? null : r.id)}>
                    {open === r.id ? '경력 검증 닫기' : '경력 검증'}
                  </button>
                  {open === r.id && <VerifyPanel row={row} onSaved={onApplicantSaved} />}
                </li>
              )
            })}
          </ol>
        )}
      </Section>

      <Section title={`제외된 후보 · ${excluded.length}명`} desc="필수 조건·일정·예산·필수 분야 경력 중 하나라도 충족하지 못한 통역사입니다.">
        {excluded.length === 0 ? (
          <p className="text-[13px] text-muted">없음</p>
        ) : (
          <ul className="divide-y divide-line">
            {excluded.map((row) => {
              const id = row.applicant.id
              const priced = row.build.estimates.map((e) => e.pick.kind)
              const reasons = row.build.failed.length
                ? row.build.failed.map((f) => `${f} 불충족`)
                : [
                    priced.includes('NOT_ALLOWED') ? '요금표에서 해당 조건 수행 불가' : '',
                    priced.some((k) => k === 'NO_RATE' || k === 'CONFIRMATION_REQUIRED') && omni.budget ? '예산 비교용 단가 산출 불가 → 견적 문의 대상' : '',
                    omni.requiredIndustry !== 'NONE' ? '필수 분야 검증 경력 부족 가능' : '',
                    '예산 초과 또는 일정 불가',
                  ].filter(Boolean).slice(0, 2)
              return (
                <li key={id} className="py-2.5 text-[13px]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-ink">{nameOf(row.applicant, row.profile)}</span>
                    <button type="button" className={btnGhost} onClick={() => setOpen(open === id ? null : id)}>{open === id ? '닫기' : '경력 검증'}</button>
                  </div>
                  <p className="text-muted">{reasons.join(' · ')}</p>
                  {open === id && <VerifyPanel row={row} onSaved={onApplicantSaved} />}
                </li>
              )
            })}
          </ul>
        )}
      </Section>
    </div>
  )
}

export default function AdminMatchingPage() {
  const requests = useSWR('admin/matching/requests', () => requestsApi.listInterpretRequests())
  const applicants = useSWR('admin/interpreters', () => applicantsApi.listApplicants())
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const omniRequests = (requests.data ?? [])
    .map((r) => ({ r, omni: readOmniRequest(r) }))
    .filter((x): x is { r: InterpretRequest; omni: RequestInput } => !!x.omni && x.r.status !== 'cancelled')
    .sort((a, b) => (b.r.createdAt ?? '').localeCompare(a.r.createdAt ?? ''))
  const selected = omniRequests.find((x) => x.r.id === selectedId) ?? omniRequests[0]

  return (
    <Page wide>
      <PageHeader title="의뢰 매칭" desc="조건 필터 → 순위 산식(유사 프로젝트 30 · 해당 분야 25 · 직무 20 · 전공 10 · 학력 5 · 체류 5 · 평가 5) → 최대 3명 제안" />
      {(requests.error || applicants.error) && (
        <div className="mb-4"><Notice tone="danger">{errorMessage(requests.error ?? applicants.error, '데이터를 불러오지 못했습니다.')}</Notice></div>
      )}
      {requests.isLoading || applicants.isLoading ? (
        <p className="text-[14px] text-muted">불러오는 중…</p>
      ) : omniRequests.length === 0 ? (
        <Empty title="매칭할 의뢰가 없습니다">의뢰사 포털에서 새 형식으로 등록된 의뢰만 표시됩니다.</Empty>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[18rem_1fr]">
          <ul className="space-y-1 lg:sticky lg:top-6 lg:self-start">
            {omniRequests.map(({ r, omni }) => {
              const on = selected?.r.id === r.id
              return (
                <li key={r.id}>
                  <button type="button" onClick={() => setSelectedId(r.id)}
                    className={`w-full rounded-md border px-3 py-2.5 text-left ${on ? 'border-brand bg-brand-soft' : 'border-line bg-surface hover:border-line-strong'}`}>
                    <p className="text-[13px] font-semibold text-ink">{omni.languagePairs.map(pairLabel).join(', ')}</p>
                    <p className="truncate text-[12px] text-muted">{omni.purposes.map((p) => PURPOSE_LABELS[p]).join('·')} · {omni.modes.map((m) => MODE_LABELS[m]).join('·')}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-subtle">
                      {r.assignedInterpreterId ? <Badge tone="success">선택 완료</Badge> : null}
                      {r.hospitalName ?? ''} · {r.startTime ? new Date(r.startTime).toLocaleDateString('ko-KR') : ''}
                    </p>
                  </button>
                </li>
              )
            })}
          </ul>
          {selected && (
            <RequestMatcher
              key={selected.r.id}
              request={selected.r}
              omni={selected.omni}
              applicants={applicants.data ?? []}
              onApplicantSaved={(a) => applicants.mutate((prev) => (prev ?? []).map((x) => (x.id === a.id ? a : x)), { revalidate: false })}
            />
          )}
        </div>
      )}
    </Page>
  )
}
