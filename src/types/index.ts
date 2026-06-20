export type TreatmentCategory = 'disease' | 'procedure' | 'surgery' | 'checkup'
export type SearchTab = 'all' | 'disease' | 'procedure' | 'surgery' | 'checkup'
export type HospitalType = '상급종합병원' | '종합병원' | '전문병원' | '의원' | '한방병원'
export type SortOption = 'recommended' | 'rating' | 'reviewCount' | 'priceAsc' | 'priceDesc'

export interface Treatment {
  id: string
  name: string
  nameEn: string
  category: TreatmentCategory
  priceMin: number
  priceMax: number
  duration: string
  recovery: string
  specialty: string
}

export interface Doctor {
  name: string
  specialty: string
  career: string
  languages: string[]
}

export interface Hospital {
  id: string
  name: string
  nameEn: string
  location: string
  district: string
  type: HospitalType
  specialties: string[]
  languages: string[]
  rating: number
  reviewCount: number
  description: string
  accreditations: string[]
  phone: string
  email: string
  address: string
  internationalDept: boolean
  treatments: Treatment[]
  doctors: Doctor[]
  featured: boolean
  bedCount?: number
}

export interface SearchFilters {
  query: string
  tab: SearchTab
  location: string
  specialty: string
  language: string
  sortBy: SortOption
}

export interface ConsultationRequest {
  hospitalId: string
  treatmentInterest: string
  patientName: string
  email: string
  phone: string
  nationality: string
  preferredDate: string
  notes: string
}
