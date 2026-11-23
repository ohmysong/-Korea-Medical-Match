const DEFAULT_BASE_URL = 'https://api-dev.makcrew.co.kr/api'

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, '')

const TOKEN_KEY = 'kmm_access_token'
const USER_KEY = 'kmm_auth_user'

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setStoredToken(token: string | null) {
  if (typeof window === 'undefined') return
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token)
    else window.localStorage.removeItem(TOKEN_KEY)
  } catch {
    // localStorage unavailable (private mode, etc.) — auth simply won't persist across reloads
  }
}

export function getStoredUser<T>(): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function setStoredUser(user: unknown | null) {
  if (typeof window === 'undefined') return
  try {
    if (user) window.localStorage.setItem(USER_KEY, JSON.stringify(user))
    else window.localStorage.removeItem(USER_KEY)
  } catch {
    // ignore
  }
}

export class ApiError extends Error {
  status: number
  body: unknown

  constructor(status: number, message: string, body?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

interface ApiFetchOptions extends RequestInit {
  /** Attach the stored Bearer token if present. Defaults to true. */
  auth?: boolean
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function extractMessage(data: unknown, status: number): string {
  if (data && typeof data === 'object' && 'message' in data) {
    const msg = (data as { message?: unknown }).message
    if (typeof msg === 'string') return msg
    if (Array.isArray(msg)) return msg.join(', ')
  }
  return `요청에 실패했습니다. (HTTP ${status})`
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { auth = true, headers, ...rest } = options
  const finalHeaders = new Headers(headers)
  if (!finalHeaders.has('Content-Type') && rest.body) {
    finalHeaders.set('Content-Type', 'application/json')
  }
  if (auth) {
    const token = getStoredToken()
    if (token) finalHeaders.set('Authorization', `Bearer ${token}`)
  }

  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { ...rest, headers: finalHeaders })
  } catch {
    throw new ApiError(0, '백엔드 서버에 연결할 수 없습니다. 네트워크 상태 또는 서버의 CORS 설정을 확인해주세요.')
  }

  const text = await res.text()
  const data = text ? safeJsonParse(text) : null

  if (!res.ok) {
    throw new ApiError(res.status, extractMessage(data, res.status), data)
  }

  return data as T
}
