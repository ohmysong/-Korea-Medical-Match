// OMNI 도메인 타입 — 「옴니 일반·비즈니스 통역 매칭 플랫폼 개발 명세」 개정 2.1 (2026-11-20)
// 부록 B openapi.json 의 components.schemas 를 그대로 옮겼다. 필드명·enum 을 바꾸지 말 것.

export const ROLES = ['INTERPRET', 'ESCORT', 'GUIDE', 'LIAISON'] as const
export type Role = (typeof ROLES)[number]

export const MODES = ['CONSECUTIVE', 'SIMULTANEOUS', 'SIGHT', 'WHISPERED'] as const
export type Mode = (typeof MODES)[number]

export const PURPOSES = [
  'BOOTH', 'BUYER_MEETING', 'NEGOTIATION', 'TECH_MEETING', 'AUDIT', 'TRAINING', 'TALK',
  'MEDIA_INTERVIEW', 'SITE_VISIT', 'CEREMONY', 'TOUR', 'INTERNAL_MEETING', 'NETWORKING', 'OTHER',
] as const
export type Purpose = (typeof PURPOSES)[number]

export const PLACE_TYPES = [
  'CONFERENCE_CENTER', 'EXHIBITION_CENTER', 'COMPANY', 'FACTORY', 'SITE', 'HOTEL', 'PUBLIC_FACILITY',
  'STUDIO', 'SCHOOL', 'ATTRACTION', 'TRANSIT', 'VIRTUAL', 'OTHER',
] as const
export type PlaceType = (typeof PLACE_TYPES)[number]

export type Workplace = 'ONSITE' | 'REMOTE'
export type Delivery = 'IN_PERSON' | 'VIDEO' | 'PHONE' | 'HYBRID'
export type Movement = 'FIXED' | 'ROAMING' | 'MULTI_SITE'
export type Schedule = 'ALL' | 'ANY' | 'SPLIT'
export type RequiredIndustry = 'NONE' | 'ROOT' | 'BRANCH' | 'LEAF'
export type Direction = 'ONE_WAY' | 'BOTH'

export const EXPENSE_KINDS = ['MEAL', 'GROUND', 'AIR', 'LODGING', 'OTHER'] as const
export type ExpenseKind = (typeof EXPENSE_KINDS)[number]
export type ExpenseProvision = 'DIRECT' | 'FIXED' | 'ACTUAL' | 'INCLUDED' | 'NONE'

export type Verification = 'NOT_SUBMITTED' | 'PENDING' | 'VERIFIED' | 'CHANGES_REQUESTED' | 'REJECTED'
export type TaxProfile = 'KR_FREELANCE_33' | 'NONE_CONFIRMED' | 'REVIEW'

export interface Pair {
  from: string
  to: string
  direction: Direction
}

export interface IndustrySelection {
  version: string
  /** 활성 세부분야(level 3) 코드. 직접 입력일 때 null */
  primaryCode: string | null
  /** 최대 3개, 중복 없음 */
  secondaryCodes: string[]
  /** primaryCode=null 일 때 필수 */
  otherText?: string | null
}

export interface Place {
  workplace: Workplace
  delivery: Delivery
  type: PlaceType
  name?: string
  detail?: string
  country: string
  city: string
  movement?: Movement
}

export interface Session {
  id: string
  startsAt: string
  endsAt: string
  timezone: string
  place: Place
}

export interface ExpensePolicy {
  kind: ExpenseKind
  provision: ExpenseProvision
  unit: 'DAY' | 'BOOKING'
  amountOrCapKrw?: number
}

export interface Task {
  name: string
  included: boolean
  estimatedMinutes?: number
}

export interface Budget {
  kind: 'WORK' | 'TOTAL'
  capKrw: number
}

export interface RequestInput {
  languagePairs: Pair[]
  singleMultilingual?: boolean
  roles: Role[]
  modes: Mode[]
  modeAdvice?: boolean
  purposes: Purpose[]
  industry: IndustrySelection
  requiredIndustry: RequiredIndustry
  schedule: Schedule
  sessions: Session[]
  headcount: number
  budget: Budget | null
  expenses: ExpensePolicy[]
  tasks?: Task[]
  brief?: string
  materialsDueAt?: string
  localResidence?: 'NONE' | 'PREFERRED' | 'REQUIRED'
  neededCredentials?: string[]
}

/** 통역사 서비스 요금표 한 줄 (openapi Rate) */
export interface Rate {
  id: string
  pair: Pair
  role: Role
  mode?: Mode | null
  purpose?: Purpose | null
  placeType?: PlaceType | null
  allowed: boolean
  unit?: 'HOUR' | 'DAY' | 'JOB'
  priceKrw?: number
  minMinutes?: number
  includedMinutes?: number
  overtimeUnitMinutes?: number
  overtimeKrw?: number
}

export interface Employment {
  employer: string
  job: string
  from: string
  to: string | null
  industry: IndustrySelection
  verification?: Verification
}

export interface Residence {
  country: string
  from: string
  to: string | null
  languages: string[]
}

/** 통역사 프로젝트 경력 (openapi Project + 관리자 검증 상태) */
export interface Project {
  id: string
  title: string
  organizer: string
  from: string
  to: string
  workedDates: string[]
  pair: Pair
  roles: Role[]
  modes: Mode[]
  purposes: Purpose[]
  industry: IndustrySelection
  interpreted: boolean
  publicSummary: string
  verification: Verification
}

/**
 * 통역사 프로필 — 현재 백엔드에는 전용 스키마가 없어 `PUT /interpreter/profile` 의
 * 자유형 `payload.omni` 에 저장한다. 필드 구성은 openapi Profile 을 따른다.
 */
export interface InterpreterProfile {
  displayName?: string
  introduction?: string
  languagePairs: Pair[]
  roles: Role[]
  modes: Mode[]
  workplaces: Workplace[]
  industry: IndustrySelection
  rates: Rate[]
  multiDay: boolean
  homeCity: string
  domesticRegions: string[]
  overseasCountries: string[]
  credentials: string[]
  degree?: string
  major?: string
  /** 전공과 직접 관련된 대분류 코드 — 운영자 산업–전공 연관표가 생기기 전까지의 임시 입력 */
  majorRootCodes: string[]
  education: 'COMPLETED' | 'IN_PROGRESS' | 'NONE'
  employment: Employment[]
  residences: Residence[]
  projects: Project[]
  taxProfile?: TaxProfile
}
