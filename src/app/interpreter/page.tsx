'use client'

// 통역사 — 매칭 제안 목록과 수락/거절 (명세 §6 후보 선택: 사전동의 범위 밖은 통역사 수락 후 결제)
import { useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import * as offersApi from '@/lib/api/offers'
import type { RequestOffer } from '@/lib/api/offers'
import type { InterpretRequest } from '@/lib/api/types'
import { SellerSettlement } from '@/components/omni/QuoteBreakdown'
import { Badge, Empty, Notice, Page, PageHeader, Spinner, btnPrimary, btnSecondary, errorMessage, inputCls } from '@/components/omni/ui'
import { industryPathLabel } from '@/lib/omni/catalog'
import { MODE_LABELS, PURPOSE_LABELS, ROLE_LABELS, pairLabel } from '@/lib/omni/labels'
import { OFFER_STATUS_LABELS, isAwaitingResponse, readCard } from '@/lib/omni/offer'
import { readOmniRequest } from '@/lib/omni/request-adapter'
import { formatSession, isPast } from '@/lib/omni/time'
import { useInterpreterProfile } from '@/lib/omni/use-interpreter-profile'

function OfferItem({ offer, onChanged }: { offer: RequestOffer; onChanged: () => void }) {
  const [busy, setBusy] = useState(false)
  const [declining, setDeclining] = useState(false)
  const [reason, setReason] = useState('')
  const [err, setErr] = useState('')
  const card = readCard(offer.scoreBreakdown)
  const omni = readOmniRequest(offer.request as InterpretRequest | null) ?? card?.request ?? null
  const status = (offer.status ?? 'proposed').toLowerCase()
  const pending = isAwaitingResponse(status)
  const expired = isPast(offer.expiresAt)

  async function respond(next: 'accepted' | 'declined') {
    setBusy(true)
    setErr('')
    try {
      await offersApi.respondOffer(offer.id, next, next === 'declined' ? reason || undefined : undefined)
      onChanged()
    } catch (e) {
      setErr(errorMessage(e, '응답을 저장하지 못했습니다.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className="rounded-lg border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={pending ? 'warning' : status === 'accepted' || status === 'selected' ? 'success' : 'neutral'}>{OFFER_STATUS_LABELS[status] ?? status}</Badge>
        {offer.matchScore != null && <Badge tone="brand">적합도 {offer.matchScore}점</Badge>}
        {offer.expiresAt && <span className="text-[12px] text-subtle">응답 기한 {new Date(offer.expiresAt).toLocaleString('ko-KR')}</span>}
      </div>

      {omni ? (
        <div className="mt-3">
          <p className="text-[15px] font-semibold text-ink">
            {omni.languagePairs.map(pairLabel).join(', ')} · {omni.roles.map((r) => ROLE_LABELS[r]).join('·')}
            {omni.modes.length > 0 && ` · ${omni.modes.map((m) => MODE_LABELS[m]).join('·')}`}
          </p>
          <p className="mt-1 text-[13px] text-muted">
            {omni.purposes.map((p) => PURPOSE_LABELS[p]).join(' · ')} · {omni.industry.primaryCode ? industryPathLabel(omni.industry.primaryCode) : omni.industry.otherText}
          </p>
          <ul className="mt-2 space-y-0.5 text-[13px] text-ink-2">
            {omni.sessions.map((s) => (
              <li key={s.id} className="tabular">
                {formatSession(s.startsAt, s.timezone)} ~ {formatSession(s.endsAt, s.timezone).split(' ').slice(-2).join(' ')} · {s.place.city}{s.place.name ? ` ${s.place.name}` : ''}
              </li>
            ))}
          </ul>
          {omni.brief && <p className="mt-2 rounded-md bg-canvas px-3 py-2 text-[13px] text-ink-2">{omni.brief}</p>}
        </div>
      ) : (
        <p className="mt-3 text-[13px] text-muted">의뢰 {offer.requestId ?? ''} — 상세 조건은 운영자 안내를 확인해 주세요.</p>
      )}

      {card?.workKrw != null && (
        <div className="mt-4 max-w-sm rounded-md bg-canvas px-4 py-3">
          <p className="mb-1 text-[12px] font-semibold text-muted">예상 정산 (원천징수 대상 국내 거주 프리랜서 기준)</p>
          <SellerSettlement workKrw={card.workKrw} />
        </div>
      )}

      {err && <div className="mt-3"><Notice tone="danger">{err}</Notice></div>}

      {pending && !expired && (
        declining ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <input className={inputCls + ' max-w-xs'} placeholder="거절 사유 (선택)" value={reason} onChange={(e) => setReason(e.target.value)} />
            <button type="button" className={btnSecondary} disabled={busy} onClick={() => respond('declined')}>거절 확정</button>
            <button type="button" className={btnSecondary} onClick={() => setDeclining(false)}>취소</button>
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className={btnPrimary} disabled={busy} onClick={() => respond('accepted')}>{busy && <Spinner />}조건 수락</button>
            <button type="button" className={btnSecondary} disabled={busy} onClick={() => setDeclining(true)}>거절</button>
          </div>
        )
      )}
    </article>
  )
}

export default function InterpreterHome() {
  const { data = [], error, isLoading, mutate } = useSWR('interpreter/offers', () => offersApi.listMyOffers())
  const { profile, isLoading: profileLoading } = useInterpreterProfile()
  const incomplete = !profileLoading && (!profile.industry.primaryCode || profile.rates.length === 0)
  const sorted = [...data].sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))

  return (
    <Page>
      <PageHeader title="매칭 제안" desc="옴니가 조건에 맞는 의뢰를 제안합니다. 수락하면 의뢰사가 최종 선택하고 결제 후 예약이 확정됩니다." />
      {incomplete && (
        <div className="mb-4">
          <Notice tone="warning">
            전문 산업과 요금표를 등록해야 추천에 노출됩니다.{' '}
            <Link href="/interpreter/profile" className="font-semibold underline">프로필 완성하기</Link>
          </Notice>
        </div>
      )}
      {error && <div className="mb-4"><Notice tone="danger">{errorMessage(error, '제안 목록을 불러오지 못했습니다.')}</Notice></div>}
      {isLoading ? (
        <p className="text-[14px] text-muted">불러오는 중…</p>
      ) : sorted.length === 0 ? (
        <Empty title="아직 받은 제안이 없습니다">검증된 프로젝트 경력과 가능 일정을 등록하면 추천 가능성이 높아집니다.</Empty>
      ) : (
        <div className="space-y-3">{sorted.map((o) => <OfferItem key={o.id} offer={o} onChanged={() => mutate()} />)}</div>
      )}
    </Page>
  )
}
