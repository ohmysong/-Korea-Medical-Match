export type LeadStatus = 'new' | 'matching' | 'completed' | 'cancelled'

export interface AgentTreatmentHistoryItem {
  date: string
  hospital: string
  treatment: string
  note?: string
}

export interface AgentDocument {
  id: string
  name: string
  type: string
  fileName: string
  fileSize: string
  uploadedAt: string
}

export interface AgentPatient {
  id: string
  name: string
  nationality: string
  gender: '남' | '여'
  birthDate: string
  email: string
  phone: string
  treatmentInterest: string
  hospitalPreference?: string
  estimatedAmount: number
  status: LeadStatus
  registeredAt: string
  visitDate?: string
  notes?: string
  treatmentHistory: AgentTreatmentHistoryItem[]
  documents: AgentDocument[]
}

export const mockAgentPatients: AgentPatient[] = [
  {
    id: 'ap1', name: 'Wang Wei', nationality: '중국', gender: '남', birthDate: '1978-04-12',
    email: 'wang.wei@email.com', phone: '+86-138-0001-0001', treatmentInterest: '위암 수술',
    hospitalPreference: '세브란스병원', estimatedAmount: 12000000, status: 'matching',
    registeredAt: '2026-06-01', visitDate: '2026-06-15', notes: '보호자 동반 1인, 중국어 통역 필수',
    treatmentHistory: [
      { date: '2026-06-15', hospital: '세브란스병원', treatment: '위암 수술', note: '수술 진행 후 입원 중' },
    ],
    documents: [
      { id: 'd1', name: '여권 사본', type: '신분증명', fileName: 'wangwei_passport.pdf', fileSize: '1.2MB', uploadedAt: '2026-06-02' },
      { id: 'd2', name: '진단서', type: '의료기록', fileName: 'wangwei_diagnosis.pdf', fileSize: '0.8MB', uploadedAt: '2026-06-05' },
    ],
  },
  {
    id: 'ap2', name: 'Chen Mei', nationality: '중국', gender: '여', birthDate: '1985-11-02',
    email: 'chenmei@163.com', phone: '+86-150-0003-0003', treatmentInterest: '간 이식',
    hospitalPreference: '서울아산병원', estimatedAmount: 75000000, status: 'matching',
    registeredAt: '2026-05-20', visitDate: '2026-06-01', notes: '기증자 동반 입국, 비자 서류 발송 완료',
    treatmentHistory: [
      { date: '2026-06-01', hospital: '서울아산병원', treatment: '간 이식', note: '입원, 수술 준비 중' },
    ],
    documents: [
      { id: 'd3', name: '여권 사본', type: '신분증명', fileName: 'chenmei_passport.pdf', fileSize: '1.1MB', uploadedAt: '2026-05-22' },
      { id: 'd4', name: '비자 서류', type: '행정서류', fileName: 'chenmei_visa.pdf', fileSize: '0.5MB', uploadedAt: '2026-05-28' },
      { id: 'd5', name: '기증자 검사결과서', type: '의료기록', fileName: 'chenmei_donor_test.pdf', fileSize: '2.0MB', uploadedAt: '2026-05-30' },
    ],
  },
  {
    id: 'ap3', name: 'Sergei Volkov', nationality: '중국', gender: '남', birthDate: '1969-02-23',
    email: 's.volkov.cn@email.com', phone: '+86-186-0004-0004', treatmentInterest: '관상동맥우회술',
    hospitalPreference: '세브란스병원', estimatedAmount: 0, status: 'cancelled',
    registeredAt: '2026-05-15', notes: '환자 사정으로 일정 취소',
    treatmentHistory: [],
    documents: [],
  },
  {
    id: 'ap4', name: 'Liu Yang', nationality: '중국', gender: '남', birthDate: '1990-07-19',
    email: 'liu.yang@qq.com', phone: '+86-139-0005-0005', treatmentInterest: '인공관절치환술',
    hospitalPreference: '서울아산병원', estimatedAmount: 9000000, status: 'matching',
    registeredAt: '2026-06-10', visitDate: '2026-06-24', notes: '편도 항공권 예약 완료',
    treatmentHistory: [],
    documents: [
      { id: 'd6', name: '여권 사본', type: '신분증명', fileName: 'liuyang_passport.pdf', fileSize: '1.0MB', uploadedAt: '2026-06-11' },
    ],
  },
  {
    id: 'ap5', name: 'Zhao Lei', nationality: '중국', gender: '남', birthDate: '1982-09-30',
    email: 'zhao.lei@163.com', phone: '+86-159-0006-0006', treatmentInterest: '종합 건강검진',
    hospitalPreference: '삼성서울병원', estimatedAmount: 1500000, status: 'new',
    registeredAt: '2026-06-14',
    treatmentHistory: [],
    documents: [],
  },
  {
    id: 'ap6', name: 'Yang Fan', nationality: '중국', gender: '여', birthDate: '1995-03-08',
    email: 'yang.fan@qq.com', phone: '+86-188-0007-0007', treatmentInterest: '쌍꺼풀/코 성형',
    hospitalPreference: 'JK성형외과', estimatedAmount: 2000000, status: 'new',
    registeredAt: '2026-06-18', notes: '상담만 우선 희망',
    treatmentHistory: [],
    documents: [],
  },
  {
    id: 'ap7', name: 'Wu Jing', nationality: '중국', gender: '여', birthDate: '1988-12-15',
    email: 'wu.jing@163.com', phone: '+86-135-0008-0008', treatmentInterest: '보톡스/필러',
    hospitalPreference: 'JK성형외과', estimatedAmount: 500000, status: 'completed',
    registeredAt: '2026-04-10', visitDate: '2026-04-20',
    treatmentHistory: [
      { date: '2026-04-20', hospital: 'JK성형외과', treatment: '보톡스/필러', note: '시술 완료, 경과 양호' },
    ],
    documents: [
      { id: 'd7', name: '진료확인서', type: '의료기록', fileName: 'wujing_confirmation.pdf', fileSize: '0.4MB', uploadedAt: '2026-04-21' },
    ],
  },
  {
    id: 'ap8', name: 'Huang Tao', nationality: '중국', gender: '남', birthDate: '1975-06-21',
    email: 'huang.tao@qq.com', phone: '+86-176-0009-0009', treatmentInterest: 'PRP 줄기세포 치료',
    hospitalPreference: '강남세란의원', estimatedAmount: 3500000, status: 'matching',
    registeredAt: '2026-06-16', visitDate: '2026-07-02',
    treatmentHistory: [],
    documents: [
      { id: 'd8', name: '여권 사본', type: '신분증명', fileName: 'huangtao_passport.pdf', fileSize: '0.9MB', uploadedAt: '2026-06-17' },
    ],
  },
]

export type MatchingRequestStatus = 'requested' | 'accepted' | 'rejected' | 'completed'

export interface AgentMatchingRequest {
  id: string
  patientId: string
  patientName: string
  hospital: string
  specialty: string
  estimatedCost: number
  estimatedInterpreter: string
  status: MatchingRequestStatus
  requestedAt: string
}

export const mockAgentMatchingRequests: AgentMatchingRequest[] = [
  { id: 'mr1', patientId: 'ap1', patientName: 'Wang Wei', hospital: '세브란스병원', specialty: '암센터', estimatedCost: 12000000, estimatedInterpreter: '장하오 (중국어)', status: 'completed', requestedAt: '2026-06-02' },
  { id: 'mr2', patientId: 'ap2', patientName: 'Chen Mei', hospital: '서울아산병원', specialty: '암센터', estimatedCost: 75000000, estimatedInterpreter: '왕리 (중국어)', status: 'accepted', requestedAt: '2026-05-21' },
  { id: 'mr3', patientId: 'ap3', patientName: 'Sergei Volkov', hospital: '세브란스병원', specialty: '심장·혈관', estimatedCost: 27500000, estimatedInterpreter: '장하오 (중국어)', status: 'rejected', requestedAt: '2026-05-16' },
  { id: 'mr4', patientId: 'ap4', patientName: 'Liu Yang', hospital: '서울아산병원', specialty: '정형외과', estimatedCost: 9000000, estimatedInterpreter: '왕리 (중국어)', status: 'accepted', requestedAt: '2026-06-11' },
  { id: 'mr5', patientId: 'ap6', patientName: 'Yang Fan', hospital: 'JK성형외과', specialty: '성형외과', estimatedCost: 2000000, estimatedInterpreter: '왕리 (중국어)', status: 'requested', requestedAt: '2026-06-18' },
  { id: 'mr6', patientId: 'ap7', patientName: 'Wu Jing', hospital: 'JK성형외과', specialty: '피부과', estimatedCost: 500000, estimatedInterpreter: '왕리 (중국어)', status: 'completed', requestedAt: '2026-04-11' },
  { id: 'mr7', patientId: 'ap8', patientName: 'Huang Tao', hospital: '강남세란의원', specialty: '재생의학', estimatedCost: 3500000, estimatedInterpreter: '장하오 (중국어)', status: 'accepted', requestedAt: '2026-06-17' },
]

export type BrochureCategory = 'hospital' | 'treatment'

export interface Brochure {
  id: string
  title: string
  category: BrochureCategory
  target: string
  languages: string[]
  fileName: string
  fileSize: string
  updatedAt: string
}

export const mockBrochures: Brochure[] = [
  { id: 'b1', title: '세브란스병원 국제진료 안내', category: 'hospital', target: '세브란스병원', languages: ['중국어', '영어', '러시아어'], fileName: 'severance_intl_brochure_cn.pdf', fileSize: '4.2MB', updatedAt: '2026-05-20' },
  { id: 'b2', title: '서울아산병원 간이식센터 소개', category: 'hospital', target: '서울아산병원', languages: ['중국어', '영어'], fileName: 'amc_liver_transplant_cn.pdf', fileSize: '3.6MB', updatedAt: '2026-05-12' },
  { id: 'b3', title: '삼성서울병원 건강검진 패키지', category: 'hospital', target: '삼성서울병원', languages: ['중국어', '영어', '일본어'], fileName: 'smc_checkup_package_cn.pdf', fileSize: '2.9MB', updatedAt: '2026-06-02' },
  { id: 'b4', title: 'JK성형외과 시술 카탈로그', category: 'hospital', target: 'JK성형외과', languages: ['중국어', '영어', '베트남어'], fileName: 'jk_plastic_catalog_cn.pdf', fileSize: '5.1MB', updatedAt: '2026-06-10' },
  { id: 'b5', title: '위암 수술 안내서', category: 'treatment', target: '위암 수술', languages: ['중국어', '영어'], fileName: 'gastric_cancer_surgery_guide_cn.pdf', fileSize: '1.8MB', updatedAt: '2026-04-28' },
  { id: 'b6', title: '인공관절치환술 회복 가이드', category: 'treatment', target: '인공관절치환술', languages: ['중국어', '영어'], fileName: 'joint_replacement_recovery_cn.pdf', fileSize: '1.5MB', updatedAt: '2026-05-05' },
  { id: 'b7', title: '쌍꺼풀/코 성형 전후 가이드', category: 'treatment', target: '쌍꺼풀/코 성형', languages: ['중국어', '영어', '태국어'], fileName: 'rhinoplasty_before_after_cn.pdf', fileSize: '2.4MB', updatedAt: '2026-06-05' },
  { id: 'b8', title: 'PRP 줄기세포 치료 소개서', category: 'treatment', target: 'PRP 줄기세포 치료', languages: ['중국어', '영어'], fileName: 'prp_stemcell_intro_cn.pdf', fileSize: '1.2MB', updatedAt: '2026-05-30' },
]

export interface AgentVideo {
  id: string
  title: string
  target: string
  duration: string
  languages: string[]
  fileName: string
  fileSize: string
  updatedAt: string
}

export const mockAgentVideos: AgentVideo[] = [
  { id: 'v1', title: '세브란스병원 시설 투어', target: '세브란스병원', duration: '3:24', languages: ['중국어 자막'], fileName: 'severance_facility_tour_cn.mp4', fileSize: '142MB', updatedAt: '2026-05-18' },
  { id: 'v2', title: '서울아산병원 간이식 성공 사례', target: '서울아산병원', duration: '5:10', languages: ['중국어 자막', '영어 자막'], fileName: 'amc_liver_transplant_story_cn.mp4', fileSize: '210MB', updatedAt: '2026-05-22' },
  { id: 'v3', title: '삼성서울병원 건강검진 프로세스', target: '삼성서울병원', duration: '2:47', languages: ['중국어 자막'], fileName: 'smc_checkup_process_cn.mp4', fileSize: '98MB', updatedAt: '2026-06-01' },
  { id: 'v4', title: 'JK성형외과 상담 후기 모음', target: 'JK성형외과', duration: '4:02', languages: ['중국어 더빙'], fileName: 'jk_plastic_testimonials_cn.mp4', fileSize: '165MB', updatedAt: '2026-06-08' },
  { id: 'v5', title: '인공관절치환술 수술 과정 안내', target: '인공관절치환술', duration: '3:55', languages: ['중국어 자막', '영어 자막'], fileName: 'joint_replacement_explained_cn.mp4', fileSize: '178MB', updatedAt: '2026-05-26' },
  { id: 'v6', title: 'PRP 줄기세포 치료 소개 영상', target: 'PRP 줄기세포 치료', duration: '2:15', languages: ['중국어 자막'], fileName: 'prp_stemcell_overview_cn.mp4', fileSize: '87MB', updatedAt: '2026-06-12' },
]

export type AgentCommissionStatus = 'pending' | 'processing' | 'completed' | 'cancelled'

export interface AgentCommissionRecord {
  id: string
  patientName: string
  hospital: string
  treatment: string
  totalAmount: number
  commissionRate: number
  commissionAmount: number
  status: AgentCommissionStatus
  expectedPayDate: string
  paidDate?: string
  settlementRequested?: boolean
}

export const mockAgentCommissions: AgentCommissionRecord[] = [
  { id: 'ac1', patientName: 'Wang Wei', hospital: '세브란스병원', treatment: '위암 수술', totalAmount: 12000000, commissionRate: 8, commissionAmount: 960000, status: 'processing', expectedPayDate: '2026-07-10' },
  { id: 'ac2', patientName: 'Chen Mei', hospital: '서울아산병원', treatment: '간 이식', totalAmount: 75000000, commissionRate: 6, commissionAmount: 4500000, status: 'processing', expectedPayDate: '2026-08-10' },
  { id: 'ac3', patientName: 'Sergei Volkov', hospital: '세브란스병원', treatment: '관상동맥우회술', totalAmount: 0, commissionRate: 8, commissionAmount: 0, status: 'cancelled', expectedPayDate: '2026-07-10' },
  { id: 'ac4', patientName: 'Wu Jing', hospital: 'JK성형외과', treatment: '보톡스/필러', totalAmount: 500000, commissionRate: 10, commissionAmount: 50000, status: 'completed', expectedPayDate: '2026-05-10', paidDate: '2026-05-09' },
  { id: 'ac5', patientName: 'Liu Yang', hospital: '서울아산병원', treatment: '인공관절치환술', totalAmount: 9000000, commissionRate: 8, commissionAmount: 720000, status: 'pending', expectedPayDate: '2026-07-24' },
  { id: 'ac6', patientName: 'Huang Tao', hospital: '강남세란의원', treatment: 'PRP 줄기세포 치료', totalAmount: 3500000, commissionRate: 10, commissionAmount: 350000, status: 'pending', expectedPayDate: '2026-08-02' },
]

export const AGENT_CURRENT_COMMISSION_RATE = 8

export type CommissionRateRequestStatus = 'pending' | 'approved' | 'rejected'

export interface AgentCommissionRateRequest {
  id: string
  requestedRate: number
  reason: string
  status: CommissionRateRequestStatus
  requestedAt: string
}

export const mockAgentRateRequests: AgentCommissionRateRequest[] = [
  { id: 'rr1', requestedRate: 10, reason: '연 300명 이상 환자 추천 달성으로 인상 요청', status: 'pending', requestedAt: '2026-06-15' },
]

export interface AgentMonthlyPerformance {
  month: string
  referred: number
  converted: number
  completed: number
  revenue: number
  commission: number
}

export const mockAgentPerformance: AgentMonthlyPerformance[] = [
  { month: '2026-01', referred: 14, converted: 9, completed: 8, revenue: 62000000, commission: 4960000 },
  { month: '2026-02', referred: 16, converted: 11, completed: 9, revenue: 71000000, commission: 5680000 },
  { month: '2026-03', referred: 19, converted: 13, completed: 12, revenue: 88000000, commission: 7040000 },
  { month: '2026-04', referred: 15, converted: 10, completed: 10, revenue: 65000000, commission: 5200000 },
  { month: '2026-05', referred: 21, converted: 15, completed: 13, revenue: 94000000, commission: 7520000 },
  { month: '2026-06', referred: 18, converted: 12, completed: 7, revenue: 86500000, commission: 6920000 },
]

export interface AgentWeeklyMatching {
  week: string
  requested: number
  accepted: number
}

export const mockWeeklyMatching: AgentWeeklyMatching[] = [
  { week: '1주', requested: 5, accepted: 3 },
  { week: '2주', requested: 7, accepted: 5 },
  { week: '3주', requested: 4, accepted: 4 },
  { week: '4주', requested: 6, accepted: 2 },
]

export interface AgentCountryStat {
  country: string
  patients: number
  percent: number
}

export const mockAgentCountryStats: AgentCountryStat[] = [
  { country: '중국', patients: 156, percent: 78 },
  { country: '대만', patients: 24, percent: 12 },
  { country: '홍콩', patients: 20, percent: 10 },
]

export interface AgentTreatmentStat {
  category: string
  count: number
  revenue: number
}

export const mockAgentTreatmentStats: AgentTreatmentStat[] = [
  { category: '수술', count: 42, revenue: 380000000 },
  { category: '건강검진', count: 38, revenue: 45000000 },
  { category: '시술', count: 56, revenue: 62000000 },
  { category: '재생의학', count: 19, revenue: 38000000 },
]

export interface ShareableLink {
  id: string
  title: string
  target: string
  url: string
  clicks: number
  createdAt: string
}

export const mockShareableLinks: ShareableLink[] = [
  { id: 'sl1', title: '세브란스병원 국제진료 소개', target: '세브란스병원', url: 'kmm.co.kr/s/zhangwei/severance', clicks: 128, createdAt: '2026-05-20' },
  { id: 'sl2', title: '서울아산병원 간이식센터', target: '서울아산병원', url: 'kmm.co.kr/s/zhangwei/amc-liver', clicks: 76, createdAt: '2026-05-25' },
  { id: 'sl3', title: 'JK성형외과 시술 카탈로그', target: 'JK성형외과', url: 'kmm.co.kr/s/zhangwei/jk', clicks: 203, createdAt: '2026-06-08' },
]

export interface AgentLandingPage {
  id: string
  name: string
  slug: string
  visits: number
  leads: number
  isActive: boolean
  createdAt: string
}

export const mockLandingPages: AgentLandingPage[] = [
  { id: 'lp1', name: 'Beijing Health Tourism 전용 페이지', slug: 'zhangwei-cn', visits: 1840, leads: 34, isActive: true, createdAt: '2026-03-01' },
  { id: 'lp2', name: '위암·간이식 환자 전용 캠페인', slug: 'zhangwei-cancer', visits: 620, leads: 11, isActive: true, createdAt: '2026-05-10' },
  { id: 'lp3', name: '성형·피부 시즌 프로모션', slug: 'zhangwei-beauty-promo', visits: 310, leads: 5, isActive: false, createdAt: '2026-04-01' },
]

export interface AgentBanner {
  id: string
  title: string
  size: string
  format: string
  fileName: string
  fileSize: string
}

export const mockBanners: AgentBanner[] = [
  { id: 'bn1', title: '세브란스병원 검진 프로모션 배너', size: '1080x1080', format: 'PNG', fileName: 'severance_checkup_banner.png', fileSize: '820KB' },
  { id: 'bn2', title: 'KMM 종합 안내 배너 (와이드)', size: '1920x600', format: 'PNG', fileName: 'kmm_wide_banner.png', fileSize: '1.1MB' },
  { id: 'bn3', title: 'JK성형외과 SNS 카드뉴스', size: '1080x1350', format: 'JPG', fileName: 'jk_sns_card.jpg', fileSize: '640KB' },
]
