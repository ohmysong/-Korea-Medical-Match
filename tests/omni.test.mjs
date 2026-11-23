// 명세 부록 B omni.test.mjs 를 TS 이식본(src/lib/omni)에 그대로 적용한다. 실행: npm test (Node 22.18+/24, 타입 제거 내장)
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { quote, settle, adjustment, payoutAction, maxWorkForCharge } from '../src/lib/omni/pricing.ts'
import { WEIGHTS, recommend, industryIndex } from '../src/lib/omni/matching.ts'
import { pickRate, lineWorkKrw, pairCovers } from '../src/lib/omni/rates.ts'

const catalog = JSON.parse(readFileSync(new URL('../src/lib/omni/industries.ko.json', import.meta.url), 'utf8'))
const tree = industryIndex(catalog)
const tax = { profile: 'KR_FREELANCE_33', incomeExpenseKrw: 0 }
const work = (workKrw) => ({ workKrw, expenseKrw: 0 })
const primary = 'BATT.MAT.04'
const req = { industries: [primary], requiredIndustry: 'NONE', needsInterpreting: true, purposes: ['BOOTH'], modes: ['CONSECUTIVE'], roles: ['INTERPRET'], slotIds: ['s1', 's2'], schedule: 'ALL', budgetCapKrw: 399000 }
function person(id) {
  return {
    id, checks: Object.fromEntries(['active', 'language', 'roles', 'modes', 'workplace', 'travel', 'expenses', 'credentials'].map((k) => [k, true])),
    slots: { s1: { state: 'AVAILABLE', budgetKrw: 133000 }, s2: { state: 'AVAILABLE', budgetKrw: 133000 } }, allBudgetKrw: 266000, exposure30d: 0,
    relevantJobMonths: 36, major: 'DIRECT', education: 'COMPLETED', languageRegionMonths: 24, reviewUnit: null,
    projects: [{ interpreted: true, verification: 'VERIFIED', industries: [primary], dates: ['2026-10-01', '2026-10-02'], purposes: ['BOOTH'], modes: ['CONSECUTIVE'], roles: ['INTERPRET'] }],
  }
}

test('기준 거래: 시급 30,000원 × 10시간 → 399,000원 승인 / 실지급 290,100원 (명세 §2)', () => {
  const minutes = (Date.parse('2026-12-03T19:00:00+09:00') - Date.parse('2026-12-03T09:00:00+09:00')) / 60000
  const terms = work((minutes * 30000) / 60)
  const c = quote(terms)
  assert.deepEqual([c.chargeKrw, c.clientFeeKrw, c.feeVatKrw], [399000, 90000, 9000])
  const s = settle(terms, tax)
  assert.deepEqual([s.withheldKrw, s.sellerNetKrw], [9900, 290100])
  assert.equal(payoutAction({ existingTransfer: 'NONE', booking: 'IN_SERVICE', fundsReconciled: true, openDispute: false, openRefund: false, taxCleared: true, payerRecorded: true, sellerEligible: true, sellerNetKrw: 290100, availableKrw: 290100 }), 'HOLD')
})
test('세무사 확정 예시와 수탁금·원천세·옴니 매출을 대사한다', () => {
  const s = settle(work(300000), tax)
  assert.deepEqual([s.workKrw, s.clientFeeKrw, s.feeVatKrw, s.chargeKrw, s.nationalKrw, s.localKrw, s.sellerNetKrw], [300000, 90000, 9000, 399000, 9000, 900, 290100])
  assert.equal(s.sellerNetKrw + s.withheldKrw + s.clientFeeKrw + s.feeVatKrw, s.chargeKrw)
})
test('원천징수 비대상도 의뢰사 결제식이 같다', () => {
  const s = settle(work(300000), { profile: 'NONE_CONFIRMED', incomeExpenseKrw: 0 })
  assert.deepEqual([s.chargeKrw, s.withheldKrw, s.sellerNetKrw], [399000, 0, 300000])
  assert.throws(() => settle(work(300000), { profile: 'REVIEW', incomeExpenseKrw: 0 }), /REVIEW/)
})
test('승인 연장과 부분 환불을 누계 차액으로 정확히 되돌린다', () => {
  const d = adjustment(work(100000), work(120000))
  assert.deepEqual(d, { workKrw: 20000, expenseKrw: 0, clientFeeKrw: 6000, feeVatKrw: 600, chargeKrw: 26600 })
  const s = settle(work(120000), tax)
  assert.deepEqual([s.chargeKrw, s.withheldKrw, s.sellerNetKrw], [159600, 3960, 116040])
  const undo = adjustment(work(120000), work(100000))
  for (const k of Object.keys(d)) assert.equal(d[k] + undo[k], 0)
  assert.equal(adjustment(work(100000), work(0)).chargeKrw, -133000)
})
test('확정 경비를 분리하고 소득으로 분류된 경비만 원천세 산식에 더한다', () => {
  const gross = { workKrw: 300000, expenseKrw: 20000 }
  const a = settle(gross, tax), b = settle(gross, { ...tax, incomeExpenseKrw: 20000 })
  assert.deepEqual([a.chargeKrw, a.feeVatKrw, a.sellerNetKrw, b.sellerNetKrw], [419000, 9000, 310100, 309440])
  assert.throws(() => settle(gross, { ...tax, incomeExpenseKrw: 21000 }))
})
test('원 단위 누적 반올림, 끝수와 소액 처리 정책', () => {
  assert.equal(quote(work(15)).clientFeeKrw, 5); assert.equal(quote(work(15)).feeVatKrw, 1)
  assert.equal(settle(work(123456), tax).withheldKrw, 4070)
  assert.equal(settle(work(20000), tax).withheldKrw, 660)
  for (let v = 0; v < 2000; v += 7) {
    const delta = adjustment(work(v), work(v + 19))
    assert.equal(quote(work(v)).chargeKrw + delta.chargeKrw, quote(work(v + 19)).chargeKrw)
  }
})
test('음수·소수·오버플로·추가 과세 필드 거부', () => {
  for (const v of [-1, 1.5, NaN, Number.MAX_SAFE_INTEGER]) assert.throws(() => quote(work(v)))
  assert.throws(() => quote({ ...work(100000), extraVatKrw: 500 }))
  assert.throws(() => quote({ workKrw: 100, expenseKrw: null }))
})
test('지급상태·대사·분쟁·잔액·결과불명·지급완료 분기', () => {
  const s = { existingTransfer: 'NONE', booking: 'COMPLETED', fundsReconciled: true, openDispute: false, openRefund: false, taxCleared: true, payerRecorded: true, sellerEligible: true, sellerNetKrw: 290100, availableKrw: 290100 }
  assert.equal(payoutAction(s), 'REQUEST_PAYOUT')
  for (const [change, expect] of [[{ availableKrw: 1 }, 'WAIT_BALANCE'], [{ openDispute: true }, 'HOLD'], [{ openRefund: true }, 'HOLD'],
    [{ booking: 'ACTIVE' }, 'HOLD'], [{ existingTransfer: 'UNKNOWN' }, 'QUERY_PROVIDER'], [{ existingTransfer: 'SUCCEEDED' }, 'ALREADY_PAID'],
    [{ sellerNetKrw: 0 }, 'CLOSE_WITHOUT_TRANSFER'], [{ taxCleared: false }, 'HOLD'], [{ payerRecorded: undefined }, 'HOLD']]) {
    assert.equal(payoutAction({ ...s, ...change }), expect)
  }
})
test('사전 전체 경로·별칭·동음이의·빈 검색 검증', () => {
  assert.equal(new Set(catalog.nodes.map((n) => n.code)).size, catalog.nodes.length)
  const leaves = catalog.nodes.filter((n) => n.level === 3); for (const n of leaves) assert.equal(tree.path(n.code)[2].code, n.code)
  assert.equal(tree.search(' scr ')[0].code, 'CHEM.CAT.03'); assert.equal(tree.search('ｅｐｃ')[0].code, 'BUILD.PLANT.01')
  assert.equal(tree.search('전해액')[0].code, primary); assert.equal(tree.search('FTA')[0].code, 'TRADE.FTA.01')
  assert.ok(tree.search('PV').filter((n) => n.score === 3).length >= 2); assert.deepEqual(tree.search(''), [])
  assert.equal(tree.relation('CHEM.CAT.01', 'CHEM.CAT.03'), 0.6)
  assert.equal(tree.relation('CHEM.CAT.01', 'CHEM.POLY.01'), 0.2)
  assert.equal(tree.relation('CHEM.CAT.01', primary), 0)
  assert.deepEqual([catalog.nodes.filter((n) => n.level === 1).length, catalog.nodes.filter((n) => n.level === 2).length, leaves.length], [37, 120, 618])
})
test('중복 경력·같은 날짜를 이중 가산하지 않는다', () => {
  const p = person('i1'); p.projects.push(structuredClone(p.projects[0]))
  const [r] = recommend(req, [p], tree)
  assert.equal(r.factors.industry, 0.1); assert.equal(r.factors.project, 1); assert.equal(r.factors.review, null)
  assert.equal(r.score, Math.round((72.5 / 95) * 10000) / 100)
  assert.equal(Object.values(WEIGHTS).reduce((a, b) => a + b, 0), 100)
})
test('미검증 프로젝트·간접 경력은 필수 분야 통과 근거가 되지 않는다', () => {
  const p = person('i1'); const strict = { ...req, requiredIndustry: 'LEAF' }
  p.projects[0].verification = 'PENDING'; assert.deepEqual(recommend(strict, [p], tree), [])
  p.projects[0].verification = 'VERIFIED'; p.projects[0].interpreted = false
  assert.deepEqual(recommend(strict, [p], tree), [])
  p.projects[0].interpreted = true; p.projects[0].industries = ['BATT.MAT.01']
  assert.equal(recommend({ ...strict, requiredIndustry: 'BRANCH' }, [p], tree).length, 1)
  assert.deepEqual(recommend(strict, [p], tree), [])
})
test('모르는 분야는 누적 분야 점수 분모에서 제외', () => {
  const [r] = recommend({ ...req, industries: [] }, [person('i')], tree)
  assert.equal(r.factors.industry, null); assert.equal(r.score, 100)
})
test('전 일정·택일·예산·미확정 일정·필수업무 분기', () => {
  const p = person('i1'); p.slots.s2.state = 'BUSY'
  assert.deepEqual(recommend(req, [p], tree), [])
  assert.deepEqual(recommend({ ...req, schedule: 'ANY' }, [p], tree)[0].eligibleSlotIds, ['s1'])
  p.slots.s2.state = 'UNKNOWN'; assert.equal(recommend(req, [p], tree)[0].certain, false)
  p.slots.s1.budgetKrw = null
  assert.deepEqual(recommend({ ...req, schedule: 'ANY' }, [p], tree)[0].eligibleSlotIds, ['s2'])
  p.allBudgetKrw = 400000; assert.deepEqual(recommend(req, [p], tree), [])
  p.checks.modes = false; assert.deepEqual(recommend({ ...req, budgetCapKrw: null }, [p], tree), [])
})
test('적격 후보 최대 3명과 안정적 동점 순서', () => {
  const ps = ['d', 'c', 'b', 'a'].map(person); ps[1].exposure30d = 10
  assert.deepEqual(recommend(req, ps, tree).map((p) => p.id), ['a', 'b', 'd'])
  assert.deepEqual(recommend(req, [], tree), [])
  assert.deepEqual(recommend(req, [ps[0]], tree).map((p) => p.id), ['d'])
})
test('단가 없는 후보는 금액 필수 예산을 통과할 수 없다', () => {
  const p = person('i'); p.allBudgetKrw = null
  assert.deepEqual(recommend(req, [p], tree), [])
  assert.equal(recommend({ ...req, budgetCapKrw: null }, [p], tree)[0].priced, false)
})

// ── 요금표 단가 선택 (명세 §3, §10 '단가·진행 방식') ─────────────────────────
const koen = { from: 'ko', to: 'en', direction: 'BOTH' }
const rates = [
  { id: 'r1', pair: koen, role: 'INTERPRET', mode: 'SIMULTANEOUS', allowed: false },
  { id: 'r2', pair: koen, role: 'INTERPRET', mode: 'CONSECUTIVE', allowed: true, unit: 'HOUR', priceKrw: 50000 },
  { id: 'r3', pair: koen, role: 'INTERPRET', mode: 'CONSECUTIVE', placeType: 'EXHIBITION_CENTER', purpose: 'BOOTH', allowed: true, unit: 'HOUR', priceKrw: 40000 },
]
const q = (extra) => ({ pair: koen, role: 'INTERPRET', mode: 'CONSECUTIVE', purposes: ['TECH_MEETING'], placeType: 'COMPANY', ...extra })
test('동시 불가자는 동시 의뢰에서 제외, 부스 4만원/일반 순차 5만원을 각각 적용', () => {
  assert.equal(pickRate(rates, q({ mode: 'SIMULTANEOUS' })).kind, 'NOT_ALLOWED')
  assert.equal(pickRate(rates, q()).rate.priceKrw, 50000)
  assert.equal(pickRate(rates, q({ purposes: ['BOOTH'], placeType: 'EXHIBITION_CENTER' })).rate.priceKrw, 40000)
  // 같은 전시장이라도 기술협상은 일반 순차 단가
  assert.equal(pickRate(rates, q({ purposes: ['NEGOTIATION'], placeType: 'EXHIBITION_CENTER' })).rate.priceKrw, 50000)
})
test('최상위 동률 단가의 조건이 다르면 견적 확인', () => {
  const tie = [...rates, { id: 'r4', pair: koen, role: 'INTERPRET', mode: 'CONSECUTIVE', allowed: true, unit: 'HOUR', priceKrw: 55000 }]
  assert.equal(pickRate(tie, q()).kind, 'CONFIRMATION_REQUIRED')
  assert.equal(pickRate(rates, q({ role: 'GUIDE' })).kind, 'NO_RATE')
})
test('시간 산정: max(최소 유급분, 합의 유급분) × 시급 ÷ 60, 일급 연장', () => {
  assert.equal(lineWorkKrw({ ...rates[1], minMinutes: 240 }, 120), 200000)
  assert.equal(lineWorkKrw({ ...rates[1] }, 600), 500000)
  assert.equal(lineWorkKrw({ id: 'd', pair: koen, role: 'INTERPRET', allowed: true, unit: 'DAY', priceKrw: 400000, includedMinutes: 480, overtimeUnitMinutes: 30, overtimeKrw: 30000 }, 545), 400000 + 3 * 30000)
  assert.equal(lineWorkKrw(rates[0], 60), null)
})
test('언어 방향: ko→en 만 가능한 사람은 en→ko 의뢰에 맞지 않는다', () => {
  const oneWay = [{ from: 'ko', to: 'en', direction: 'ONE_WAY' }]
  assert.equal(pairCovers(oneWay, { from: 'ko', to: 'en', direction: 'ONE_WAY' }), true)
  assert.equal(pairCovers(oneWay, { from: 'en', to: 'ko', direction: 'ONE_WAY' }), false)
  assert.equal(pairCovers(oneWay, koen), false)
  assert.equal(pairCovers([koen], { from: 'en', to: 'ko', direction: 'ONE_WAY' }), true)
})
test('총결제액 상한 → 최대 통역료 역산', () => {
  assert.equal(maxWorkForCharge(399000), 300000)
  for (const cap of [0, 1, 133, 99999, 1234567]) {
    const w = maxWorkForCharge(cap)
    assert.ok(quote(work(w)).chargeKrw <= cap && quote(work(w + 1)).chargeKrw > cap)
  }
})
