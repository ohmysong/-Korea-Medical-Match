'use client'

import { mockAgentPerformance, mockAgentCountryStats, mockAgentTreatmentStats } from '@/lib/agent-mock-data'

function fmt(n: number) {
  if (n >= 100000000) return `₩${(n / 100000000).toFixed(1)}억`
  if (n >= 10000000) return `₩${(n / 10000000).toFixed(0)}천만`
  return `₩${n.toLocaleString()}`
}

function downloadCSV(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((v) => (typeof v === 'string' && v.includes(',') ? `"${v}"` : v)).join(',')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default function AgentReportsPage() {
  const data = mockAgentPerformance
  const latest = data[data.length - 1]
  const totalReferred = data.reduce((sum, m) => sum + m.referred, 0)
  const totalConverted = data.reduce((sum, m) => sum + m.converted, 0)
  const totalCompleted = data.reduce((sum, m) => sum + m.completed, 0)
  const totalCommission = data.reduce((sum, m) => sum + m.commission, 0)
  const maxReferred = Math.max(...data.map((m) => m.referred))

  const stats = [
    { label: '이번 달 환자 유치', value: `${latest.referred}명` },
    { label: '매칭 성공률', value: `${Math.round((latest.converted / latest.referred) * 100)}%` },
    { label: '이번 달 수익', value: fmt(latest.revenue) },
    { label: '누적 수수료', value: fmt(totalCommission) },
  ]

  function handleExportMonthly() {
    downloadCSV('agent_monthly_report.csv', [
      ['월', '추천 환자', '예약 전환', '진료 완료', '발생 진료비', '수수료'],
      ...data.map((m) => [m.month, m.referred, m.converted, m.completed, m.revenue, m.commission]),
    ])
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">리포트 & 분석</h1>
          <p className="text-sm text-gray-500 mt-0.5">환자 유치 실적, 매칭 성공률, 수익을 분석하세요</p>
        </div>
        <button onClick={handleExportMonthly} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          Excel 다운로드
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">월별 추천 환자 추이</h2>
          <div className="flex items-end gap-3 h-40">
            {data.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center justify-end h-full">
                <span className="text-xs text-gray-500 mb-1">{m.referred}</span>
                <div className="w-full flex flex-col gap-0.5 justify-end" style={{ height: '100%' }}>
                  <div className="w-full bg-indigo-500 rounded-t-md" style={{ height: `${(m.referred / maxReferred) * 100}%` }} />
                  <div className="w-full bg-indigo-200" style={{ height: `${(m.converted / maxReferred) * 100}%` }} />
                </div>
                <span className="text-xs text-gray-400 mt-1.5">{m.month.slice(5)}월</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block" />추천</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-indigo-200 inline-block" />전환</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">누적 전환 퍼널 (6개월)</h2>
          <div className="space-y-3">
            {[
              { label: '추천 환자', value: totalReferred, percent: 100 },
              { label: '예약 전환', value: totalConverted, percent: Math.round((totalConverted / totalReferred) * 100) },
              { label: '진료 완료', value: totalCompleted, percent: Math.round((totalCompleted / totalReferred) * 100) },
            ].map((f) => (
              <div key={f.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-700">{f.label}</span>
                  <span className="text-gray-500">{f.value}명 ({f.percent}%)</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${f.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">전환율 = 예약 전환 ÷ 추천 환자, 완료율 = 진료 완료 ÷ 추천 환자</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">국가별 환자 분포</h2>
          </div>
          <div className="p-4 space-y-2.5">
            {mockAgentCountryStats.map((c) => (
              <div key={c.country}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-700">{c.country}</span>
                  <span className="text-gray-500">{c.patients}명 ({c.percent}%)</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${c.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">시술 분류별 현황</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['분류', '건수', '발생 진료비'].map((h) => (
                  <th key={h} className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockAgentTreatmentStats.map((t) => (
                <tr key={t.category} className="hover:bg-gray-50">
                  <td className="py-2.5 px-4 font-medium text-gray-900">{t.category}</td>
                  <td className="py-2.5 px-4 text-gray-700">{t.count.toLocaleString()}건</td>
                  <td className="py-2.5 px-4 text-indigo-600">{fmt(t.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-sm font-semibold text-gray-900">월별 상세 실적</h2>
          <button onClick={handleExportMonthly} className="text-xs text-indigo-600 hover:underline font-medium">CSV로 내보내기</button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {['월', '추천 환자', '예약 전환', '진료 완료', '발생 진료비', '수수료'].map((h) => (
                <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((m) => (
              <tr key={m.month} className="hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-900">{m.month}</td>
                <td className="py-3 px-4 text-gray-700">{m.referred}명</td>
                <td className="py-3 px-4 text-gray-700">{m.converted}명</td>
                <td className="py-3 px-4 text-gray-700">{m.completed}건</td>
                <td className="py-3 px-4 text-gray-700">{fmt(m.revenue)}</td>
                <td className="py-3 px-4 text-indigo-600 font-medium">{fmt(m.commission)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
