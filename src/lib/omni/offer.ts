// 오퍼의 scoreBreakdown — 명세 openapi `Card` 의 필드를 담는다.
// 운영자 콘솔이 추천 결과로 오퍼를 만들 때 쓰고, 의뢰사·통역사 화면이 같은 구조로 읽는다.
import type { Factors } from './matching'
import type { RequestInput } from './types'

export interface OmniCard {
  schema: 'OMNI-Card-v1'
  version: string
  taxonomyVersion: string
  factors: Partial<Factors>
  eligibleSlotIds: string[]
  certainSlotIds: string[]
  availability: 'CONFIRMED' | 'CHECK_REQUIRED'
  bookingMode: 'PRECONSENT' | 'REQUEST'
  /** 약정 통역료 누계(전 세션). 단가 확인이 필요하면 null */
  workKrw: number | null
  estimatedChargeKrw: number | null
  pricePerSlot: { slotId: string; workKrw: number | null }[]
  reasons: string[]
  evidenceSummaries: string[]
  displayName?: string
  /** 오퍼 시점 의뢰 조건 스냅샷 — 통역사는 의뢰 API(403)를 읽을 수 없어 카드에 함께 싣는다 */
  request?: RequestInput | null
}

export function readCard(raw: unknown): OmniCard | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Partial<OmniCard>
  if (o.schema !== 'OMNI-Card-v1') return null
  return {
    schema: 'OMNI-Card-v1',
    version: String(o.version ?? ''),
    taxonomyVersion: String(o.taxonomyVersion ?? ''),
    factors: o.factors ?? {},
    eligibleSlotIds: Array.isArray(o.eligibleSlotIds) ? o.eligibleSlotIds : [],
    certainSlotIds: Array.isArray(o.certainSlotIds) ? o.certainSlotIds : [],
    availability: o.availability === 'CONFIRMED' ? 'CONFIRMED' : 'CHECK_REQUIRED',
    bookingMode: o.bookingMode === 'PRECONSENT' ? 'PRECONSENT' : 'REQUEST',
    workKrw: typeof o.workKrw === 'number' ? o.workKrw : null,
    estimatedChargeKrw: typeof o.estimatedChargeKrw === 'number' ? o.estimatedChargeKrw : null,
    pricePerSlot: Array.isArray(o.pricePerSlot) ? o.pricePerSlot : [],
    reasons: Array.isArray(o.reasons) ? o.reasons : [],
    request: o.request && typeof o.request === 'object' && Array.isArray(o.request.sessions) ? o.request : null,
    evidenceSummaries: Array.isArray(o.evidenceSummaries) ? o.evidenceSummaries : [],
    displayName: typeof o.displayName === 'string' ? o.displayName : undefined,
  }
}

export const OFFER_STATUS_LABELS: Record<string, string> = {
  proposed: '통역사 수락 대기', // 백엔드 실제 초기 상태 (2026-11-23 확인)
  pending: '통역사 수락 대기',
  offered: '통역사 수락 대기',
  accepted: '수락 — 선택 가능',
  declined: '거절',
  withdrawn: '철회',
  selected: '선택됨',
  expired: '만료',
}

/** 통역사 응답 대기 상태인지 (백엔드 초기값은 'proposed') */
export function isAwaitingResponse(status: string | null | undefined): boolean {
  const s = (status ?? '').toLowerCase()
  return s === 'proposed' || s === 'pending' || s === 'offered'
}
