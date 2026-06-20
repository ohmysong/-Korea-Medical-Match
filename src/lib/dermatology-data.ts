export interface DermProcedure {
  id: string
  name: string
  nameEn: string
  type: '주사' | '레이저' | '리프팅' | '스킨케어'
  areas: string[]
  concerns: string[]
  priceMin: number
  priceMax: number
  duration: string
  recoveryDays: number
  recoveryLabel: string
  effect: number
  naturalness: number
  description: string
}

export const FACE_AREAS = ['이마', '미간', '눈가', '볼·팔자', '코', '입가', '턱·턱선', '목']

export const CONCERNS = [
  '주름·탄력저하', '색소침착·기미', '여드름·트러블', '모공·피부결',
  '다크서클', '흉터', '처짐·리프팅', '안면홍조',
]

export const PRIORITIES = [
  { id: 'effect', label: '효과 우선', desc: '확실한 변화를 우선으로' },
  { id: 'recovery', label: '회복기간 최소화', desc: '다운타임 없이 바로 일상복귀' },
  { id: 'value', label: '가성비', desc: '예산 안에서 최대 효과' },
  { id: 'natural', label: '자연스러운 결과', desc: '티 안 나는 자연스러운 변화' },
] as const

export type PriorityId = (typeof PRIORITIES)[number]['id']

export const BUDGET_PRESETS = [
  { label: '~50만원', value: 500000 },
  { label: '50~100만원', value: 1000000 },
  { label: '100~200만원', value: 2000000 },
  { label: '200~400만원', value: 4000000 },
  { label: '400만원 이상', value: 8000000 },
]

export const DERM_PROCEDURES: DermProcedure[] = [
  {
    id: 'd1', name: '보톡스 (이마·미간)', nameEn: 'Botulinum Toxin', type: '주사',
    areas: ['이마', '미간', '눈가'], concerns: ['주름·탄력저하'],
    priceMin: 150000, priceMax: 300000, duration: '15분', recoveryDays: 0, recoveryLabel: '즉시 일상복귀',
    effect: 4, naturalness: 4,
    description: '표정 주름의 원인이 되는 근육 움직임을 완화해 이마·미간 주름을 줄여줍니다.',
  },
  {
    id: 'd2', name: '필러 (팔자·입가)', nameEn: 'Dermal Filler', type: '주사',
    areas: ['볼·팔자', '입가', '코'], concerns: ['주름·탄력저하', '처짐·리프팅'],
    priceMin: 300000, priceMax: 700000, duration: '20분', recoveryDays: 1, recoveryLabel: '1일 내 회복',
    effect: 4, naturalness: 3,
    description: '볼륨이 빠진 부위에 채워 넣어 팔자주름과 꺼짐을 즉각적으로 개선합니다.',
  },
  {
    id: 'd3', name: '물광주사 (스킨부스터)', nameEn: 'Skin Booster', type: '주사',
    areas: ['볼·팔자', '눈가', '이마', '목'], concerns: ['모공·피부결', '주름·탄력저하'],
    priceMin: 250000, priceMax: 450000, duration: '30분', recoveryDays: 0, recoveryLabel: '즉시 일상복귀',
    effect: 3, naturalness: 5,
    description: '히알루론산을 피부 전반에 분산 주입해 속건조를 잡고 피부결을 매끄럽게 합니다.',
  },
  {
    id: 'd4', name: '콜라겐 부스터 (쥬베룩 계열)', nameEn: 'Collagen Booster Injection', type: '주사',
    areas: ['볼·팔자', '목', '이마'], concerns: ['주름·탄력저하', '처짐·리프팅'],
    priceMin: 400000, priceMax: 800000, duration: '30분', recoveryDays: 1, recoveryLabel: '1일 내 회복',
    effect: 4, naturalness: 5,
    description: '콜라겐 생성을 자극해 시간이 지날수록 탄력이 점진적으로 개선되는 자연스러운 결과를 만듭니다.',
  },
  {
    id: 'd5', name: '지방분해주사', nameEn: 'Fat Dissolving Injection', type: '주사',
    areas: ['턱·턱선', '볼·팔자'], concerns: ['처짐·리프팅'],
    priceMin: 200000, priceMax: 500000, duration: '20분', recoveryDays: 2, recoveryLabel: '1~2일 부기',
    effect: 3, naturalness: 4,
    description: '턱밑·볼 라인의 국소 지방을 분해해 윤곽을 정리합니다.',
  },
  {
    id: 'd6', name: '울쎄라 (HIFU 리프팅)', nameEn: 'Ulthera HIFU Lifting', type: '리프팅',
    areas: ['턱·턱선', '볼·팔자', '목', '이마'], concerns: ['처짐·리프팅', '주름·탄력저하'],
    priceMin: 1500000, priceMax: 3000000, duration: '60분', recoveryDays: 0, recoveryLabel: '즉시 일상복귀',
    effect: 5, naturalness: 5,
    description: '고강도 집속 초음파로 피부 깊은 층의 탄력 섬유를 자극해 처짐을 끌어올립니다.',
  },
  {
    id: 'd7', name: '슈링크 (HIFU 리프팅)', nameEn: 'Shurink HIFU Lifting', type: '리프팅',
    areas: ['턱·턱선', '볼·팔자', '목'], concerns: ['처짐·리프팅'],
    priceMin: 400000, priceMax: 900000, duration: '40분', recoveryDays: 0, recoveryLabel: '즉시 일상복귀',
    effect: 4, naturalness: 5,
    description: '울쎄라 대비 합리적인 가격으로 탄력 개선 효과를 제공하는 HIFU 리프팅입니다.',
  },
  {
    id: 'd8', name: '실리프팅', nameEn: 'Thread Lifting', type: '리프팅',
    areas: ['턱·턱선', '볼·팔자'], concerns: ['처짐·리프팅'],
    priceMin: 800000, priceMax: 2000000, duration: '50분', recoveryDays: 3, recoveryLabel: '2~3일 부기',
    effect: 4, naturalness: 3,
    description: '녹는 실을 삽입해 늘어진 피부 조직을 물리적으로 끌어올립니다.',
  },
  {
    id: 'd9', name: '토닝 레이저', nameEn: 'Toning Laser', type: '레이저',
    areas: ['볼·팔자', '이마', '코'], concerns: ['색소침착·기미'],
    priceMin: 150000, priceMax: 350000, duration: '20분', recoveryDays: 0, recoveryLabel: '즉시 일상복귀',
    effect: 4, naturalness: 4,
    description: '낮은 에너지를 여러 번 조사해 기미·색소를 서서히 옅게 만듭니다.',
  },
  {
    id: 'd10', name: '피코 레이저', nameEn: 'PicoSure Laser', type: '레이저',
    areas: ['볼·팔자', '이마', '코', '입가'], concerns: ['색소침착·기미', '흉터'],
    priceMin: 300000, priceMax: 600000, duration: '20분', recoveryDays: 2, recoveryLabel: '1~2일 붉음',
    effect: 5, naturalness: 4,
    description: '피코초 단위의 펄스로 색소와 흉터 부위를 정밀하게 파괴해 효과가 빠릅니다.',
  },
  {
    id: 'd11', name: '프락셀 레이저', nameEn: 'Fraxel Laser', type: '레이저',
    areas: ['볼·팔자', '이마'], concerns: ['흉터', '모공·피부결'],
    priceMin: 400000, priceMax: 800000, duration: '30분', recoveryDays: 5, recoveryLabel: '4~5일 홍반·각질',
    effect: 5, naturalness: 3,
    description: '미세한 레이저 채널로 피부 재생을 촉진해 여드름 흉터와 모공을 개선합니다.',
  },
  {
    id: 'd12', name: '여드름 압출 + LED 케어', nameEn: 'Acne Extraction + LED Therapy', type: '스킨케어',
    areas: ['볼·팔자', '이마', '턱·턱선'], concerns: ['여드름·트러블'],
    priceMin: 80000, priceMax: 150000, duration: '40분', recoveryDays: 0, recoveryLabel: '즉시 일상복귀',
    effect: 2, naturalness: 5,
    description: '염증성 여드름을 안전하게 압출하고 LED로 진정·재생을 돕는 기본 케어입니다.',
  },
  {
    id: 'd13', name: 'LDM 슈퍼클렌징', nameEn: 'LDM Super Clenzing', type: '스킨케어',
    areas: ['볼·팔자', '이마', '코'], concerns: ['여드름·트러블', '모공·피부결'],
    priceMin: 100000, priceMax: 200000, duration: '50분', recoveryDays: 0, recoveryLabel: '즉시 일상복귀',
    effect: 2, naturalness: 5,
    description: '저주파 진동으로 노폐물 배출과 흡수를 돕는 순한 트러블 케어 시술입니다.',
  },
  {
    id: 'd14', name: '다크서클 레이저', nameEn: 'Under-eye Pigment Laser', type: '레이저',
    areas: ['눈가'], concerns: ['다크서클'],
    priceMin: 300000, priceMax: 600000, duration: '20분', recoveryDays: 2, recoveryLabel: '1~2일 붉음',
    effect: 3, naturalness: 4,
    description: '눈가 색소와 혈관성 다크서클을 선택적으로 타겟해 옅게 만듭니다.',
  },
  {
    id: 'd15', name: '브로드밴드라이트 (BBL)', nameEn: 'BroadBand Light', type: '레이저',
    areas: ['볼·팔자', '코', '이마'], concerns: ['안면홍조', '색소침착·기미'],
    priceMin: 250000, priceMax: 500000, duration: '20분', recoveryDays: 1, recoveryLabel: '1일 내 붉음',
    effect: 4, naturalness: 4,
    description: '광범위한 파장으로 홍조와 색소를 동시에 완화하는 복합 레이저입니다.',
  },
  {
    id: 'd16', name: '보타이트 (눈가 보톡스)', nameEn: 'Periorbital Botulinum Toxin', type: '주사',
    areas: ['눈가'], concerns: ['주름·탄력저하'],
    priceMin: 150000, priceMax: 250000, duration: '15분', recoveryDays: 0, recoveryLabel: '즉시 일상복귀',
    effect: 3, naturalness: 4,
    description: '눈가 잔주름과 처짐을 동시에 잡아주는 소량 보톡스 시술입니다.',
  },
]
