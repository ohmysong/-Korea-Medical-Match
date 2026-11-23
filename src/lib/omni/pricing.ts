// 명세 부록 B `pricing.mjs` 의 TypeScript 이식본. 산식·단수 처리·에러 문자열을 원본과 동일하게 유지한다.
// 화면 미리보기용이다. 결제 승인액의 기준은 언제나 서버 견적이다 (명세 §2, §8.1).
// tsconfig target(ES2017) 때문에 BigInt 리터럴(30n) 대신 BigInt() 호출을 쓴다.

export const PRICING_VERSION = 'OMNI-KRW-FEE30-VAT10-v1'
export const WITHHOLDING_VERSION = 'KR-RESIDENT-SERVICE-33-v1'

const B0 = BigInt(0)
const B3 = BigInt(3)
const B10 = BigInt(10)
const B30 = BigInt(30)
const B50 = BigInt(50)
const B100 = BigInt(100)
const B1000 = BigInt(1000)

export interface PricingInput {
  workKrw: number
  expenseKrw?: number
}

export interface Quote {
  pricingVersion: string
  workKrw: number
  expenseKrw: number
  clientFeeKrw: number
  feeVatKrw: number
  chargeKrw: number
}

export type QuoteDelta = Omit<Quote, 'pricingVersion'>

export interface TaxInput {
  profile: 'KR_FREELANCE_33' | 'NONE_CONFIRMED' | 'REVIEW'
  incomeExpenseKrw: number
}

export interface Settlement extends Quote {
  withholdingVersion: string
  withholdingProfile: TaxInput['profile']
  withholdingBaseKrw: number
  nationalKrw: number
  localKrw: number
  withheldKrw: number
  sellerNetKrw: number
}

function won(value: unknown, field: string): bigint {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(field + ': non-negative safe integer required')
  }
  return BigInt(value)
}

function numeric(amount: bigint): number {
  const result = Number(amount)
  if (!Number.isSafeInteger(result)) throw new RangeError('amount exceeds JSON safe integer range')
  return result
}

function closedInputs(input: unknown, allowed: string[]) {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) throw new TypeError('object required')
  for (const key of Object.keys(input)) {
    if (!allowed.includes(key)) throw new TypeError('unknown field: ' + key)
  }
}

/** workKrw 는 승인된 연장을 포함한 약정 통역 보수, expenseKrw 는 통역사에게 전달할 별도 경비 */
export function quote(input: PricingInput): Quote {
  closedInputs(input, ['workKrw', 'expenseKrw'])
  const work = won(input.workKrw, 'workKrw')
  const expense = won(input.expenseKrw === undefined ? 0 : input.expenseKrw, 'expenseKrw')
  const fee = (work * B30 + B50) / B100
  const feeVat = (fee * B10 + B50) / B100
  return {
    pricingVersion: PRICING_VERSION,
    workKrw: numeric(work),
    expenseKrw: numeric(expense),
    clientFeeKrw: numeric(fee),
    feeVatKrw: numeric(feeVat),
    chargeKrw: numeric(work + expense + fee + feeVat),
  }
}

/** 누계 기준 재계산 후 구성요소별 부호 있는 차액 */
export function adjustment(previous: PricingInput, next: PricingInput): QuoteDelta {
  const before = quote(previous)
  const after = quote(next)
  return {
    workKrw: after.workKrw - before.workKrw,
    expenseKrw: after.expenseKrw - before.expenseKrw,
    clientFeeKrw: after.clientFeeKrw - before.clientFeeKrw,
    feeVatKrw: after.feeVatKrw - before.feeVatKrw,
    chargeKrw: after.chargeKrw - before.chargeKrw,
  }
}

/** 세무 유형·경비 분류는 서버가 결정한다. 금액은 1회 지급분 기준. */
export function settle(input: PricingInput, tax: TaxInput): Settlement {
  const q = quote(input)
  closedInputs(tax, ['profile', 'incomeExpenseKrw'])
  if (!['KR_FREELANCE_33', 'NONE_CONFIRMED'].includes(tax.profile)) throw new Error('TAX_REVIEW_REQUIRED')
  const incomeExpense = won(tax.incomeExpenseKrw, 'incomeExpenseKrw')
  const expense = BigInt(q.expenseKrw)
  if (incomeExpense > expense) throw new RangeError('incomeExpenseKrw exceeds expenseKrw')
  const gross = BigInt(q.workKrw) + expense
  const base = tax.profile === 'KR_FREELANCE_33' ? BigInt(q.workKrw) + incomeExpense : B0
  // 계속·반복 인적용역. 세목별 10원 미만 절사.
  const national = ((base * B3) / B1000) * B10
  const local = (national / B100) * B10
  return {
    ...q,
    withholdingVersion: WITHHOLDING_VERSION,
    withholdingProfile: tax.profile,
    withholdingBaseKrw: numeric(base),
    nationalKrw: numeric(national),
    localKrw: numeric(local),
    withheldKrw: numeric(national + local),
    sellerNetKrw: numeric(gross - national - local),
  }
}

export type TransferState = 'NONE' | 'SENT' | 'UNKNOWN' | 'SUCCEEDED' | 'CONFIRMED_FAILED' | string

export interface PayoutState {
  existingTransfer: TransferState
  booking: string
  fundsReconciled?: boolean
  openDispute?: boolean
  openRefund?: boolean
  taxCleared?: boolean
  payerRecorded?: boolean
  sellerEligible?: boolean
  sellerNetKrw: number
  availableKrw: number
}

export type PayoutAction =
  | 'ALREADY_PAID' | 'QUERY_PROVIDER' | 'REVIEW' | 'HOLD' | 'CLOSE_WITHOUT_TRANSFER' | 'WAIT_BALANCE' | 'REQUEST_PAYOUT'

/** 정산 행 잠금 아래에서 호출하는 지급 판단 (서버 워커 전용 로직, 화면에서는 상태 설명에만 사용) */
export function payoutAction(state: PayoutState): PayoutAction {
  if (state.existingTransfer === 'SUCCEEDED') return 'ALREADY_PAID'
  if (['SENT', 'UNKNOWN'].includes(state.existingTransfer)) return 'QUERY_PROVIDER'
  if (!['NONE', 'CONFIRMED_FAILED'].includes(state.existingTransfer)) return 'REVIEW'
  if (
    state.booking !== 'COMPLETED' || state.fundsReconciled !== true || state.openDispute !== false ||
    state.openRefund !== false || state.taxCleared !== true || state.payerRecorded !== true ||
    state.sellerEligible !== true
  ) return 'HOLD'
  const due = won(state.sellerNetKrw, 'sellerNetKrw')
  const available = won(state.availableKrw, 'availableKrw')
  if (due === B0) return 'CLOSE_WITHOUT_TRANSFER'
  return available < due ? 'WAIT_BALANCE' : 'REQUEST_PAYOUT'
}

/** 총결제액 상한 → 허용 가능한 최대 약정 통역료 (화면 안내용, 1원 단위 보수적 역산) */
export function maxWorkForCharge(chargeCapKrw: number): number {
  if (!Number.isSafeInteger(chargeCapKrw) || chargeCapKrw < 0) return 0
  let work = Math.floor(chargeCapKrw / 1.33)
  while (work > 0 && quote({ workKrw: work }).chargeKrw > chargeCapKrw) work -= 1
  while (quote({ workKrw: work + 1 }).chargeKrw <= chargeCapKrw) work += 1
  return work
}
