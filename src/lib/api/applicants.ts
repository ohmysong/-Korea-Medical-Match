import { apiFetch } from './client'
import type { Applicant, ApplicantInput, DeletedResponse } from './types'

// /admin/interpreters 는 로그인 계정(AccountResponseDto, payload 없음). 지원서·프로필(payload.omni)은 /admin/applicants
const BASE = '/admin/applicants'

export function listApplicants() {
  return apiFetch<Applicant[]>(BASE)
}

export function getApplicant(id: string) {
  return apiFetch<Applicant>(`${BASE}/${encodeURIComponent(id)}`)
}

export function createApplicant(input: ApplicantInput & { id: string }) {
  return apiFetch<Applicant>(BASE, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateApplicant(id: string, input: ApplicantInput) {
  return apiFetch<Applicant>(`${BASE}/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function deleteApplicant(id: string) {
  return apiFetch<DeletedResponse>(`${BASE}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

/** 공개 통역사 지원서 제출 (인증 불필요). 승인 후 운영자가 계정을 발급한다. */
export function submitPublicApplication(input: ApplicantInput) {
  return apiFetch<Applicant>('/applicants', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(input),
  })
}
