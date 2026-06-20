'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  FACE_AREAS,
  CONCERNS,
  PRIORITIES,
  BUDGET_PRESETS,
  DERM_PROCEDURES,
  type DermProcedure,
  type PriorityId,
} from '@/lib/dermatology-data'

const TYPE_ORDER: Record<DermProcedure['type'], number> = { '스킨케어': 0, '레이저': 1, '주사': 2, '리프팅': 3 }

const COMBO_TITLE: Record<PriorityId, string> = {
  effect: '효과 중심 조합',
  recovery: '무다운타임 조합',
  value: '가성비 조합',
  natural: '자연스러운 변화 조합',
}

function formatPrice(n: number) {
  if (n >= 10000000) return `${(n / 10000000).toFixed(1).replace(/\.0$/, '')}천만원`
  if (n >= 10000) return `${Math.round(n / 10000)}만원`
  return `${n.toLocaleString()}원`
}

function scoreProcedure(p: DermProcedure, priority: PriorityId) {
  switch (priority) {
    case 'effect': return p.effect * 2 - p.recoveryDays * 0.3
    case 'recovery': return -p.recoveryDays * 3 + p.effect * 0.3
    case 'value': return p.effect / (p.priceMin / 100000)
    case 'natural': return p.naturalness * 2 + p.effect * 0.2
  }
}

interface Plan {
  chosen: DermProcedure[]
  totalMin: number
  totalMax: number
  overBudget: boolean
  uncoveredConcerns: string[]
  usedFallback: boolean
}

function buildPlan(areas: string[], concerns: string[], budget: number, priority: PriorityId): Plan | null {
  if (areas.length === 0 || concerns.length === 0) return null

  let usedFallback = false
  let candidates = DERM_PROCEDURES.filter(
    (p) => p.concerns.some((c) => concerns.includes(c)) && p.areas.some((a) => areas.includes(a)),
  )
  if (candidates.length === 0) {
    usedFallback = true
    candidates = DERM_PROCEDURES.filter((p) => p.concerns.some((c) => concerns.includes(c)))
  }
  if (candidates.length === 0) {
    return { chosen: [], totalMin: 0, totalMax: 0, overBudget: false, uncoveredConcerns: concerns, usedFallback }
  }

  const sorted = [...candidates].sort((a, b) => scoreProcedure(b, priority) - scoreProcedure(a, priority))

  const chosen: DermProcedure[] = []
  const remaining = new Set(concerns)
  let totalMin = 0

  for (const concern of concerns) {
    if (!remaining.has(concern)) continue
    const best = sorted.find((p) => !chosen.includes(p) && p.concerns.includes(concern) && totalMin + p.priceMin <= budget)
    if (best) {
      chosen.push(best)
      totalMin += best.priceMin
      best.concerns.forEach((c) => remaining.delete(c))
    }
    if (chosen.length >= 4) break
  }

  if (chosen.length === 0) {
    const cheapest = sorted.reduce((a, b) => (a.priceMin <= b.priceMin ? a : b))
    chosen.push(cheapest)
    totalMin = cheapest.priceMin
    cheapest.concerns.forEach((c) => remaining.delete(c))
  }

  const totalMax = chosen.reduce((s, p) => s + p.priceMax, 0)

  return {
    chosen,
    totalMin,
    totalMax,
    overBudget: totalMin > budget,
    uncoveredConcerns: [...remaining],
    usedFallback,
  }
}

export default function DermatologyPlannerPage() {
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([])
  const [budget, setBudget] = useState<number | null>(null)
  const [priority, setPriority] = useState<PriorityId | null>(null)

  const plan = useMemo(() => {
    if (!budget || !priority) return null
    return buildPlan(selectedAreas, selectedConcerns, budget, priority)
  }, [selectedAreas, selectedConcerns, budget, priority])

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
  }

  const readyForResult = selectedAreas.length > 0 && selectedConcerns.length > 0 && !!budget && !!priority
  const orderedChosen = plan ? [...plan.chosen].sort((a, b) => TYPE_ORDER[a.type] - TYPE_ORDER[b.type]) : []

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-pink-600 to-rose-600 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -translate-y-32 translate-x-32 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 py-14 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/15 text-white/90 text-xs px-3 py-1 rounded-full mb-4 border border-white/20">
            ✦ AI 피부과 플래너
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">나에게 맞는 피부 시술, AI가 조합해드립니다</h1>
          <p className="text-pink-100 text-sm">고민 부위와 예산을 알려주시면 우선순위에 맞는 시술 조합과 예상 비용을 바로 보여드려요</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        {/* ── Form ── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-7">
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-3">1. 어디가 고민이신가요? <span className="text-gray-400 font-normal">(얼굴 부위, 복수 선택 가능)</span></p>
            <div className="flex flex-wrap gap-2">
              {FACE_AREAS.map((area) => (
                <button
                  key={area}
                  onClick={() => toggle(selectedAreas, setSelectedAreas, area)}
                  className={`text-sm px-3.5 py-1.5 rounded-full border font-medium transition-colors ${
                    selectedAreas.includes(area)
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-rose-300'
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900 mb-3">2. 어떤 점이 고민이신가요? <span className="text-gray-400 font-normal">(복수 선택 가능)</span></p>
            <div className="flex flex-wrap gap-2">
              {CONCERNS.map((concern) => (
                <button
                  key={concern}
                  onClick={() => toggle(selectedConcerns, setSelectedConcerns, concern)}
                  className={`text-sm px-3.5 py-1.5 rounded-full border font-medium transition-colors ${
                    selectedConcerns.includes(concern)
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-rose-300'
                  }`}
                >
                  {concern}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900 mb-3">3. 예상 예산은 얼마인가요?</p>
            <div className="flex flex-wrap gap-2">
              {BUDGET_PRESETS.map((b) => (
                <button
                  key={b.label}
                  onClick={() => setBudget(b.value)}
                  className={`text-sm px-3.5 py-1.5 rounded-full border font-medium transition-colors ${
                    budget === b.value
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-rose-300'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900 mb-3">4. 가장 중요하게 생각하시는 것은?</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPriority(p.id)}
                  className={`text-left p-3 rounded-xl border transition-colors ${
                    priority === p.id
                      ? 'bg-rose-50 border-rose-400'
                      : 'bg-white border-gray-200 hover:border-rose-300'
                  }`}
                >
                  <p className={`text-sm font-semibold ${priority === p.id ? 'text-rose-700' : 'text-gray-800'}`}>{p.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Results ── */}
        {!readyForResult ? (
          <div className="text-center text-sm text-gray-400 py-8">
            위 항목을 모두 선택하면 AI가 맞춤 시술 조합을 추천해드립니다
          </div>
        ) : !plan || plan.chosen.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
            <p className="text-gray-400 text-3xl mb-3">🔍</p>
            <p className="text-gray-600 font-medium">조건에 맞는 시술을 찾지 못했습니다</p>
            <p className="text-sm text-gray-400 mt-1">다른 부위·고민을 선택하거나 예산을 조정해보세요</p>
          </div>
        ) : (
          <>
            {plan.usedFallback && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                선택한 부위에 딱 맞는 시술이 부족해 고민 기준으로 추천했습니다
              </p>
            )}

            {/* 추천 시술 */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">AI 추천 시술</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {plan.chosen.map((p) => (
                  <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-1.5">
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.nameEn}</p>
                      </div>
                      <span className="text-xs bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full whitespace-nowrap">{p.type}</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed mb-2.5">{p.description}</p>
                    <div className="flex flex-wrap gap-1 mb-2.5">
                      {p.concerns.filter((c) => selectedConcerns.includes(c)).map((c) => (
                        <span key={c} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{c}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400 pt-2.5 border-t border-gray-100">
                      <span>⏱ {p.duration} · {p.recoveryLabel}</span>
                      <span className="font-semibold text-rose-600">{formatPrice(p.priceMin)}~{formatPrice(p.priceMax)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 예상 비용 */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">예상 비용</h2>
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-sm text-gray-500">{plan.chosen.length}개 시술 합계</span>
                  <span className="text-xl font-bold text-gray-900">{formatPrice(plan.totalMin)}~{formatPrice(plan.totalMax)}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${plan.overBudget ? 'bg-orange-400' : 'bg-rose-500'}`}
                    style={{ width: `${Math.min(100, (plan.totalMin / budget!) * 100)}%` }}
                  />
                </div>
                <p className={`text-xs mt-2 ${plan.overBudget ? 'text-orange-600' : 'text-rose-600'}`}>
                  {plan.overBudget
                    ? `예산보다 약 ${formatPrice(plan.totalMin - budget!)} 초과될 수 있어요`
                    : `예산 ${formatPrice(budget!)} 안에서 추천했어요`}
                </p>
                {plan.uncoveredConcerns.length > 0 && (
                  <p className="text-xs text-gray-400 mt-2">
                    아직 다루지 못한 고민: {plan.uncoveredConcerns.join(', ')} · 관련 부위를 추가로 선택하거나 예산을 늘리면 추가 추천이 가능해요
                  </p>
                )}
              </div>
            </section>

            {/* 추천 조합 */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">추천 시술 조합 — {COMBO_TITLE[priority!]}</h2>
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <ol className="space-y-3">
                  {orderedChosen.map((p, i) => (
                    <li key={p.id} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                        <p className="text-xs text-gray-400">
                          {p.recoveryDays > 0 ? `시술 후 ${p.recoveryDays}일 정도 회복 기간을 두고 다음 시술 진행을 추천해요` : '다운타임이 거의 없어 다른 시술과 같은 날 진행 가능해요'}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="text-xs text-gray-400 mt-4 pt-3 border-t border-gray-100">
                  레이저·리프팅 계열은 회복 기간을 두고 순차적으로, 주사·스킨케어 계열은 동시 진행이 가능한 경우가 많아요. 정확한 일정은 상담 시 의료진과 조율하세요.
                </p>
              </div>
            </section>

            <div className="flex justify-center pt-2">
              <Link
                href="/hospitals?specialty=피부과"
                className="bg-rose-600 text-white font-bold px-8 py-3 rounded-xl text-sm hover:bg-rose-700 transition-colors"
              >
                이 시술을 제공하는 병원 보기 →
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
