// 현지 IANA 시간대의 날짜·시각 ↔ UTC 오프셋 포함 ISO 문자열 (명세 §6: 현지 시간대와 UTC 를 함께 보존)

function offsetFor(timeZone: string, at: Date): string {
  try {
    const part = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' })
      .formatToParts(at)
      .find((p) => p.type === 'timeZoneName')?.value
    const m = part?.match(/GMT([+-]\d{2}):?(\d{2})?/)
    if (m) return `${m[1]}:${m[2] ?? '00'}`
    if (part === 'GMT') return '+00:00'
  } catch {
    // 알 수 없는 시간대
  }
  return '+09:00'
}

/** '2026-12-03', '09:00', 'Asia/Seoul' → '2026-12-03T09:00:00+09:00' */
export function zonedIso(date: string, time: string, timeZone: string): string {
  const guess = new Date(`${date}T${time}:00Z`)
  const off = offsetFor(timeZone, Number.isNaN(guess.getTime()) ? new Date() : guess)
  return `${date}T${time}:00${off}`
}

/** ISO → 해당 시간대의 { date, time } */
export function splitZoned(iso: string, timeZone: string): { date: string; time: string } {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return { date: '', time: '' }
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(d)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  return { date: `${get('year')}-${get('month')}-${get('day')}`, time: `${get('hour')}:${get('minute')}` }
}

export function formatSession(iso: string, timeZone: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('ko-KR', { timeZone, month: 'long', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit' })
}

/** 이벤트 핸들러·표시용 현재 시각 헬퍼 (렌더 순수성 규칙 때문에 컴포넌트 본문에서 Date.now 를 직접 부르지 않는다) */
export function hoursFromNow(hours: number): string {
  return new Date(Date.now() + hours * 3600000).toISOString()
}

export function isPast(iso: string | null | undefined): boolean {
  if (!iso) return false
  const t = Date.parse(iso)
  return Number.isFinite(t) && t < Date.now()
}

export const TIMEZONES = ['Asia/Seoul', 'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Ho_Chi_Minh', 'Asia/Singapore', 'Asia/Dubai', 'Europe/London', 'Europe/Berlin', 'America/New_York', 'America/Los_Angeles']
