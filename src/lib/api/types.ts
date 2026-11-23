// Types mirrored from the backend OpenAPI spec (https://api-dev.makcrew.co.kr/api/docs)

export type UserRole = 'admin' | 'hospital' | 'interpreter'

export interface AuthenticatedUser {
  sub: string
  email?: string | null
  role?: UserRole | null
  displayName?: string | null
}

export interface LoginResponse {
  accessToken: string
  expiresIn: number
  tokenType: string
  user: AuthenticatedUser
}

export type ApplicantStatus = 'new' | 'reviewed' | 'interview_requested' | 'approved'

export interface Applicant {
  id: string
  payload?: Record<string, unknown> | null
  nameKr?: string | null
  nameEn?: string | null
  phone?: string | null
  email?: string | null
  birthYear?: number | null
  gender?: string | null
  country?: string | null
  nationalityType?: string | null
  proficiency?: string | null
  medicalEnvExp?: string | null
  agreePrivacy?: boolean | null
  status?: ApplicantStatus | null
  createdAt?: string | null
  linkedUserId?: string | null
  adminMemo?: string | null
  blocked?: boolean | null
}

export type ApplicantInput = Partial<Omit<Applicant, 'id'>>

export interface NoticeImage {
  id: number
  noticeId: string
  imageUrl: string
  sortOrder: number
}

export interface Notice {
  id: string
  payload?: Record<string, unknown> | null
  target?: string | null
  pinned?: boolean | null
  marker?: string | null
  createdAt?: string | null
  title?: string | null
  content?: string | null
  viewCount?: number | null
  images: NoticeImage[]
}

export type NoticeInput = Partial<Omit<Notice, 'id' | 'images'>>
export type NoticeImageInput = { imageUrl: string; sortOrder?: number }

export type InterpretRequestStatus = 'accepted' | 'cancelled'

export interface InterpretRequest {
  id: string
  hospitalId?: string | null
  hospitalName?: string | null
  contactName?: string | null
  phone?: string | null
  language?: string | null
  level?: number | null
  preferredInterpreterGender?: string | null
  requireMedicalCert?: boolean | null
  interpreterStyle?: string | null
  department?: string | null
  startTime?: string | null
  endTime?: string | null
  procedureContent?: string | null
  patientNationality?: string | null
  notes?: string | null
  offerToken?: Record<string, unknown> | null
  /** OMNI 의뢰 전체 — 서버가 검증·저장 (2026-11-23 백엔드 추가) */
  omniRequest?: Record<string, unknown> | null
  /** 서버 파생: 주 산업 세부분야 코드 */
  industryCode?: string | null
  /** OMNI 진행 단계 */
  omniStage?: 'matching' | 'selected' | 'paid' | 'in_progress' | 'completed' | 'cancelled' | null
  createdAt?: string | null
  assignedInterpreterId?: string | null
  status?: InterpretRequestStatus | null
  adminAssigned?: boolean | null
}

export type InterpretRequestInput = Partial<Omit<InterpretRequest, 'id'>>

export interface AiSearchRequest {
  query: string
  limit?: number
}

// Response schema is undocumented server-side ("병원 검색 결과" only) — treat defensively.
export type AiSearchResult = unknown

export interface DeletedResponse {
  id: string | number
  deleted: boolean
}
