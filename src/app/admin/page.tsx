'use client'

// 운영자 대시보드 — 실제 API 데이터(의뢰·통역사)만 집계한다. 결제·정산·분쟁 지표는 PG·원장 연동 후 추가 (명세 §9.3)
import Link from 'next/link'
import useSWR from 'swr'
import * as requestsApi from '@/lib/api/requests'
import * as applicantsApi from '@/lib/api/applicants'
import { Badge, Notice, Page, PageHeader, Section, btnPrimary, errorMessage } from '@/components/omni/ui'
import { industryPathLabel } from '@/lib/omni/catalog'
import { readProfile } from '@/lib/omni/candidate'
import { pairLabel } from '@/lib/omni/labels'
import { readOmniRequest, summarizeRequest } from '@/lib/omni/request-adapter'

function Stat({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface px-4 py-4">
      <p className="text-[13px] text-muted">{label}</p>
      <p className="tabular mt-1 text-[24px] font-bold tracking-[-0.02em] text-ink">{value}</p>
      {sub && <p className="mt-0.5 text-[12px] text-subtle">{sub}</p>}
    </div>
  )
}

export default function AdminDashboard() {
  const requests = useSWR('admin/matching/requests', () => requestsApi.listInterpretRequests())
  const applicants = useSWR('admin/interpreters', () => applicantsApi.listApplicants())

  const reqs = requests.data ?? []
  const omniReqs = reqs.map((r) => ({ r, omni: readOmniRequest(r) })).filter((x) => x.omni)
  const open = omniReqs.filter((x) => x.r.status !== 'cancelled' && !x.r.assignedInterpreterId)
  const apps = applicants.data ?? []
  const approved = apps.filter((a) => a.status === 'approved' && !a.blocked)
  const profiles = approved.map((a) => readProfile((a.payload as Record<string, unknown> | null)?.omni))
  const ready = profiles.filter((p) => p.industry.primaryCode && p.rates.length > 0).length
  const pendingEvidence = apps.reduce((sum, a) => {
    const p = readProfile((a.payload as Record<string, unknown> | null)?.omni)
    return sum + p.projects.filter((x) => x.verification === 'PENDING').length + p.employment.filter((x) => (x.verification ?? 'PENDING') === 'PENDING').length
  }, 0)

  const err = requests.error ?? applicants.error

  return (
    <Page wide>
      <PageHeader title="운영 대시보드" desc="추천 대기 의뢰, 경력 증빙 검토, 통역사 프로필 준비 상태" actions={<Link href="/admin/matching" className={btnPrimary}>의뢰 매칭으로</Link>} />
      {err && <div className="mb-4"><Notice tone="danger">{errorMessage(err, '데이터를 불러오지 못했습니다.')}</Notice></div>}

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="추천 대기 의뢰" value={open.length} sub={`전체 ${omniReqs.length}건`} />
        <Stat label="승인 통역사" value={approved.length} sub={`지원자 ${apps.length}명`} />
        <Stat label="추천 노출 가능" value={ready} sub="전문 산업 + 요금표 등록" />
        <Stat label="증빙 검토 대기" value={pendingEvidence} sub="프로젝트·회사 경력" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Section title="추천 대기 의뢰" aside={<Link href="/admin/matching" className="text-[13px] text-brand hover:underline">전체 보기</Link>}>
          {open.length === 0 ? (
            <p className="text-[13px] text-muted">대기 중인 의뢰가 없습니다.</p>
          ) : (
            <ul className="divide-y divide-line">
              {open.slice(0, 8).map(({ r, omni }) => (
                <li key={r.id} className="py-2.5 text-[13px]">
                  <p className="font-semibold text-ink">{omni!.languagePairs.map(pairLabel).join(', ')} · {summarizeRequest(omni!)}</p>
                  <p className="text-muted">
                    {r.hospitalName ?? '-'} · {omni!.industry.primaryCode ? industryPathLabel(omni!.industry.primaryCode) : omni!.industry.otherText}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="운영 연동 현황" desc="명세 §10 출시 검수표 기준">
          <ul className="space-y-2 text-[13px]">
            {[
              ['의뢰 등록 · 산업 사전 · 프로필 · 요금표', 'success', '연동'],
              ['추천 산식 (matching v1) · 오퍼 생성/수락/선택', 'success', '연동'],
              ['결제 견적 산식 (수수료 30% · 부가세 10% · 원천세 3.3%)', 'success', '화면 반영'],
              ['서버 추천 API · 예약 점유 · 고정 견적', 'warning', '백엔드 대기'],
              ['카드 결제 (토스페이먼츠) · 지급대행 · 대사', 'warning', 'PG 계약 대기'],
              ['현장 출근·연장 · 후기 · 분쟁 처리', 'neutral', '다음 단계'],
            ].map(([label, tone, state]) => (
              <li key={label} className="flex items-center justify-between gap-3">
                <span className="text-ink-2">{label}</span>
                <Badge tone={tone as 'success' | 'warning' | 'neutral'}>{state}</Badge>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </Page>
  )
}
