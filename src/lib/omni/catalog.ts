// 산업 사전 (industries.ko.json) — 37 대분류 / 120 중분류 / 618 세부분야.
// 백엔드 `GET /v1/industries` 가 생기기 전까지 정적 사전을 번들에 포함해 사용한다.
// 사전을 교체할 때는 같은 폴더의 JSON 파일만 새 버전으로 바꾸면 된다 (명세 §4 코드와 저장 규칙).
import data from './industries.ko.json'
import { industryIndex, type IndustryCatalog, type IndustryNode, type SearchHit } from './matching'

export const catalog = data as IndustryCatalog
export const INDUSTRY_VERSION = catalog.version
export const industryTree = industryIndex(catalog)

const byCode = new Map(catalog.nodes.map((n) => [n.code, n]))
const childrenOf = new Map<string | null, IndustryNode[]>()
for (const n of catalog.nodes) {
  if (!n.active) continue
  const list = childrenOf.get(n.parent_code) ?? []
  list.push(n)
  childrenOf.set(n.parent_code, list)
}
for (const list of childrenOf.values()) list.sort((a, b) => a.sort_order - b.sort_order || a.code.localeCompare(b.code))

export function industryNode(code: string): IndustryNode | undefined {
  return byCode.get(code)
}

/** parentCode 생략 시 활성 대분류, 지정 시 바로 아래 자식 */
export function industryChildren(parentCode: string | null = null): IndustryNode[] {
  return childrenOf.get(parentCode) ?? []
}

/** 노드 전체 경로 (대분류 → … → 해당 노드) */
export function industryLineage(code: string): IndustryNode[] {
  const out: IndustryNode[] = []
  let cur = byCode.get(code)
  while (cur) {
    out.unshift(cur)
    cur = cur.parent_code ? byCode.get(cur.parent_code) : undefined
  }
  return out
}

export function industryPathLabel(code: string, sep = ' → '): string {
  const lineage = industryLineage(code)
  return lineage.length ? lineage.map((n) => n.label_ko).join(sep) : code
}

export function isActiveLeaf(code: string): boolean {
  const n = byCode.get(code)
  return !!n && n.level === 3 && n.active
}

export interface SearchHitWithPath extends SearchHit {
  path: string
}

/** 검색 결과에 동명이의어 구분용 전체 경로를 붙인다 (명세 §4) */
export function searchIndustries(query: string, limit = 20): SearchHitWithPath[] {
  return industryTree.search(query, limit).map((hit) => ({ ...hit, path: industryPathLabel(hit.code) }))
}

export function rootOf(code: string): string | undefined {
  return industryLineage(code)[0]?.code
}
