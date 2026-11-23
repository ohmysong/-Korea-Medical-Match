'use client'

// 결제 화면·정산 화면 금액표 (명세 §2 카드 결제 화면의 기준 거래)
import { formatKrw } from '@/lib/omni/labels'
import { quote, settle, type TaxInput } from '@/lib/omni/pricing'

function Row({ label, value, strong, minus }: { label: string; value: number; strong?: boolean; minus?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 py-2 ${strong ? 'border-t border-line pt-3 text-[15px] font-bold text-ink' : 'text-[14px] text-ink-2'}`}>
      <dt>{label}</dt>
      <dd className="tabular whitespace-nowrap">{minus && value > 0 ? '−' : ''}{formatKrw(value)}</dd>
    </div>
  )
}

export function ClientQuote({ workKrw, expenseKrw = 0 }: { workKrw: number; expenseKrw?: number }) {
  const q = quote({ workKrw, expenseKrw })
  return (
    <dl>
      <Row label="약정 통역료" value={q.workKrw} />
      <Row label="옴니 중개수수료 · 30%" value={q.clientFeeKrw} />
      <Row label="중개수수료 부가세 · 10%" value={q.feeVatKrw} />
      <Row label="별도 청구 경비" value={q.expenseKrw} />
      <Row label="카드 결제 합계" value={q.chargeKrw} strong />
    </dl>
  )
}

export function SellerSettlement({
  workKrw,
  expenseKrw = 0,
  tax = { profile: 'KR_FREELANCE_33', incomeExpenseKrw: 0 },
}: {
  workKrw: number
  expenseKrw?: number
  tax?: TaxInput
}) {
  if (tax.profile === 'REVIEW') {
    return <p className="text-[13px] text-warning">세무 유형 검토 중 — 실지급액은 운영자 확인 후 확정됩니다.</p>
  }
  const s = settle({ workKrw, expenseKrw }, tax)
  return (
    <dl>
      <Row label="약정 통역료" value={s.workKrw} />
      {s.expenseKrw > 0 && <Row label="별도 경비" value={s.expenseKrw} />}
      <Row label="통역사 플랫폼 수수료" value={0} />
      <Row label="소득세 원천징수 · 3%" value={s.nationalKrw} minus />
      <Row label="개인지방소득세 특별징수" value={s.localKrw} minus />
      <Row label="통역사 실지급액" value={s.sellerNetKrw} strong />
    </dl>
  )
}
