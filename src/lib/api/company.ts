// 의뢰사(기업) 프로필 API
import { apiFetch } from './client'

export interface CompanyProfile {
  companyName: string
  businessNumber?: string
  representativeName?: string
  address?: string
  businessType?: string
  businessItem?: string
  contactName?: string
  contactPhone?: string
  billingEmail?: string
  businessRegistrationUrl?: string
}

export function getCompanyProfile() {
  return apiFetch<Partial<CompanyProfile> | null>('/company/profile')
}

export function saveCompanyProfile(input: CompanyProfile) {
  return apiFetch<CompanyProfile>('/company/profile', { method: 'PUT', body: JSON.stringify(input) })
}
