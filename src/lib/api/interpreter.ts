// 통역사 본인 API — 프로필·가능 일정
import { apiFetch } from './client'
import { asArray } from './offers'
import type { Applicant } from './types'

export function getMyProfile() {
  return apiFetch<Applicant | null>('/interpreter/profile')
}

/** payload 는 자유형 객체 — OMNI 프로필은 payload.omni 에 저장한다 */
export function saveMyProfile(input: {
  payload: Record<string, unknown>
  nameKr?: string | null
  phone?: string | null
  email?: string | null
}) {
  return apiFetch<Applicant>('/interpreter/profile', { method: 'PUT', body: JSON.stringify(input) })
}

export interface AvailabilitySlot {
  availableDate: string
  startTime?: string
  endTime?: string
  available?: boolean
  note?: string
}

export async function getMyAvailability(): Promise<AvailabilitySlot[]> {
  const raw = await apiFetch<unknown>('/interpreter/availability')
  return asArray<Record<string, unknown>>(raw)
    .map((s) => ({
      availableDate: String(s.availableDate ?? s.date ?? '').slice(0, 10),
      startTime: typeof s.startTime === 'string' ? s.startTime.slice(0, 5) : undefined,
      endTime: typeof s.endTime === 'string' ? s.endTime.slice(0, 5) : undefined,
      available: s.available === undefined ? true : Boolean(s.available),
      note: typeof s.note === 'string' ? s.note : undefined,
    }))
    .filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s.availableDate))
}

/** 운영자: 여러 통역사(계정 id)의 가능 일정 — 추천 시 세션별 가능 여부 판정용 */
export async function listAvailabilityForAdmin(interpreterIds: string[], from?: string, to?: string) {
  const q = new URLSearchParams({ interpreterIds: interpreterIds.join(',') })
  if (from) q.set('from', from)
  if (to) q.set('to', to)
  const raw = await apiFetch<unknown>(`/admin/availability?${q.toString()}`)
  return asArray<Record<string, unknown>>(raw).map((s) => ({
    interpreterId: String(s.interpreterId ?? ''),
    availableDate: String(s.availableDate ?? '').slice(0, 10),
    startTime: typeof s.startTime === 'string' ? s.startTime : null,
    endTime: typeof s.endTime === 'string' ? s.endTime : null,
    available: s.available === undefined ? true : Boolean(s.available),
  }))
}

export function saveMyAvailability(slots: AvailabilitySlot[]) {
  return apiFetch<unknown>('/interpreter/availability', { method: 'PUT', body: JSON.stringify({ slots }) })
}
