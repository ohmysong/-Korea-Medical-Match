'use client'

import { useState, useEffect } from 'react'

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

const MOCK_HOSPITALS = [
  {
    id: 'h1',
    name: '세브란스병원',
    type: '상급종합병원',
    score: 95,
    department: '신경외과 척추센터',
    doctor: '박성훈 교수',
    treatment: '최소침습 척추 수술 (MISS) / 비수술 신경성형술',
    costRange: '$8,500 ~ $12,000',
    features: ['JCI 국제인증', '러시아어 통역 지원', '국제진료센터'],
    waitDays: 7,
    costs: [
      { item: '초진 · 정밀검사', amount: '$600' },
      { item: '수술비 (MISS)', amount: '$8,500' },
      { item: '입원비 (4박)', amount: '$1,200' },
      { item: '통역 · 이동', amount: '$200' },
    ],
    total: '$10,500',
  },
  {
    id: 'h2',
    name: '서울아산병원',
    type: '상급종합병원',
    score: 88,
    department: '정형외과 척추센터',
    doctor: '김재훈 교수',
    treatment: '로봇 보조 척추 수술 / 내시경 디스크 수술',
    costRange: '$9,000 ~ $13,500',
    features: ['로봇 수술 시스템', '국제진료팀', '최소침습 전문'],
    waitDays: 10,
    costs: [
      { item: '초진 · 정밀검사', amount: '$700' },
      { item: '수술비 (로봇)', amount: '$9,200' },
      { item: '입원비 (5박)', amount: '$1,500' },
      { item: '통역 · 이동', amount: '$200' },
    ],
    total: '$11,600',
  },
  {
    id: 'h3',
    name: '삼성서울병원',
    type: '상급종합병원',
    score: 79,
    department: '신경외과',
    doctor: '이민석 교수',
    treatment: '경막외 신경성형술 (비수술) / 수술적 치료',
    costRange: '$7,000 ~ $11,000',
    features: ['JCI 국제인증', '다국어 지원', '빠른 예약'],
    waitDays: 5,
    costs: [
      { item: '초진 · 정밀검사', amount: '$550' },
      { item: '수술비 / 시술비', amount: '$7,800' },
      { item: '입원비 (3박)', amount: '$1,000' },
      { item: '통역 · 이동', amount: '$200' },
    ],
    total: '$9,550',
  },
]

const MOCK_TREATMENTS = [
  { name: '최소침습 척추 수술 (MISS)', hospitals: 3, costRange: '$7,000 ~ $9,500', recovery: '3~5일 입원', score: 94 },
  { name: '내시경 디스크 수술', hospitals: 2, costRange: '$5,500 ~ $7,500', recovery: '1~2일 입원', score: 86 },
  { name: '경막외 신경성형술', hospitals: 3, costRange: '$2,500 ~ $3,500', recovery: '당일 퇴원', score: 72 },
  { name: '물리치료 + 도수치료 패키지', hospitals: 2, costRange: '$1,200 ~ $2,000', recovery: '외래 10회', score: 58 },
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

type Phase = 'idle' | 'loading' | 'done'

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
  selectedHospital,
  onSelect,
}: {
  form: MatchForm
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
              <h2 className="text-sm font-bold text-gray-900">AI 분석 완료</h2>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">3개 병원 매칭</span>
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
          </div>
        </div>
      </div>

      {/* Recommended Hospitals */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">추천 병원</p>
        <div className="space-y-3">
          {MOCK_HOSPITALS.map((h, i) => (
            <div
              key={h.id}
              className={`bg-white border rounded-2xl p-5 transition-all ${
                selectedHospital === h.id
                  ? 'border-blue-400 shadow-sm ring-1 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                      i === 0
                        ? 'bg-blue-600 text-white'
                        : i === 1
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-900">{h.name}</h3>
                      <span className="text-xs text-gray-400">{h.type}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{h.department} · {h.doctor}</p>
                  </div>
                </div>
                <ScoreBadge score={h.score} />
              </div>

              <ScoreBar score={h.score} />

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">추천 시술</p>
                  <p className="text-xs font-medium text-gray-800 leading-snug">{h.treatment}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">예상 비용</p>
                  <p className="text-sm font-bold text-blue-700">{h.costRange}</p>
                  <p className="text-xs text-gray-400 mt-0.5">예약 대기 {h.waitDays}일</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-3">
                {h.features.map((f) => (
                  <span key={f} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">
                    {f}
                  </span>
                ))}
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => onSelect(h.id)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedHospital === h.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  {selectedHospital === h.id ? '✓ 선택됨' : '이 병원 선택'}
                </button>
                <button className="px-4 py-2 border border-gray-200 text-gray-500 rounded-lg text-sm hover:bg-gray-50">
                  상세 보기
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Treatment Recommendations */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">추천 시술</p>
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {MOCK_TREATMENTS.map((t, i) => (
            <div
              key={t.name}
              className={`flex items-center gap-4 px-5 py-4 ${
                i < MOCK_TREATMENTS.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                i === 0 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t.hospitals}개 병원 매칭 · 회복 {t.recovery}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-gray-800">{t.costRange}</p>
                <div className="flex items-center gap-1.5 mt-1 justify-end">
                  <div className="w-14 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${t.score}%` }} />
                  </div>
                  <span className="text-xs text-gray-400 w-7 text-right">{t.score}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Comparison */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">예상 비용 비교</p>
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 w-40">항목</th>
                  {MOCK_HOSPITALS.map((h, i) => (
                    <th key={h.id} className="text-center px-5 py-3 text-xs font-semibold text-gray-700">
                      <span className={i === 0 ? 'text-blue-600' : ''}>{h.name}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_HOSPITALS[0].costs.map((cost, ci) => (
                  <tr key={cost.item} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-5 py-3 text-xs text-gray-500">{cost.item}</td>
                    {MOCK_HOSPITALS.map((h) => (
                      <td key={h.id} className="px-5 py-3 text-center text-xs text-gray-700 tabular-nums">
                        {h.costs[ci]?.amount}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="bg-blue-50 border-t border-blue-100">
                  <td className="px-5 py-3.5 text-sm font-bold text-gray-800">합계</td>
                  {MOCK_HOSPITALS.map((h, i) => (
                    <td
                      key={h.id}
                      className={`px-5 py-3.5 text-center text-sm font-bold tabular-nums ${
                        i === 0 ? 'text-blue-700' : 'text-gray-800'
                      }`}
                    >
                      {h.total}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <div className="px-5 py-2.5 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-400">* 예상 비용은 참고용이며, 실제 비용은 진료 후 확정됩니다.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AIMatchingPage() {
  const [form, setForm] = useState<MatchForm>(INIT_FORM)
  const [phase, setPhase] = useState<Phase>('idle')
  const [selectedHospital, setSelectedHospital] = useState<string | null>(null)
  const [toast, setToast] = useState('')

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
    await new Promise((r) => setTimeout(r, 2900))
    setPhase('done')
  }

  function handleReset() {
    setForm(INIT_FORM)
    setPhase('idle')
    setSelectedHospital(null)
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
              UI 미리보기 · AI 연결 준비 중
            </span>
            {phase === 'done' && (
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
          {phase === 'done' && (
            <ResultsState form={form} selectedHospital={selectedHospital} onSelect={handleSelect} />
          )}
        </div>
      </div>
    </div>
  )
}
