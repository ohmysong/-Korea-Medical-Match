// 통역사 요금표에서 의뢰 조건에 맞는 단가를 고르고 보수를 산정한다 (명세 §3 통역사 프로필·가용일·가격표).
import type { Mode, Pair, PlaceType, Purpose, Rate, Role, Session } from './types'

export interface RateQuery {
  pair: Pair
  role: Role
  mode: Mode | null
  purposes: Purpose[]
  placeType: PlaceType | null
}

export type RatePick =
  | { kind: 'RATE'; rate: Rate }
  | { kind: 'NOT_ALLOWED'; rate: Rate }
  | { kind: 'CONFIRMATION_REQUIRED'; candidates: Rate[] }
  | { kind: 'NO_RATE' }

/** 프로필 언어쌍이 의뢰 언어쌍을 덮는가. 의뢰가 양방향이면 프로필도 양방향(또는 두 방향 모두)이어야 한다. */
export function pairCovers(profilePairs: Pair[], wanted: Pair): boolean {
  const canDo = (from: string, to: string) =>
    profilePairs.some(
      (p) => (p.from === from && p.to === to) || (p.direction === 'BOTH' && p.from === to && p.to === from),
    )
  return wanted.direction === 'BOTH' ? canDo(wanted.from, wanted.to) && canDo(wanted.to, wanted.from) : canDo(wanted.from, wanted.to)
}

function rateMatchesPair(rate: Rate, wanted: Pair) {
  return pairCovers([rate.pair], wanted)
}

/** null 조건은 '모든 값'에 적용된다. 지정된 조건은 일치해야 하며 일치한 상세 조건 수를 반환한다. */
function specificity(rate: Rate, q: RateQuery): number | null {
  let n = 0
  if (rate.mode) {
    if (rate.mode !== q.mode) return null
    n += 1
  }
  if (rate.purpose) {
    if (!q.purposes.includes(rate.purpose)) return null
    n += 1
  }
  if (rate.placeType) {
    if (rate.placeType !== q.placeType) return null
    n += 1
  }
  return n
}

const sameTerms = (a: Rate, b: Rate) =>
  a.unit === b.unit && a.priceKrw === b.priceKrw && (a.minMinutes ?? 0) === (b.minMinutes ?? 0) &&
  (a.overtimeKrw ?? null) === (b.overtimeKrw ?? null) && (a.overtimeUnitMinutes ?? null) === (b.overtimeUnitMinutes ?? null) &&
  (a.includedMinutes ?? null) === (b.includedMinutes ?? null)

/**
 * 1) 명시적 수행 불가를 먼저 적용한다.
 * 2) 가능 단가 중 상세 조건이 가장 많이 일치하는 행을 쓴다.
 * 3) 최상위 행들의 금액·최소시간·연장 조건이 다르면 견적 확인으로 보낸다.
 */
export function pickRate(rates: Rate[], q: RateQuery): RatePick {
  const applicable = rates
    .filter((r) => r.role === q.role && rateMatchesPair(r, q.pair))
    .map((r) => ({ r, s: specificity(r, q) }))
    .filter((x): x is { r: Rate; s: number } => x.s !== null)
  const blocked = applicable.find((x) => !x.r.allowed)
  if (blocked) return { kind: 'NOT_ALLOWED', rate: blocked.r }
  if (!applicable.length) return { kind: 'NO_RATE' }
  const top = Math.max(...applicable.map((x) => x.s))
  const best = applicable.filter((x) => x.s === top).map((x) => x.r)
  if (best.some((r) => r.unit === undefined || r.priceKrw === undefined)) return { kind: 'CONFIRMATION_REQUIRED', candidates: best }
  if (best.every((r) => sameTerms(r, best[0]))) return { kind: 'RATE', rate: best[0] }
  return { kind: 'CONFIRMATION_REQUIRED', candidates: best }
}

export function sessionMinutes(s: Pick<Session, 'startsAt' | 'endsAt'>): number {
  const ms = Date.parse(s.endsAt) - Date.parse(s.startsAt)
  return Number.isFinite(ms) && ms > 0 ? Math.round(ms / 60000) : 0
}

/**
 * 한 업무 줄의 보수. 시급은 max(최소 유급분, 합의 유급분) × 시급 ÷ 60 을 원 단위 반올림.
 * 일급은 예약된 일별 1회(포함시간 초과분은 연장 단가), 건당은 합의 업무 1회.
 */
export function lineWorkKrw(rate: Rate, paidMinutes: number): number | null {
  if (!rate.allowed || rate.priceKrw === undefined || !rate.unit) return null
  const minutes = Math.max(rate.minMinutes ?? 0, paidMinutes)
  if (rate.unit === 'HOUR') return Math.round((minutes * rate.priceKrw) / 60)
  if (rate.unit === 'JOB') return rate.priceKrw
  // DAY
  const included = rate.includedMinutes ?? 480
  const over = Math.max(0, minutes - included)
  if (!over) return rate.priceKrw
  if (!rate.overtimeKrw || !rate.overtimeUnitMinutes) return null // 연장 조건 미등록 → 견적 확인
  return rate.priceKrw + Math.ceil(over / rate.overtimeUnitMinutes) * rate.overtimeKrw
}
