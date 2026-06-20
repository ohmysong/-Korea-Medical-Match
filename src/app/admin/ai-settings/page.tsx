'use client'

import { useState } from 'react'

const WEIGHT_DEFS = [
  { key: 'specialty', label: '전문과 적합도',  desc: '환자 질환과 병원 전문과의 일치도',    color: 'bg-blue-500',   hint: '가장 중요한 매칭 기준. 암 환자에게는 암센터를, 정형외과 질환에는 정형외과를 우선 배정.' },
  { key: 'budget',    label: '예산 적합도',    desc: '환자 예산 범위 내 시술 여부',          color: 'bg-green-500',  hint: '예산 초과 병원은 추천에서 제외. 예산 여유가 있을수록 상위 병원 포함.' },
  { key: 'language',  label: '언어 지원',      desc: '병원·통역사의 환자 언어 지원 여부',    color: 'bg-purple-500', hint: '의사 소통 장벽 최소화. 직접 언어 지원 병원 > 통역사 배정 병원 순서.' },
  { key: 'rating',    label: '병원 평점',      desc: 'KMM 플랫폼 누적 평점 (리뷰 기반)',    color: 'bg-yellow-500', hint: '100건 이상 리뷰가 있는 병원만 평점 반영. 신규 병원은 기본값 적용.' },
  { key: 'agent',     label: '에이전트 선호',  desc: '협력 에이전트가 추천한 병원 우선 배정', color: 'bg-orange-500', hint: '에이전트-병원 간 협약 병원을 소폭 상향. 독립 매칭에는 반영 안 됨.' },
  { key: 'location',  label: '위치·접근성',   desc: '공항·호텔 거리, 대중교통 편의성',      color: 'bg-teal-500',   hint: '장거리 이동이 어려운 고령·중증 환자에게 높은 가중치 권장.' },
  { key: 'history',   label: '치료 이력',      desc: '이전 방문 병원 연속성 가중',           color: 'bg-indigo-500', hint: '재방문 환자에게 기존 담당의 및 병원을 우선 연결.' },
]

const PRESETS: { name: string; weights: Record<string, number>; desc: string }[] = [
  {
    name: '기본 (균형)',
    desc: '전반적으로 균형 잡힌 추천',
    weights: { specialty: 30, budget: 25, language: 20, rating: 10, agent: 5, location: 5, history: 5 },
  },
  {
    name: '비용 우선',
    desc: '예산 제약이 강한 환자',
    weights: { specialty: 25, budget: 40, language: 15, rating: 5, agent: 5, location: 5, history: 5 },
  },
  {
    name: '전문성 우선',
    desc: '희귀·중증 질환 전문 매칭',
    weights: { specialty: 45, budget: 15, language: 20, rating: 10, agent: 2, location: 5, history: 3 },
  },
  {
    name: '에이전트 파트너',
    desc: '협력 에이전트 통한 유입 강화',
    weights: { specialty: 25, budget: 20, language: 20, rating: 10, agent: 15, location: 5, history: 5 },
  },
]

export default function AISettingsPage() {
  const [weights, setWeights] = useState<Record<string, number>>(PRESETS[0].weights)
  const [activePreset, setActivePreset] = useState<string>(PRESETS[0].name)
  const [saved, setSaved] = useState(false)
  const [saveTime, setSaveTime] = useState('')

  const total = Object.values(weights).reduce((s, v) => s + v, 0)
  const overHundred = total !== 100

  function set(key: string, val: number) {
    setSaved(false)
    setActivePreset('')
    setWeights((w) => ({ ...w, [key]: Math.max(0, Math.min(100, val)) }))
  }

  function applyPreset(p: typeof PRESETS[0]) {
    setWeights(p.weights)
    setActivePreset(p.name)
    setSaved(false)
  }

  function save() {
    if (overHundred) return
    setSaved(true)
    setSaveTime(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }))
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">AI 매칭 알고리즘 설정</h1>
          <p className="text-sm text-gray-500 mt-0.5">각 요소의 가중치를 조정하여 매칭 품질을 최적화합니다</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-xs text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
              ✓ {saveTime}에 저장됨
            </span>
          )}
          <span className={`text-sm font-bold px-3 py-1.5 rounded-lg ${
            overHundred ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'
          }`}>
            합계 {total} / 100
          </span>
          <button onClick={save} disabled={overHundred}
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium">
            설정 저장
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: sliders */}
        <div className="col-span-2 space-y-4">
          {/* Presets */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-sm font-bold text-gray-900 mb-3">빠른 프리셋</p>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <button key={p.name} onClick={() => applyPreset(p)}
                  className={`text-left p-3 rounded-xl border transition-all ${
                    activePreset === p.name
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}>
                  <p className={`text-sm font-semibold ${activePreset === p.name ? 'text-blue-700' : 'text-gray-900'}`}>
                    {p.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-5">
            <p className="text-sm font-bold text-gray-900">세부 가중치 조정</p>
            {WEIGHT_DEFS.map(({ key, label, desc, color, hint }) => (
              <div key={key}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-sm font-semibold text-gray-800">{label}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => set(key, weights[key] - 5)}
                      className="w-6 h-6 rounded-full border border-gray-200 text-gray-500 text-xs hover:bg-gray-100 transition-colors flex items-center justify-center">
                      −
                    </button>
                    <input
                      type="number" min={0} max={100} value={weights[key]}
                      onChange={(e) => set(key, Number(e.target.value))}
                      className="w-12 border border-gray-200 rounded-lg px-1 py-0.5 text-sm text-center font-bold outline-none focus:border-blue-400"
                    />
                    <button onClick={() => set(key, weights[key] + 5)}
                      className="w-6 h-6 rounded-full border border-gray-200 text-gray-500 text-xs hover:bg-gray-100 transition-colors flex items-center justify-center">
                      +
                    </button>
                    <span className="text-xs text-gray-400 w-4">%</span>
                  </div>
                </div>
                <input
                  type="range" min={0} max={100} value={weights[key]}
                  onChange={(e) => set(key, Number(e.target.value))}
                  className="w-full h-1.5 rounded-full cursor-pointer accent-blue-600"
                />
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{hint}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: summary + preview */}
        <div className="space-y-4">
          {/* Visual bar */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-sm font-bold text-gray-900 mb-3">가중치 구성</p>
            <div className="h-4 rounded-full overflow-hidden flex mb-3">
              {WEIGHT_DEFS.map(({ key, color }) =>
                weights[key] > 0 ? (
                  <div key={key} className={`${color} transition-all`}
                    style={{ width: `${weights[key]}%` }}
                    title={`${WEIGHT_DEFS.find((d) => d.key === key)?.label} ${weights[key]}%`}
                  />
                ) : null
              )}
            </div>
            <div className="space-y-2">
              {WEIGHT_DEFS.map(({ key, label, color }) => (
                <div key={key} className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${color}`} />
                  <span className="text-xs text-gray-600 flex-1">{label}</span>
                  <span className="text-xs font-bold text-gray-800">{weights[key]}%</span>
                </div>
              ))}
            </div>
            {overHundred && (
              <div className="mt-3 p-2.5 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-xs text-red-600 font-medium">합계 {total}% — 정확히 100%가 되어야 합니다</p>
                <p className="text-xs text-red-500 mt-0.5">{total > 100 ? `${total - 100}% 줄여야 합니다` : `${100 - total}% 늘려야 합니다`}</p>
              </div>
            )}
          </div>

          {/* Simulation preview */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-sm font-bold text-gray-900 mb-3">예시 매칭 점수</p>
            <p className="text-xs text-gray-400 mb-3">가상 환자: 러시아 · 예산 500만원 · 척추 질환</p>
            {[
              { hospital: '세브란스병원', match: { specialty: 95, budget: 80, language: 90, rating: 88, agent: 70, location: 75, history: 60 } },
              { hospital: '서울아산병원', match: { specialty: 90, budget: 75, language: 70, rating: 92, agent: 60, location: 65, history: 50 } },
              { hospital: '강남세란의원', match: { specialty: 70, budget: 95, language: 60, rating: 82, agent: 80, location: 85, history: 40 } },
            ].map((h) => {
              const score = Math.round(
                WEIGHT_DEFS.reduce((sum, { key }) =>
                  sum + (h.match[key as keyof typeof h.match] * (weights[key] / 100)), 0)
              )
              return (
                <div key={h.hospital} className="flex items-center gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{h.hospital}</p>
                    <div className="mt-0.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${score}%` }} />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-blue-700 flex-shrink-0">{score}</span>
                </div>
              )
            })}
            <p className="text-xs text-gray-400 mt-2">* 가중치 변경 시 실시간 반영</p>
          </div>

          {/* Last saved */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
            <p className="text-xs font-semibold text-gray-500 mb-1">현재 적용 설정</p>
            <p className="text-sm font-bold text-gray-900">{activePreset || '커스텀'}</p>
            <p className="text-xs text-gray-400 mt-0.5">최근 저장: 2026-06-18 09:30</p>
          </div>
        </div>
      </div>
    </div>
  )
}
