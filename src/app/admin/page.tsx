'use client'

import { useState } from 'react'
import Link from 'next/link'
import { mockPatients, mockSettlements, mockInterpreters, mockAgents } from '@/lib/admin-mock-data'

// ── Chart data ─────────────────────────────────────────────────────────────────
const MONTHLY = [
  { m: '1월', matches: 52,  revenue: 218, patients: 44 },
  { m: '2월', matches: 61,  revenue: 274, patients: 53 },
  { m: '3월', matches: 78,  revenue: 341, patients: 69 },
  { m: '4월', matches: 64,  revenue: 289, patients: 57 },
  { m: '5월', matches: 91,  revenue: 412, patients: 82 },
  { m: '6월', matches: 73,  revenue: 331, patients: 66 },
]

// ── Mock user-management data ───────────────────────────────────────────────────
const PENDING_HOSPITALS = [
  { id: 'ph1', name: '강남뷰티클리닉', type: '의원', specialty: '성형외과', contact: '02-555-1234', submitted: '2026-06-16' },
  { id: 'ph2', name: '부산척추전문병원', type: '전문병원', specialty: '척추·신경외과', contact: '051-240-5678', submitted: '2026-06-15' },
  { id: 'ph3', name: '제주 힐링센터', type: '한방병원', specialty: '한방·재생', contact: '064-740-9900', submitted: '2026-06-14' },
]
const ALL_HOSPITALS_STATUS = [
  { id: 'hh1', name: '세브란스병원',   type: '상급종합', status: 'active',    patients: 312 },
  { id: 'hh2', name: '서울아산병원',   type: '상급종합', status: 'active',    patients: 287 },
  { id: 'hh3', name: '삼성서울병원',   type: '상급종합', status: 'active',    patients: 241 },
  { id: 'hh4', name: 'JK성형외과',    type: '전문병원', status: 'active',    patients: 98  },
  { id: 'hh5', name: 'BGN밝은눈안과', type: '전문병원', status: 'active',    patients: 74  },
  { id: 'hh6', name: '강남세란의원',   type: '의원',     status: 'suspended', patients: 12  },
]

// ── Mock banners ───────────────────────────────────────────────────────────────
const INITIAL_BANNERS = [
  { id: 'b1', title: '세브란스병원 특별 건강검진 패키지',  position: '홈 히어로',    type: 'hospital', active: true,  startDate: '2026-06-01', endDate: '2026-06-30', clicks: 1284 },
  { id: 'b2', title: '피부과·성형 여름 시즌 프로모션',   position: '카테고리 배너', type: 'promo',    active: true,  startDate: '2026-06-10', endDate: '2026-07-10', clicks: 893  },
  { id: 'b3', title: '외국인 환자 VIP 케어 프로그램',   position: '사이드바',      type: 'service',  active: false, startDate: '2026-07-01', endDate: '2026-07-31', clicks: 0    },
  { id: 'b4', title: '척추·관절 수술 전문 병원 소개',   position: '홈 하단',       type: 'hospital', active: true,  startDate: '2026-05-15', endDate: '2026-06-30', clicks: 542  },
  { id: 'b5', title: '아랍어 전담 코디네이터 서비스',   position: '검색 결과',     type: 'service',  active: false, startDate: '2026-06-20', endDate: '2026-07-20', clicks: 0    },
]

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmt(n: number) {
  if (n >= 100000000) return `${(n / 100000000).toFixed(1)}억`
  if (n >= 10000000)  return `${(n / 10000000).toFixed(0)}천만`
  if (n >= 1000000)   return `${(n / 1000000).toFixed(0)}백만`
  return `${(n / 10000).toFixed(0)}만`
}

// ── SVG Bar Chart ──────────────────────────────────────────────────────────────
function BarChart() {
  const max = Math.max(...MONTHLY.map((d) => d.matches))
  const W = 420; const H = 140; const BAR = 38; const GAP = 30; const PAD = 28

  return (
    <svg viewBox={`0 0 ${W} ${H + PAD}`} className="w-full">
      {[0, 0.5, 1].map((t) => {
        const y = H - t * (H - 16)
        return (
          <g key={t}>
            <line x1={PAD} y1={y} x2={W - 8} y2={y} stroke="#f3f4f6" strokeWidth={1} />
            <text x={PAD - 4} y={y + 4} textAnchor="end" fontSize={9} fill="#9ca3af">{Math.round(t * max)}</text>
          </g>
        )
      })}
      {MONTHLY.map((d, i) => {
        const x = PAD + 4 + i * (BAR + GAP)
        const bh = ((d.matches / max) * (H - 16))
        const y = H - bh
        return (
          <g key={d.m}>
            <rect x={x} y={y} width={BAR} height={bh} rx={4} fill="#2563eb" opacity={0.8} />
            <text x={x + BAR / 2} y={y - 4} textAnchor="middle" fontSize={9} fontWeight="600" fill="#2563eb">{d.matches}</text>
            <text x={x + BAR / 2} y={H + PAD - 4} textAnchor="middle" fontSize={10} fill="#6b7280">{d.m}</text>
          </g>
        )
      })}
    </svg>
  )
}

// ── SVG Area Chart ─────────────────────────────────────────────────────────────
function AreaChart() {
  const max = Math.max(...MONTHLY.map((d) => d.revenue))
  const W = 420; const H = 140; const PAD = 28; const n = MONTHLY.length

  const pts = MONTHLY.map((d, i) => ({
    x: PAD + i * ((W - PAD - 8) / (n - 1)),
    y: H - (d.revenue / max) * (H - 16),
    ...d,
  }))
  const line = pts.map((p) => `${p.x},${p.y}`).join(' ')
  const area = `${pts[0].x},${H} ` + line + ` ${pts[n - 1].x},${H}`

  return (
    <svg viewBox={`0 0 ${W} ${H + PAD}`} className="w-full">
      {[0, 0.5, 1].map((t) => {
        const y = H - t * (H - 16)
        return (
          <g key={t}>
            <line x1={PAD} y1={y} x2={W - 8} y2={y} stroke="#f3f4f6" strokeWidth={1} />
            <text x={PAD - 4} y={y + 4} textAnchor="end" fontSize={9} fill="#9ca3af">{Math.round(t * max * 100)}만</text>
          </g>
        )
      })}
      <polygon points={area} fill="#2563eb" opacity={0.07} />
      <polyline points={line} fill="none" stroke="#2563eb" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p) => (
        <g key={p.m}>
          <circle cx={p.x} cy={p.y} r={3.5} fill="white" stroke="#2563eb" strokeWidth={2} />
          <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize={9} fontWeight="600" fill="#2563eb">{p.revenue * 100}만</text>
          <text x={p.x} y={H + PAD - 4} textAnchor="middle" fontSize={10} fill="#6b7280">{p.m}</text>
        </g>
      ))}
    </svg>
  )
}

// ── User Management ────────────────────────────────────────────────────────────
function UserManagement() {
  type UTab = 'hospital' | 'agent' | 'interpreter'
  const [tab, setTab] = useState<UTab>('hospital')
  const [hospitalStatus, setHospitalStatus] = useState<Record<string, 'active' | 'suspended' | 'pending'>>(
    Object.fromEntries([
      ...PENDING_HOSPITALS.map((h) => [h.id, 'pending' as const]),
      ...ALL_HOSPITALS_STATUS.map((h) => [h.id, h.status as 'active' | 'suspended']),
    ])
  )
  const [agentStatus, setAgentStatus] = useState<Record<string, string>>(
    Object.fromEntries(mockAgents.map((a) => [a.id, a.status]))
  )
  const [interpStatus, setInterpStatus] = useState<Record<string, string>>(
    Object.fromEntries(mockInterpreters.map((i) => [i.id, i.status]))
  )

  const STATUS_BADGE: Record<string, string> = {
    active:    'bg-green-50 text-green-700 border border-green-200',
    inactive:  'bg-gray-100 text-gray-500',
    suspended: 'bg-red-50 text-red-700 border border-red-200',
    pending:   'bg-yellow-50 text-yellow-700 border border-yellow-200',
    available: 'bg-green-50 text-green-700 border border-green-200',
    busy:      'bg-blue-50 text-blue-700 border border-blue-200',
  }
  const STATUS_LABEL: Record<string, string> = {
    active: '활성', inactive: '비활성', suspended: '정지', pending: '승인대기', available: '가용', busy: '배정중',
  }

  const TABS: { id: UTab; label: string; count: number }[] = [
    { id: 'hospital',    label: '병원',   count: PENDING_HOSPITALS.length },
    { id: 'agent',       label: '에이전트', count: mockAgents.filter((a) => a.status === 'inactive').length },
    { id: 'interpreter', label: '통역사',  count: mockInterpreters.filter((i) => i.status === 'inactive').length },
  ]

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-900">유저 관리</h2>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {t.label}
              {t.count > 0 && (
                <span className="bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{t.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5">
        {/* Hospital tab */}
        {tab === 'hospital' && (
          <div className="space-y-4">
            {PENDING_HOSPITALS.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-yellow-700 bg-yellow-50 border border-yellow-100 rounded-lg px-3 py-1.5 mb-3 inline-block">
                  승인 대기 {PENDING_HOSPITALS.length}건
                </p>
                <div className="space-y-2">
                  {PENDING_HOSPITALS.filter((h) => hospitalStatus[h.id] === 'pending').map((h) => (
                    <div key={h.id} className="flex items-center gap-3 p-3 bg-yellow-50/40 border border-yellow-100 rounded-xl">
                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-700 font-bold text-sm flex-shrink-0">
                        {h.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{h.name}</p>
                        <p className="text-xs text-gray-500">{h.type} · {h.specialty} · {h.contact}</p>
                        <p className="text-xs text-gray-400">신청: {h.submitted}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => setHospitalStatus((s) => ({ ...s, [h.id]: 'active' }))}
                          className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 font-medium transition-colors">
                          승인
                        </button>
                        <button onClick={() => setHospitalStatus((s) => ({ ...s, [h.id]: 'suspended' }))}
                          className="text-xs border border-red-200 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 font-medium transition-colors">
                          거절
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">등록 병원</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['병원명', '유형', '누적환자', '상태', ''].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-2 pr-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {ALL_HOSPITALS_STATUS.map((h) => {
                    const st = hospitalStatus[h.id] ?? h.status
                    const isSuspended = st === 'suspended'
                    return (
                      <tr key={h.id} className={`hover:bg-gray-50 ${isSuspended ? 'opacity-60' : ''}`}>
                        <td className="py-2.5 pr-3 text-sm font-medium text-gray-900">{h.name}</td>
                        <td className="py-2.5 pr-3 text-xs text-gray-500">{h.type}</td>
                        <td className="py-2.5 pr-3 text-xs text-gray-700">{h.patients}명</td>
                        <td className="py-2.5 pr-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[st]}`}>
                            {STATUS_LABEL[st]}
                          </span>
                        </td>
                        <td className="py-2.5">
                          <button
                            onClick={() => setHospitalStatus((s) => ({ ...s, [h.id]: isSuspended ? 'active' : 'suspended' }))}
                            className={`text-xs px-2 py-1 rounded-lg font-medium transition-colors ${
                              isSuspended
                                ? 'text-green-600 hover:bg-green-50'
                                : 'text-red-500 hover:bg-red-50'
                            }`}
                          >
                            {isSuspended ? '복구' : '정지'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Agent tab */}
        {tab === 'agent' && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['에이전트', '국가', '이번달', '누적', '상태', ''].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-2 pr-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mockAgents.map((a) => {
                const st = agentStatus[a.id] ?? a.status
                const isOff = st === 'inactive'
                return (
                  <tr key={a.id} className={`hover:bg-gray-50 ${isOff ? 'opacity-60' : ''}`}>
                    <td className="py-2.5 pr-3">
                      <p className="text-sm font-medium text-gray-900">{a.name}</p>
                      <p className="text-xs text-gray-400">{a.company}</p>
                    </td>
                    <td className="py-2.5 pr-3 text-xs text-gray-500">{a.country}</td>
                    <td className="py-2.5 pr-3 text-xs text-gray-700 font-medium">{a.thisMonthPatients}명</td>
                    <td className="py-2.5 pr-3 text-xs text-gray-500">{a.totalPatients}명</td>
                    <td className="py-2.5 pr-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[st]}`}>
                        {STATUS_LABEL[st]}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <button
                        onClick={() => setAgentStatus((s) => ({ ...s, [a.id]: isOff ? 'active' : 'inactive' }))}
                        className={`text-xs px-2 py-1 rounded-lg font-medium transition-colors ${
                          isOff ? 'text-green-600 hover:bg-green-50' : 'text-red-500 hover:bg-red-50'
                        }`}
                      >
                        {isOff ? '복구' : '정지'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {/* Interpreter tab */}
        {tab === 'interpreter' && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['통역사', '언어', '완료건', '평점', '상태', ''].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-2 pr-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mockInterpreters.map((i) => {
                const st = interpStatus[i.id] ?? i.status
                const isOff = st === 'inactive'
                return (
                  <tr key={i.id} className={`hover:bg-gray-50 ${isOff ? 'opacity-60' : ''}`}>
                    <td className="py-2.5 pr-3 text-sm font-medium text-gray-900">{i.name}</td>
                    <td className="py-2.5 pr-3 text-xs text-gray-500">{i.languages.slice(0, 2).join(', ')}</td>
                    <td className="py-2.5 pr-3 text-xs text-gray-700">{i.completedCases}건</td>
                    <td className="py-2.5 pr-3 text-xs">
                      <span className="text-yellow-500">★</span>
                      <span className="text-gray-700 font-medium ml-0.5">{i.rating}</span>
                    </td>
                    <td className="py-2.5 pr-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[st]}`}>
                        {STATUS_LABEL[st]}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <button
                        onClick={() => setInterpStatus((s) => ({ ...s, [i.id]: isOff ? 'available' : 'inactive' }))}
                        className={`text-xs px-2 py-1 rounded-lg font-medium transition-colors ${
                          isOff ? 'text-green-600 hover:bg-green-50' : 'text-red-500 hover:bg-red-50'
                        }`}
                      >
                        {isOff ? '복구' : '정지'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ── AI Algorithm Settings ──────────────────────────────────────────────────────
const WEIGHT_DEFS = [
  { key: 'specialty',  label: '전문과 적합도',   desc: '환자 질환과 병원 전문과의 일치도',  color: 'bg-blue-500' },
  { key: 'budget',     label: '예산 적합도',     desc: '환자 예산 범위 내 시술 여부',       color: 'bg-green-500' },
  { key: 'language',   label: '언어 지원',       desc: '통역사·의료진 언어 일치',           color: 'bg-purple-500' },
  { key: 'rating',     label: '병원 평점',       desc: 'KMM 플랫폼 평점 반영',             color: 'bg-yellow-500' },
  { key: 'agent',      label: '에이전트 선호',   desc: '협력 에이전트 우선 매칭',           color: 'bg-orange-500' },
  { key: 'location',   label: '위치·접근성',     desc: '공항, 호텔 거리 고려',              color: 'bg-teal-500' },
  { key: 'history',    label: '치료 이력',       desc: '이전 방문 병원 연속성 가중',        color: 'bg-indigo-500' },
]

function AISettings() {
  type Weights = Record<string, number>
  const [weights, setWeights] = useState<Weights>({
    specialty: 30, budget: 25, language: 20, rating: 10, agent: 5, location: 5, history: 5,
  })
  const [saved, setSaved] = useState(false)
  const total = Object.values(weights).reduce((s, v) => s + v, 0)

  function set(key: string, val: number) {
    setSaved(false)
    setWeights((w) => ({ ...w, [key]: val }))
  }

  function save() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const overHundred = total !== 100

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-gray-900">AI 매칭 알고리즘 가중치</h2>
          <p className="text-xs text-gray-400 mt-0.5">각 요소의 합이 100이 되도록 설정</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            overHundred ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
          }`}>
            합계 {total}
          </span>
          <button
            onClick={save}
            disabled={overHundred}
            className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {saved ? '✓ 저장됨' : '저장'}
          </button>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {WEIGHT_DEFS.map(({ key, label, desc, color }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <span className="text-sm font-medium text-gray-800">{label}</span>
                <span className="text-xs text-gray-400 ml-2">{desc}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0} max={100}
                  value={weights[key]}
                  onChange={(e) => set(key, Math.max(0, Math.min(100, Number(e.target.value))))}
                  className="w-12 border border-gray-200 rounded-lg px-2 py-0.5 text-xs text-center font-bold outline-none focus:border-blue-400"
                />
                <span className="text-xs text-gray-400">%</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range" min={0} max={100} value={weights[key]}
                onChange={(e) => set(key, Number(e.target.value))}
                className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer accent-blue-600"
              />
              <div className="w-24 bg-gray-100 rounded-full h-1.5 flex-shrink-0 overflow-hidden">
                <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${weights[key]}%` }} />
              </div>
            </div>
          </div>
        ))}

        {overHundred && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg p-2">
            ⚠ 가중치 합계가 {total}입니다. 정확히 100이 되도록 조정해 주세요.
          </p>
        )}

        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">현재 구성 미리보기</p>
          <div className="h-3 rounded-full overflow-hidden flex">
            {WEIGHT_DEFS.map(({ key, color }) => (
              <div key={key} className={`${color} transition-all`} style={{ width: `${weights[key]}%` }}
                title={WEIGHT_DEFS.find((d) => d.key === key)?.label} />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
            {WEIGHT_DEFS.filter((d) => weights[d.key] > 0).map((d) => (
              <span key={d.key} className="text-xs text-gray-500 flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${d.color}`} />
                {d.label} {weights[d.key]}%
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Banner Management ──────────────────────────────────────────────────────────
const BANNER_TYPE_COLOR: Record<string, string> = {
  hospital: 'bg-blue-50 text-blue-700',
  promo:    'bg-orange-50 text-orange-700',
  service:  'bg-purple-50 text-purple-700',
}
const BANNER_TYPE_LABEL: Record<string, string> = {
  hospital: '병원', promo: '프로모션', service: '서비스',
}
const POSITION_COLORS: Record<string, string> = {
  '홈 히어로': 'bg-blue-100 text-blue-700',
  '카테고리 배너': 'bg-green-100 text-green-700',
  '사이드바': 'bg-purple-100 text-purple-700',
  '홈 하단': 'bg-amber-100 text-amber-700',
  '검색 결과': 'bg-teal-100 text-teal-700',
}
const BANNER_GRADIENTS = [
  'from-blue-500 to-blue-700',
  'from-orange-400 to-pink-600',
  'from-purple-500 to-indigo-700',
  'from-teal-500 to-emerald-700',
  'from-amber-400 to-orange-600',
]

function BannerManagement() {
  const [banners, setBanners] = useState(INITIAL_BANNERS)
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newPos, setNewPos] = useState('홈 히어로')
  const [newType, setNewType] = useState('hospital')

  function toggle(id: string) {
    setBanners((b) => b.map((bn) => bn.id === id ? { ...bn, active: !bn.active } : bn))
  }
  function remove(id: string) {
    setBanners((b) => b.filter((bn) => bn.id !== id))
  }
  function addBanner() {
    if (!newTitle.trim()) return
    setBanners((b) => [...b, {
      id: `b${Date.now()}`, title: newTitle, position: newPos, type: newType,
      active: true, startDate: '2026-06-18', endDate: '2026-07-18', clicks: 0,
    }])
    setNewTitle('')
    setShowAdd(false)
  }

  const active = banners.filter((b) => b.active).length

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-gray-900">배너 · 콘텐츠 관리</h2>
          <p className="text-xs text-gray-400 mt-0.5">활성 {active}개 · 전체 {banners.length}개</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + 배너 추가
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="px-5 py-4 bg-blue-50/50 border-b border-blue-100 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-gray-500 block mb-1">배너 제목</label>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="배너 제목 입력..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 bg-white"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">노출 위치</label>
            <select value={newPos} onChange={(e) => setNewPos(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 bg-white">
              {Object.keys(POSITION_COLORS).map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">유형</label>
            <select value={newType} onChange={(e) => setNewType(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 bg-white">
              {Object.entries(BANNER_TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={addBanner}
              className="bg-blue-600 text-white text-xs px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              추가
            </button>
            <button onClick={() => setShowAdd(false)}
              className="border border-gray-200 text-gray-500 text-xs px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              취소
            </button>
          </div>
        </div>
      )}

      {/* Banner grid */}
      <div className="p-5 grid grid-cols-3 gap-4">
        {banners.map((bn, i) => (
          <div key={bn.id} className={`border rounded-2xl overflow-hidden transition-all ${
            bn.active ? 'border-gray-200' : 'border-gray-100 opacity-60'
          }`}>
            {/* Preview */}
            <div className={`h-20 bg-gradient-to-br ${BANNER_GRADIENTS[i % BANNER_GRADIENTS.length]} relative flex items-end p-3`}>
              <span className="text-white/20 font-black text-5xl absolute right-3 top-1 select-none">★</span>
              <div className="relative z-10">
                <p className="text-white text-xs font-bold leading-tight line-clamp-2">{bn.title}</p>
              </div>
              {/* Active toggle overlay */}
              <div className="absolute top-2 right-2">
                <button
                  onClick={() => toggle(bn.id)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    bn.active ? 'bg-white/30' : 'bg-black/30'
                  }`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                    bn.active ? 'translate-x-4' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>

            {/* Meta */}
            <div className="p-3 space-y-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${BANNER_TYPE_COLOR[bn.type]}`}>
                  {BANNER_TYPE_LABEL[bn.type]}
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${POSITION_COLORS[bn.position] ?? 'bg-gray-100 text-gray-600'}`}>
                  {bn.position}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{bn.startDate} ~ {bn.endDate}</span>
                <span>{bn.clicks.toLocaleString()} 클릭</span>
              </div>
              <div className="flex gap-1.5 pt-1">
                <button className="flex-1 text-xs border border-gray-200 text-gray-500 py-1 rounded-lg hover:bg-gray-50 transition-colors">
                  수정
                </button>
                <button onClick={() => remove(bn.id)}
                  className="text-xs border border-red-100 text-red-500 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors">
                  삭제
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const totalPatients = 1284
  const thisMonthNew  = 47
  const thisMonthMatchCount = MONTHLY[MONTHLY.length - 1].matches
  const thisMonthRevenue    = MONTHLY[MONTHLY.length - 1].revenue * 100   // 만원
  const totalRevenue  = MONTHLY.reduce((s, d) => s + d.revenue, 0) * 100  // 만원
  const convRate      = 68  // %

  const newInquiries    = mockPatients.filter((p) => p.status === 'inquiry').length
  const inTreatment     = mockPatients.filter((p) => p.status === 'in-treatment').length
  const pendingSettle   = mockSettlements.filter((s) => s.status === 'pending').length
  const pendingApproval = PENDING_HOSPITALS.length

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">관리자 대시보드</h1>
          <p className="text-sm text-gray-500 mt-0.5">2026년 6월 18일 기준</p>
        </div>
        <div className="flex items-center gap-2">
          {pendingApproval > 0 && (
            <span className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs px-3 py-1.5 rounded-lg font-medium">
              <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
              병원 승인 대기 {pendingApproval}건
            </span>
          )}
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-md">v2.4.1</span>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-6 gap-3">
        {[
          { label: '총 유저',       value: (totalPatients + 45 + 18 + 24).toLocaleString(), sub: `환자 ${totalPatients.toLocaleString()} · 병원 45 · 에이전트 18 · 통역사 24`, color: 'text-blue-600',   bg: 'bg-blue-50',   icon: '👥', href: '/admin/patients' },
          { label: '이달 신규',     value: `+${thisMonthNew}명`,                             sub: '전월 대비 +18.4%',                                                           color: 'text-emerald-600', bg: 'bg-emerald-50', icon: '📈', href: '/admin/patients' },
          { label: '이달 매칭',     value: `${thisMonthMatchCount}건`,                       sub: `전월 대비 −20% ▼`,                                                           color: 'text-violet-600',  bg: 'bg-violet-50',  icon: '🔗', href: '/admin/crm' },
          { label: '이달 매출',     value: `${thisMonthRevenue.toLocaleString()}만원`,        sub: `전환율 ${convRate}%`,                                                         color: 'text-amber-600',   bg: 'bg-amber-50',   icon: '💰', href: '/admin/settlements' },
          { label: '정산 대기',     value: `${pendingSettle}건`,                              sub: '처리 필요',                                                                    color: 'text-orange-600',  bg: 'bg-orange-50',  icon: '⏳', href: '/admin/settlements' },
          { label: '승인 대기',     value: `${pendingApproval}건`,                            sub: '병원 신규 등록',                                                               color: 'text-red-600',     bg: 'bg-red-50',     icon: '🔔', href: '/admin/approvals' },
        ].map((c) => (
          <Link key={c.label} href={c.href}
            className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md hover:border-gray-300 transition-all">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 font-medium">{c.label}</p>
              <span className={`text-lg w-8 h-8 ${c.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                {c.icon}
              </span>
            </div>
            <p className={`text-xl font-bold ${c.color} leading-none`}>{c.value}</p>
            <p className="text-xs text-gray-400 mt-1 leading-tight">{c.sub}</p>
          </Link>
        ))}
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-bold text-gray-900">월별 매칭 건수</h2>
            <span className="text-xs text-gray-400">2026년 상반기</span>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl font-bold text-blue-600">
              {MONTHLY.reduce((s, d) => s + d.matches, 0)}건
            </span>
            <span className="text-xs text-gray-400">상반기 누계</span>
            <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full ml-auto">
              평균 {Math.round(MONTHLY.reduce((s, d) => s + d.matches, 0) / MONTHLY.length)}건/월
            </span>
          </div>
          <BarChart />
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-bold text-gray-900">월별 매출 추이</h2>
            <span className="text-xs text-gray-400">2026년 상반기 (만원)</span>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl font-bold text-blue-600">
              {totalRevenue.toLocaleString()}만원
            </span>
            <span className="text-xs text-gray-400">상반기 누계</span>
            <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full ml-auto">
              최고 5월 {MONTHLY.find(d=>d.m==='5월')!.revenue * 100}만원
            </span>
          </div>
          <AreaChart />
        </div>
      </div>

      {/* ── User Management + AI Settings ── */}
      <div className="grid grid-cols-2 gap-4">
        <UserManagement />
        <AISettings />
      </div>

      {/* ── Banner Management ── */}
      <BannerManagement />

    </div>
  )
}
