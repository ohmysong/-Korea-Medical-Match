export type ConsultationStatus = 'draft' | 'submitted' | 'reviewing' | 'replied' | 'closed'
export type ProposalStatus = 'sent' | 'viewed' | 'accepted' | 'rejected'
export type PatientAppointmentStatus = 'confirmed' | 'completed' | 'cancelled'
export type PatientVehicleStatus = 'scheduled' | 'en_route' | 'arrived' | 'completed' | 'cancelled'
export type PatientInterpreterStatus = 'scheduled' | 'active' | 'completed' | 'cancelled'
export type PatientResultStatus = 'pending' | 'uploaded' | 'viewed'

export interface PatientProfile {
  id: string
  name: string
  nationality: string
  language: string
  email: string
  phone: string
  dateOfBirth: string
  gender: 'male' | 'female'
  treatmentPurpose: string
  coordinatorName: string
  coordinatorEmail: string
  coordinatorPhone: string
  registeredAt: string
}

export interface ConsultationRequest {
  id: string
  treatmentCategory: string
  treatmentDetail: string
  description: string
  medicalHistory?: string
  preferredHospitals?: string[]
  preferredDate?: string
  budget?: string
  status: ConsultationStatus
  coordinatorReply?: string
  createdAt: string
  updatedAt: string
}

export interface HospitalProposal {
  id: string
  consultationId: string
  hospitalName: string
  hospitalType: string
  doctorName: string
  doctorSpecialty: string
  treatmentPlan: string
  estimatedCost: string
  estimatedDuration: string
  features: string[]
  notes?: string
  status: ProposalStatus
  sentAt: string
  viewedAt?: string
  respondedAt?: string
}

export interface PatientAppointment {
  id: string
  hospital: string
  doctor: string
  specialty: string
  date: string
  time: string
  purpose: string
  location: string
  notes?: string
  status: PatientAppointmentStatus
}

export interface PatientVehicle {
  id: string
  date: string
  time: string
  vehicleType: string
  driver: string
  plateNumber: string
  from: string
  to: string
  status: PatientVehicleStatus
  notes?: string
}

export interface PatientInterpreter {
  id: string
  interpreterName: string
  language: string
  date: string
  time: string
  location: string
  purpose: string
  status: PatientInterpreterStatus
}

export interface PatientResult {
  id: string
  hospital: string
  resultType: string
  date: string
  fileName?: string
  fileSize?: string
  description: string
  status: PatientResultStatus
  uploadedAt?: string
  viewedAt?: string
}

export const mockPatientProfile: PatientProfile = {
  id: 'pt-001',
  name: 'Elena Petrova',
  nationality: '러시아',
  language: '러시아어',
  email: 'elena.petrova@mail.ru',
  phone: '+7-903-456-7890',
  dateOfBirth: '1982-09-14',
  gender: 'female',
  treatmentPurpose: '척추 디스크 치료',
  coordinatorName: '김민지 코디네이터',
  coordinatorEmail: 'minjkim@kmm.co.kr',
  coordinatorPhone: '010-9876-5432',
  registeredAt: '2026-05-20',
}

export const mockConsultations: ConsultationRequest[] = [
  {
    id: 'con-001',
    treatmentCategory: '척추·관절',
    treatmentDetail: '허리 디스크 (요추 추간판 탈출증)',
    description: '2년 전부터 허리 통증과 다리 저림 증상이 있습니다. 러시아에서 물리치료를 받았으나 호전이 없어 한국에서 전문 치료를 받고 싶습니다. 수술 가능 여부와 비수술 치료 옵션을 모두 알고 싶습니다.',
    medicalHistory: '고혈압(약 복용 중), 2024년 MRI 촬영 기록 있음',
    preferredHospitals: ['세브란스병원', '서울아산병원'],
    preferredDate: '2026-07-01',
    budget: '$5,000~$15,000',
    status: 'replied',
    coordinatorReply: '세브란스병원 및 삼성서울병원 두 곳에서 치료 제안을 받았습니다. 아래 제안서를 검토해 주세요. 추가 문의사항이 있으시면 언제든지 연락 주세요.',
    createdAt: '2026-05-22',
    updatedAt: '2026-06-01',
  },
  {
    id: 'con-002',
    treatmentCategory: '건강검진',
    treatmentDetail: '종합 정밀 건강검진',
    description: '척추 치료와 함께 40대 정밀 건강검진을 받고 싶습니다. 암 조기 발견을 위한 PET-CT 포함 패키지를 원합니다.',
    preferredDate: '2026-07-05',
    budget: '$2,000~$5,000',
    status: 'reviewing',
    createdAt: '2026-06-05',
    updatedAt: '2026-06-10',
  },
  {
    id: 'con-003',
    treatmentCategory: '안과',
    treatmentDetail: '라식·라섹 시력 교정',
    description: '시력 교정 수술을 고려 중입니다. 러시아에서는 아직 상담을 받지 않았으며 한국에서 처음으로 검사와 수술을 받고 싶습니다.',
    status: 'draft',
    createdAt: '2026-06-15',
    updatedAt: '2026-06-15',
  },
]

export const mockProposals: HospitalProposal[] = [
  {
    id: 'prop-001',
    consultationId: 'con-001',
    hospitalName: '세브란스병원',
    hospitalType: '상급종합병원',
    doctorName: '박성훈 교수',
    doctorSpecialty: '신경외과',
    treatmentPlan: '최소침습 척추 수술 (MISS) 또는 비수술 치료(신경성형술+물리치료). 첫 방문 시 정밀 MRI + 신경과 전문의 진료 후 최종 결정.',
    estimatedCost: '$8,000~$12,000',
    estimatedDuration: '입원 3~5일 + 외래 3~4회',
    features: ['JCI 국제인증', '러시아어 통역 지원', '국제진료센터 운영', '픽업 서비스 제공'],
    notes: '수술 결정 전 정밀검사 비용 별도 (약 $500~$800). 비수술 치료 선택 시 일정이 단축됩니다.',
    status: 'accepted',
    sentAt: '2026-06-01',
    viewedAt: '2026-06-02',
    respondedAt: '2026-06-03',
  },
  {
    id: 'prop-002',
    consultationId: 'con-001',
    hospitalName: '삼성서울병원',
    hospitalType: '상급종합병원',
    doctorName: '이재원 교수',
    doctorSpecialty: '정형외과',
    treatmentPlan: '내시경 척추 수술 전문 센터. 최첨단 로봇 수술 시스템 보유. 비수술 치료와 수술 모두 가능하며 환자 상태에 따라 맞춤 결정.',
    estimatedCost: '$9,000~$14,000',
    estimatedDuration: '입원 4~6일 + 외래 4~5회',
    features: ['로봇 수술 시스템', '다국어 지원', '프리미엄 병실'],
    status: 'viewed',
    sentAt: '2026-06-01',
    viewedAt: '2026-06-04',
  },
  {
    id: 'prop-003',
    consultationId: 'con-002',
    hospitalName: '강남세란병원',
    hospitalType: '건강검진 전문',
    doctorName: '건강검진센터',
    doctorSpecialty: '내과·영상의학과',
    treatmentPlan: '프리미엄 정밀 건강검진 패키지 (PET-CT 포함). 암 조기진단 + 심혈관 + 뇌 MRI 통합 패키지. 결과 당일 영문 리포트 제공.',
    estimatedCost: '$3,200~$4,500',
    estimatedDuration: '1일 (8시간)',
    features: ['영문 리포트 즉시 제공', '전일제 VIP 검진', '점심 제공', '통역 포함'],
    notes: '예약 2주 전 사전 문진표 작성 필요.',
    status: 'sent',
    sentAt: '2026-06-12',
  },
]

export const mockPatientAppointments: PatientAppointment[] = [
  {
    id: 'pa-001',
    hospital: '세브란스병원',
    doctor: '박성훈 교수',
    specialty: '신경외과',
    date: '2026-07-08',
    time: '10:00',
    purpose: '척추 디스크 정밀 진료 및 치료 계획 수립',
    location: '세브란스병원 신관 5층 신경외과 외래',
    notes: '러시아어 통역사 동반 예정. MRI 필름 지참 요망.',
    status: 'confirmed',
  },
  {
    id: 'pa-002',
    hospital: '세브란스병원',
    doctor: '방사선과',
    specialty: '영상의학과',
    date: '2026-07-07',
    time: '09:00',
    purpose: '수술 전 정밀 MRI 검사 (요추·경추)',
    location: '세브란스병원 지하 1층 영상의학과',
    notes: '검사 전날 자정부터 금식',
    status: 'confirmed',
  },
  {
    id: 'pa-003',
    hospital: '삼성서울병원',
    doctor: '이재원 교수',
    specialty: '정형외과',
    date: '2026-06-10',
    time: '14:00',
    purpose: '척추 치료 세컨드 오피니언 진료',
    location: '삼성서울병원 외래 정형외과',
    status: 'completed',
  },
  {
    id: 'pa-004',
    hospital: '강남세란병원',
    doctor: '건강검진센터',
    specialty: '종합검진',
    date: '2026-07-12',
    time: '08:00',
    purpose: '종합 정밀 건강검진 (PET-CT 포함)',
    location: '강남세란병원 VIP 건강검진센터',
    notes: '검사 전날 저녁 9시 이후 금식',
    status: 'confirmed',
  },
]

export const mockPatientVehicles: PatientVehicle[] = [
  {
    id: 'pv-001',
    date: '2026-07-01',
    time: '13:30',
    vehicleType: 'VAN',
    driver: '이철수',
    plateNumber: '34나 5678',
    from: '인천국제공항 T1',
    to: '메디스테이 강남',
    status: 'scheduled',
    notes: '인천공항 1터미널 3번 출구 픽업. 이름 피켓 소지.',
  },
  {
    id: 'pv-002',
    date: '2026-07-07',
    time: '08:30',
    vehicleType: 'SEDAN',
    driver: '홍길동',
    plateNumber: '12가 3456',
    from: '메디스테이 강남',
    to: '세브란스병원',
    status: 'scheduled',
  },
  {
    id: 'pv-003',
    date: '2026-07-08',
    time: '09:00',
    vehicleType: 'SEDAN',
    driver: '홍길동',
    plateNumber: '12가 3456',
    from: '메디스테이 강남',
    to: '세브란스병원',
    status: 'scheduled',
  },
  {
    id: 'pv-004',
    date: '2026-06-10',
    time: '13:00',
    vehicleType: 'SEDAN',
    driver: '김영호',
    plateNumber: '56다 7890',
    from: '메디스테이 강남',
    to: '삼성서울병원',
    status: 'completed',
  },
]

export const mockPatientInterpreters: PatientInterpreter[] = [
  {
    id: 'pi-001',
    interpreterName: '이리나 킴',
    language: '러시아어',
    date: '2026-07-08',
    time: '09:45',
    location: '세브란스병원 신관 5층 신경외과 외래',
    purpose: '척추 디스크 진료 (박성훈 교수)',
    status: 'scheduled',
  },
  {
    id: 'pi-002',
    interpreterName: '이리나 킴',
    language: '러시아어',
    date: '2026-07-07',
    time: '08:45',
    location: '세브란스병원 지하 1층 영상의학과',
    purpose: 'MRI 검사 안내 및 결과 통역',
    status: 'scheduled',
  },
  {
    id: 'pi-003',
    interpreterName: '이리나 킴',
    language: '러시아어',
    date: '2026-06-10',
    time: '13:45',
    location: '삼성서울병원 외래 정형외과',
    purpose: '세컨드 오피니언 진료 통역',
    status: 'completed',
  },
]

export const mockPatientResults: PatientResult[] = [
  {
    id: 'pr-001',
    hospital: '삼성서울병원',
    resultType: '정형외과 진료 소견서',
    date: '2026-06-10',
    fileName: 'samsung_spine_opinion_20260610.pdf',
    fileSize: '1.2 MB',
    description: '이재원 교수 진료 소견 — 수술적 치료보다 비침습 치료 우선 권고. 세부 내용은 파일 참조.',
    status: 'viewed',
    uploadedAt: '2026-06-11',
    viewedAt: '2026-06-12',
  },
  {
    id: 'pr-002',
    hospital: '세브란스병원',
    resultType: '혈액 검사 결과지',
    date: '2026-06-15',
    fileName: 'severance_blood_20260615.pdf',
    fileSize: '0.8 MB',
    description: '수술 전 기본 혈액 검사 (혈액형, CBC, 간기능, 신장기능, 혈당 등). 전반적으로 정상 범위.',
    status: 'uploaded',
    uploadedAt: '2026-06-16',
  },
  {
    id: 'pr-003',
    hospital: '세브란스병원',
    resultType: 'MRI 영상 결과 (예정)',
    date: '2026-07-07',
    description: '요추·경추 정밀 MRI 검사 결과. 검사 완료 후 업로드 예정.',
    status: 'pending',
  },
]
