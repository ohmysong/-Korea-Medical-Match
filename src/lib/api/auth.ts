import { apiFetch } from './client'
import type { AuthenticatedUser, LoginResponse } from './types'

export function login(email: string, password: string) {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    auth: false,
  })
}

export function me() {
  return apiFetch<AuthenticatedUser>('/auth/me')
}
