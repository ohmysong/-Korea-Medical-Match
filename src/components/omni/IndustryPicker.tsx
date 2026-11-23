'use client'

// 산업 분야 선택 — 검색창 + 대분류 → 중분류 → 세부분야 단계 선택 (명세 §4 산업 사전과 검색 UX)
// 주산업 1개 + 보조산업 최대 3개, 활성 세부분야 코드만 저장. 모르면 '직접 입력'.
import { useMemo, useState } from 'react'
import { industryChildren, industryLineage, industryNode, industryPathLabel, isActiveLeaf, searchIndustries, INDUSTRY_VERSION } from '@/lib/omni/catalog'
import type { IndustrySelection } from '@/lib/omni/types'
import { inputCls, textareaCls } from './ui'

const MAX_SECONDARY = 3

export default function IndustryPicker({
  value,
  onChange,
  allowOther = true,
  question = '무슨 제품·기술·제도를 다루나요?',
}: {
  value: IndustrySelection
  onChange: (next: IndustrySelection) => void
  allowOther?: boolean
  question?: string
}) {
  const [query, setQuery] = useState('')
  const [browse, setBrowse] = useState<string | null>(null)
  const otherMode = value.primaryCode === null && typeof value.otherText === 'string'

  const hits = useMemo(() => (query.trim() ? searchIndustries(query, 30) : []), [query])
  const browseNodes = industryChildren(browse)
  const lineage = browse ? industryLineage(browse) : []
  const selected = value.primaryCode ? [value.primaryCode, ...value.secondaryCodes] : []
  const full = selected.length >= 1 + MAX_SECONDARY

  function addLeaf(code: string) {
    if (!isActiveLeaf(code) || selected.includes(code)) return
    if (!value.primaryCode) {
      onChange({ version: INDUSTRY_VERSION, primaryCode: code, secondaryCodes: [], otherText: null })
    } else if (value.secondaryCodes.length < MAX_SECONDARY) {
      onChange({ ...value, version: INDUSTRY_VERSION, secondaryCodes: [...value.secondaryCodes, code] })
    }
  }

  function remove(code: string) {
    if (code === value.primaryCode) {
      const [next, ...rest] = value.secondaryCodes
      onChange({ ...value, primaryCode: next ?? null, secondaryCodes: rest, otherText: null })
    } else {
      onChange({ ...value, secondaryCodes: value.secondaryCodes.filter((c) => c !== code) })
    }
  }

  function promote(code: string) {
    if (!value.primaryCode) return
    onChange({ ...value, primaryCode: code, secondaryCodes: [value.primaryCode, ...value.secondaryCodes.filter((c) => c !== code)] })
  }

  function pick(code: string, level: number) {
    if (level === 3) {
      addLeaf(code)
      setQuery('')
    } else {
      setBrowse(code)
      setQuery('')
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-[13px] text-muted">{question}</p>

      {selected.length > 0 && (
        <ul className="space-y-1.5">
          {selected.map((code, i) => (
            <li key={code} className="flex flex-wrap items-center gap-2 rounded-md border border-line bg-canvas px-3 py-2">
              <span className={`rounded-sm px-1.5 py-0.5 text-[11px] font-semibold ${i === 0 ? 'bg-brand text-white' : 'bg-wash text-ink-2'}`}>
                {i === 0 ? '주산업' : `보조 ${i}`}
              </span>
              <span className="min-w-0 flex-1 text-[13px] text-ink">
                {industryPathLabel(code)} <code className="ml-1 text-[11px] text-subtle">{code}</code>
              </span>
              {i > 0 && (
                <button type="button" onClick={() => promote(code)} className="text-[12px] text-brand hover:underline">
                  주산업으로
                </button>
              )}
              <button type="button" onClick={() => remove(code)} aria-label={`${industryNode(code)?.label_ko} 삭제`} className="text-[12px] text-muted hover:text-danger">
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}

      {otherMode ? (
        <div className="space-y-2">
          <textarea
            rows={3}
            className={textareaCls}
            placeholder="구체적인 업무 설명 (예: 선박 평형수 처리장치 형식승인 회의)"
            value={value.otherText ?? ''}
            onChange={(e) => onChange({ version: INDUSTRY_VERSION, primaryCode: null, secondaryCodes: [], otherText: e.target.value })}
          />
          <p className="text-[12px] text-subtle">직접 입력 시 필수 산업경력 조건은 해제되고, 운영자가 기존 분류 연결을 제안합니다.</p>
          <button type="button" className="text-[13px] text-brand hover:underline" onClick={() => onChange({ ...value, otherText: null })}>
            ← 분류에서 고르기
          </button>
        </div>
      ) : (
        !full && (
          <div className="rounded-md border border-line">
            <div className="border-b border-line p-2">
              <input
                type="search"
                className={inputCls}
                placeholder="검색: 촉매, SCR, EPC, FTA, 전해액, PV …"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="산업 분야 검색"
              />
            </div>

            {query.trim() ? (
              <ul className="max-h-72 overflow-y-auto py-1" aria-label="검색 결과">
                {hits.length === 0 && <li className="px-3 py-3 text-[13px] text-muted">일치하는 분야가 없습니다.</li>}
                {hits.map((h) => (
                  <li key={h.code}>
                    <button
                      type="button"
                      disabled={selected.includes(h.code)}
                      onClick={() => pick(h.code, h.level)}
                      className="flex w-full items-baseline gap-2 px-3 py-2 text-left text-[13px] hover:bg-wash disabled:opacity-40"
                    >
                      <span className="min-w-0 flex-1 text-ink">{h.path}</span>
                      <span className="shrink-0 text-[11px] text-subtle">{h.level === 3 ? h.code : '하위 보기 →'}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-2">
                <nav className="mb-2 flex flex-wrap items-center gap-1 px-1 text-[12px]" aria-label="분류 경로">
                  <button type="button" onClick={() => setBrowse(null)} className={browse ? 'text-brand hover:underline' : 'font-semibold text-ink'}>
                    전체 대분류
                  </button>
                  {lineage.map((n) => (
                    <span key={n.code} className="flex items-center gap-1">
                      <span className="text-subtle">/</span>
                      <button type="button" onClick={() => setBrowse(n.code)} className={n.code === browse ? 'font-semibold text-ink' : 'text-brand hover:underline'}>
                        {n.label_ko}
                      </button>
                    </span>
                  ))}
                </nav>
                <ul className="grid max-h-72 grid-cols-1 gap-1 overflow-y-auto sm:grid-cols-2">
                  {browseNodes.map((n) => (
                    <li key={n.code}>
                      <button
                        type="button"
                        disabled={selected.includes(n.code)}
                        onClick={() => pick(n.code, n.level)}
                        className="flex w-full items-center justify-between gap-2 rounded-sm px-2.5 py-2 text-left text-[13px] text-ink-2 hover:bg-wash hover:text-ink disabled:opacity-40"
                      >
                        <span>{n.label_ko}</span>
                        <span className="text-[11px] text-subtle">{n.level < 3 ? '›' : '+ 선택'}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )
      )}

      {!otherMode && allowOther && selected.length === 0 && (
        <button type="button" className="text-[13px] text-brand hover:underline" onClick={() => onChange({ version: INDUSTRY_VERSION, primaryCode: null, secondaryCodes: [], otherText: '' })}>
          분야를 모르겠어요 · 직접 입력
        </button>
      )}
      <p className="text-[12px] text-subtle">
        주산업 1개, 보조산업 최대 {MAX_SECONDARY}개 · 사전 {INDUSTRY_VERSION}
      </p>
    </div>
  )
}
