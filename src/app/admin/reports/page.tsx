'use client'

const MONTHLY_DATA = [
  { month: '2026-01', newPatients: 34, completedTreatments: 28, revenue: 52000000, commission: 6800000 },
  { month: '2026-02', newPatients: 29, completedTreatments: 31, revenue: 48000000, commission: 6200000 },
  { month: '2026-03', newPatients: 41, completedTreatments: 35, revenue: 67000000, commission: 8900000 },
  { month: '2026-04', newPatients: 38, completedTreatments: 42, revenue: 71000000, commission: 9600000 },
  { month: '2026-05', newPatients: 52, completedTreatments: 47, revenue: 89000000, commission: 12100000 },
  { month: '2026-06', newPatients: 47, completedTreatments: 31, revenue: 62000000, commission: 8400000 },
]

const TOP_HOSPITALS = [
  { name: '세브란스병원', patients: 287, revenue: 4200000000, avgCommission: '15%' },
  { name: '서울아산병원', patients: 241, revenue: 5100000000, avgCommission: '15%' },
  { name: '삼성서울병원', patients: 198, revenue: 3900000000, avgCommission: '15%' },
  { name: 'JK성형외과', patients: 156, revenue: 890000000, avgCommission: '12%' },
  { name: 'BGN밝은눈안과', patients: 134, revenue: 420000000, avgCommission: '10%' },
]

const NATIONALITY_DATA = [
  { country: '중국', patients: 412, percent: 32 },
  { country: '러시아', patients: 289, percent: 22 },
  { country: '몽골', patients: 198, percent: 15 },
  { country: 'UAE', patients: 156, percent: 12 },
  { country: '일본', patients: 134, percent: 10 },
  { country: '기타', percent: 9, patients: 95 },
]

const TREATMENT_DATA = [
  { category: '수술', count: 432, revenue: 8900000000 },
  { category: '건강검진', count: 298, revenue: 890000000 },
  { category: '시술', count: 356, revenue: 1200000000 },
  { category: '질환', count: 198, revenue: 540000000 },
]

function fmt(n: number) {
  if (n >= 100000000) return `₩${(n / 100000000).toFixed(1)}억`
  if (n >= 10000000) return `₩${(n / 10000000).toFixed(0)}천만`
  if (n >= 1000000) return `₩${(n / 1000000).toFixed(0)}백만`
  return `₩${n.toLocaleString()}`
}

export default function ReportsPage() {
  const totalPatients = MONTHLY_DATA.reduce((sum, m) => sum + m.newPatients, 0)
  const totalRevenue = MONTHLY_DATA.reduce((sum, m) => sum + m.revenue, 0)
  const totalCommission = MONTHLY_DATA.reduce((sum, m) => sum + m.commission, 0)

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">리포트</h1>
        <p className="text-sm text-gray-500 mt-0.5">2026년 1~6월 누적 현황</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: '누적 환자', value: totalPatients },
          { label: '누적 진료비', value: fmt(totalRevenue) },
          { label: '누적 수수료', value: fmt(totalCommission) },
          { label: '평균 수수료율', value: `${((totalCommission / totalRevenue) * 100).toFixed(1)}%` },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Monthly table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">월별 현황</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['월', '신규 환자', '완료 진료', '진료비', '수수료'].map((h) => (
                  <th key={h} className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MONTHLY_DATA.map((m) => (
                <tr key={m.month} className="hover:bg-gray-50">
                  <td className="py-2.5 px-4 font-medium text-gray-900">{m.month}</td>
                  <td className="py-2.5 px-4 text-gray-700">{m.newPatients}명</td>
                  <td className="py-2.5 px-4 text-gray-700">{m.completedTreatments}건</td>
                  <td className="py-2.5 px-4 text-gray-700">{fmt(m.revenue)}</td>
                  <td className="py-2.5 px-4 text-blue-600 font-medium">{fmt(m.commission)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-4">
          {/* Nationality */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">국적별 환자 분포</h2>
            </div>
            <div className="p-4 space-y-2">
              {NATIONALITY_DATA.map((n) => (
                <div key={n.country}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-700">{n.country}</span>
                    <span className="text-gray-500">{n.patients}명 ({n.percent}%)</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${n.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Treatment category */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">진료 분류별 현황</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['분류', '건수', '진료비'].map((h) => (
                    <th key={h} className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {TREATMENT_DATA.map((t) => (
                  <tr key={t.category} className="hover:bg-gray-50">
                    <td className="py-2.5 px-4 font-medium text-gray-900">{t.category}</td>
                    <td className="py-2.5 px-4 text-gray-700">{t.count.toLocaleString()}건</td>
                    <td className="py-2.5 px-4 text-blue-600">{fmt(t.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Top hospitals */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">병원별 실적 TOP 5</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {['순위', '병원명', '환자 수', '총 진료비', '수수료율'].map((h) => (
                <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {TOP_HOSPITALS.map((h, idx) => (
              <tr key={h.name} className="hover:bg-gray-50">
                <td className="py-3 px-4 font-bold text-gray-400">#{idx + 1}</td>
                <td className="py-3 px-4 font-medium text-gray-900">{h.name}</td>
                <td className="py-3 px-4 text-gray-700">{h.patients.toLocaleString()}명</td>
                <td className="py-3 px-4 text-gray-700">{fmt(h.revenue)}</td>
                <td className="py-3 px-4 text-blue-600 font-medium">{h.avgCommission}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
