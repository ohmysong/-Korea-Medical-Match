'use client'

import useSWR from 'swr'
import * as interpreterApi from '@/lib/api/interpreter'
import type { Applicant } from '@/lib/api/types'
import { readProfile } from './candidate'
import type { InterpreterProfile, Project, Employment } from './types'

/** 통역사 본인 프로필 — 백엔드 payload.omni 에 OMNI 프로필을 저장한다 */
export function useInterpreterProfile() {
  const swr = useSWR<Applicant | null>('interpreter/profile', () => interpreterApi.getMyProfile(), { shouldRetryOnError: false })
  const payload = (swr.data?.payload ?? {}) as Record<string, unknown>
  const profile = readProfile(payload.omni)

  async function save(next: InterpreterProfile) {
    // 검증 상태는 운영자 소유 — 본인이 수정한 항목은 다시 '검토 중'으로 돌린다.
    const prev = readProfile(payload.omni)
    const keepVerification = <T extends Project | Employment>(items: T[], before: T[], key: (x: T) => string): T[] =>
      items.map((it) => {
        const old = before.find((b) => key(b) === key(it))
        const same = old && JSON.stringify({ ...old, verification: undefined }) === JSON.stringify({ ...it, verification: undefined })
        return { ...it, verification: same ? old.verification : 'PENDING' }
      })
    const cleaned: InterpreterProfile = {
      ...next,
      taxProfile: prev.taxProfile, // 세무 유형은 운영자가 근거와 함께 기록
      projects: keepVerification(next.projects, prev.projects, (p) => p.id),
      employment: keepVerification(next.employment, prev.employment, (e) => `${e.employer}|${e.from}`),
    }
    const saved = await interpreterApi.saveMyProfile({
      payload: { ...payload, omni: cleaned },
      nameKr: swr.data?.nameKr ?? next.displayName ?? null,
      phone: swr.data?.phone ?? null,
      email: swr.data?.email ?? null,
    })
    await swr.mutate(saved ?? { ...(swr.data as Applicant), payload: { ...payload, omni: cleaned } }, { revalidate: false })
    return cleaned
  }

  return { ...swr, applicant: swr.data, profile, save }
}
