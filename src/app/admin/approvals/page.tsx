'use client'

import { useState } from 'react'
import { mockAgents, mockInterpreters } from '@/lib/admin-mock-data'

// ── Mock pending registrations ─────────────────────────────────────────────────
const INIT_HOSPITALS = [
  { id: 'ph1', name: '강남뷰티클리닉',   type: '의원',     specialty: '성형외과',    contact: '02-555-1234',  email: 'gangnam@beauty.kr',    submitted: '2026-06-16', docs: true  },
  { id: 'ph2', name: '부산척추전문병원',  type: '전문병원', specialty: '척추·신경외과', contact: '051-240-5678', email: 'busan@spine.kr',       submitted: '2026-06-15', docs: true  },
  { id: 'ph3', name: '제주 힐링센터',    type: '한방병원', specialty: '한방·재생의학', contact: '064-740-9900', email: 'jeju@healing.kr',      submitted: '2026-06-14', docs: false },
  { id: 'ph4', name: '대전 암전문센터',   type: '종합병원', specialty: '암센터·종양내과', contact: '042-600-7788', email: 'daejeon@cancer.kr',  submitted: '2026-06-12', docs: true  },
]

const INIT_AGENTS = [
  { id: 'ag1', name: 'Priya Sharma',    company: 'India MedConnect',      country: '인도',    languages: ['영어', '힌디어'],    submitted: '2026-06-17', email: 'priya@indiamedconnect.in' },
  { id: 'ag2', name: 'Carlos Mendez',   company: 'LatAm Health Bridge',   country: '멕시코',  languages: ['스페인어', '영어'],   submitted: '2026-06-16', email: 'carlos@latamhealth.mx'   },
  { id: 'ag3', name: 'Amira El-Sayed',  company: 'Cairo Medical Tours',   country: '이집트',  languages: ['아랍어', '영어'],     submitted: '2026-06-14', email: 'amira@cairomed.eg'       },
]

const INIT_INTERPRETERS = [
  { id: 'ip1', name: '응우옌 반 민',    languages: ['베트남어', '한국어', '영어'], specialties: ['외과', '내과'],  submitted: '2026-06-17', cases: 0   },
  { id: 'ip2', name: 'Khalid Hassan',  languages: ['아랍어', '영어'],            specialties: ['암센터'],       submitted: '2026-06-15', cases: 12  },
  { id: 'ip3', name: '타나 수타',      languages: ['태국어', '영어', '한국어'],   specialties: ['성형외과', '피부과'], submitted: '2026-06-13', cases: 45 },
]

type Status = 'pending' | 'approved' | 'rejected'
type Tab = 'hospital' | 'agent' | 'interpreter'

const TAB_LABELS: Record<Tab, string> = { hospital: '병원', agent: '에이전트', interpreter: '통역사' }

function StatusBadge({ s }: { s: Status }) {
  const cls = s === 'pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
    : s === 'approved' ? 'bg-green-50 text-green-700 border border-green-200'
    : 'bg-red-50 text-red-700 border border-red-200'
  const label = s === 'pending' ? '대기' : s === 'approved' ? '승인' : '거절'
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>
}

function ActionBtns({ id, status, onApprove, onReject }: {
  id: string; status: Status
  onApprove: (id: string) => void
  onReject: (id: string) => void
}) {
  if (status !== 'pending') {
    return (
      <span className="text-xs text-gray-400">처리 완료</span>
    )
  }
  return (
    <div className="flex gap-1.5">
      <button onClick={() => onApprove(id)}
        className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 font-medium transition-colors">
        승인
      </button>
      <button onClick={() => onReject(id)}
        className="text-xs border border-red-200 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 font-medium transition-colors">
        거절
      </button>
    </div>
  )
}

export default function ApprovalsPage() {
  const [tab, setTab] = useState<Tab>('hospital')
  const [hospitalStatus, setHospitalStatus] = useState<Record<string, Status>>(
    Object.fromEntries(INIT_HOSPITALS.map((h) => [h.id, 'pending' as Status]))
  )
  const [agentStatus, setAgentStatus] = useState<Record<string, Status>>(
    Object.fromEntries(INIT_AGENTS.map((a) => [a.id, 'pending' as Status]))
  )
  const [interpStatus, setInterpStatus] = useState<Record<string, Status>>(
    Object.fromEntries(INIT_INTERPRETERS.map((i) => [i.id, 'pending' as Status]))
  )

  const pendingH = Object.values(hospitalStatus).filter((s) => s === 'pending').length
  const pendingA = Object.values(agentStatus).filter((s) => s === 'pending').length
  const pendingI = Object.values(interpStatus).filter((s) => s === 'pending').length
  const totalPending = pendingH + pendingA + pendingI

  const approve = (setter: typeof setHospitalStatus) => (id: string) => setter((s) => ({ ...s, [id]: 'approved' }))
  const reject  = (setter: typeof setHospitalStatus) => (id: string) => setter((s) => ({ ...s, [id]: 'rejected'  }))

  const TABS: { id: Tab; pending: number }[] = [
    { id: 'hospital',    pending: pendingH },
    { id: 'agent',       pending: pendingA },
    { id: 'interpreter', pending: pendingI },
  ]

  return (
    <div className="max-w-5xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">승인 관리</h1>
          <p className="text-sm text-gray-500 mt-0.5">신규 파트너 가입 요청 검토 및 승인</p>
        </div>
        {totalPending > 0 && (
          <span className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm px-4 py-2 rounded-xl font-medium">
            <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            전체 대기 {totalPending}건
          </span>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`p-4 rounded-2xl border text-left transition-all ${
              tab === t.id ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}>
            <p className="text-sm text-gray-500 font-medium">{TAB_LABELS[t.id]}</p>
            <p className={`text-3xl font-bold mt-1 ${t.pending > 0 ? 'text-yellow-600' : 'text-gray-400'}`}>
              {t.pending}
            </p>
            <p className="text-xs text-gray-400 mt-1">대기 중</p>
          </button>
        ))}
      </div>

      {/* Tab bar */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="flex border-b border-gray-100">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-3.5 text-sm font-medium transition-colors border-b-2 flex items-center justify-center gap-2 ${
                tab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {TAB_LABELS[t.id]}
              {t.pending > 0 && (
                <span className="bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {t.pending}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* Hospital */}
          {tab === 'hospital' && (
            <div className="space-y-3">
              {INIT_HOSPITALS.map((h) => {
                const s = hospitalStatus[h.id]
                return (
                  <div key={h.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                    s === 'pending' ? 'border-gray-200 bg-white' :
                    s === 'approved' ? 'border-green-100 bg-green-50/30' :
                    'border-red-100 bg-red-50/20 opacity-60'
                  }`}>
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 font-bold text-lg flex-shrink-0">
                      {h.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 text-sm">{h.name}</p>
                        <StatusBadge s={s} />
                        {!h.docs && s === 'pending' && (
                          <span className="text-xs bg-orange-50 text-orange-600 border border-orange-200 px-1.5 py-0.5 rounded-full">서류 미제출</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{h.type} · {h.specialty}</p>
                      <div className="flex gap-4 mt-1 text-xs text-gray-400">
                        <span>📞 {h.contact}</span>
                        <span>✉ {h.email}</span>
                        <span>신청일: {h.submitted}</span>
                      </div>
                    </div>
                    <ActionBtns id={h.id} status={s} onApprove={approve(setHospitalStatus)} onReject={reject(setHospitalStatus)} />
                  </div>
                )
              })}
            </div>
          )}

          {/* Agent */}
          {tab === 'agent' && (
            <div className="space-y-3">
              {INIT_AGENTS.map((a) => {
                const s = agentStatus[a.id]
                return (
                  <div key={a.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                    s === 'pending' ? 'border-gray-200 bg-white' :
                    s === 'approved' ? 'border-green-100 bg-green-50/30' :
                    'border-red-100 bg-red-50/20 opacity-60'
                  }`}>
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-700 font-bold text-lg flex-shrink-0">
                      {a.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 text-sm">{a.name}</p>
                        <StatusBadge s={s} />
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{a.company} · {a.country}</p>
                      <div className="flex gap-4 mt-1 text-xs text-gray-400">
                        <span>🌐 {a.languages.join(', ')}</span>
                        <span>✉ {a.email}</span>
                        <span>신청일: {a.submitted}</span>
                      </div>
                    </div>
                    <ActionBtns id={a.id} status={s} onApprove={approve(setAgentStatus)} onReject={reject(setAgentStatus)} />
                  </div>
                )
              })}
            </div>
          )}

          {/* Interpreter */}
          {tab === 'interpreter' && (
            <div className="space-y-3">
              {INIT_INTERPRETERS.map((i) => {
                const s = interpStatus[i.id]
                return (
                  <div key={i.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                    s === 'pending' ? 'border-gray-200 bg-white' :
                    s === 'approved' ? 'border-green-100 bg-green-50/30' :
                    'border-red-100 bg-red-50/20 opacity-60'
                  }`}>
                    <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center text-teal-700 font-bold text-lg flex-shrink-0">
                      {i.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 text-sm">{i.name}</p>
                        <StatusBadge s={s} />
                        {i.cases > 0 && (
                          <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">{i.cases}건 경력</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{i.languages.join(' · ')}</p>
                      <div className="flex gap-4 mt-1 text-xs text-gray-400">
                        <span>전문: {i.specialties.join(', ')}</span>
                        <span>신청일: {i.submitted}</span>
                      </div>
                    </div>
                    <ActionBtns id={i.id} status={s} onApprove={approve(setInterpStatus)} onReject={reject(setInterpStatus)} />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
