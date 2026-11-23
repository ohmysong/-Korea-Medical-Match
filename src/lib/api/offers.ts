// 매칭 제안(오퍼) API — 운영자가 생성, 통역사가 수락/거절, 의뢰사가 최종 선택.
// 2026-11-23 기준 Swagger 에 응답 스키마가 없어("" schema) 응답은 방어적으로 정규화한다.
import { apiFetch } from './client'

export type OfferStatus = 'pending' | 'accepted' | 'declined' | 'withdrawn' | 'selected' | 'expired' | string

export interface RequestOffer {
  id: string
  requestId?: string | null
  interpreterId?: string | null
  interpreterName?: string | null
  status?: OfferStatus | null
  matchScore?: number | null
  scoreBreakdown?: Record<string, unknown> | null
  expiresAt?: string | null
  createdAt?: string | null
  declineReason?: string | null
  request?: Record<string, unknown> | null
  interpreter?: Record<string, unknown> | null
}

export interface CreateOfferInput {
  interpreterId: string
  matchScore?: number
  scoreBreakdown?: Record<string, unknown>
  expiresAt?: string
}

/** 배열 또는 {items|data|offers|slots: [...]} 형태 모두 허용 */
export function asArray<T>(value: unknown, keys: string[] = ['items', 'data', 'offers', 'slots', 'results']): T[] {
  if (Array.isArray(value)) return value as T[]
  if (value && typeof value === 'object') {
    for (const k of keys) {
      const v = (value as Record<string, unknown>)[k]
      if (Array.isArray(v)) return v as T[]
    }
  }
  return []
}

function str(v: unknown): string | null {
  return typeof v === 'string' ? v : typeof v === 'number' ? String(v) : null
}

export function normalizeOffer(raw: unknown): RequestOffer | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const id = str(o.id ?? o.offerId)
  if (!id) return null
  const interpreter = (o.interpreter && typeof o.interpreter === 'object' ? o.interpreter : null) as Record<string, unknown> | null
  const score = typeof o.matchScore === 'number' ? o.matchScore : typeof o.matchScore === 'string' ? Number(o.matchScore) : null
  return {
    id,
    requestId: str(o.requestId),
    interpreterId: str(o.interpreterId ?? interpreter?.id),
    interpreterName: str(o.interpreterName ?? interpreter?.displayName ?? interpreter?.nameKr ?? interpreter?.name),
    status: str(o.status),
    matchScore: Number.isFinite(score) ? score : null,
    scoreBreakdown: (o.scoreBreakdown && typeof o.scoreBreakdown === 'object' ? o.scoreBreakdown : null) as Record<string, unknown> | null,
    expiresAt: str(o.expiresAt),
    createdAt: str(o.createdAt),
    declineReason: str(o.declineReason),
    request: (o.request && typeof o.request === 'object' ? o.request : null) as Record<string, unknown> | null,
    interpreter,
  }
}

function normalizeList(raw: unknown) {
  return asArray<unknown>(raw).map(normalizeOffer).filter((x): x is RequestOffer => !!x)
}

// ── 의뢰사 ──
export async function listRequestOffers(requestId: string) {
  return normalizeList(await apiFetch<unknown>(`/hospital/requests/${encodeURIComponent(requestId)}/offers`))
}

export function selectOffer(requestId: string, offerId: string) {
  return apiFetch<unknown>(`/hospital/requests/${encodeURIComponent(requestId)}/offers/select`, {
    method: 'POST',
    body: JSON.stringify({ offerId }),
  })
}

// ── 운영자 ──
export function createOffer(requestId: string, input: CreateOfferInput) {
  return apiFetch<unknown>(`/admin/requests/${encodeURIComponent(requestId)}/offers`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

// ── 통역사 ──
export async function listMyOffers() {
  return normalizeList(await apiFetch<unknown>('/interpreter/offers'))
}

export function respondOffer(offerId: string, status: 'accepted' | 'declined' | 'withdrawn', declineReason?: string) {
  return apiFetch<unknown>(`/interpreter/offers/${encodeURIComponent(offerId)}`, {
    method: 'PATCH',
    body: JSON.stringify(declineReason ? { status, declineReason } : { status }),
  })
}
