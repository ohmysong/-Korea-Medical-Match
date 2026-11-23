import type {
  Delivery, ExpenseKind, ExpenseProvision, Mode, Movement, PlaceType, Purpose, RequiredIndustry, Role,
  Schedule, Verification, Workplace,
} from './types'

export const ROLE_LABELS: Record<Role, string> = {
  INTERPRET: '통역',
  ESCORT: '수행',
  GUIDE: '가이드',
  LIAISON: '리에종',
}

export const MODE_LABELS: Record<Mode, string> = {
  CONSECUTIVE: '순차',
  SIMULTANEOUS: '동시',
  SIGHT: '시역',
  WHISPERED: '위스퍼링',
}

export const PURPOSE_LABELS: Record<Purpose, string> = {
  BOOTH: '부스 응대',
  BUYER_MEETING: '바이어 상담',
  NEGOTIATION: '협상',
  TECH_MEETING: '기술회의',
  AUDIT: '품질실사',
  TRAINING: '교육',
  TALK: '발표',
  MEDIA_INTERVIEW: '언론 인터뷰',
  SITE_VISIT: '현장 시찰',
  CEREMONY: '의전',
  TOUR: '관광 안내',
  INTERNAL_MEETING: '내부 미팅',
  NETWORKING: '네트워킹',
  OTHER: '기타',
}

export const PLACE_TYPE_LABELS: Record<PlaceType, string> = {
  CONFERENCE_CENTER: '국제회의·컨벤션 시설',
  EXHIBITION_CENTER: '전시장',
  COMPANY: '회사',
  FACTORY: '공장·사업장',
  SITE: '건설·현장',
  HOTEL: '호텔',
  PUBLIC_FACILITY: '공공기관',
  STUDIO: '방송·촬영 시설',
  SCHOOL: '학교·연구기관',
  ATTRACTION: '관광지',
  TRANSIT: '공항·이동 중',
  VIRTUAL: '원격',
  OTHER: '기타',
}

export const WORKPLACE_LABELS: Record<Workplace, string> = { ONSITE: '현장', REMOTE: '원격' }

export const DELIVERY_LABELS: Record<Delivery, string> = {
  IN_PERSON: '대면',
  VIDEO: '화상',
  PHONE: '전화',
  HYBRID: '혼합',
}

export const MOVEMENT_LABELS: Record<Movement, string> = {
  FIXED: '고정',
  ROAMING: '순회',
  MULTI_SITE: '여러 장소',
}

export const SCHEDULE_LABELS: Record<Schedule, string> = {
  ALL: '전 일정 동일인',
  ANY: '후보일 중 택일',
  SPLIT: '날짜별 분할 가능',
}

export const REQUIRED_INDUSTRY_LABELS: Record<RequiredIndustry, string> = {
  NONE: '우대 (필수 아님)',
  ROOT: '대분류 경력 필수',
  BRANCH: '중분류 경력 필수',
  LEAF: '세부분야 경력 필수',
}

export const EXPENSE_KIND_LABELS: Record<ExpenseKind, string> = {
  MEAL: '중식',
  GROUND: '국내교통',
  AIR: '항공',
  LODGING: '숙박',
  OTHER: '기타',
}

export const EXPENSE_PROVISION_LABELS: Record<ExpenseProvision, string> = {
  DIRECT: '직접 제공',
  FIXED: '정액',
  ACTUAL: '실비',
  INCLUDED: '단가 포함',
  NONE: '미지원',
}

export const VERIFICATION_LABELS: Record<Verification, string> = {
  NOT_SUBMITTED: '미제출',
  PENDING: '검토 중',
  VERIFIED: '검증 완료',
  CHANGES_REQUESTED: '보완 요청',
  REJECTED: '반려',
}

export const LANGUAGES: { code: string; label: string }[] = [
  { code: 'ko', label: '한국어' },
  { code: 'en', label: '영어' },
  { code: 'zh', label: '중국어' },
  { code: 'ja', label: '일본어' },
  { code: 'vi', label: '베트남어' },
  { code: 'th', label: '태국어' },
  { code: 'id', label: '인도네시아어' },
  { code: 'ru', label: '러시아어' },
  { code: 'mn', label: '몽골어' },
  { code: 'de', label: '독일어' },
  { code: 'fr', label: '프랑스어' },
  { code: 'es', label: '스페인어' },
  { code: 'ar', label: '아랍어' },
]

export function languageLabel(code: string) {
  return LANGUAGES.find((l) => l.code === code)?.label ?? code
}

export function pairLabel(p: { from: string; to: string; direction: 'ONE_WAY' | 'BOTH' }) {
  return `${languageLabel(p.from)} ${p.direction === 'BOTH' ? '↔' : '→'} ${languageLabel(p.to)}`
}

export function formatKrw(value: number | null | undefined) {
  if (value === null || value === undefined) return '-'
  return `${value.toLocaleString('ko-KR')}원`
}
