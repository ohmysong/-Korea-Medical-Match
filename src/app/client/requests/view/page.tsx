'use client'

// 의뢰 상세 — 후보 카드(최대 3명), 선택, 결제 요약 (명세 §5.3, §6, §2)
import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import * as requestsApi from '@/lib/api/requests'
import * as offersApi from '@/lib/api/offers'
import type { RequestOffer } from '@/lib/api/offers'
import FactorBars from '@/components/omni/FactorBars'
import { ClientQuote } from '@/components/omni/QuoteBreakdown'
import { Badge, Empty, Notice, Page, PageHeader, Section, Spinner, btnPrimary, btnSecondary, errorMessage } from '@/components/omni/ui'
import { industryPathLabel } from '@/lib/omni/catalog'
import {
  DELIVERY_LABELS, EXPENSE_KIND_LABELS, EXPENSE_PROVISION_LABELS, MODE_LABELS, PLACE_TYPE_LABELS, PURPOSE_LABELS,
  REQUIRED_INDUSTRY_LABELS, ROLE_LABELS, SCHEDULE_LABELS, WORKPLACE_LABELS, formatKrw, pairLabel,
} from '@/lib/omni/labels'
import { OFFER_STATUS_LABELS, readCard } from '@/lib/omni/offer'
import { readOmniRequest } from '@/lib/omni/request-adapter'
import { formatSession } from '@/lib/omni/time'
import type { RequestInput } from '@/lib/omni/types'

function Dl({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="grid gap-x-6 gap-y-2 text-[13px] sm:grid-cols-[8rem_1fr]">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-muted">{k}</dt>
          <dd className="text-ink">{v}</dd>
        </div>
      ))}
    </dl>
  )
}

function RequestSummary({ omni }: { omni: RequestInput }) {
  const ind = omni.industry
  return (
    <div className="space-y-4">
      <Dl
        rows={[
          ['언어', omni.languagePairs.map(pairLabel).join(', ')],
          ['역할', omni.roles.map((r) => ROLE_LABELS[r]).join(' · ')],
          ['통역 방식', omni.modes.length ? omni.modes.map((m) => MODE_LABELS[m]).join(' · ') : omni.modeAdvice ? '상담 필요' : '-'],
          ['업무·목적', omni.purposes.map((p) => PURPOSE_LABELS[p]).join(' · ')],
          ['주산업', ind.primaryCode ? `${industryPathLabel(ind.primaryCode)} (${ind.primaryCode})` : `직접 입력: ${ind.otherText}`],
          ...(ind.secondaryCodes.length ? [['보조산업', ind.secondaryCodes.map((c) => industryPathLabel(c)).join(' / ')] as [string, string]] : []),
          ['경력 조건', REQUIRED_INDUSTRY_LABELS[omni.requiredIndustry]],
          ['일정 조건', `${SCHEDULE_LABELS[omni.schedule]} · ${omni.headcount}명`],
          ['예산', omni.budget ? `${omni.budget.kind === 'TOTAL' ? '총 결제액' : '통역료'} 상한 ${formatKrw(omni.budget.capKrw)}` : '상한 없음'],
          ['경비', omni.expenses.length ? omni.expenses.map((e) => `${EXPENSE_KIND_LABELS[e.kind]} ${EXPENSE_PROVISION_LABELS[e.provision]}`).join(', ') : '지원 없음'],
        ]}
      />
      <ol className="space-y-2">
        {omni.sessions.map((s, i) => (
          <li key={s.id} className="rounded-md border border-line px-3 py-2 text-[13px]">
            <span className="font-semibold text-ink">일정 {i + 1}</span>{' '}
            <span className="tabular text-ink-2">{formatSession(s.startsAt, s.timezone)} ~ {formatSession(s.endsAt, s.timezone).split(' ').slice(-2).join(' ')}</span>
            <span className="ml-1 text-subtle">({s.timezone})</span>
            <p className="mt-0.5 text-muted">
              {WORKPLACE_LABELS[s.place.workplace]} · {DELIVERY_LABELS[s.place.delivery]}
              {s.place.workplace === 'ONSITE' && ` · ${PLACE_TYPE_LABELS[s.place.type]}`} · {s.place.city}
              {s.place.name && ` · ${s.place.name}`}{s.place.detail && ` / ${s.place.detail}`}
            </p>
          </li>
        ))}
      </ol>
      {omni.brief && <p className="whitespace-pre-wrap rounded-md bg-canvas px-3 py-2 text-[13px] text-ink-2">{omni.brief}</p>}
    </div>
  )
}

function OfferCard({
  offer, rank, canSelect, selected, onSelect, busy,
}: { offer: RequestOffer; rank: number; canSelect: boolean; selected: boolean; onSelect: () => void; busy: boolean }) {
  const card = readCard(offer.scoreBreakdown)
  const status = (offer.status ?? 'proposed').toLowerCase()
  const accepted = status === 'accepted' || card?.bookingMode === 'PRECONSENT'
  return (
    <article className={`rounded-lg border bg-surface p-5 ${selected ? 'border-success' : 'border-line'}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[12px] text-subtle">추천 {rank}순위</p>
          <p className="text-[16px] font-semibold text-ink">{card?.displayName ?? offer.interpreterName ?? `통역사 ${offer.interpreterId ?? ''}`}</p>
        </div>
        <div className="text-right">
          <p className="tabular text-[22px] font-bold text-brand">{offer.matchScore ?? '-'}<span className="text-[13px] font-medium text-muted">점</span></p>
          <div className="mt-1 flex flex-wrap justify-end gap-1">
            <Badge tone={selected ? 'success' : accepted ? 'brand' : status === 'declined' || status === 'withdrawn' ? 'danger' : 'warning'}>
              {selected ? '선택됨' : OFFER_STATUS_LABELS[status] ?? status}
            </Badge>
            {card && <Badge tone={card.availability === 'CONFIRMED' ? 'success' : 'warning'}>{card.availability === 'CONFIRMED' ? '일정 확정 가능' : '일정 확인 필요'}</Badge>}
          </div>
        </div>
      </div>

      {card && (
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          <div>
            {(card.reasons.length > 0 || card.evidenceSummaries.length > 0) && (
              <ul className="mb-3 space-y-1 text-[13px] text-ink">
                {[...card.reasons, ...card.evidenceSummaries].slice(0, 4).map((r) => <li key={r}>· {r}</li>)}
              </ul>
            )}
            <FactorBars factors={card.factors} />
          </div>
          <div className="rounded-md bg-canvas px-4 py-3">
            {card.workKrw !== null ? (
              <>
                <p className="mb-1 text-[12px] font-semibold text-muted">예상 결제액</p>
                <ClientQuote workKrw={card.workKrw} />
              </>
            ) : (
              <p className="text-[13px] text-warning">단가 조건 확인이 필요해 통역사 회신 후 견적이 확정됩니다.</p>
            )}
          </div>
        </div>
      )}

      {!selected && canSelect && (
        <div className="mt-4 flex justify-end">
          <button type="button" className={btnPrimary} disabled={!accepted || busy} onClick={onSelect}>
            {busy && <Spinner />}
            {accepted ? '이 통역사로 선택' : '통역사 수락 후 선택 가능'}
          </button>
        </div>
      )}
    </article>
  )
}

function RequestView() {
  const id = useSearchParams().get('id') ?? ''
  const req = useSWR(id ? ['hospital/requests', id] : null, () => requestsApi.getInterpretRequest(id))
  const offers = useSWR(id ? ['hospital/requests/offers', id] : null, () => offersApi.listRequestOffers(id))
  const [busy, setBusy] = useState('')
  const [actionError, setActionError] = useState('')

  if (!id) return <Page><Empty title="의뢰 번호가 없습니다"><Link href="/client" className="text-brand underline">내 의뢰로 이동</Link></Empty></Page>
  if (req.isLoading) return <Page><p className="text-[14px] text-muted">불러오는 중…</p></Page>
  if (req.error || !req.data) {
    return <Page><Notice tone="danger">{errorMessage(req.error, '의뢰를 불러오지 못했습니다.')}</Notice></Page>
  }

  const r = req.data
  const omni = readOmniRequest(r)
  const list = [...(offers.data ?? [])]
    .filter((o) => !['declined', 'withdrawn', 'expired'].includes((o.status ?? '').toLowerCase()))
    .sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0))
    .slice(0, 3)
  const chosenId = r.assignedInterpreterId ?? list.find((o) => (o.status ?? '').toLowerCase() === 'selected')?.interpreterId ?? null
  const chosen = chosenId ? list.find((o) => o.interpreterId === chosenId) ?? null : null
  const chosenCard = readCard(chosen?.scoreBreakdown)
  const cancelled = r.status === 'cancelled'

  async function select(offer: RequestOffer) {
    setBusy(offer.id)
    setActionError('')
    try {
      await offersApi.selectOffer(id, offer.id)
      await Promise.all([req.mutate(), offers.mutate()])
    } catch (err) {
      setActionError(errorMessage(err, '선택하지 못했습니다.'))
    } finally {
      setBusy('')
    }
  }

  return (
    <Page wide>
      <PageHeader
        title="의뢰 상세"
        desc={<span className="tabular">{r.id}{cancelled && ' · 취소됨'}</span>}
        actions={<Link href="/client" className={btnSecondary}>목록으로</Link>}
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
        <div className="min-w-0 space-y-5">
          <Section
            title="추천 통역사"
            desc="검증된 직접 통역 경력·유사 프로젝트·관련 직무를 기준으로 최대 3명을 보여 드립니다. 통역사가 조건을 수락하면 선택할 수 있습니다."
            aside={<button type="button" className="text-[13px] text-brand hover:underline" onClick={() => offers.mutate()}>새로고침</button>}
          >
            {actionError && <div className="mb-3"><Notice tone="danger">{actionError}</Notice></div>}
            {offers.error ? (
              <Notice tone="danger">{errorMessage(offers.error, '추천 목록을 불러오지 못했습니다.')}</Notice>
            ) : offers.isLoading ? (
              <p className="text-[13px] text-muted">불러오는 중…</p>
            ) : list.length === 0 ? (
              <Empty title="추천을 준비하고 있습니다">
                조건에 맞는 통역사를 찾는 중입니다. 후보가 부족하면 날짜·지역·예산 조건을 조정하거나, 인증 통역사 대상 제한 모집으로 전환할 수 있습니다.
              </Empty>
            ) : (
              <div className="space-y-3">
                {list.map((o, i) => (
                  <OfferCard
                    key={o.id}
                    offer={o}
                    rank={i + 1}
                    canSelect={!chosenId && !cancelled}
                    selected={!!chosenId && o.interpreterId === chosenId}
                    onSelect={() => select(o)}
                    busy={busy === o.id}
                  />
                ))}
              </div>
            )}
          </Section>

          <Section title="의뢰 내용">
            {omni ? (
              <RequestSummary omni={omni} />
            ) : (
              <Dl rows={[['언어', r.language ?? '-'], ['내용', r.procedureContent ?? '-'], ['분야', r.department ?? '-'], ['메모', r.notes ?? '-']]} />
            )}
          </Section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-lg border border-line bg-surface p-5">
            <p className="text-[14px] font-semibold text-ink">결제</p>
            {chosenCard?.workKrw != null ? (
              <>
                <div className="mt-2"><ClientQuote workKrw={chosenCard.workKrw} /></div>
                <button type="button" className={btnPrimary + ' mt-4 w-full'} disabled>카드 결제</button>
                <p className="mt-2 text-[12px] leading-relaxed text-subtle">
                  카드 결제는 PG(토스페이먼츠) 계약 후 활성화됩니다. 결제 금액은 서버의 고정 견적으로 확정되며, 승인 후 예약이 확정됩니다.
                </p>
              </>
            ) : chosenId ? (
              <p className="mt-2 text-[13px] text-warning">선택한 통역사의 단가 확인 후 견적이 발행됩니다.</p>
            ) : (
              <p className="mt-2 text-[13px] text-muted">통역사를 선택하면 약정 통역료·옴니 중개수수료(30%)·수수료 부가세(10%)가 표시됩니다.</p>
            )}
          </div>
          <p className="px-1 text-[12px] leading-relaxed text-subtle">
            통역 완료가 확인되면 옴니가 통역사 실지급액을 지급대행사에 자동 요청합니다. 거래명세에는 통역사 보수와 옴니 중개수수료·부가세가 구분되어 표시됩니다.
          </p>
        </aside>
      </div>
    </Page>
  )
}

export default function RequestViewPage() {
  return (
    <Suspense fallback={<Page><p className="text-[14px] text-muted">불러오는 중…</p></Page>}>
      <RequestView />
    </Suspense>
  )
}
