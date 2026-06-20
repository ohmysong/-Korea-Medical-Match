export type GuestStatus = 'reserved' | 'checked_in' | 'checked_out' | 'cancelled'
export type CheckupStatus = 'draft' | 'submitted' | 'confirmed' | 'completed' | 'cancelled'
export type ReservationStatus = 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled'
export type VehicleAssignmentStatus = 'scheduled' | 'en_route' | 'arrived' | 'completed' | 'cancelled'
export type InterpreterAssignmentStatus = 'scheduled' | 'active' | 'completed' | 'cancelled'
export type HotelSettlementStatus = 'pending' | 'processing' | 'completed'
export type ScheduleType = 'hospital' | 'checkup' | 'vehicle' | 'interpreter'
export type ScheduleStatus = 'scheduled' | 'completed' | 'cancelled'

export interface HotelGuest {
  id: string
  name: string
  nationality: string
  email: string
  phone: string
  checkIn: string
  checkOut: string
  nights: number
  roomNumber: string
  roomType: string
  hospital: string
  treatmentPurpose: string
  status: GuestStatus
  agentName?: string
  specialRequests?: string
  createdAt: string
}

export interface CheckupApplication {
  id: string
  guestId: string
  guestName: string
  nationality: string
  hospital: string
  checkupType: string
  preferredDate: string
  confirmedDate?: string
  status: CheckupStatus
  notes?: string
  createdAt: string
}

export interface ScheduleItem {
  id: string
  guestName: string
  nationality: string
  date: string
  time: string
  type: ScheduleType
  location: string
  details: string
  status: ScheduleStatus
}

export interface HotelReservation {
  id: string
  guestName: string
  nationality: string
  roomNumber: string
  roomType: string
  checkIn: string
  checkOut: string
  nights: number
  pricePerNight: number
  totalAmount: number
  hospital: string
  treatmentPurpose: string
  status: ReservationStatus
  paymentStatus: 'pending' | 'partial' | 'paid'
  createdAt: string
}

export interface VehicleAssignment {
  id: string
  guestName: string
  nationality: string
  date: string
  time: string
  vehicleType: string
  driver: string
  plateNumber: string
  from: string
  to: string
  status: VehicleAssignmentStatus
  notes?: string
}

export interface InterpreterAssignment {
  id: string
  guestName: string
  nationality: string
  language: string
  interpreterName: string
  date: string
  time: string
  location: string
  purpose: string
  status: InterpreterAssignmentStatus
}

export interface HotelSettlement {
  id: string
  guestName: string
  nationality: string
  checkIn: string
  checkOut: string
  nights: number
  roomRevenue: number
  referralCommission: number
  packageRevenue: number
  totalRevenue: number
  status: HotelSettlementStatus
  expectedPayDate: string
  paidDate?: string
}

export interface HotelProfile {
  id: string
  name: string
  nameEn: string
  address: string
  phone: string
  email: string
  website: string
  totalRooms: number
  availableRooms: number
  starRating: number
  nearbyHospitals: string[]
  amenities: string[]
  languages: string[]
  managerName: string
  managerEmail: string
}

export const mockHotelProfile: HotelProfile = {
  id: 'medistay-001',
  name: '메디스테이 강남',
  nameEn: 'Medistay Gangnam',
  address: '서울특별시 강남구 테헤란로 123',
  phone: '02-1234-5678',
  email: 'info@medistay.co.kr',
  website: 'https://www.medistay.co.kr',
  totalRooms: 120,
  availableRooms: 34,
  starRating: 4,
  nearbyHospitals: ['삼성서울병원', '강남세란병원', 'BGN밝은눈안과', 'JK성형외과'],
  amenities: ['무료 WiFi', '조식 포함', '픽업 서비스', '의료 코디네이터', '짐 보관', '피트니스 센터'],
  languages: ['영어', '중국어', '러시아어', '아랍어'],
  managerName: '박지현 매니저',
  managerEmail: 'manager@medistay.co.kr',
}

export const mockHotelGuests: HotelGuest[] = [
  {
    id: 'hg-001',
    name: 'Mohammed Al-Rashidi',
    nationality: 'UAE',
    email: 'rashidi@gmail.com',
    phone: '+971-50-345-6789',
    checkIn: '2026-06-15',
    checkOut: '2026-07-10',
    nights: 25,
    roomNumber: '1204',
    roomType: '디럭스 더블',
    hospital: '세브란스병원',
    treatmentPurpose: '척추 수술',
    status: 'checked_in',
    agentName: '두바이 헬스케어 에이전시',
    createdAt: '2026-06-10',
  },
  {
    id: 'hg-002',
    name: 'Sakura Tanaka',
    nationality: '일본',
    email: 'sakura.t@outlook.jp',
    phone: '+81-90-1234-5678',
    checkIn: '2026-07-01',
    checkOut: '2026-07-14',
    nights: 13,
    roomNumber: '0805',
    roomType: '슈페리어 싱글',
    hospital: '세브란스병원',
    treatmentPurpose: '유방암 치료',
    status: 'reserved',
    agentName: '도쿄 메디투어',
    createdAt: '2026-06-13',
  },
  {
    id: 'hg-003',
    name: 'Li Mingzhu',
    nationality: '중국',
    email: 'lmz@163.com',
    phone: '+86-139-8901-2345',
    checkIn: '2026-07-26',
    checkOut: '2026-08-08',
    nights: 13,
    roomNumber: '1101',
    roomType: '디럭스 트윈',
    hospital: '세브란스병원',
    treatmentPurpose: '무릎 인공관절 수술',
    status: 'reserved',
    agentName: '베이징 메디칼 에이전시',
    createdAt: '2026-06-12',
  },
  {
    id: 'hg-004',
    name: 'Natasha Ivanova',
    nationality: '러시아',
    email: 'natasha.i@mail.ru',
    phone: '+7-903-234-5678',
    checkIn: '2026-07-08',
    checkOut: '2026-07-18',
    nights: 10,
    roomNumber: '0612',
    roomType: '슈페리어 더블',
    hospital: '삼성서울병원',
    treatmentPurpose: '심장 정밀 검진',
    status: 'reserved',
    agentName: '모스크바 메드투어',
    createdAt: '2026-06-16',
  },
  {
    id: 'hg-005',
    name: 'Huang Wei',
    nationality: '중국',
    email: 'huangwei@126.com',
    phone: '+86-138-0012-3456',
    checkIn: '2026-06-18',
    checkOut: '2026-07-02',
    nights: 14,
    roomNumber: '0901',
    roomType: '디럭스 더블',
    hospital: '세브란스병원',
    treatmentPurpose: '대장암 수술',
    status: 'checked_in',
    agentName: '상하이 메디칼 코디',
    createdAt: '2026-06-08',
  },
  {
    id: 'hg-006',
    name: 'Fatima Al-Zaabi',
    nationality: 'UAE',
    email: 'fatima.z@gmail.com',
    phone: '+971-55-678-9012',
    checkIn: '2026-08-03',
    checkOut: '2026-08-15',
    nights: 12,
    roomNumber: '0714',
    roomType: '디럭스 싱글',
    hospital: '세브란스병원',
    treatmentPurpose: 'IVF 시술',
    status: 'reserved',
    createdAt: '2026-06-16',
  },
  {
    id: 'hg-007',
    name: 'Dmitry Volkov',
    nationality: '러시아',
    email: 'dmitry.v@mail.ru',
    phone: '+7-911-789-0123',
    checkIn: '2026-06-17',
    checkOut: '2026-06-24',
    nights: 7,
    roomNumber: '0506',
    roomType: '슈페리어 싱글',
    hospital: '세브란스병원',
    treatmentPurpose: '당뇨 합병증 치료',
    status: 'checked_in',
    specialRequests: '저당식 식사 요청',
    createdAt: '2026-06-14',
  },
  {
    id: 'hg-008',
    name: 'Yuki Kobayashi',
    nationality: '일본',
    email: 'yuki.k@yahoo.co.jp',
    phone: '+81-80-3456-7890',
    checkIn: '2026-06-08',
    checkOut: '2026-06-13',
    nights: 5,
    roomNumber: '0311',
    roomType: '슈페리어 싱글',
    hospital: '세브란스병원',
    treatmentPurpose: '위내시경 검사',
    status: 'checked_out',
    agentName: '도쿄 메디투어',
    createdAt: '2026-06-05',
  },
  {
    id: 'hg-009',
    name: 'Chen Jing',
    nationality: '중국',
    email: 'chenjing@126.com',
    phone: '+86-186-5678-9012',
    checkIn: '2026-07-03',
    checkOut: '2026-07-17',
    nights: 14,
    roomNumber: '1305',
    roomType: '디럭스 더블',
    hospital: '세브란스병원',
    treatmentPurpose: '뇌종양 수술',
    status: 'reserved',
    agentName: '상하이 메디칼 코디',
    createdAt: '2026-06-17',
  },
  {
    id: 'hg-010',
    name: 'Aisha Raisova',
    nationality: '카자흐스탄',
    email: 'aisha.r@gmail.com',
    phone: '+7-701-901-2345',
    checkIn: '2026-06-20',
    checkOut: '2026-07-05',
    nights: 15,
    roomNumber: '0808',
    roomType: '디럭스 더블',
    hospital: '삼성서울병원',
    treatmentPurpose: '폐암 수술',
    status: 'reserved',
    agentName: '알마티 메드투어',
    createdAt: '2026-06-15',
  },
  {
    id: 'hg-011',
    name: 'Elena Petrova',
    nationality: '러시아',
    email: 'elena.petrova@mail.ru',
    phone: '+7-903-456-7890',
    checkIn: '2026-07-01',
    checkOut: '2026-07-15',
    nights: 14,
    roomNumber: '0702',
    roomType: '슈페리어 싱글',
    hospital: '세브란스병원',
    treatmentPurpose: '척추 디스크 치료',
    status: 'reserved',
    createdAt: '2026-06-03',
  },
]

export const mockCheckupApplications: CheckupApplication[] = [
  {
    id: 'ca-001',
    guestId: 'hg-001',
    guestName: 'Mohammed Al-Rashidi',
    nationality: 'UAE',
    hospital: '세브란스병원',
    checkupType: '전신 정밀 검진 패키지',
    preferredDate: '2026-07-05',
    confirmedDate: '2026-07-05',
    status: 'confirmed',
    notes: '수술 전 검진. 영어 가능 의사 배정 요청.',
    createdAt: '2026-06-16',
  },
  {
    id: 'ca-002',
    guestId: 'hg-005',
    guestName: 'Huang Wei',
    nationality: '중국',
    hospital: '세브란스병원',
    checkupType: '암 정밀 검진 (PET-CT 포함)',
    preferredDate: '2026-06-20',
    confirmedDate: '2026-06-20',
    status: 'completed',
    createdAt: '2026-06-09',
  },
  {
    id: 'ca-003',
    guestId: 'hg-004',
    guestName: 'Natasha Ivanova',
    nationality: '러시아',
    hospital: '삼성서울병원',
    checkupType: '심장 정밀 검진 패키지',
    preferredDate: '2026-07-10',
    status: 'submitted',
    notes: '러시아어 통역사 동반 예정',
    createdAt: '2026-06-17',
  },
  {
    id: 'ca-004',
    guestId: 'hg-007',
    guestName: 'Dmitry Volkov',
    nationality: '러시아',
    hospital: '세브란스병원',
    checkupType: '당뇨 합병증 정밀 검사',
    preferredDate: '2026-06-19',
    confirmedDate: '2026-06-19',
    status: 'confirmed',
    createdAt: '2026-06-15',
  },
  {
    id: 'ca-005',
    guestId: 'hg-009',
    guestName: 'Chen Jing',
    nationality: '중국',
    hospital: '세브란스병원',
    checkupType: '뇌 MRI 정밀 검진',
    preferredDate: '2026-07-05',
    status: 'submitted',
    notes: '중국어 통역사 필요',
    createdAt: '2026-06-17',
  },
  {
    id: 'ca-006',
    guestId: 'hg-002',
    guestName: 'Sakura Tanaka',
    nationality: '일본',
    hospital: '세브란스병원',
    checkupType: '유방암 수술 전 검진',
    preferredDate: '2026-07-03',
    status: 'draft',
    createdAt: '2026-06-17',
  },
  {
    id: 'ca-007',
    guestId: 'hg-008',
    guestName: 'Yuki Kobayashi',
    nationality: '일본',
    hospital: '세브란스병원',
    checkupType: '위내시경 검사 (수면)',
    preferredDate: '2026-06-10',
    confirmedDate: '2026-06-10',
    status: 'completed',
    createdAt: '2026-06-05',
  },
]

export const mockScheduleItems: ScheduleItem[] = [
  {
    id: 'sch-001',
    guestName: 'Huang Wei',
    nationality: '중국',
    date: '2026-06-18',
    time: '09:00',
    type: 'vehicle',
    location: '메디스테이 강남 → 세브란스병원',
    details: 'SEDAN 12가 3456 / 홍길동',
    status: 'scheduled',
  },
  {
    id: 'sch-002',
    guestName: 'Huang Wei',
    nationality: '중국',
    date: '2026-06-18',
    time: '09:30',
    type: 'hospital',
    location: '세브란스병원 외래',
    details: '대장암 수술 후 외래 진료',
    status: 'scheduled',
  },
  {
    id: 'sch-003',
    guestName: 'Dmitry Volkov',
    nationality: '러시아',
    date: '2026-06-18',
    time: '14:00',
    type: 'interpreter',
    location: '세브란스병원 내분비내과',
    details: '러시아어 통역 — 이리나 킴',
    status: 'scheduled',
  },
  {
    id: 'sch-004',
    guestName: 'Dmitry Volkov',
    nationality: '러시아',
    date: '2026-06-19',
    time: '09:00',
    type: 'checkup',
    location: '세브란스병원 건강검진센터',
    details: '당뇨 합병증 정밀 검사',
    status: 'scheduled',
  },
  {
    id: 'sch-005',
    guestName: 'Mohammed Al-Rashidi',
    nationality: 'UAE',
    date: '2026-07-03',
    time: '08:30',
    type: 'vehicle',
    location: '메디스테이 강남 → 세브란스병원',
    details: 'VAN 34나 5678 / 이철수',
    status: 'scheduled',
  },
  {
    id: 'sch-006',
    guestName: 'Mohammed Al-Rashidi',
    nationality: 'UAE',
    date: '2026-07-05',
    time: '09:00',
    type: 'checkup',
    location: '세브란스병원 건강검진센터',
    details: '전신 정밀 검진 패키지',
    status: 'scheduled',
  },
  {
    id: 'sch-007',
    guestName: 'Mohammed Al-Rashidi',
    nationality: 'UAE',
    date: '2026-07-08',
    time: '10:00',
    type: 'hospital',
    location: '세브란스병원 신경외과',
    details: '척추 MRI 및 수술 상담',
    status: 'scheduled',
  },
  {
    id: 'sch-008',
    guestName: 'Sakura Tanaka',
    nationality: '일본',
    date: '2026-07-01',
    time: '08:00',
    type: 'vehicle',
    location: '인천국제공항 T2 → 메디스테이 강남',
    details: 'VAN 56다 7890 / 김영호 (공항 픽업)',
    status: 'scheduled',
  },
  {
    id: 'sch-009',
    guestName: 'Sakura Tanaka',
    nationality: '일본',
    date: '2026-07-03',
    time: '09:30',
    type: 'hospital',
    location: '세브란스병원 외과',
    details: '유방암 수술 전 검진 — 김정희 교수',
    status: 'scheduled',
  },
  {
    id: 'sch-010',
    guestName: 'Sakura Tanaka',
    nationality: '일본',
    date: '2026-07-03',
    time: '09:00',
    type: 'interpreter',
    location: '세브란스병원',
    details: '일본어 통역 — 다나카 유코',
    status: 'scheduled',
  },
  {
    id: 'sch-011',
    guestName: 'Yuki Kobayashi',
    nationality: '일본',
    date: '2026-06-10',
    time: '08:30',
    type: 'checkup',
    location: '세브란스병원 소화기내과',
    details: '위내시경 검사 (수면)',
    status: 'completed',
  },
  {
    id: 'sch-012',
    guestName: 'Natasha Ivanova',
    nationality: '러시아',
    date: '2026-07-10',
    time: '09:00',
    type: 'checkup',
    location: '삼성서울병원 심장혈관병원',
    details: '심장 정밀 검진 패키지',
    status: 'scheduled',
  },
  {
    id: 'sch-013',
    guestName: 'Elena Petrova',
    nationality: '러시아',
    date: '2026-07-01',
    time: '13:30',
    type: 'vehicle',
    location: '인천국제공항 T1 → 메디스테이 강남',
    details: 'VAN 34나 5678 / 이철수 (공항 픽업)',
    status: 'scheduled',
  },
  {
    id: 'sch-014',
    guestName: 'Elena Petrova',
    nationality: '러시아',
    date: '2026-07-07',
    time: '08:30',
    type: 'vehicle',
    location: '메디스테이 강남 → 세브란스병원',
    details: 'SEDAN 12가 3456 / 홍길동',
    status: 'scheduled',
  },
  {
    id: 'sch-015',
    guestName: 'Elena Petrova',
    nationality: '러시아',
    date: '2026-07-07',
    time: '09:00',
    type: 'checkup',
    location: '세브란스병원 영상의학과',
    details: '요추·경추 정밀 MRI 검사',
    status: 'scheduled',
  },
  {
    id: 'sch-016',
    guestName: 'Elena Petrova',
    nationality: '러시아',
    date: '2026-07-08',
    time: '09:00',
    type: 'vehicle',
    location: '메디스테이 강남 → 세브란스병원',
    details: 'SEDAN 12가 3456 / 홍길동',
    status: 'scheduled',
  },
  {
    id: 'sch-017',
    guestName: 'Elena Petrova',
    nationality: '러시아',
    date: '2026-07-08',
    time: '10:00',
    type: 'hospital',
    location: '세브란스병원 신관 5층 신경외과',
    details: '척추 디스크 진료 — 박성훈 교수',
    status: 'scheduled',
  },
]

export const mockHotelReservations: HotelReservation[] = [
  {
    id: 'res-001',
    guestName: 'Mohammed Al-Rashidi',
    nationality: 'UAE',
    roomNumber: '1204',
    roomType: '디럭스 더블',
    checkIn: '2026-06-15',
    checkOut: '2026-07-10',
    nights: 25,
    pricePerNight: 180000,
    totalAmount: 4500000,
    hospital: '세브란스병원',
    treatmentPurpose: '척추 수술',
    status: 'checked_in',
    paymentStatus: 'partial',
    createdAt: '2026-06-10',
  },
  {
    id: 'res-002',
    guestName: 'Sakura Tanaka',
    nationality: '일본',
    roomNumber: '0805',
    roomType: '슈페리어 싱글',
    checkIn: '2026-07-01',
    checkOut: '2026-07-14',
    nights: 13,
    pricePerNight: 130000,
    totalAmount: 1690000,
    hospital: '세브란스병원',
    treatmentPurpose: '유방암 치료',
    status: 'confirmed',
    paymentStatus: 'pending',
    createdAt: '2026-06-13',
  },
  {
    id: 'res-003',
    guestName: 'Li Mingzhu',
    nationality: '중국',
    roomNumber: '1101',
    roomType: '디럭스 트윈',
    checkIn: '2026-07-26',
    checkOut: '2026-08-08',
    nights: 13,
    pricePerNight: 200000,
    totalAmount: 2600000,
    hospital: '세브란스병원',
    treatmentPurpose: '무릎 인공관절 수술',
    status: 'confirmed',
    paymentStatus: 'pending',
    createdAt: '2026-06-12',
  },
  {
    id: 'res-004',
    guestName: 'Natasha Ivanova',
    nationality: '러시아',
    roomNumber: '0612',
    roomType: '슈페리어 더블',
    checkIn: '2026-07-08',
    checkOut: '2026-07-18',
    nights: 10,
    pricePerNight: 150000,
    totalAmount: 1500000,
    hospital: '삼성서울병원',
    treatmentPurpose: '심장 정밀 검진',
    status: 'confirmed',
    paymentStatus: 'pending',
    createdAt: '2026-06-16',
  },
  {
    id: 'res-005',
    guestName: 'Huang Wei',
    nationality: '중국',
    roomNumber: '0901',
    roomType: '디럭스 더블',
    checkIn: '2026-06-18',
    checkOut: '2026-07-02',
    nights: 14,
    pricePerNight: 180000,
    totalAmount: 2520000,
    hospital: '세브란스병원',
    treatmentPurpose: '대장암 수술',
    status: 'checked_in',
    paymentStatus: 'paid',
    createdAt: '2026-06-08',
  },
  {
    id: 'res-006',
    guestName: 'Dmitry Volkov',
    nationality: '러시아',
    roomNumber: '0506',
    roomType: '슈페리어 싱글',
    checkIn: '2026-06-17',
    checkOut: '2026-06-24',
    nights: 7,
    pricePerNight: 130000,
    totalAmount: 910000,
    hospital: '세브란스병원',
    treatmentPurpose: '당뇨 합병증 치료',
    status: 'checked_in',
    paymentStatus: 'paid',
    createdAt: '2026-06-14',
  },
  {
    id: 'res-007',
    guestName: 'Yuki Kobayashi',
    nationality: '일본',
    roomNumber: '0311',
    roomType: '슈페리어 싱글',
    checkIn: '2026-06-08',
    checkOut: '2026-06-13',
    nights: 5,
    pricePerNight: 130000,
    totalAmount: 650000,
    hospital: '세브란스병원',
    treatmentPurpose: '위내시경 검사',
    status: 'checked_out',
    paymentStatus: 'paid',
    createdAt: '2026-06-05',
  },
  {
    id: 'res-008',
    guestName: 'Chen Jing',
    nationality: '중국',
    roomNumber: '1305',
    roomType: '디럭스 더블',
    checkIn: '2026-07-03',
    checkOut: '2026-07-17',
    nights: 14,
    pricePerNight: 180000,
    totalAmount: 2520000,
    hospital: '세브란스병원',
    treatmentPurpose: '뇌종양 수술',
    status: 'confirmed',
    paymentStatus: 'pending',
    createdAt: '2026-06-17',
  },
  {
    id: 'res-009',
    guestName: 'Elena Petrova',
    nationality: '러시아',
    roomNumber: '0702',
    roomType: '슈페리어 싱글',
    checkIn: '2026-07-01',
    checkOut: '2026-07-15',
    nights: 14,
    pricePerNight: 130000,
    totalAmount: 1820000,
    hospital: '세브란스병원',
    treatmentPurpose: '척추 디스크 치료',
    status: 'confirmed',
    paymentStatus: 'pending',
    createdAt: '2026-06-03',
  },
]

export const mockVehicleAssignments: VehicleAssignment[] = [
  {
    id: 'va-001',
    guestName: 'Huang Wei',
    nationality: '중국',
    date: '2026-06-18',
    time: '09:00',
    vehicleType: 'SEDAN',
    driver: '홍길동',
    plateNumber: '12가 3456',
    from: '메디스테이 강남',
    to: '세브란스병원',
    status: 'scheduled',
  },
  {
    id: 'va-002',
    guestName: 'Mohammed Al-Rashidi',
    nationality: 'UAE',
    date: '2026-07-03',
    time: '08:30',
    vehicleType: 'VAN',
    driver: '이철수',
    plateNumber: '34나 5678',
    from: '메디스테이 강남',
    to: '세브란스병원',
    status: 'scheduled',
  },
  {
    id: 'va-003',
    guestName: 'Sakura Tanaka',
    nationality: '일본',
    date: '2026-07-01',
    time: '08:00',
    vehicleType: 'VAN',
    driver: '김영호',
    plateNumber: '56다 7890',
    from: '인천국제공항 T2',
    to: '메디스테이 강남',
    status: 'scheduled',
    notes: '공항 픽업. 수하물 많음.',
  },
  {
    id: 'va-004',
    guestName: 'Dmitry Volkov',
    nationality: '러시아',
    date: '2026-06-19',
    time: '08:30',
    vehicleType: 'SEDAN',
    driver: '박민철',
    plateNumber: '78라 9012',
    from: '메디스테이 강남',
    to: '세브란스병원 건강검진센터',
    status: 'scheduled',
  },
  {
    id: 'va-005',
    guestName: 'Huang Wei',
    nationality: '중국',
    date: '2026-06-20',
    time: '14:00',
    vehicleType: 'SEDAN',
    driver: '홍길동',
    plateNumber: '12가 3456',
    from: '세브란스병원',
    to: '메디스테이 강남',
    status: 'completed',
  },
  {
    id: 'va-006',
    guestName: 'Yuki Kobayashi',
    nationality: '일본',
    date: '2026-06-10',
    time: '08:00',
    vehicleType: 'SEDAN',
    driver: '김영호',
    plateNumber: '56다 7890',
    from: '메디스테이 강남',
    to: '세브란스병원',
    status: 'completed',
  },
  {
    id: 'va-007',
    guestName: 'Natasha Ivanova',
    nationality: '러시아',
    date: '2026-07-08',
    time: '09:00',
    vehicleType: 'VAN',
    driver: '이철수',
    plateNumber: '34나 5678',
    from: '인천국제공항 T1',
    to: '메디스테이 강남',
    status: 'scheduled',
    notes: '공항 픽업',
  },
  {
    id: 'va-008',
    guestName: 'Chen Jing',
    nationality: '중국',
    date: '2026-07-03',
    time: '07:30',
    vehicleType: 'VAN',
    driver: '박민철',
    plateNumber: '78라 9012',
    from: '인천국제공항 T2',
    to: '메디스테이 강남',
    status: 'scheduled',
    notes: '공항 픽업. 가족 2인 동반.',
  },
  {
    id: 'va-009',
    guestName: 'Elena Petrova',
    nationality: '러시아',
    date: '2026-07-01',
    time: '13:30',
    vehicleType: 'VAN',
    driver: '이철수',
    plateNumber: '34나 5678',
    from: '인천국제공항 T1',
    to: '메디스테이 강남',
    status: 'scheduled',
    notes: '이름 피켓 소지.',
  },
  {
    id: 'va-010',
    guestName: 'Elena Petrova',
    nationality: '러시아',
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
    id: 'va-011',
    guestName: 'Elena Petrova',
    nationality: '러시아',
    date: '2026-07-08',
    time: '09:00',
    vehicleType: 'SEDAN',
    driver: '홍길동',
    plateNumber: '12가 3456',
    from: '메디스테이 강남',
    to: '세브란스병원',
    status: 'scheduled',
  },
]

export const mockInterpreterAssignments: InterpreterAssignment[] = [
  {
    id: 'ia-001',
    guestName: 'Huang Wei',
    nationality: '중국',
    language: '중국어',
    interpreterName: '장하오',
    date: '2026-06-18',
    time: '09:30',
    location: '세브란스병원 외래',
    purpose: '대장암 수술 후 외래 진료',
    status: 'scheduled',
  },
  {
    id: 'ia-002',
    guestName: 'Dmitry Volkov',
    nationality: '러시아',
    language: '러시아어',
    interpreterName: '이리나 킴',
    date: '2026-06-18',
    time: '14:00',
    location: '세브란스병원 내분비내과',
    purpose: '당뇨 합병증 진료',
    status: 'scheduled',
  },
  {
    id: 'ia-003',
    guestName: 'Mohammed Al-Rashidi',
    nationality: 'UAE',
    language: '영어',
    interpreterName: '영어 가능 의사 배정',
    date: '2026-07-08',
    time: '10:00',
    location: '세브란스병원 신경외과',
    purpose: '척추 MRI 및 수술 상담',
    status: 'scheduled',
  },
  {
    id: 'ia-004',
    guestName: 'Sakura Tanaka',
    nationality: '일본',
    language: '일본어',
    interpreterName: '다나카 유코',
    date: '2026-07-03',
    time: '09:00',
    location: '세브란스병원 외과',
    purpose: '유방암 수술 전 검진',
    status: 'scheduled',
  },
  {
    id: 'ia-005',
    guestName: 'Natasha Ivanova',
    nationality: '러시아',
    language: '러시아어',
    interpreterName: '이리나 킴',
    date: '2026-07-10',
    time: '09:00',
    location: '삼성서울병원 심장혈관병원',
    purpose: '심장 정밀 검진',
    status: 'scheduled',
  },
  {
    id: 'ia-006',
    guestName: 'Yuki Kobayashi',
    nationality: '일본',
    language: '일본어',
    interpreterName: '다나카 유코',
    date: '2026-06-10',
    time: '08:30',
    location: '세브란스병원 소화기내과',
    purpose: '위내시경 검사',
    status: 'completed',
  },
  {
    id: 'ia-007',
    guestName: 'Chen Jing',
    nationality: '중국',
    language: '중국어',
    interpreterName: '장하오',
    date: '2026-07-05',
    time: '09:30',
    location: '세브란스병원 신경외과',
    purpose: '뇌 MRI 정밀 검진',
    status: 'scheduled',
  },
  {
    id: 'ia-008',
    guestName: 'Elena Petrova',
    nationality: '러시아',
    language: '러시아어',
    interpreterName: '이리나 킴',
    date: '2026-07-07',
    time: '08:45',
    location: '세브란스병원 영상의학과',
    purpose: 'MRI 검사 안내 및 결과 통역',
    status: 'scheduled',
  },
  {
    id: 'ia-009',
    guestName: 'Elena Petrova',
    nationality: '러시아',
    language: '러시아어',
    interpreterName: '이리나 킴',
    date: '2026-07-08',
    time: '09:45',
    location: '세브란스병원 신관 5층 신경외과 외래',
    purpose: '척추 디스크 진료 (박성훈 교수)',
    status: 'scheduled',
  },
]

export const mockHotelSettlements: HotelSettlement[] = [
  {
    id: 'hs-001',
    guestName: 'Yuki Kobayashi',
    nationality: '일본',
    checkIn: '2026-06-08',
    checkOut: '2026-06-13',
    nights: 5,
    roomRevenue: 650000,
    referralCommission: 25000,
    packageRevenue: 50000,
    totalRevenue: 725000,
    status: 'completed',
    expectedPayDate: '2026-07-10',
    paidDate: '2026-07-05',
  },
  {
    id: 'hs-002',
    guestName: 'Huang Wei',
    nationality: '중국',
    checkIn: '2026-06-18',
    checkOut: '2026-07-02',
    nights: 14,
    roomRevenue: 2520000,
    referralCommission: 180000,
    packageRevenue: 120000,
    totalRevenue: 2820000,
    status: 'processing',
    expectedPayDate: '2026-07-20',
  },
  {
    id: 'hs-003',
    guestName: 'Dmitry Volkov',
    nationality: '러시아',
    checkIn: '2026-06-17',
    checkOut: '2026-06-24',
    nights: 7,
    roomRevenue: 910000,
    referralCommission: 35000,
    packageRevenue: 80000,
    totalRevenue: 1025000,
    status: 'processing',
    expectedPayDate: '2026-07-24',
  },
  {
    id: 'hs-004',
    guestName: 'Mohammed Al-Rashidi',
    nationality: 'UAE',
    checkIn: '2026-06-15',
    checkOut: '2026-07-10',
    nights: 25,
    roomRevenue: 4500000,
    referralCommission: 240000,
    packageRevenue: 300000,
    totalRevenue: 5040000,
    status: 'pending',
    expectedPayDate: '2026-08-10',
  },
  {
    id: 'hs-005',
    guestName: 'Sakura Tanaka',
    nationality: '일본',
    checkIn: '2026-07-01',
    checkOut: '2026-07-14',
    nights: 13,
    roomRevenue: 1690000,
    referralCommission: 120000,
    packageRevenue: 150000,
    totalRevenue: 1960000,
    status: 'pending',
    expectedPayDate: '2026-08-14',
  },
  {
    id: 'hs-006',
    guestName: 'Li Mingzhu',
    nationality: '중국',
    checkIn: '2026-07-26',
    checkOut: '2026-08-08',
    nights: 13,
    roomRevenue: 2600000,
    referralCommission: 180000,
    packageRevenue: 200000,
    totalRevenue: 2980000,
    status: 'pending',
    expectedPayDate: '2026-09-08',
  },
  {
    id: 'hs-007',
    guestName: 'Elena Petrova',
    nationality: '러시아',
    checkIn: '2026-07-01',
    checkOut: '2026-07-15',
    nights: 14,
    roomRevenue: 1820000,
    referralCommission: 100000,
    packageRevenue: 80000,
    totalRevenue: 2000000,
    status: 'pending',
    expectedPayDate: '2026-08-15',
  },
]
