// 명세 부록 B `matching.mjs` 의 TypeScript 이식본 — 산업 검색, 필수조건 필터, 최대 3명 추천.
// 산식·정렬·에러 문자열은 원본과 동일하다. 추천의 기준 실행 위치는 서버다 (명세 §5.3).

export const MATCH_VERSION = 'OMNI-PROJECT30-FIELD25-v1'
export const WEIGHTS = Object.freeze({
  project: 30, industry: 25, employment: 20, major: 10, education: 5, residence: 5, review: 5,
})
export type FactorKey = keyof typeof WEIGHTS

export const FACTOR_LABELS: Record<FactorKey, string> = {
  project: '유사 프로젝트',
  industry: '해당 분야 직접 통역',
  employment: '관련 회사·직무',
  major: '전공',
  education: '학력·통번역 교육',
  residence: '해당 언어권 체류',
  review: '수행평가',
}

export const REQUIRED_CHECKS = ['active', 'language', 'roles', 'modes', 'workplace', 'travel', 'expenses', 'credentials'] as const
export type CheckKey = (typeof REQUIRED_CHECKS)[number]

const priority: Record<string, number> = { NONE: 0, ROOT: 0.2, BRANCH: 0.6, LEAF: 1 }

export interface IndustryNode {
  code: string
  parent_code: string | null
  level: 1 | 2 | 3 | number
  label_ko: string
  aliases: string[]
  sort_order: number
  active: boolean
}

export interface IndustryCatalog {
  version: string
  locale: string
  nodes: IndustryNode[]
}

export interface SearchHit {
  code: string
  level: number
  label: string
  score: number
}

export interface IndustryTree {
  path(code: string): [IndustryNode, IndustryNode, IndustryNode]
  relation(a: string, b: string): number
  search(query: string, limit?: number): SearchHit[]
}

// 대상 tsconfig(ES2017)에서 정규식 리터럴의 \p{…} 문법 검사를 피하려고 생성자를 쓴다.
const NON_WORD = new RegExp('[^\\p{L}\\p{N}]', 'gu')

export function normalized(value: string): string {
  return value.normalize('NFKC').toLowerCase().replace(NON_WORD, '')
}

const cmp = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0)

export function industryIndex(catalog: IndustryCatalog): IndustryTree {
  const nodes = new Map(catalog.nodes.map((n) => [n.code, n]))
  if (!nodes.size || nodes.size !== catalog.nodes.length) throw new Error('INVALID_CATALOG')
  const path = (code: string): [IndustryNode, IndustryNode, IndustryNode] => {
    const leaf = nodes.get(code)
    if (!leaf || leaf.level !== 3) throw new Error('INDUSTRY_LEAF_REQUIRED: ' + code)
    const branch = leaf.parent_code ? nodes.get(leaf.parent_code) : undefined
    const root = branch?.parent_code ? nodes.get(branch.parent_code) : undefined
    if (branch?.level !== 2 || root?.level !== 1) throw new Error('INVALID_PARENT')
    return [root, branch, leaf]
  }
  const indexRows = catalog.nodes
    .filter((n) => n.active)
    .map((n) => ({ node: n, terms: [n.code, n.label_ko, ...n.aliases].map(normalized) }))
  return {
    path,
    relation(a, b) {
      const x = path(a)
      const y = path(b)
      if (x[2].code === y[2].code) return 1
      if (x[1].code === y[1].code) return 0.6
      return x[0].code === y[0].code ? 0.2 : 0
    },
    search(query, limit = 20) {
      if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error('INVALID_LIMIT')
      const q = normalized(query)
      if (!q) return []
      const result: SearchHit[] = []
      for (const { node, terms } of indexRows) {
        const score = terms.includes(q) ? 3 : terms.some((t) => t.startsWith(q)) ? 2 : terms.some((t) => t.includes(q)) ? 1 : 0
        if (score) result.push({ code: node.code, level: node.level, label: node.label_ko, score })
      }
      return result.sort((a, b) => b.score - a.score || cmp(a.code, b.code)).slice(0, limit)
    },
  }
}

// ── 추천 입력 (서버가 만든 추천용 데이터, 명세 §5.3) ────────────────────────────

export type SlotState = 'AVAILABLE' | 'UNKNOWN' | 'BUSY'

export interface MatchRequest {
  /** 주산업부터 정렬한 세부분야 코드 */
  industries: string[]
  requiredIndustry: 'NONE' | 'ROOT' | 'BRANCH' | 'LEAF'
  schedule: 'ALL' | 'ANY'
  slotIds: string[]
  needsInterpreting: boolean
  purposes: string[]
  modes: string[]
  roles: string[]
  budgetCapKrw: number | null
}

export interface MatchProject {
  verification: string
  interpreted: boolean
  industries: string[]
  dates: string[]
  purposes: string[]
  modes: string[]
  roles: string[]
}

export interface MatchCandidate {
  id: string
  checks: Partial<Record<CheckKey, boolean>>
  slots: Record<string, { state: SlotState; budgetKrw?: number | null }>
  allBudgetKrw?: number | null
  projects: MatchProject[]
  relevantJobMonths: number
  major: 'DIRECT' | 'RELATED' | 'NONE'
  education: 'COMPLETED' | 'IN_PROGRESS' | 'NONE'
  languageRegionMonths: number
  reviewUnit: number | null
  exposure30d: number
}

export type Factors = Record<FactorKey, number | null>

export interface Ranked {
  id: string
  score: number
  factors: Factors
  eligibleSlotIds: string[]
  certainSlotIds: string[]
  certain: boolean
  priced: boolean
  exposure30d: number
  version: string
}

function validMoney(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
}

interface ScheduleFit {
  eligibleSlotIds: string[]
  certainSlotIds: string[]
  certain: boolean
  priced: boolean
}

function scheduleFit(req: MatchRequest, c: MatchCandidate): ScheduleFit | null {
  if (!REQUIRED_CHECKS.every((k) => c.checks?.[k] === true)) return null
  const hasCap = req.budgetCapKrw !== null && req.budgetCapKrw !== undefined
  if (hasCap && !validMoney(req.budgetCapKrw)) throw new Error('INVALID_BUDGET')
  const fitsCap = (value: unknown) => !hasCap || (validMoney(value) && value <= (req.budgetCapKrw as number))
  const slots = req.slotIds
    .map((id) => ({ ...c.slots?.[id], id }))
    .filter((s): s is { id: string; state: SlotState; budgetKrw?: number | null } =>
      s.state === 'AVAILABLE' || s.state === 'UNKNOWN')
  if (req.schedule === 'ALL') {
    if (slots.length !== req.slotIds.length || !fitsCap(c.allBudgetKrw)) return null
    const certain = slots.every((s) => s.state === 'AVAILABLE')
    return {
      eligibleSlotIds: slots.map((s) => s.id),
      certainSlotIds: slots.filter((s) => s.state === 'AVAILABLE').map((s) => s.id),
      certain,
      priced: validMoney(c.allBudgetKrw),
    }
  }
  const choices = slots.filter((s) => fitsCap(s.budgetKrw))
  if (!choices.length) return null
  const certainSlots = choices.filter((s) => s.state === 'AVAILABLE')
  return {
    eligibleSlotIds: choices.map((s) => s.id),
    certainSlotIds: certainSlots.map((s) => s.id),
    certain: certainSlots.length > 0,
    priced: choices.some((s) => s.state === 'AVAILABLE' && validMoney(s.budgetKrw)),
  }
}

function bounded(value: number, ceiling: number) {
  if (!Number.isFinite(value) || value < 0) throw new Error('INVALID_FIT_INPUT')
  return Math.min(value / ceiling, 1)
}

function overlap(a: string[], b: string[]) {
  return a.some((x) => b.includes(x))
}

function related(industries: string[], targets: string[], tree: IndustryTree) {
  let best = 0
  for (const code of industries) {
    targets.forEach((target, i) => {
      best = Math.max(best, tree.relation(code, target) * (i === 0 ? 1 : 0.7))
    })
  }
  return best
}

function caseSimilarity(req: MatchRequest, p: MatchProject, fit: number) {
  const dimensions: [number, string[], string[]][] = [
    [40, req.purposes, p.purposes],
    [35, req.modes, p.modes],
    [25, req.roles, p.roles],
  ]
  let max = 0
  let earned = 0
  for (const [weight, needed, done] of dimensions) {
    if (!needed.length) continue
    max += weight
    earned += (weight * needed.filter((x) => done.includes(x)).length) / needed.length
  }
  const context = req.industries.length ? 0.5 + 0.5 * fit : 1
  return max ? (earned / max) * context : 0
}

function professionalFit(req: MatchRequest, c: MatchCandidate, tree: IndustryTree): Factors | null {
  let project = 0
  let primaryRelation = 0
  const days = new Map<string, number>()
  for (const p of c.projects) {
    if (p.verification !== 'VERIFIED' || !p.dates.length) continue
    const fit = related(p.industries, req.industries, tree)
    if (p.interpreted === true) {
      primaryRelation = Math.max(primaryRelation, related(p.industries, req.industries.slice(0, 1), tree))
      for (const day of p.dates) days.set(day, Math.max(days.get(day) ?? 0, fit))
    }
    const direct = req.needsInterpreting ? p.interpreted === true : overlap(req.roles, p.roles)
    if (direct) project = Math.max(project, caseSimilarity(req, p, fit))
  }
  if (primaryRelation < priority[req.requiredIndustry]) return null
  const major = ({ DIRECT: 1, RELATED: 0.5, NONE: 0 } as Record<string, number>)[c.major]
  const education = ({ COMPLETED: 1, IN_PROGRESS: 0.5, NONE: 0 } as Record<string, number>)[c.education]
  if (major === undefined || education === undefined) throw new Error('INVALID_BACKGROUND')
  const review = c.reviewUnit
  if (review !== null && (!Number.isFinite(review) || review < 0 || review > 1)) throw new Error('INVALID_REVIEW')
  return {
    project,
    industry: req.industries.length ? bounded([...days.values()].reduce((sum, v) => sum + v, 0), 20) : null,
    employment: bounded(c.relevantJobMonths, 36),
    major,
    education,
    residence: bounded(c.languageRegionMonths, 24),
    review,
  }
}

export function recommend(req: MatchRequest, candidates: MatchCandidate[], tree: IndustryTree): Ranked[] {
  if (
    !['ALL', 'ANY'].includes(req.schedule) || !req.slotIds.length ||
    new Set(req.slotIds).size !== req.slotIds.length ||
    !Object.prototype.hasOwnProperty.call(priority, req.requiredIndustry) ||
    (!req.industries.length && req.requiredIndustry !== 'NONE')
  ) throw new Error('INVALID_REQUEST')
  for (const code of req.industries) tree.path(code)
  const ids = candidates.map((c) => c.id)
  if (new Set(ids).size !== ids.length) throw new Error('DUPLICATE_CANDIDATE')
  const ranked: Ranked[] = []
  for (const c of candidates) {
    const schedule = scheduleFit(req, c)
    if (!schedule) continue
    const factors = professionalFit(req, c, tree)
    if (!factors) continue
    let total = 0
    let denominator = 0
    for (const [k, v] of Object.entries(factors) as [FactorKey, number | null][]) {
      if (v !== null) {
        total += v * WEIGHTS[k]
        denominator += WEIGHTS[k]
      }
    }
    const score = Math.round((total / denominator) * 10000) / 100
    ranked.push({ id: c.id, score, factors, ...schedule, exposure30d: c.exposure30d, version: MATCH_VERSION })
  }
  return ranked
    .sort((a, b) => b.score - a.score || Number(b.certain) - Number(a.certain) || a.exposure30d - b.exposure30d || cmp(a.id, b.id))
    .slice(0, 3)
}
