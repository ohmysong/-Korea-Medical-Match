// 통역사 가능 일정(availableDate + 선택적 시간대) → 의뢰 세션별 SlotState.
// 명세 §5: 확정 가능(AVAILABLE)만 '일정 확정 가능'으로 표시하고, 판단할 근거가 부족하면 UNKNOWN(확인 필요).
// 통역사가 '불가'로 등록한 날·시간과 겹치면 BUSY 로 추천에서 제외된다.
import type { SlotState } from './matching'
import { splitZoned } from './time'
import type { Session } from './types'

export interface AvailabilityRow {
  interpreterId: string
  availableDate: string
  startTime?: string | null
  endTime?: string | null
  available?: boolean | null
}

const hm = (t: string | null | undefined) => (t ? t.slice(0, 5) : null)

export function sessionSlotState(session: Session, rows: AvailabilityRow[]): SlotState {
  const start = splitZoned(session.startsAt, session.timezone)
  const end = splitZoned(session.endsAt, session.timezone)
  if (!start.date) return 'UNKNOWN'
  const sameDay = start.date === end.date
  const day = rows.filter((r) => String(r.availableDate).slice(0, 10) === start.date)
  if (day.length === 0) return 'UNKNOWN'

  const overlaps = (r: AvailabilityRow) => {
    const a = hm(r.startTime)
    const b = hm(r.endTime)
    if (!a || !b) return true // 시간 없이 하루 전체
    return !sameDay || (a < end.time && b > start.time)
  }
  const covers = (r: AvailabilityRow) => {
    const a = hm(r.startTime)
    const b = hm(r.endTime)
    if (!a || !b) return sameDay
    return sameDay && a <= start.time && b >= end.time
  }

  if (day.some((r) => r.available === false && overlaps(r))) return 'BUSY'
  if (day.some((r) => r.available !== false && covers(r))) return 'AVAILABLE'
  return 'UNKNOWN'
}

/** 세션 ID → SlotState */
export function slotStates(sessions: Session[], rows: AvailabilityRow[]): Record<string, SlotState> {
  return Object.fromEntries(sessions.map((s) => [s.id, sessionSlotState(s, rows)]))
}

/** 조회 기간: 세션 현지 날짜의 최소~최대 */
export function sessionDateRange(sessions: Session[]): { from: string; to: string } | null {
  const days = sessions.flatMap((s) => [splitZoned(s.startsAt, s.timezone).date, splitZoned(s.endsAt, s.timezone).date]).filter(Boolean).sort()
  return days.length ? { from: days[0], to: days[days.length - 1] } : null
}
