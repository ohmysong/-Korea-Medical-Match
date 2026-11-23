'use client'

import { useState, useEffect } from 'react'
import * as aiApi from '@/lib/api/ai'
import { ApiError } from '@/lib/api/client'

interface MatchForm {
  nationality: string
  language: string
  symptoms: string
  conditionInput: string
  conditions: string[]
  budget: string
  preferences: string[]
}

const NATIONALITIES = ['러시아', '중국', 'UAE', '카자흐스탄', '몽골', '일본', '미국', '우즈베키스탄', '기타']
const LANGUAGES = ['러시아어', '중국어', '아랍어', '영어', '일본어', '몽골어', '기타']
const BUDGETS = [
  { value: '2000', label: '$2,000 이하' },
  { value: '5000', label: '$2,000 ~ $5,000' },
  { value: '10000', label: '$5,000 ~ $10,000' },
  { value: '20000', label: '$10,000 ~ $20,000' },
  { value: '50000', label: '$20,000 이상' },
]
const PREFS = [
  'JCI 국제인증',
  '국제진료팀 보유',
  '통역 지원',
  '당일 검진 가능',
  '최소침습 수술',
  '입원 최소화',
  '픽업 서비스',
]

const INIT_FORM: MatchForm = {
  nationality: '',
  language: '',
  symptoms: '',
  conditionInput: '',
  conditions: [],
  budget: '',
  preferences: [],
}

interface AiResultItem {
  raw: Record<string, unknown>
  title: string
  subtitle?: string
  description?: string
  score?: number
}

function pickString(obj: Record<string, unknown>, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = obj[k]
    if (typeof v === 'string' && v.trim()) return v
  }
  return undefined
}

function pickNumber(obj: Record<string, unknown>, keys: string[]): number | undefined {
  for (const k of keys) {
    const v = obj[k]
    if (typeof v === 'number') return v
  }
  return undefined
}

function normalizeAiResults(raw: unknown): AiResultItem[] {
  let list: unknown[] = []
  if (Array.isArray(raw)) {
    list = raw
  } else if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>
    const arrField = ['results', 'hospitals', 'data', 'items'].find((k) => Array.isArray(obj[k]))
    list = arrField ? (obj[arrField] as unknown[]) : [obj]
  }

  return list
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => ({
      raw: item,
      title: pickString(item, ['name', 'hospitalName', 'title', 'nameKr', 'nameEn']) ?? '이름 미상',
      subtitle: pickString(item, ['department', 'specialty', 'type', 'category']),
      description: pickString(item, ['reason', 'matchReason', 'description', 'summary', 'content']),
      score: pickNumber(item, ['score', 'matchScore', 'rank']),
    }))
}

function buildAiQuery(form: MatchForm): string {
  const parts: string[] = []
  if (form.symptoms.trim()) parts.push(form.symptoms.trim())
  if (form.conditions.length) parts.push(`진단명: ${form.conditions.join(', ')}`)
  if (form.nationality) parts.push(`환자 국적: ${form.nationality}`)
  if (form.language) parts.push(`선호 언어: ${form.language}`)
  const budgetLabel = BUDGETS.find((b) => b.value === form.budget)?.label
  if (budgetLabel) parts.push(`예산: ${budgetLabel}`)
  if (form.preferences.length) parts.push(`선호 조건: ${form.preferences.join(', ')}`)
  return parts.join('. ')
}

type Phase = 'idle' | 'loading' | 'done' | 'error'

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 90 ? 'text-green-700 bg-green-100 border-green-200'
    : score >= 80 ? 'text-blue-700 bg-blue-100 border-blue-200'
    : 'text-amber-700 bg-amber-100 border-amber-200'
  return (
    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-bold ${color}`}>
      <span>✦</span>
      <span>매칭 {score}점</span>
    </div>
  )
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 90 ? 'bg-green-500' : score >= 80 ? 'bg-blue-500' : 'bg-amber-500'
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
      <div className={`${color} h-1.5 rounded-full`} style={{ width: `${score}%` }} />
    </div>
  )
}

function IdleState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center py-24">
      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-5">
        <span className="text-blue-600 text-2xl font-bold">AI</span>
      </div>
      <h2 className="text-base font-bold text-gray-900 mb-2">AI 매칭 분석 준비</h2>
      <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
        좌측 폼에 환자 정보를 입력하고<br />
        AI 매칭 분석 버튼을 눌러주세요
      </p>
      <div className="mt-8 grid grid-cols-3 gap-3 max-w-xs">
        {[
          { icon: '🏥', label: '병원 추천', desc: '진료과·병원 자동 매칭' },
          { icon: '💊', label: '시술 추천', desc: '최적 치료법 제안' },
          { icon: '💰', label: '예상 비용', desc: '3개 병원 비용 비교' },
        ].map((item) => (
          <div key={item.label} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
            <div className="text-2xl mb-1.5">{item.icon}</div>
            <p className="text-xs font-semibold text-gray-700">{item.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const LOADING_STEPS = [
  '증상 및 질환 데이터 분석 중...',
  '병원 데이터베이스 검색 중...',
  '최적 매칭 스코어 계산 중...',
  '결과 생성 완료',
]

function LoadingState() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 700)
    const t2 = setTimeout(() => setStep(2), 1600)
    const t3 = setTimeout(() => setStep(3), 2400)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  const progress = [0, 30, 65, 100][step]

  return (
    <div className="space-y-5">
      <div className="bg-white border border-blue-100 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 animate-pulse">
            <span className="text-white text-xs font-bold">AI</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">AI 매칭 분석 중</p>
            <p className="text-xs text-blue-600 mt-0.5">{LOADING_STEPS[step]}</p>
          </div>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          {LOADING_STEPS.slice(0, 3).map((s, i) => (
            <span key={s} className={`text-xs ${i <= step - 1 ? 'text-blue-600' : 'text-gray-300'}`}>
              {i <= step - 1 ? '✓' : '○'}
            </span>
          ))}
        </div>
      </div>

      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                <div className="space-y-1.5">
                  <div className="h-4 bg-gray-200 rounded w-28" />
                  <div className="h-3 bg-gray-100 rounded w-20" />
                </div>
              </div>
              <div className="h-6 bg-gray-200 rounded-full w-20" />
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-14 bg-gray-100 rounded-xl" />
              <div className="h-14 bg-gray-100 rounded-xl" />
            </div>
            <div className="flex gap-2">
              <div className="h-6 bg-gray-100 rounded-full w-16" />
              <div className="h-6 bg-gray-100 rounded-full w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ResultsState({
  form,
  results,
  query,
  selectedHospital,
  onSelect,
}: {
  form: MatchForm
  results: AiResultItem[]
  query: string
  selectedHospital: string | null
  onSelect: (id: string) => void
}) {
  const symptoms = form.symptoms.trim().split(/[,，\n]/).map((s) => s.trim()).filter(Boolean)
  const allTags = [...symptoms, ...form.conditions].slice(0, 6)
  const budgetLabel = BUDGETS.find((b) => b.value === form.budget)?.label

  return (
    <div className="space-y-6">
      {/* Analysis Summary */}
      <div className="bg-white border border-blue-200 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">AI</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <h2 className="text-sm font-bold text-gray-900">AI 검색 완료</h2>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{results.length}개 병원 매칭</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              {form.nationality && <span className="font-medium text-gray-700">{form.nationality} 환자</span>}
              {form.language && <span className="text-gray-400"> · {form.language}</span>}
              {budgetLabel && <span className="text-gray-400"> · 예산 {budgetLabel}</span>}
            </p>
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-xs text-gray-400">분석 키워드</span>
                {allTags.map((t) => (
                  <span key={t} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
                    {t}
                  </span>
                ))}
              </div>
            )}
            {form.preferences.length > 0 && (
              <div className="flex flex-wrap gap-1.5 items-center mt-2">
                <span className="text-xs text-gray-400">선호도</span>
                {form.preferences.map((p) => (
                  <span key={p} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {p}
                  </span>
                ))}
              </div>
            )}
            <details className="mt-3">
              <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">AI에 전달된 검색어 보기</summary>
              <p className="text-xs text-gray-500 mt-1.5 bg-gray-50 rounded-lg p-2.5 leading-relaxed">{query}</p>
            </details>
          </div>
        </div>
      </div>

      {/* Recommended Hospitals */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">AI 추천 병원</p>
        {results.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center text-sm text-gray-400">
            조건에 맞는 병원을 찾지 못했습니다. 검색 조건을 조정해보세요.
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((h, i) => {
              const key = pickString(h.raw, ['id', 'hospitalId']) ?? h.title
              return (
                <div
                  key={key}
                  className={`bg-white border rounded-2xl p-5 transition-all ${
                    selectedHospital === key
                      ? 'border-blue-400 shadow-sm ring-1 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                          i === 0 ? 'bg-blue-600 text-white' : i === 1 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-gray-900">{h.title}</h3>
                          {h.subtitle && <span className="text-xs text-gray-400">{h.subtitle}</span>}
                        </div>
                      </div>
                    </div>
                    {typeof h.score === 'number' && <ScoreBadge score={h.score} />}
                  </div>

                  {typeof h.score === 'number' && <ScoreBar score={h.score} />}

                  {h.description && (
                    <div className="mt-3 bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-1">AI 추천 사유</p>
                      <p className="text-xs font-medium text-gray-800 leading-snug">{h.description}</p>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => onSelect(key)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedHospital === key ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      }`}
                    >
                      {selectedHospital === key ? '✓ 선택됨' : '이 병원 선택'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {results.length > 0 && (
        <details>
          <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">원본 응답(JSON) 보기</summary>
          <pre className="mt-2 bg-gray-900 text-gray-100 text-xs rounded-xl p-4 overflow-x-auto">
            {JSON.stringify(results.map((r) => r.raw), null, 2)}
          </pre>
        </details>
      )}
    </div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center py-24">
      <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-5">
        <span className="text-red-600 text-2xl font-bold">!</span>
      </div>
      <h2 className="text-base font-bold text-gray-900 mb-2">AI 검색에 실패했습니다</h2>
      <p className="text-sm text-gray-400 max-w-sm leading-relaxed whitespace-pre-line">{message}</p>
      <button onClick={onRetry} className="mt-6 text-sm border border-gray-200 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50">
        다시 시도
      </button>
    </div>
  )
}

export default function AIMatchingPage() {
  const [form, setForm] = useState<MatchForm>(INIT_FORM)
  const [phase, setPhase] = useState<Phase>('idle')
  const [selectedHospital, setSelectedHospital] = useState<string | null>(null)
  const [toast, setToast] = useState('')
  const [results, setResults] = useState<AiResultItem[]>([])
  const [lastQuery, setLastQuery] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  function togglePref(p: string) {
    setForm((prev) => ({
      ...prev,
      preferences: prev.preferences.includes(p)
        ? prev.preferences.filter((x) => x !== p)
        : [...prev.preferences, p],
    }))
  }

  function addCondition() {
    const val = form.conditionInput.trim()
    if (val && !form.conditions.includes(val)) {
      setForm((prev) => ({ ...prev, conditions: [...prev.conditions, val], conditionInput: '' }))
    }
  }

  function removeCondition(c: string) {
    setForm((prev) => ({ ...prev, conditions: prev.conditions.filter((x) => x !== c) }))
  }

  const canSubmit = form.symptoms.trim().length > 0 || form.conditions.length > 0

  async function handleAnalyze() {
    if (!canSubmit) return
    setPhase('loading')
    setSelectedHospital(null)
    const query = buildAiQuery(form)
    setLastQuery(query)
    try {
      const raw = await aiApi.aiSearch({ query, limit: 5 })
      setResults(normalizeAiResults(raw))
      setPhase('done')
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 503) {
          setErrorMessage('서버에 LLM 연동 환경변수(LLM_API_KEY / LLM_MODEL)가 설정되지 않았습니다.\n백엔드 담당자에게 확인이 필요합니다.')
        } else if (err.status === 502) {
          setErrorMessage('LLM 서버와 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
        } else {
          setErrorMessage(err.message)
        }
      } else {
        setErrorMessage('알 수 없는 오류가 발생했습니다.')
      }
      setPhase('error')
    }
  }

  function handleReset() {
    setForm(INIT_FORM)
    setPhase('idle')
    setSelectedHospital(null)
    setResults([])
    setErrorMessage('')
  }

  function handleSelect(id: string) {
    setSelectedHospital(id)
    showToast('병원을 선택했습니다. 코디네이터에게 알림이 전송됩니다.')
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      {/* Page header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">AI</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">AI 매칭 엔진</h1>
              <p className="text-xs text-gray-400">환자 정보 기반 병원 · 시술 자동 추천</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium border border-amber-200">
              실시간 AI 검색 연동 (POST /api/ai/search)
            </span>
            {(phase === 'done' || phase === 'error') && (
              <button
                onClick={handleReset}
                className="text-sm text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50"
              >
                새 분석
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Input Form */}
        <div className="w-80 flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-5 space-y-6">

            {/* 환자 프로필 */}
            <section>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">환자 프로필</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">국가 / 국적</label>
                  <select
                    value={form.nationality}
                    onChange={(e) => setForm((p) => ({ ...p, nationality: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 bg-white"
                  >
                    <option value="">선택하세요</option>
                    {NATIONALITIES.map((n) => <option key={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">언어</label>
                  <select
                    value={form.language}
                    onChange={(e) => setForm((p) => ({ ...p, language: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 bg-white"
                  >
                    <option value="">선택하세요</option>
                    {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
            </section>

            {/* 의료 정보 */}
            <section>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">의료 정보</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    증상 <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={form.symptoms}
                    onChange={(e) => setForm((p) => ({ ...p, symptoms: e.target.value }))}
                    rows={3}
                    placeholder="예: 허리 통증, 다리 저림, 보행 장애..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">질환 / 진단명</label>
                  <div className="flex gap-1.5">
                    <input
                      value={form.conditionInput}
                      onChange={(e) => setForm((p) => ({ ...p, conditionInput: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCondition() } }}
                      placeholder="입력 후 Enter"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                    />
                    <button
                      onClick={addCondition}
                      className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 font-medium"
                    >
                      +
                    </button>
                  </div>
                  {form.conditions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {form.conditions.map((c) => (
                        <span
                          key={c}
                          className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full border border-blue-100"
                        >
                          {c}
                          <button onClick={() => removeCondition(c)} className="hover:text-blue-900 ml-0.5">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* 매칭 조건 */}
            <section>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">매칭 조건</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">예산 범위</label>
                  <select
                    value={form.budget}
                    onChange={(e) => setForm((p) => ({ ...p, budget: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 bg-white"
                  >
                    <option value="">제한 없음</option>
                    {BUDGETS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">선호도</label>
                  <div className="space-y-2">
                    {PREFS.map((p) => (
                      <label key={p} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={form.preferences.includes(p)}
                          onChange={() => togglePref(p)}
                          className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 cursor-pointer"
                        />
                        <span className="text-xs text-gray-600 group-hover:text-gray-900">{p}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Submit */}
            <button
              onClick={handleAnalyze}
              disabled={!canSubmit || phase === 'loading'}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {phase === 'loading' ? (
                <>
                  <span className="animate-spin inline-block">◌</span>
                  분석 중...
                </>
              ) : (
                <>
                  <span className="text-base">✦</span>
                  AI 매칭 분석
                </>
              )}
            </button>

            {!canSubmit && (
              <p className="text-xs text-gray-400 text-center -mt-2">증상을 입력하면 분석이 가능합니다</p>
            )}
          </div>
        </div>

        {/* Right: Results */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {phase === 'idle' && <IdleState />}
          {phase === 'loading' && <LoadingState />}
          {phase === 'error' && <ErrorState message={errorMessage} onRetry={handleAnalyze} />}
          {phase === 'done' && (
            <ResultsState form={form} results={results} query={lastQuery} selectedHospital={selectedHospital} onSelect={handleSelect} />
          )}
        </div>
      </div>
    </div>
  )
}
