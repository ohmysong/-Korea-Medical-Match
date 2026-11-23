'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import type { UserRole } from '@/lib/api/types'

export default function RequireRole({ role, children }: { role: UserRole; children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || user.role !== role)) {
      router.replace('/login')
    }
  }, [loading, user, role, router])

  if (loading || !user || user.role !== role) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">
        인증 확인 중...
      </div>
    )
  }

  return <>{children}</>
}
