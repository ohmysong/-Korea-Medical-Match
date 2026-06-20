export type PatientStatus = 'inquiry' | 'consultation' | 'scheduled' | 'in-treatment' | 'completed' | 'cancelled'
export type InterpreterStatus = 'available' | 'busy' | 'inactive'
export type AgentStatus = 'active' | 'inactive'
export type VehicleStatus = 'available' | 'on-trip' | 'maintenance'
export type SettlementStatus = 'pending' | 'processing' | 'completed' | 'cancelled'
export type CrmType = 'call' | 'email' | 'chat' | 'visit'
export type NoticeType = 'general' | 'urgent' | 'maintenance'
export type NoticeTarget = 'all' | 'hospital' | 'agent' | 'patient'

export interface AdminPatient {
  id: string
  name: string
  nationality: string
  email: string
  phone: string
  status: PatientStatus
  treatment: string
  hospital: string
  coordinator: string
  agent?: string
  createdAt: string
  visitDate?: string
}

export interface AdminInterpreter {
  id: string
  name: string
  languages: string[]
  specialties: string[]
  status: InterpreterStatus
  rating: number
  completedCases: number
  phone: string
  email: string
  joinedAt: string
}

export interface AdminAgent {
  id: string
  name: string
  company: string
  country: string
  languages: string[]
  totalPatients: number
  thisMonthPatients: number
  status: AgentStatus
  contractDate: string
  email: string
  phone: string
}

export interface AdminHotel {
  id: string
  name: string
  location: string
  totalRooms: number
  availableRooms: number
  pricePerNight: number
  nearbyHospitals: string[]
  status: 'active' | 'inactive'
  contactName: string
  phone: string
}

export interface AdminVehicle {
  id: string
  type: '세단' | 'SUV' | '밴' | '버스'
  licensePlate: string
  driverName: string
  driverPhone: string
  status: VehicleStatus
  capacity: number
  currentAssignment?: string
}

export interface Settlement {
  id: string
  patientName: string
  hospital: string
  treatment: string
  totalAmount: number
  commissionRate: number
  commissionAmount: number
  status: SettlementStatus
  dueDate: string
  paidDate?: string
}

export interface CrmRecord {
  id: string
  patientName: string
  nationality: string
  type: CrmType
  summary: string
  coordinator: string
  createdAt: string
  followUpDate?: string
}

export interface Notice {
  id: string
  title: string
  type: NoticeType
  target: NoticeTarget
  author: string
  createdAt: string
  isPublished: boolean
  views: number
}

export const mockPatients: AdminPatient[] = [
  { id: 'p1', name: 'Wang Wei', nationality: '중국', email: 'wang.wei@email.com', phone: '+86-138-0001-0001', status: 'in-treatment', treatment: '위암 수술', hospital: '세브란스병원', coordinator: '김민지', agent: 'Beijing Health', createdAt: '2026-06-01', visitDate: '2026-06-15' },
  { id: 'p2', name: 'Alexei Petrov', nationality: '러시아', email: 'a.petrov@mail.ru', phone: '+7-916-000-1111', status: 'scheduled', treatment: '인공관절치환술', hospital: '서울아산병원', coordinator: '이수진', agent: 'Moscow MedTour', createdAt: '2026-05-28', visitDate: '2026-06-20' },
  { id: 'p3', name: 'Ahmad Al-Rashid', nationality: 'UAE', email: 'ahmad@email.ae', phone: '+971-50-000-1111', status: 'consultation', treatment: '종합 건강검진', hospital: '삼성서울병원', coordinator: '박지현', createdAt: '2026-06-10' },
  { id: 'p4', name: 'Oyunbaatar Bold', nationality: '몽골', email: 'oyun@email.mn', phone: '+976-9900-1111', status: 'completed', treatment: '라식/라섹', hospital: 'BGN밝은눈안과', coordinator: '김민지', createdAt: '2026-05-01', visitDate: '2026-05-15' },
  { id: 'p5', name: 'Linh Nguyen', nationality: '베트남', email: 'linh.nguyen@vn.com', phone: '+84-90-000-1111', status: 'inquiry', treatment: '쌍꺼풀/코 성형', hospital: '', coordinator: '', createdAt: '2026-06-17' },
  { id: 'p6', name: 'Fatima Hassan', nationality: 'UAE', email: 'fatima@email.ae', phone: '+971-55-000-2222', status: 'scheduled', treatment: '척추 내시경 수술', hospital: '자생한방병원', coordinator: '이수진', agent: 'Dubai Health Connect', createdAt: '2026-06-05', visitDate: '2026-06-25' },
  { id: 'p7', name: 'Li Hua', nationality: '중국', email: 'lihua@qq.com', phone: '+86-139-0002-0002', status: 'completed', treatment: '보톡스/필러', hospital: 'JK성형외과', coordinator: '박지현', agent: 'Shanghai Beauty', createdAt: '2026-04-10', visitDate: '2026-04-20' },
  { id: 'p8', name: 'Sergei Volkov', nationality: '러시아', email: 's.volkov@mail.ru', phone: '+7-926-000-2222', status: 'cancelled', treatment: '관상동맥우회술', hospital: '세브란스병원', coordinator: '김민지', agent: 'Moscow MedTour', createdAt: '2026-05-15' },
  { id: 'p9', name: 'Tanaka Kenji', nationality: '일본', email: 'tanaka@jp.com', phone: '+81-90-0000-1111', status: 'consultation', treatment: 'PRP 줄기세포 치료', hospital: '강남세란의원', coordinator: '이수진', createdAt: '2026-06-12' },
  { id: 'p10', name: 'Baatarjav Enkh', nationality: '몽골', email: 'baat@email.mn', phone: '+976-9911-2222', status: 'scheduled', treatment: '종합 건강검진', hospital: '서울아산병원', coordinator: '박지현', agent: 'UB Medical', createdAt: '2026-06-08', visitDate: '2026-06-22' },
  { id: 'p11', name: 'Chen Mei', nationality: '중국', email: 'chenmei@163.com', phone: '+86-150-0003-0003', status: 'in-treatment', treatment: '간 이식', hospital: '서울아산병원', coordinator: '김민지', agent: 'Beijing Health', createdAt: '2026-05-20', visitDate: '2026-06-01' },
  { id: 'p12', name: 'Hassan Ibrahim', nationality: '이집트', email: 'hassan@email.eg', phone: '+20-100-000-1111', status: 'inquiry', treatment: '암 검진', hospital: '', coordinator: '', createdAt: '2026-06-16' },
  { id: 'p13', name: 'Yuki Sato', nationality: '일본', email: 'yuki.sato@jp.com', phone: '+81-80-0000-2222', status: 'completed', treatment: '여성 정밀 건강검진', hospital: '미즈메디병원', coordinator: '이수진', createdAt: '2026-05-05', visitDate: '2026-05-10' },
  { id: 'p14', name: 'Park Min-soo', nationality: '미국', email: 'minsoo.park@us.com', phone: '+1-213-000-1111', status: 'consultation', treatment: '인공관절치환술', hospital: '세브란스병원', coordinator: '박지현', createdAt: '2026-06-14' },
  { id: 'p15', name: 'Asel Bakytbekova', nationality: '키르기스스탄', email: 'asel@email.kg', phone: '+996-700-001-111', status: 'scheduled', treatment: '척추 내시경 수술', hospital: '연세굿모닝병원', coordinator: '김민지', createdAt: '2026-06-09', visitDate: '2026-06-28' },
  { id: 'p16', name: 'Elena Petrova', nationality: '러시아', email: 'elena.petrova@mail.ru', phone: '+7-903-456-7890', status: 'scheduled', treatment: '척추 디스크 치료', hospital: '세브란스병원', coordinator: '김민지', createdAt: '2026-05-20', visitDate: '2026-07-08' },
]

export const mockInterpreters: AdminInterpreter[] = [
  { id: 'i1', name: '장하오(Zhang Hao)', languages: ['중국어', '한국어', '영어'], specialties: ['외과', '내과', '건강검진'], status: 'busy', rating: 4.9, completedCases: 312, phone: '+82-10-1111-2222', email: 'zhanghao@kakao.com', joinedAt: '2023-03-15' },
  { id: 'i2', name: '이리나 킴', languages: ['러시아어', '한국어', '영어'], specialties: ['정형외과', '척추', '재활'], status: 'available', rating: 4.8, completedCases: 245, phone: '+82-10-2222-3333', email: 'irina.kim@email.com', joinedAt: '2023-07-01' },
  { id: 'i3', name: '모하마드 알리', languages: ['아랍어', '한국어', '영어'], specialties: ['암센터', '심장외과'], status: 'available', rating: 4.7, completedCases: 189, phone: '+82-10-3333-4444', email: 'mohamad@email.com', joinedAt: '2024-01-10' },
  { id: 'i4', name: '나라 바트', languages: ['몽골어', '한국어', '영어'], specialties: ['성형외과', '피부과', '안과'], status: 'busy', rating: 4.9, completedCases: 421, phone: '+82-10-4444-5555', email: 'nara.bat@email.com', joinedAt: '2022-09-01' },
  { id: 'i5', name: '응우옌 티 홍', languages: ['베트남어', '한국어', '영어'], specialties: ['산부인과', '소아과'], status: 'available', rating: 4.6, completedCases: 134, phone: '+82-10-5555-6666', email: 'hongnguyen@email.com', joinedAt: '2024-03-20' },
  { id: 'i6', name: '다나카 유코', languages: ['일본어', '한국어', '영어'], specialties: ['피부과', '성형외과'], status: 'available', rating: 4.8, completedCases: 298, phone: '+82-10-6666-7777', email: 'yuko.tanaka@email.com', joinedAt: '2023-05-15' },
  { id: 'i7', name: '압둘라 카림', languages: ['아랍어', '영어', '한국어'], specialties: ['정형외과', '신경외과'], status: 'inactive', rating: 4.5, completedCases: 87, phone: '+82-10-7777-8888', email: 'karim@email.com', joinedAt: '2024-06-01' },
  { id: 'i8', name: '왕리(Wang Li)', languages: ['중국어', '한국어'], specialties: ['한방', '재생의학'], status: 'available', rating: 4.7, completedCases: 156, phone: '+82-10-8888-9999', email: 'wangli@email.com', joinedAt: '2023-11-01' },
]

export const mockAgents: AdminAgent[] = [
  { id: 'a1', name: 'Zhang Wei', company: 'Beijing Health Tourism', country: '중국', languages: ['중국어', '영어'], totalPatients: 432, thisMonthPatients: 18, status: 'active', contractDate: '2022-01-15', email: 'zhang.wei@bjhealth.cn', phone: '+86-138-0010-0010' },
  { id: 'a2', name: 'Ivan Sokolov', company: 'Moscow MedTour', country: '러시아', languages: ['러시아어', '영어'], totalPatients: 289, thisMonthPatients: 12, status: 'active', contractDate: '2022-06-01', email: 'ivan@moscowmedtour.ru', phone: '+7-495-000-1111' },
  { id: 'a3', name: 'Ali Al-Mansoori', company: 'Dubai Health Connect', country: 'UAE', languages: ['아랍어', '영어'], totalPatients: 156, thisMonthPatients: 8, status: 'active', contractDate: '2023-03-10', email: 'ali@dubaihealth.ae', phone: '+971-4-000-1111' },
  { id: 'a4', name: 'Nomun Gantulga', company: 'UB Medical Group', country: '몽골', languages: ['몽골어', '영어', '러시아어'], totalPatients: 198, thisMonthPatients: 15, status: 'active', contractDate: '2022-08-20', email: 'nomun@ubmedical.mn', phone: '+976-7700-1111' },
  { id: 'a5', name: 'Akira Tanaka', company: 'Tokyo Korea Health', country: '일본', languages: ['일본어', '한국어', '영어'], totalPatients: 87, thisMonthPatients: 4, status: 'active', contractDate: '2023-09-01', email: 'akira@tkhealth.jp', phone: '+81-3-0000-1111' },
  { id: 'a6', name: 'Nguyen Van Duc', company: 'Hanoi MedConnect', country: '베트남', languages: ['베트남어', '영어'], totalPatients: 43, thisMonthPatients: 2, status: 'inactive', contractDate: '2024-01-05', email: 'duc@medconnect.vn', phone: '+84-24-000-1111' },
]

export const mockHotels: AdminHotel[] = [
  { id: 'h1', name: '코리아나 호텔', location: '서울 중구', totalRooms: 15, availableRooms: 8, pricePerNight: 150000, nearbyHospitals: ['세브란스병원', '삼성서울병원'], status: 'active', contactName: '김영수', phone: '+82-2-2171-7000' },
  { id: 'h2', name: '강남 메디컬 스테이', location: '서울 강남구', totalRooms: 20, availableRooms: 12, pricePerNight: 200000, nearbyHospitals: ['삼성서울병원', 'JK성형외과'], status: 'active', contactName: '이정희', phone: '+82-2-555-1234' },
  { id: 'h3', name: '아산 메디텔', location: '서울 송파구', totalRooms: 30, availableRooms: 5, pricePerNight: 180000, nearbyHospitals: ['서울아산병원'], status: 'active', contactName: '박상욱', phone: '+82-2-3010-9900' },
  { id: 'h4', name: '신촌 게스트하우스', location: '서울 서대문구', totalRooms: 10, availableRooms: 10, pricePerNight: 80000, nearbyHospitals: ['세브란스병원'], status: 'active', contactName: '최명수', phone: '+82-2-313-4567' },
  { id: 'h5', name: '부산 의료관광 호텔', location: '부산 서구', totalRooms: 12, availableRooms: 7, pricePerNight: 120000, nearbyHospitals: ['부산대학교병원'], status: 'inactive', contactName: '정지은', phone: '+82-51-240-8900' },
]

export const mockVehicles: AdminVehicle[] = [
  { id: 'v1', type: '세단', licensePlate: '12가 3456', driverName: '홍길동', driverPhone: '+82-10-1234-5678', status: 'available', capacity: 4 },
  { id: 'v2', type: 'SUV', licensePlate: '34나 5678', driverName: '이철수', driverPhone: '+82-10-2345-6789', status: 'on-trip', capacity: 7, currentAssignment: 'Wang Wei → 세브란스병원' },
  { id: 'v3', type: '밴', licensePlate: '56다 7890', driverName: '김영호', driverPhone: '+82-10-3456-7890', status: 'available', capacity: 9 },
  { id: 'v4', type: 'SUV', licensePlate: '78라 9012', driverName: '박민철', driverPhone: '+82-10-4567-8901', status: 'on-trip', capacity: 7, currentAssignment: 'Alexei Petrov → 인천공항' },
  { id: 'v5', type: '세단', licensePlate: '90마 1234', driverName: '최준영', driverPhone: '+82-10-5678-9012', status: 'maintenance', capacity: 4 },
  { id: 'v6', type: '버스', licensePlate: '12바 3456', driverName: '정상원', driverPhone: '+82-10-6789-0123', status: 'available', capacity: 25 },
]

export const mockSettlements: Settlement[] = [
  { id: 's1', patientName: 'Wang Wei', hospital: '세브란스병원', treatment: '위암 수술', totalAmount: 12000000, commissionRate: 15, commissionAmount: 1800000, status: 'processing', dueDate: '2026-07-01' },
  { id: 's2', patientName: 'Oyunbaatar Bold', hospital: 'BGN밝은눈안과', treatment: '라식/라섹', totalAmount: 2500000, commissionRate: 10, commissionAmount: 250000, status: 'completed', dueDate: '2026-06-15', paidDate: '2026-06-14' },
  { id: 's3', patientName: 'Li Hua', hospital: 'JK성형외과', treatment: '보톡스/필러', totalAmount: 500000, commissionRate: 12, commissionAmount: 60000, status: 'completed', dueDate: '2026-05-10', paidDate: '2026-05-09' },
  { id: 's4', patientName: 'Alexei Petrov', hospital: '서울아산병원', treatment: '인공관절치환술', totalAmount: 9000000, commissionRate: 15, commissionAmount: 1350000, status: 'pending', dueDate: '2026-07-15' },
  { id: 's5', patientName: 'Yuki Sato', hospital: '미즈메디병원', treatment: '여성 정밀 건강검진', totalAmount: 1500000, commissionRate: 10, commissionAmount: 150000, status: 'completed', dueDate: '2026-06-01', paidDate: '2026-05-30' },
  { id: 's6', patientName: 'Fatima Hassan', hospital: '자생한방병원', treatment: '척추 내시경 수술', totalAmount: 7000000, commissionRate: 15, commissionAmount: 1050000, status: 'pending', dueDate: '2026-07-20' },
  { id: 's7', patientName: 'Chen Mei', hospital: '서울아산병원', treatment: '간 이식', totalAmount: 75000000, commissionRate: 10, commissionAmount: 7500000, status: 'processing', dueDate: '2026-08-01' },
  { id: 's8', patientName: 'Sergei Volkov', hospital: '세브란스병원', treatment: '관상동맥우회술', totalAmount: 0, commissionRate: 15, commissionAmount: 0, status: 'cancelled', dueDate: '2026-07-01' },
  { id: 's9', patientName: 'Baatarjav Enkh', hospital: '서울아산병원', treatment: '종합 건강검진', totalAmount: 1200000, commissionRate: 10, commissionAmount: 120000, status: 'pending', dueDate: '2026-07-10' },
  { id: 's10', patientName: 'Tanaka Kenji', hospital: '강남세란의원', treatment: 'PRP 줄기세포 치료', totalAmount: 3500000, commissionRate: 12, commissionAmount: 420000, status: 'pending', dueDate: '2026-07-05' },
]

export const mockCrmRecords: CrmRecord[] = [
  { id: 'c1', patientName: 'Wang Wei', nationality: '중국', type: 'call', summary: '수술 전 통화 - 수술 일정 및 입원 절차 안내', coordinator: '김민지', createdAt: '2026-06-14 10:30', followUpDate: '2026-06-16' },
  { id: 'c2', patientName: 'Alexei Petrov', nationality: '러시아', type: 'email', summary: '수술 견적서 및 일정 이메일 발송', coordinator: '이수진', createdAt: '2026-06-13 14:20', followUpDate: '2026-06-15' },
  { id: 'c3', patientName: 'Ahmad Al-Rashid', nationality: 'UAE', type: 'chat', summary: '카카오톡 상담 - 건강검진 항목 및 비용 문의', coordinator: '박지현', createdAt: '2026-06-12 09:15' },
  { id: 'c4', patientName: 'Linh Nguyen', nationality: '베트남', type: 'call', summary: '초기 상담 - 성형 시술 가능 여부 및 가격 안내', coordinator: '이수진', createdAt: '2026-06-17 11:00', followUpDate: '2026-06-20' },
  { id: 'c5', patientName: 'Tanaka Kenji', nationality: '일본', type: 'visit', summary: '병원 방문 동행 - 피부과 시술 상담 통역', coordinator: '이수진', createdAt: '2026-06-12 13:00' },
  { id: 'c6', patientName: 'Fatima Hassan', nationality: 'UAE', type: 'email', summary: '수술 전 검사 결과 번역 및 의사 소견서 전달', coordinator: '이수진', createdAt: '2026-06-10 16:30' },
  { id: 'c7', patientName: 'Chen Mei', nationality: '중국', type: 'call', summary: '이식 수술 경과 상담 - 보호자 통화', coordinator: '김민지', createdAt: '2026-06-05 09:00', followUpDate: '2026-06-10' },
  { id: 'c8', patientName: 'Park Min-soo', nationality: '미국', type: 'chat', summary: '영어 채팅 상담 - 보험 서류 및 의료 기록 안내', coordinator: '박지현', createdAt: '2026-06-14 20:15', followUpDate: '2026-06-18' },
  { id: 'c9', patientName: 'Asel Bakytbekova', nationality: '키르기스스탄', type: 'call', summary: '러시아어 통화 - 수술 일정 확정 및 호텔 연결', coordinator: '김민지', createdAt: '2026-06-09 15:45' },
  { id: 'c10', patientName: 'Hassan Ibrahim', nationality: '이집트', type: 'email', summary: '아랍어 이메일 - 암 검진 패키지 소개서 발송', coordinator: '박지현', createdAt: '2026-06-16 11:30', followUpDate: '2026-06-19' },
  { id: 'c11', patientName: 'Baatarjav Enkh', nationality: '몽골', type: 'call', summary: '비자 서류 안내 및 검진 일정 확정', coordinator: '박지현', createdAt: '2026-06-08 10:00' },
  { id: 'c12', patientName: 'Oyunbaatar Bold', nationality: '몽골', type: 'visit', summary: '수술 완료 후 퇴원 지원 및 귀국 일정 조율', coordinator: '김민지', createdAt: '2026-05-16 14:00' },
]

export const mockNotices: Notice[] = [
  { id: 'n1', title: '2026년 7월 여름 시즌 운영 안내', type: 'general', target: 'all', author: '관리자', createdAt: '2026-06-15', isPublished: true, views: 245 },
  { id: 'n2', title: '[긴급] 세브란스병원 7/1 시스템 점검 안내', type: 'urgent', target: 'hospital', author: '관리자', createdAt: '2026-06-17', isPublished: true, views: 89 },
  { id: 'n3', title: '에이전트 수수료 정책 변경 안내 (2026.07.01~)', type: 'general', target: 'agent', author: '운영팀', createdAt: '2026-06-10', isPublished: true, views: 67 },
  { id: 'n4', title: '환자 상담 신청 폼 개선 안내', type: 'general', target: 'patient', author: '개발팀', createdAt: '2026-06-12', isPublished: true, views: 134 },
  { id: 'n5', title: '6월 통역사 우수 사례 공유', type: 'general', target: 'all', author: '코디팀', createdAt: '2026-06-08', isPublished: true, views: 312 },
  { id: 'n6', title: '아랍어 통역사 추가 모집 공고 (초안)', type: 'general', target: 'all', author: '관리자', createdAt: '2026-06-16', isPublished: false, views: 0 },
  { id: 'n7', title: '서버 점검 안내 (6/25 00:00~04:00)', type: 'maintenance', target: 'all', author: '개발팀', createdAt: '2026-06-18', isPublished: true, views: 52 },
  { id: 'n8', title: '2026년 하반기 신규 파트너 병원 소개 (작성 중)', type: 'general', target: 'all', author: '운영팀', createdAt: '2026-06-17', isPublished: false, views: 0 },
]
