// OMNI RequestInput ↔ 현재 백엔드 CreateRequestDto 변환.
//
// 백엔드 `POST /hospital/requests` 는 의료 통역 시절 필드에 더해 `omniRequest`(명세 RequestInput)를 받는다.
//   - 서버가 omniRequest 를 검증하고 startTime/endTime/industryCode/omniStage 를 계산한다.
//   - 공통 필드(language, interpreterStyle, procedureContent, notes)는 운영 화면에서 읽기 쉽게 함께 채운다.
//   - 2026-11-23 이전 의뢰는 offerToken.omniRequest 에 저장돼 있어 읽을 때 둘 다 확인한다.
import type { InterpretRequest, InterpretRequestInput } from '@/lib/api/types'
import { industryPathLabel } from './catalog'
import { MODE_LABELS, PURPOSE_LABELS, ROLE_LABELS, pairLabel } from './labels'
import type { RequestInput } from './types'

export const OMNI_REQUEST_SCHEMA = 'OMNI-RequestInput-2026-11-20'

export function newRequestId() {
  const rand = Math.random().toString(36).slice(2, 8)
  return `req-${Date.now().toString(36)}-${rand}`
}

export function summarizeRequest(input: RequestInput): string {
  const parts = [
    input.roles.map((r) => ROLE_LABELS[r]).join('·'),
    input.modes.length ? input.modes.map((m) => MODE_LABELS[m]).join('·') : input.modeAdvice ? '방식 상담 필요' : '',
    input.purposes.map((p) => PURPOSE_LABELS[p]).join('·'),
  ].filter(Boolean)
  return parts.join(' / ')
}

export function toCreateRequestDto(
  input: RequestInput,
  meta: { id: string; companyName?: string | null; contactName?: string | null; phone?: string | null },
): InterpretRequestInput & { id: string } {
  const starts = input.sessions.map((s) => s.startsAt).sort()
  const ends = input.sessions.map((s) => s.endsAt).sort()
  const industry = input.industry.primaryCode
    ? industryPathLabel(input.industry.primaryCode)
    : input.industry.otherText ?? null
  return {
    id: meta.id,
    hospitalName: meta.companyName ?? null,
    contactName: meta.contactName ?? null,
    phone: meta.phone ?? null,
    language: input.languagePairs.map(pairLabel).join(', '),
    interpreterStyle: input.modes.map((m) => MODE_LABELS[m]).join(', ') || null,
    department: industry, // 백엔드 필드명은 의료 시절 '진료과' — 산업 경로를 담는다
    startTime: new Date(starts[0]).toISOString(),
    endTime: new Date(ends[ends.length - 1]).toISOString(),
    procedureContent: summarizeRequest(input),
    notes: input.brief ?? null,
    omniRequest: input as unknown as Record<string, unknown>,
    // 전환기 호환: omniRequest 컬럼이 없는 이전 백엔드(배포 전 api-dev)에서도 의뢰 구조가 남도록 함께 보낸다.
    // 새 백엔드가 배포되면 이 줄을 지운다.
    offerToken: { schema: OMNI_REQUEST_SCHEMA, omniRequest: input },
  }
}

/** 백엔드 의뢰 레코드에서 OMNI 구조를 복원. 구 의료 의뢰 등 구조가 없으면 null */
export function readOmniRequest(r: InterpretRequest | null | undefined): RequestInput | null {
  const token = r?.offerToken as Record<string, unknown> | null | undefined
  const raw = (r?.omniRequest ?? token?.omniRequest) as RequestInput | undefined
  if (!raw || !Array.isArray(raw.sessions) || !Array.isArray(raw.languagePairs) || !raw.industry) return null
  return raw
}
