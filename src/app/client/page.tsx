'use client'

import Link from 'next/link'
import useSWR from 'swr'
import * as requestsApi from '@/lib/api/requests'
import type { InterpretRequest } from '@/lib/api/types'
import { industryPathLabel } from '@/lib/omni/catalog'
import { pairLabel } from '@/lib/omni/labels'
import { readOmniRequest, summarizeRequest } from '@/lib/omni/request-adapter'
import { Badge, Empty, Notice, Page, PageHeader, btnPrimary, errorMessage } from '@/components/omni/ui'

function statusOf(r: InterpretRequest): { label: string; tone: 'neutral' | 'brand' | 'success' | 'warning' } {
  if (r.status === 'cancelled' || r.omniStage === 'cancelled') return { label: '취소됨', tone: 'neutral' }
  if (r.omniStage === 'completed') return { label: '수행 완료', tone: 'neutral' }
  if (r.omniStage === 'in_progress') return { label: '진행 중', tone: 'success' }
  if (r.omniStage === 'paid') return { label: '예약 확정', tone: 'success' }
  if (r.omniStage === 'selected' || r.assignedInterpreterId) return { label: '통역사 선택 완료 · 결제 대기', tone: 'warning' }
  return { label: '추천 진행 중', tone: 'brand' }
}

function fmt(iso?: string | null) {
  if (!iso) return '-'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString('ko-KR', { dateStyle: 'medium', timeStyle: 'short' })
}

export default function ClientHome() {
  const { data = [], error, isLoading, mutate } = useSWR('hospital/requests', () => requestsApi.listInterpretRequests())
  const rows = [...data].sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))

  return (
    <Page wide>
      <PageHeader
        title="내 의뢰"
        desc="등록한 통역 의뢰와 추천 현황입니다. 서버가 조건에 맞는 통역사를 최대 3명 추천하고, 선택은 의뢰사가 합니다."
        actions={<Link href="/client/requests/new" className={btnPrimary}>+ 새 의뢰 등록</Link>}
      />

      {error && (
        <div className="mb-4">
          <Notice tone="danger">
            {errorMessage(error, '의뢰 목록을 불러오지 못했습니다.')}{' '}
            <button className="underline" onClick={() => mutate()}>다시 시도</button>
          </Notice>
        </div>
      )}

      {isLoading ? (
        <p className="text-[14px] text-muted">불러오는 중…</p>
      ) : rows.length === 0 ? (
        <Empty title="아직 등록한 의뢰가 없습니다">
          언어·업무·산업·일정을 입력하면 가능한 통역사를 추천해 드립니다.
          <div className="mt-4">
            <Link href="/client/requests/new" className={btnPrimary}>첫 의뢰 등록하기</Link>
          </div>
        </Empty>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
          {rows.map((r) => {
            const omni = readOmniRequest(r)
            const st = statusOf(r)
            return (
              <li key={r.id}>
                <Link href={`/client/requests/view?id=${encodeURIComponent(r.id)}`} className="block px-5 py-4 transition-colors hover:bg-canvas">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={st.tone}>{st.label}</Badge>
                    {!omni && <Badge>이전 형식 의뢰</Badge>}
                    <span className="text-[12px] text-subtle">{r.id}</span>
                  </div>
                  <p className="mt-1.5 text-[15px] font-semibold text-ink">
                    {omni ? omni.languagePairs.map(pairLabel).join(', ') : r.language ?? '-'}
                    <span className="ml-2 font-normal text-ink-2">{omni ? summarizeRequest(omni) : r.procedureContent ?? ''}</span>
                  </p>
                  <p className="mt-1 text-[13px] text-muted">
                    {omni?.industry.primaryCode ? industryPathLabel(omni.industry.primaryCode) : omni?.industry.otherText ?? r.department ?? '분야 미지정'}
                  </p>
                  <p className="mt-1 text-[12px] text-subtle">
                    {fmt(r.startTime)} ~ {fmt(r.endTime)}
                    {omni && ` · 세션 ${omni.sessions.length}개 · ${omni.sessions[0].place.city}`}
                  </p>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </Page>
  )
}
