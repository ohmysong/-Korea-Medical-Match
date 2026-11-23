// 의뢰(RequestInput)와 통역사 프로필(InterpreterProfile)을 추천 엔진 입력으로 변환한다.
// 명세상 이 변환은 서버가 만든다 (§5.3 "추천 점수와 검증 상태는 클라이언트 입력으로 받지 않는다").
// 백엔드에 `POST /v1/requests/{id}/recommendations` 가 생기기 전까지 운영자 콘솔이 같은 규칙으로 계산한다.
import { industryNode, industryTree, rootOf, INDUSTRY_VERSION } from './catalog'
import type { MatchCandidate, MatchRequest, SlotState } from './matching'
import { quote } from './pricing'
import { lineWorkKrw, pairCovers, pickRate, sessionMinutes, type RatePick } from './rates'
import type { IndustrySelection, InterpreterProfile, Mode, RequestInput, Session } from './types'

export function emptyIndustry(): IndustrySelection {
  return { version: INDUSTRY_VERSION, primaryCode: null, secondaryCodes: [], otherText: null }
}

export function emptyProfile(): InterpreterProfile {
  return {
    displayName: '',
    introduction: '',
    languagePairs: [{ from: 'ko', to: 'en', direction: 'BOTH' }],
    roles: ['INTERPRET'],
    modes: ['CONSECUTIVE'],
    workplaces: ['ONSITE', 'REMOTE'],
    industry: emptyIndustry(),
    rates: [],
    multiDay: true,
    homeCity: '서울',
    domesticRegions: [],
    overseasCountries: [],
    credentials: [],
    degree: '',
    major: '',
    majorRootCodes: [],
    education: 'NONE',
    employment: [],
    residences: [],
    projects: [],
  }
}

/** 저장된 payload 를 안전하게 프로필로 복원 (누락 필드는 기본값) */
export function readProfile(raw: unknown): InterpreterProfile {
  const base = emptyProfile()
  if (!raw || typeof raw !== 'object') return base
  return { ...base, ...(raw as Partial<InterpreterProfile>) }
}

export function selectionCodes(sel: IndustrySelection | undefined | null): string[] {
  if (!sel?.primaryCode) return []
  return [sel.primaryCode, ...sel.secondaryCodes]
}

export function toMatchRequest(req: RequestInput): MatchRequest {
  return {
    industries: selectionCodes(req.industry),
    requiredIndustry: req.industry.primaryCode ? req.requiredIndustry : 'NONE',
    // SPLIT 은 명세상 자리별 순위다. 자리(seat) 분리가 백엔드에 생기기 전까지 세션 단위 택일로 계산한다.
    schedule: req.schedule === 'ALL' ? 'ALL' : 'ANY',
    slotIds: req.sessions.map((s) => s.id),
    needsInterpreting: req.roles.includes('INTERPRET'),
    purposes: req.purposes,
    modes: req.modes,
    roles: req.roles,
    budgetCapKrw: req.budget ? req.budget.capKrw : null,
  }
}

export interface SessionEstimate {
  sessionId: string
  minutes: number
  pick: RatePick
  workKrw: number | null
}

/** 주 역할·첫 통역 방식·세션 장소 유형으로 단가를 고르고 세션 보수를 계산한다 */
export function estimateSession(profile: InterpreterProfile, req: RequestInput, session: Session): SessionEstimate {
  const minutes = sessionMinutes(session)
  const pick = pickRate(profile.rates, {
    pair: req.languagePairs[0],
    role: req.roles[0],
    mode: req.modes[0] ?? null,
    purposes: req.purposes,
    placeType: session.place.type,
  })
  const workKrw = pick.kind === 'RATE' ? lineWorkKrw(pick.rate, minutes) : null
  return { sessionId: session.id, minutes, pick, workKrw }
}

/** 예산 비교값: 통역료 상한이면 보수, 총액 상한이면 수수료·수수료 부가세 포함 결제액 */
export function budgetValue(req: RequestInput, workKrw: number | null): number | null {
  if (workKrw === null) return null
  if (!req.budget || req.budget.kind === 'TOTAL') return quote({ workKrw }).chargeKrw
  return workKrw
}

const DAY_MS = 86400000

function dayIntervals(ranges: { from: string; to: string | null }[]): number {
  const today = Date.now()
  const spans = ranges
    .map((r) => [Date.parse(r.from), r.to ? Date.parse(r.to) + DAY_MS : today] as [number, number])
    .filter(([a, b]) => Number.isFinite(a) && Number.isFinite(b) && b > a)
    .sort((x, y) => x[0] - y[0])
  let total = 0
  let curStart = -Infinity
  let curEnd = -Infinity
  for (const [a, b] of spans) {
    if (a > curEnd) {
      if (curEnd > curStart) total += curEnd - curStart
      curStart = a
      curEnd = b
    } else curEnd = Math.max(curEnd, b)
  }
  if (curEnd > curStart) total += curEnd - curStart
  return total / DAY_MS
}

/** 겹치는 기간은 합집합으로만 센다 (명세 §3 경력·학력) */
export function unionMonths(ranges: { from: string; to: string | null }[]): number {
  return Math.round((dayIntervals(ranges) / 30.4375) * 10) / 10
}

function relatedToRequest(codes: string[], targets: string[]): boolean {
  if (!targets.length) return false
  return codes.some((c) => targets.some((t) => {
    try {
      return industryTree.relation(c, t) > 0
    } catch {
      return false
    }
  }))
}

function cityAllowed(profile: InterpreterProfile, s: Session): boolean {
  if (s.place.workplace === 'REMOTE') return true
  const { country, city } = s.place
  if (country.toUpperCase() !== 'KR') return profile.overseasCountries.map((c) => c.toUpperCase()).includes(country.toUpperCase())
  const regions = [profile.homeCity, ...profile.domesticRegions].map((x) => x.trim())
  return regions.includes('전국') || regions.some((r) => r && (city.includes(r) || r.includes(city)))
}

export interface CandidateMeta {
  id: string
  active: boolean
  /** 세션 ID → 가용 상태. 모르면 UNKNOWN */
  availability?: Record<string, SlotState>
  exposure30d?: number
}

export interface CandidateBuild {
  candidate: MatchCandidate
  estimates: SessionEstimate[]
  /** 탈락 사유 (운영 콘솔 표시용) */
  failed: string[]
}

export const CHECK_LABELS: Record<string, string> = {
  active: '활동·예약 가능 상태',
  language: '언어 방향',
  roles: '요청 역할',
  modes: '통역 방식',
  workplace: '근무 형태(현장·원격)',
  travel: '출장 가능 지역·다일 일정',
  expenses: '경비 지원 조건',
  credentials: '필수 자격',
}

export function buildCandidate(profile: InterpreterProfile, req: RequestInput, meta: CandidateMeta): CandidateBuild {
  const reqCodes = selectionCodes(req.industry)
  const estimates = req.sessions.map((s) => estimateSession(profile, req, s))
  const modeBlocked = req.modes.some((m: Mode) =>
    req.languagePairs.some((pair) =>
      pickRate(profile.rates, { pair, role: req.roles[0], mode: m, purposes: req.purposes, placeType: null }).kind === 'NOT_ALLOWED'))
  const distinctDays = new Set(req.sessions.map((s) => s.startsAt.slice(0, 10))).size
  const checks = {
    active: meta.active,
    language: req.languagePairs.every((p) => pairCovers(profile.languagePairs, p)),
    roles: req.roles.every((r) => profile.roles.includes(r)),
    modes: req.modes.every((m) => profile.modes.includes(m)) && !modeBlocked,
    workplace: req.sessions.every((s) => profile.workplaces.includes(s.place.workplace)),
    travel: req.sessions.every((s) => cityAllowed(profile, s)) && !(req.schedule === 'ALL' && distinctDays > 1 && !profile.multiDay),
    expenses: true,
    credentials: (req.neededCredentials ?? []).every((c) => profile.credentials.includes(c)),
  }
  const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([k]) => CHECK_LABELS[k] ?? k)

  const slots: MatchCandidate['slots'] = {}
  for (const e of estimates) {
    slots[e.sessionId] = { state: meta.availability?.[e.sessionId] ?? 'UNKNOWN', budgetKrw: budgetValue(req, e.workKrw) }
  }
  const allWork = estimates.every((e) => e.workKrw !== null)
    ? estimates.reduce((sum, e) => sum + (e.workKrw as number), 0)
    : null

  const foreign = Array.from(new Set(req.languagePairs.flatMap((p) => [p.from, p.to]).filter((l) => l !== 'ko')))
  const primaryRoot = req.industry.primaryCode ? rootOf(req.industry.primaryCode) : undefined
  const secondaryRoots = req.industry.secondaryCodes.map(rootOf)
  const major = primaryRoot && profile.majorRootCodes.includes(primaryRoot)
    ? 'DIRECT'
    : secondaryRoots.some((r) => r && profile.majorRootCodes.includes(r)) ? 'RELATED' : 'NONE'

  const candidate: MatchCandidate = {
    id: meta.id,
    checks,
    slots,
    allBudgetKrw: budgetValue(req, allWork),
    projects: profile.projects.map((p) => ({
      verification: p.verification,
      interpreted: p.interpreted,
      industries: selectionCodes(p.industry).filter((c) => industryNode(c)?.level === 3),
      dates: p.workedDates,
      purposes: p.purposes,
      modes: p.modes,
      roles: p.roles,
    })),
    relevantJobMonths: unionMonths(
      profile.employment.filter((e) => e.verification === 'VERIFIED' && relatedToRequest(selectionCodes(e.industry), reqCodes)),
    ),
    major,
    education: profile.education,
    languageRegionMonths: unionMonths(profile.residences.filter((r) => r.languages.some((l) => foreign.includes(l)))),
    reviewUnit: null,
    exposure30d: meta.exposure30d ?? 0,
  }
  return { candidate, estimates, failed }
}

/** 후보 카드의 근거 문장 — '배터리 전해액 관련 직접 통역 5일 / 바이어 부스 상담 1건' (명세 §5.3) */
export function evidenceSummaries(profile: InterpreterProfile, req: RequestInput): string[] {
  const primary = req.industry.primaryCode
  const verified = profile.projects.filter((p) => p.verification === 'VERIFIED' && p.workedDates.length)
  const out: string[] = []
  if (primary) {
    const days = new Set<string>()
    for (const p of verified) {
      if (!p.interpreted) continue
      if (relatedToRequest(selectionCodes(p.industry), [primary])) p.workedDates.forEach((d) => days.add(d))
    }
    if (days.size) out.push(`${industryNode(primary)?.label_ko ?? primary} 관련 직접 통역 ${days.size}일`)
  }
  const similar = verified.filter((p) => p.purposes.some((x) => req.purposes.includes(x)))
  if (similar.length) out.push(`유사 목적 프로젝트 ${similar.length}건 · 최근 「${similar[similar.length - 1].title}」`)
  return out
}
