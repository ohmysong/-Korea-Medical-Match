'use client'

import { createContext, useCallback, useContext, type ReactNode } from 'react'
import useSWR from 'swr'
import * as authApi from '@/lib/api/auth'
import { getStoredToken, getStoredUser, setStoredToken, setStoredUser } from '@/lib/api/client'
import type { AuthenticatedUser } from '@/lib/api/types'

interface StoredAuth {
  token: string | null
  user: AuthenticatedUser | null
}

interface AuthContextValue {
  user: AuthenticatedUser | null
  token: string | null
  /** true until the initial localStorage check on mount completes */
  loading: boolean
  login: (email: string, password: string) => Promise<AuthenticatedUser>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredAuth(): StoredAuth {
  return { token: getStoredToken(), user: getStoredUser<AuthenticatedUser>() }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Modeled as a SWR resource (rather than useState+useEffect) so the localStorage
  // read happens post-mount without React flagging a same-render setState-in-effect.
  const { data, mutate } = useSWR<StoredAuth>('kmm-auth-session', () => readStoredAuth(), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.login(email, password)
      setStoredToken(res.accessToken)
      setStoredUser(res.user)
      await mutate({ token: res.accessToken, user: res.user }, { revalidate: false })
      return res.user
    },
    [mutate]
  )

  const logout = useCallback(() => {
    setStoredToken(null)
    setStoredUser(null)
    mutate({ token: null, user: null }, { revalidate: false })
  }, [mutate])

  const value: AuthContextValue = {
    user: data?.user ?? null,
    token: data?.token ?? null,
    loading: data === undefined,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
