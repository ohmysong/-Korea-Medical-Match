'use client'

import { FACTOR_LABELS, WEIGHTS, type FactorKey, type Factors } from '@/lib/omni/matching'

/** 항목별 점수 (배점 × 0~1 적합도). null 은 분모에서 제외된 항목 */
export default function FactorBars({ factors }: { factors: Partial<Factors> }) {
  const keys = Object.keys(WEIGHTS) as FactorKey[]
  return (
    <ul className="space-y-1.5">
      {keys.map((k) => {
        const v = factors[k]
        const excluded = v === null || v === undefined
        const pts = excluded ? 0 : Math.round((v as number) * WEIGHTS[k] * 10) / 10
        return (
          <li key={k} className="grid grid-cols-[7.5rem_1fr_3.5rem] items-center gap-2 text-[12px]">
            <span className="truncate text-muted">{FACTOR_LABELS[k]}</span>
            <span className="h-1.5 overflow-hidden rounded-full bg-wash">
              {!excluded && <span className="block h-full rounded-full bg-brand" style={{ width: `${(v as number) * 100}%` }} />}
            </span>
            <span className="tabular text-right text-ink-2">{excluded ? '제외' : `${pts}/${WEIGHTS[k]}`}</span>
          </li>
        )
      })}
    </ul>
  )
}
