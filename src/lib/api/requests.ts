import { apiFetch } from './client'
import type { DeletedResponse, InterpretRequest, InterpretRequestInput } from './types'

const BASE = '/hospital/requests'

export function listInterpretRequests() {
  return apiFetch<InterpretRequest[]>(BASE)
}

export function getInterpretRequest(id: string) {
  return apiFetch<InterpretRequest>(`${BASE}/${encodeURIComponent(id)}`)
}

export function createInterpretRequest(input: InterpretRequestInput & { id: string }) {
  return apiFetch<InterpretRequest>(BASE, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateInterpretRequest(id: string, input: InterpretRequestInput) {
  return apiFetch<InterpretRequest>(`${BASE}/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function deleteInterpretRequest(id: string) {
  return apiFetch<DeletedResponse>(`${BASE}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}
