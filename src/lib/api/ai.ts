import { apiFetch } from './client'
import type { AiSearchRequest, AiSearchResult } from './types'

export function aiSearch(input: AiSearchRequest) {
  return apiFetch<AiSearchResult>('/ai/search', {
    method: 'POST',
    body: JSON.stringify(input),
    auth: false,
  })
}
