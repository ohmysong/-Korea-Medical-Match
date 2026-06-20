export type InquiryStatus = 'new' | 'reviewed' | 'responded' | 'converted'
export type AppointmentStatus = 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled'
export type ServiceRequestType = 'interpreter' | 'vehicle'
export type ServiceRequestStatus = 'pending' | 'assigned' | 'completed' | 'cancelled'
export type ResultUploadStatus = 'pending' | 'uploaded' | 'sent'
export type HospitalPricingCategory = '수술' | '시술' | '건강검진' | '내과' | '외과' | '재생의학'
export type HospitalSettlementStatus = 'pending' | 'processing' | 'completed'
export type HospitalPortalType = 'general' | 'premium' | 'checkup' | 'regenerative'

export interface HospitalInquiry {
  id: string
  patientName: string
  nationality: string
  email: string
  phone: string
  treatmentInterest: string
  message: string
  preferredDate?: string
  status: InquiryStatus
  agentName?: string
  createdAt: string
}

export interface HospitalAppointment {
  id: string
  patientName: string
  nationality: string
  treatment: string
  requestedDate: string
  confirmedDate?: string
  doctor: string
  status: AppointmentStatus
  needsInterpreter: boolean
  needsVehicle: boolean
  note?: string
  inquiryId?: string
  createdAt: string
}

export interface ServiceRequest {
  id: string
  appointmentId: string
  patientName: string
  nationality: string
  type: ServiceRequestType
  requestedDate: string
  language?: string
  vehicleType?: string
  pickupLocation?: string
  destination?: string
  status: ServiceRequestStatus
  assignedName?: string
  note?: string
  createdAt: string
}

export interface MedicalResult {
  id: string
  patientName: string
  nationality: string
  treatment: string
  visitDate: string
  doctor: string
  status: ResultUploadStatus
  fileName?: string
  uploadedAt?: string
  sentAt?: string
}

export interface HospitalPricingItem {
  id: string
  treatmentName: string
  treatmentNameEn: string
  category: HospitalPricingCategory
  priceMin: number
  priceMax: number
  duration: string
  recovery: string
  isPublished: boolean
  lastUpdated: string
}

export interface HospitalSettlement {
  id: string
  patientName: string
  nationality: string
  treatment: string
  visitDate: string
  totalAmount: number
  commissionRate: number
  commissionAmount: number
  netAmount: number
  status: HospitalSettlementStatus
  expectedPayDate: string
  paidDate?: string
}

export interface HospitalProfile {
  id: string
  name: string
  nameEn: string
  type: HospitalPortalType
  description: string
  address: string
  phone: string
  email: string
  website: string
  specialties: string[]
  languages: string[]
  accreditations: string[]
  internationalDept: boolean
  internationalDeptContact: string
  internationalDeptEmail: string
  bedCount: number
  establishedYear: number
}

export const mockHospitalProfile: HospitalProfile = {
  id: 'severance-001',
  name: '세브란스병원',
  nameEn: 'Severance Hospital',
  type: 'general',
  description: '연세대학교의료원 소속 상급종합병원으로, 국내 최고 수준의 의료 서비스를 제공합니다. 1885년 설립 이래 외국인 환자를 위한 국제진료센터를 운영하고 있습니다.',
  address: '서울특별시 서대문구 연세로 50-1',
  phone: '02-2228-0000',
  email: 'international@severance.ac.kr',
  website: 'https://www.severance.ac.kr',
  specialties: ['암센터', '심장혈관병원', '신경과', '정형외과', '소화기내과', '안과', '산부인과', '내분비내과'],
  languages: ['영어', '중국어', '러시아어', '아랍어', '몽골어', '일본어'],
  accreditations: ['JCI 국제인증', '의료기관 인증', '암 전문 인증기관', 'ISO 9001'],
  internationalDept: true,
  internationalDeptContact: '김국제 과장',
  internationalDeptEmail: 'intl@severance.ac.kr',
  bedCount: 2500,
  establishedYear: 1885,
}

export const mockHospitalInquiries: HospitalInquiry[] = [
  {
    id: 'inq-001',
    patientName: 'Wang Fang',
    nationality: '중국',
    email: 'wangfang@email.cn',
    phone: '+86-135-1234-5678',
    treatmentInterest: '위암 수술',
    message: '아버지께서 위암 3기 판정을 받으셨습니다. 한국에서 수술을 받고 싶은데 가능한지 문의드립니다. 복강경 수술이 가능한지, 대략적인 비용과 입원 기간이 궁금합니다.',
    preferredDate: '2026-07-15',
    status: 'new',
    agentName: '베이징 메디칼 에이전시',
    createdAt: '2026-06-17',
  },
  {
    id: 'inq-002',
    patientName: 'Natasha Ivanova',
    nationality: '러시아',
    email: 'natasha.i@mail.ru',
    phone: '+7-903-234-5678',
    treatmentInterest: '심장 검진 및 치료',
    message: '심장 판막 이상으로 정밀 검진이 필요합니다. 수술 가능 여부와 비용을 알고 싶습니다.',
    preferredDate: '2026-07-10',
    status: 'reviewed',
    agentName: '모스크바 메드투어',
    createdAt: '2026-06-16',
  },
  {
    id: 'inq-003',
    patientName: 'Mohammed Al-Rashidi',
    nationality: 'UAE',
    email: 'rashidi@gmail.com',
    phone: '+971-50-345-6789',
    treatmentInterest: '척추 수술',
    message: '척추 디스크 수술을 희망합니다. 최소 침습 방식으로 가능한지 확인 부탁드립니다.',
    status: 'responded',
    agentName: '두바이 헬스케어 에이전시',
    createdAt: '2026-06-15',
  },
  {
    id: 'inq-004',
    patientName: 'Batmunkh Gantulga',
    nationality: '몽골',
    email: 'batmunkh@yahoo.com',
    phone: '+976-9911-2345',
    treatmentInterest: '간 이식',
    message: '간경화 말기로 간 이식이 필요합니다. 외국인 환자도 간 이식 가능한지 알고 싶습니다.',
    status: 'responded',
    createdAt: '2026-06-14',
  },
  {
    id: 'inq-005',
    patientName: 'Sakura Tanaka',
    nationality: '일본',
    email: 'sakura.t@outlook.jp',
    phone: '+81-90-1234-5678',
    treatmentInterest: '유방암 치료',
    message: '유방암 조기 발견. 한국 병원에서의 치료 옵션과 비용에 대해 문의합니다.',
    preferredDate: '2026-07-20',
    status: 'converted',
    agentName: '도쿄 메디투어',
    createdAt: '2026-06-13',
  },
  {
    id: 'inq-006',
    patientName: 'Chen Jing',
    nationality: '중국',
    email: 'chenjing@126.com',
    phone: '+86-186-5678-9012',
    treatmentInterest: '뇌종양 제거',
    message: '뇌종양 수술을 위해 최고 수준의 병원을 찾고 있습니다. 신경외과 전문의 상담을 요청합니다.',
    status: 'new',
    agentName: '상하이 메디칼 코디',
    createdAt: '2026-06-17',
  },
  {
    id: 'inq-007',
    patientName: 'Fatima Al-Zaabi',
    nationality: 'UAE',
    email: 'fatima.z@gmail.com',
    phone: '+971-55-678-9012',
    treatmentInterest: '불임 치료 / IVF',
    message: '3년째 시험관 아기 시술을 시도 중입니다. 한국에서 성공 사례가 많다고 들었습니다.',
    preferredDate: '2026-08-01',
    status: 'reviewed',
    createdAt: '2026-06-16',
  },
  {
    id: 'inq-008',
    patientName: 'Dmitry Volkov',
    nationality: '러시아',
    email: 'dmitry.v@mail.ru',
    phone: '+7-911-789-0123',
    treatmentInterest: '당뇨 합병증 치료',
    message: '당뇨 합병증으로 발 괴사가 진행 중입니다. 혈관 수술 가능 여부 문의합니다.',
    status: 'new',
    createdAt: '2026-06-18',
  },
  {
    id: 'inq-009',
    patientName: 'Li Mingzhu',
    nationality: '중국',
    email: 'lmz@163.com',
    phone: '+86-139-8901-2345',
    treatmentInterest: '정형외과 무릎 수술',
    message: '무릎 연골 손상으로 인공관절 수술이 필요합니다. 최소 입원 기간과 회복 기간이 궁금합니다.',
    preferredDate: '2026-07-28',
    status: 'converted',
    agentName: '베이징 메디칼 에이전시',
    createdAt: '2026-06-12',
  },
  {
    id: 'inq-010',
    patientName: 'Aisha Raisova',
    nationality: '카자흐스탄',
    email: 'aisha.r@gmail.com',
    phone: '+7-701-901-2345',
    treatmentInterest: '폐암 수술',
    message: '폐암 2기 진단. 수술 후 항암 치료 병행 계획입니다. 전체 치료 패키지 견적이 필요합니다.',
    status: 'reviewed',
    agentName: '알마티 메드투어',
    createdAt: '2026-06-15',
  },
  {
    id: 'inq-011',
    patientName: 'Elena Petrova',
    nationality: '러시아',
    email: 'elena.petrova@mail.ru',
    phone: '+7-903-456-7890',
    treatmentInterest: '척추 디스크 치료 (요추 추간판 탈출증)',
    message: '2년 전부터 허리 통증과 다리 저림 증상. 최소침습 수술 가능 여부 및 비용 문의.',
    preferredDate: '2026-07-08',
    status: 'converted',
    createdAt: '2026-05-22',
  },
]

export const mockHospitalAppointments: HospitalAppointment[] = [
  {
    id: 'apt-001',
    patientName: 'Sakura Tanaka',
    nationality: '일본',
    treatment: '유방암 수술 전 검진',
    requestedDate: '2026-07-03',
    confirmedDate: '2026-07-03',
    doctor: '김정희 교수 (외과)',
    status: 'confirmed',
    needsInterpreter: true,
    needsVehicle: true,
    note: '일본어 통역사 배정 완료. 공항 픽업 요청.',
    inquiryId: 'inq-005',
    createdAt: '2026-06-14',
  },
  {
    id: 'apt-002',
    patientName: 'Li Mingzhu',
    nationality: '중국',
    treatment: '무릎 인공관절 수술',
    requestedDate: '2026-07-28',
    confirmedDate: '2026-07-28',
    doctor: '박동현 교수 (정형외과)',
    status: 'confirmed',
    needsInterpreter: true,
    needsVehicle: false,
    note: '중국어 통역사 필요.',
    inquiryId: 'inq-009',
    createdAt: '2026-06-13',
  },
  {
    id: 'apt-003',
    patientName: 'Wang Fang',
    nationality: '중국',
    treatment: '위암 수술 상담',
    requestedDate: '2026-07-15',
    doctor: '이수현 교수 (소화기외과)',
    status: 'pending',
    needsInterpreter: true,
    needsVehicle: true,
    inquiryId: 'inq-001',
    createdAt: '2026-06-17',
  },
  {
    id: 'apt-004',
    patientName: 'Natasha Ivanova',
    nationality: '러시아',
    treatment: '심장 정밀 검진',
    requestedDate: '2026-07-10',
    doctor: '최성진 교수 (심장내과)',
    status: 'pending',
    needsInterpreter: true,
    needsVehicle: true,
    inquiryId: 'inq-002',
    createdAt: '2026-06-16',
  },
  {
    id: 'apt-005',
    patientName: 'Mohammed Al-Rashidi',
    nationality: 'UAE',
    treatment: '척추 MRI 및 수술 상담',
    requestedDate: '2026-07-08',
    confirmedDate: '2026-07-08',
    doctor: '정민호 교수 (신경외과)',
    status: 'confirmed',
    needsInterpreter: false,
    needsVehicle: false,
    note: '영어 가능 의사 배정 완료',
    inquiryId: 'inq-003',
    createdAt: '2026-06-15',
  },
  {
    id: 'apt-006',
    patientName: 'Kim Soo-jin',
    nationality: '재외동포',
    treatment: '두뇌 정밀 검진',
    requestedDate: '2026-06-25',
    confirmedDate: '2026-06-25',
    doctor: '홍길동 교수 (신경과)',
    status: 'completed',
    needsInterpreter: false,
    needsVehicle: false,
    createdAt: '2026-06-10',
  },
  {
    id: 'apt-007',
    patientName: 'Chen Jing',
    nationality: '중국',
    treatment: '뇌종양 수술 상담',
    requestedDate: '2026-07-05',
    doctor: '유재원 교수 (신경외과)',
    status: 'pending',
    needsInterpreter: true,
    needsVehicle: true,
    inquiryId: 'inq-006',
    createdAt: '2026-06-17',
  },
  {
    id: 'apt-008',
    patientName: 'Park Ji-young',
    nationality: '재외동포',
    treatment: '갑상선 수술',
    requestedDate: '2026-06-30',
    confirmedDate: '2026-06-30',
    doctor: '김현수 교수 (내분비외과)',
    status: 'completed',
    needsInterpreter: false,
    needsVehicle: true,
    createdAt: '2026-06-05',
  },
  {
    id: 'apt-009',
    patientName: 'Fatima Al-Zaabi',
    nationality: 'UAE',
    treatment: 'IVF 상담 및 검사',
    requestedDate: '2026-08-05',
    doctor: '이지현 교수 (산부인과)',
    status: 'pending',
    needsInterpreter: true,
    needsVehicle: false,
    inquiryId: 'inq-007',
    createdAt: '2026-06-16',
  },
  {
    id: 'apt-010',
    patientName: 'Batmunkh Gantulga',
    nationality: '몽골',
    treatment: '간 기능 검사 및 상담',
    requestedDate: '2026-07-20',
    doctor: '조상훈 교수 (간담췌외과)',
    status: 'pending',
    needsInterpreter: true,
    needsVehicle: false,
    inquiryId: 'inq-004',
    createdAt: '2026-06-14',
  },
  {
    id: 'apt-011',
    patientName: 'Alexei Petrov',
    nationality: '러시아',
    treatment: '무릎 연골 복원 수술',
    requestedDate: '2026-07-12',
    doctor: '박동현 교수 (정형외과)',
    status: 'rejected',
    needsInterpreter: true,
    needsVehicle: true,
    note: '해당 날짜 수술 일정 불가. 환자에게 다른 날짜 안내 필요.',
    createdAt: '2026-06-11',
  },
  {
    id: 'apt-012',
    patientName: 'Huang Wei',
    nationality: '중국',
    treatment: '대장암 수술',
    requestedDate: '2026-06-20',
    confirmedDate: '2026-06-20',
    doctor: '문대석 교수 (대장항문외과)',
    status: 'completed',
    needsInterpreter: true,
    needsVehicle: true,
    createdAt: '2026-06-08',
  },
  {
    id: 'apt-013',
    patientName: 'Elena Petrova',
    nationality: '러시아',
    treatment: '척추 디스크 진료 및 수술 상담',
    requestedDate: '2026-07-08',
    confirmedDate: '2026-07-08',
    doctor: '박성훈 교수 (신경외과)',
    status: 'confirmed',
    needsInterpreter: true,
    needsVehicle: false,
    note: '러시아어 통역 이리나 킴 배정 완료.',
    inquiryId: 'inq-011',
    createdAt: '2026-06-03',
  },
]

export const mockServiceRequests: ServiceRequest[] = [
  {
    id: 'svc-001',
    appointmentId: 'apt-001',
    patientName: 'Sakura Tanaka',
    nationality: '일본',
    type: 'interpreter',
    requestedDate: '2026-07-03',
    language: '일본어',
    status: 'assigned',
    assignedName: '다나카 유코',
    createdAt: '2026-06-14',
  },
  {
    id: 'svc-002',
    appointmentId: 'apt-001',
    patientName: 'Sakura Tanaka',
    nationality: '일본',
    type: 'vehicle',
    requestedDate: '2026-07-03',
    vehicleType: 'VAN',
    pickupLocation: '인천국제공항 T2',
    destination: '세브란스병원',
    status: 'assigned',
    assignedName: '차량 56다 7890 (김영호)',
    createdAt: '2026-06-14',
  },
  {
    id: 'svc-003',
    appointmentId: 'apt-002',
    patientName: 'Li Mingzhu',
    nationality: '중국',
    type: 'interpreter',
    requestedDate: '2026-07-28',
    language: '중국어',
    status: 'pending',
    createdAt: '2026-06-13',
  },
  {
    id: 'svc-004',
    appointmentId: 'apt-003',
    patientName: 'Wang Fang',
    nationality: '중국',
    type: 'interpreter',
    requestedDate: '2026-07-15',
    language: '중국어',
    status: 'pending',
    createdAt: '2026-06-17',
  },
  {
    id: 'svc-005',
    appointmentId: 'apt-003',
    patientName: 'Wang Fang',
    nationality: '중국',
    type: 'vehicle',
    requestedDate: '2026-07-15',
    vehicleType: 'SEDAN',
    pickupLocation: '강남구 호텔 리츠칼튼',
    destination: '세브란스병원',
    status: 'pending',
    createdAt: '2026-06-17',
  },
  {
    id: 'svc-006',
    appointmentId: 'apt-004',
    patientName: 'Natasha Ivanova',
    nationality: '러시아',
    type: 'interpreter',
    requestedDate: '2026-07-10',
    language: '러시아어',
    status: 'pending',
    createdAt: '2026-06-16',
  },
  {
    id: 'svc-007',
    appointmentId: 'apt-012',
    patientName: 'Huang Wei',
    nationality: '중국',
    type: 'interpreter',
    requestedDate: '2026-06-20',
    language: '중국어',
    status: 'completed',
    assignedName: '장하오',
    createdAt: '2026-06-08',
  },
  {
    id: 'svc-008',
    appointmentId: 'apt-012',
    patientName: 'Huang Wei',
    nationality: '중국',
    type: 'vehicle',
    requestedDate: '2026-06-20',
    vehicleType: 'SEDAN',
    pickupLocation: '서울 조선호텔',
    destination: '세브란스병원',
    status: 'completed',
    assignedName: '차량 12가 3456 (홍길동)',
    createdAt: '2026-06-08',
  },
  {
    id: 'svc-009',
    appointmentId: 'apt-013',
    patientName: 'Elena Petrova',
    nationality: '러시아',
    type: 'interpreter',
    requestedDate: '2026-07-08',
    language: '러시아어',
    status: 'assigned',
    assignedName: '이리나 킴',
    createdAt: '2026-06-05',
  },
]

export const mockMedicalResults: MedicalResult[] = [
  {
    id: 'res-001',
    patientName: 'Huang Wei',
    nationality: '중국',
    treatment: '대장암 수술',
    visitDate: '2026-06-20',
    doctor: '문대석 교수',
    status: 'uploaded',
    fileName: 'huang-wei-surgical-report.pdf',
    uploadedAt: '2026-06-21',
  },
  {
    id: 'res-002',
    patientName: 'Park Ji-young',
    nationality: '재외동포',
    treatment: '갑상선 수술',
    visitDate: '2026-06-30',
    doctor: '김현수 교수',
    status: 'pending',
  },
  {
    id: 'res-003',
    patientName: 'Kim Soo-jin',
    nationality: '재외동포',
    treatment: '두뇌 정밀 검진',
    visitDate: '2026-06-25',
    doctor: '홍길동 교수',
    status: 'sent',
    fileName: 'kim-soojin-brain-mri.pdf',
    uploadedAt: '2026-06-26',
    sentAt: '2026-06-27',
  },
  {
    id: 'res-004',
    patientName: 'Yuki Kobayashi',
    nationality: '일본',
    treatment: '위내시경 검사',
    visitDate: '2026-06-10',
    doctor: '장태영 교수',
    status: 'sent',
    fileName: 'kobayashi-endoscopy-report.pdf',
    uploadedAt: '2026-06-11',
    sentAt: '2026-06-12',
  },
  {
    id: 'res-005',
    patientName: 'Dmitry Volkov',
    nationality: '러시아',
    treatment: '당뇨 합병증 검사',
    visitDate: '2026-06-18',
    doctor: '임상훈 교수',
    status: 'uploaded',
    fileName: 'volkov-diabetes-report.pdf',
    uploadedAt: '2026-06-18',
  },
  {
    id: 'res-006',
    patientName: 'Sakura Tanaka',
    nationality: '일본',
    treatment: '유방암 수술 전 검진',
    visitDate: '2026-07-03',
    doctor: '김정희 교수',
    status: 'pending',
  },
  {
    id: 'res-007',
    patientName: 'Mohammed Al-Rashidi',
    nationality: 'UAE',
    treatment: '척추 MRI',
    visitDate: '2026-07-08',
    doctor: '정민호 교수',
    status: 'pending',
  },
  {
    id: 'res-008',
    patientName: 'Chen Jing',
    nationality: '중국',
    treatment: '뇌 MRI',
    visitDate: '2026-07-05',
    doctor: '유재원 교수',
    status: 'pending',
  },
  {
    id: 'res-009',
    patientName: 'Elena Petrova',
    nationality: '러시아',
    treatment: '혈액 검사',
    visitDate: '2026-06-15',
    doctor: '검사팀',
    status: 'sent',
    fileName: 'petrova-blood-test-20260615.pdf',
    uploadedAt: '2026-06-16',
    sentAt: '2026-06-16',
  },
  {
    id: 'res-010',
    patientName: 'Elena Petrova',
    nationality: '러시아',
    treatment: '요추·경추 정밀 MRI',
    visitDate: '2026-07-07',
    doctor: '방사선과',
    status: 'pending',
  },
]

export const mockHospitalPricing: HospitalPricingItem[] = [
  {
    id: 'price-001',
    treatmentName: '위암 수술 (복강경)',
    treatmentNameEn: 'Laparoscopic Stomach Cancer Surgery',
    category: '수술',
    priceMin: 8000000,
    priceMax: 15000000,
    duration: '3-4시간',
    recovery: '7-10일 입원',
    isPublished: true,
    lastUpdated: '2026-05-01',
  },
  {
    id: 'price-002',
    treatmentName: '무릎 인공관절 수술',
    treatmentNameEn: 'Total Knee Replacement',
    category: '수술',
    priceMin: 7000000,
    priceMax: 12000000,
    duration: '2-3시간',
    recovery: '5-7일 입원',
    isPublished: true,
    lastUpdated: '2026-05-01',
  },
  {
    id: 'price-003',
    treatmentName: '척추 내시경 수술',
    treatmentNameEn: 'Endoscopic Spine Surgery',
    category: '수술',
    priceMin: 5000000,
    priceMax: 9000000,
    duration: '1-2시간',
    recovery: '2-3일 입원',
    isPublished: true,
    lastUpdated: '2026-04-15',
  },
  {
    id: 'price-004',
    treatmentName: '심장 정밀 검진 패키지',
    treatmentNameEn: 'Comprehensive Cardiac Checkup',
    category: '건강검진',
    priceMin: 1500000,
    priceMax: 2500000,
    duration: '1일',
    recovery: '당일 귀가',
    isPublished: true,
    lastUpdated: '2026-05-10',
  },
  {
    id: 'price-005',
    treatmentName: '암 정밀 검진 패키지 (PET-CT 포함)',
    treatmentNameEn: 'Cancer Screening with PET-CT',
    category: '건강검진',
    priceMin: 2000000,
    priceMax: 3500000,
    duration: '1-2일',
    recovery: '당일 귀가',
    isPublished: true,
    lastUpdated: '2026-05-10',
  },
  {
    id: 'price-006',
    treatmentName: '뇌 MRI + 신경과 상담',
    treatmentNameEn: 'Brain MRI + Neurology Consultation',
    category: '내과',
    priceMin: 500000,
    priceMax: 900000,
    duration: '2-3시간',
    recovery: '당일 귀가',
    isPublished: true,
    lastUpdated: '2026-04-20',
  },
  {
    id: 'price-007',
    treatmentName: '간 이식 수술',
    treatmentNameEn: 'Liver Transplant Surgery',
    category: '수술',
    priceMin: 50000000,
    priceMax: 80000000,
    duration: '8-12시간',
    recovery: '21-30일 입원',
    isPublished: false,
    lastUpdated: '2026-03-01',
  },
  {
    id: 'price-008',
    treatmentName: '대장내시경 (수면)',
    treatmentNameEn: 'Colonoscopy (Sedation)',
    category: '내과',
    priceMin: 150000,
    priceMax: 300000,
    duration: '1-2시간',
    recovery: '당일 귀가',
    isPublished: true,
    lastUpdated: '2026-05-15',
  },
  {
    id: 'price-009',
    treatmentName: '시험관 아기 시술 (IVF) 1회',
    treatmentNameEn: 'In Vitro Fertilization (1 Cycle)',
    category: '외과',
    priceMin: 3000000,
    priceMax: 5000000,
    duration: '4-6주 과정',
    recovery: '외래 진료',
    isPublished: true,
    lastUpdated: '2026-05-20',
  },
  {
    id: 'price-010',
    treatmentName: '유방암 수술 (로봇)',
    treatmentNameEn: 'Robotic Breast Cancer Surgery',
    category: '수술',
    priceMin: 10000000,
    priceMax: 18000000,
    duration: '3-5시간',
    recovery: '5-7일 입원',
    isPublished: false,
    lastUpdated: '2026-04-01',
  },
]

export const mockHospitalSettlements: HospitalSettlement[] = [
  {
    id: 'stl-001',
    patientName: 'Huang Wei',
    nationality: '중국',
    treatment: '대장암 수술',
    visitDate: '2026-06-20',
    totalAmount: 12000000,
    commissionRate: 15,
    commissionAmount: 1800000,
    netAmount: 10200000,
    status: 'processing',
    expectedPayDate: '2026-07-20',
  },
  {
    id: 'stl-002',
    patientName: 'Kim Soo-jin',
    nationality: '재외동포',
    treatment: '두뇌 정밀 검진',
    visitDate: '2026-06-25',
    totalAmount: 800000,
    commissionRate: 10,
    commissionAmount: 80000,
    netAmount: 720000,
    status: 'pending',
    expectedPayDate: '2026-07-25',
  },
  {
    id: 'stl-003',
    patientName: 'Yuki Kobayashi',
    nationality: '일본',
    treatment: '위내시경 검사',
    visitDate: '2026-06-10',
    totalAmount: 250000,
    commissionRate: 10,
    commissionAmount: 25000,
    netAmount: 225000,
    status: 'completed',
    expectedPayDate: '2026-07-10',
    paidDate: '2026-07-05',
  },
  {
    id: 'stl-004',
    patientName: 'Alexei Petrov',
    nationality: '러시아',
    treatment: '정형외과 상담',
    visitDate: '2026-05-28',
    totalAmount: 150000,
    commissionRate: 10,
    commissionAmount: 15000,
    netAmount: 135000,
    status: 'completed',
    expectedPayDate: '2026-06-28',
    paidDate: '2026-06-25',
  },
  {
    id: 'stl-005',
    patientName: 'Li Wei',
    nationality: '중국',
    treatment: '위암 수술',
    visitDate: '2026-05-15',
    totalAmount: 11000000,
    commissionRate: 15,
    commissionAmount: 1650000,
    netAmount: 9350000,
    status: 'completed',
    expectedPayDate: '2026-06-15',
    paidDate: '2026-06-12',
  },
  {
    id: 'stl-006',
    patientName: 'Fatima Al-Zaabi',
    nationality: 'UAE',
    treatment: '건강검진 패키지',
    visitDate: '2026-06-05',
    totalAmount: 2000000,
    commissionRate: 12,
    commissionAmount: 240000,
    netAmount: 1760000,
    status: 'processing',
    expectedPayDate: '2026-07-05',
  },
  {
    id: 'stl-007',
    patientName: 'Park Ji-young',
    nationality: '재외동포',
    treatment: '갑상선 수술',
    visitDate: '2026-06-30',
    totalAmount: 4500000,
    commissionRate: 12,
    commissionAmount: 540000,
    netAmount: 3960000,
    status: 'pending',
    expectedPayDate: '2026-07-30',
  },
  {
    id: 'stl-008',
    patientName: 'Dmitry Volkov',
    nationality: '러시아',
    treatment: '당뇨 검사',
    visitDate: '2026-06-18',
    totalAmount: 350000,
    commissionRate: 10,
    commissionAmount: 35000,
    netAmount: 315000,
    status: 'pending',
    expectedPayDate: '2026-07-18',
  },
]
