'use client'

import Link from 'next/link'
import { mockAgents } from '@/lib/admin-mock-data'
import {
  mockAgentPatients, mockAgentMatchingRequests, mockAgentPerformance, mockWeeklyMatching,
  type LeadStatus,
} from '@/lib/agent-mock-data'

const agent = mockAgents[0]

const STATUS_LABELS: Record<LeadStatus, string> = { new: '신규', matching: '매칭 중', completed: '완료', cancelled: '취소' }
const STATUS_STYLES: Record<LeadStatus, string> = {
  new: 'bg-gray-100 text-gray-600',
  matching: 'bg-blue-50 text-blue-700 border border-blue-200',
  completed: 'bg-green-50 text-green-700 border border-green-200',
  cancelled: 'bg-red-50 text-red-700 border border-red-200',
}

function fmt(n: number) {
  return `₩${n.toLocaleString()}`
}

export default function AgentDashboard() {
  const latestMonth = mockAgentPerformance[mockAgentPerformance.length - 1]
  const registeredThisMonth = mockAgentPatients.filter((p) => p.registeredAt >= '2026-06-01').length
  const matchingSuccessThisMonth = mockAgentMatchingRequests.filter(
    (r) => (r.status === 'accepted' || r.status === 'completed') && r.requestedAt >= '2026-06-01'
  ).length

  const recentLeads = [...mockAgentPatients]
    .sort((a, b) => b.registeredAt.localeCompare(a.registeredAt))
    .slice(0, 4)

  const maxWeekly = Math.max(...mockWeeklyMatching.map((w) => w.requested))

  return (
    <div className="max-w-5xl mx-auto px-6 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">안녕하세요, {agent.name}님</h1>
        <p className="text-sm text-gray-500 mt-0.5">{agent.company} · {agent.country}</p>
      </div>

      {/* 이번 달 실적 카드 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500">이번 달 등록 환자 수</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{registeredThisMonth}명</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500">이번 달 매칭 성공 수</p>
          <p className="text-xl font-bold text-indigo-600 mt-1">{matchingSuccessThisMonth}건</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500">이번 달 예상 커미션</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{fmt(latestMonth.commission)}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 mb-6">
        <Link href="/agent/leads" className="flex-1 bg-indigo-600 text-white text-center py-3 rounded-xl text-sm font-semibold hover:bg-indigo-700">
          + 새 환자 등록
        </Link>
        <Link href="/agent/matching" className="flex-1 border border-indigo-200 text-indigo-700 text-center py-3 rounded-xl text-sm font-semibold hover:bg-indigo-50">
          🏥 병원 추천하기
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* 최근 리드 현황 */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900">최근 리드 현황</h2>
            <Link href="/agent/leads" className="text-xs text-indigo-600 hover:underline">전체보기</Link>
          </div>
          <div className="space-y-2">
            {recentLeads.map((p) => (
              <div key={p.id} className="flex items-center justify-between border border-gray-100 rounded-lg p-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400 truncate">{p.nationality} · {p.treatmentInterest}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_STYLES[p.status]}`}>
                  {STATUS_LABELS[p.status]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 이번 주 매칭 현황 차트 */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">이번 주 매칭 현황</h2>
          <div className="flex items-end gap-3 h-32">
            {mockWeeklyMatching.map((w) => (
              <div key={w.week} className="flex-1 flex flex-col items-center justify-end h-full">
                <span className="text-xs text-gray-500 mb-1">{w.requested}</span>
                <div className="w-full flex flex-col gap-0.5 justify-end" style={{ height: '100%' }}>
                  <div className="w-full bg-indigo-500 rounded-t-md" style={{ height: `${(w.requested / maxWeekly) * 100}%` }} />
                  <div className="w-full bg-indigo-200" style={{ height: `${(w.accepted / maxWeekly) * 100}%` }} />
                </div>
                <span className="text-xs text-gray-400 mt-1.5">{w.week}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block" />요청</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-indigo-200 inline-block" />수락</span>
          </div>
        </div>
      </div>

      <Link
        href="/agent/marketing"
        className="block bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 text-white hover:shadow-lg transition-shadow"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs bg-white/15 inline-block px-2.5 py-1 rounded-full border border-white/20 mb-2">✦ AI 마케팅 에이전트</p>
            <h2 className="text-lg font-bold mb-1">병원 자료로 SNS·블로그·광고 문구를 자동 생성하세요</h2>
            <p className="text-indigo-100 text-sm">7개 언어로 번역까지 한 번에 — {agent.languages.join(', ')} 환자 대상 마케팅에 활용해보세요</p>
          </div>
          <span className="text-2xl flex-shrink-0">→</span>
        </div>
      </Link>
    </div>
  )
}
