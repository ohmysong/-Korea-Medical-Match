'use client'

import { Fragment, useState } from 'react'
import Link from 'next/link'
import {
  mockHospitalInquiries,
  mockHospitalAppointments,
  mockMedicalResults,
  mockServiceRequests,
  mockHospitalPricing,
  mockHospitalProfile,
} from '@/lib/hospital-mock-data'
import type { HospitalPricingItem } from '@/lib/hospital-mock-data'

// ── Static chart data ──────────────────────────────────────────────────────────
const MONTHLY_DATA = [
  { month: '1월', matches: 8,  revenue: 3200, patients: 7 },
  { month: '2월', matches: 11, revenue: 4100, patients: 9 },
  { month: '3월', matches: 14, revenue: 5300, patients: 12 },
  { month: '4월', matches: 9,  revenue: 3800, patients: 8 },
  { month: '5월', matches: 16, revenue: 6200, patients: 14 },
  { month: '6월', matches: 12, revenue: 4800, patients: 11 },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatPrice(n: number) {
  if (n >= 100000000) return `${(n / 100000000).toFixed(1)}억원`
  if (n >= 10000000)  return `${(n / 10000000).toFixed(0)}천만원`
  if (n >= 1000000)   return `${(n / 1000000).toFixed(0)}백만원`
  if (n >= 10000)     return `${Math.round(n / 10000)}만원`
  return `${n.toLocaleString()}원`
}

const NAT_FLAG: Record<string, string> = {
  '중국': '🇨🇳', '러시아': '🇷🇺', '일본': '🇯🇵', 'UAE': '🇦🇪',
  '몽골': '🇲🇳', '카자흐스탄': '🇰🇿', '재외동포': '🇰🇷',
}

// ── Bar Chart ─────────────────────────────────────────────────────────────────
function BarChart() {
  const max = Math.max(...MONTHLY_DATA.map((d) => d.matches))
  const W = 420; const H = 160; const PAD = 32; const BAR_W = 40; const GAP = 30

  return (
    <svg viewBox={`0 0 ${W} ${H + PAD}`} className="w-full">
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const y = H - t * (H - 20)
        return (
          <g key={t}>
            <line x1={28} y1={y} x2={W - 8} y2={y} stroke="#f0f0f0" strokeWidth={1} />
            <text x={22} y={y + 4} textAnchor="end" fontSize={9} fill="#9ca3af">
              {Math.round(t * max)}
            </text>
          </g>
        )
      })}
      {/* Bars */}
      {MONTHLY_DATA.map((d, i) => {
        const x = 36 + i * (BAR_W + GAP)
        const barH = ((d.matches / max) * (H - 20))
        const y = H - barH
        return (
          <g key={d.month}>
            <rect x={x} y={y} width={BAR_W} height={barH}
              rx={4} fill="#16a34a" opacity={0.85}
              className="hover:opacity-100 transition-opacity"
            />
            <text x={x + BAR_W / 2} y={y - 5} textAnchor="middle" fontSize={10} fontWeight="600" fill="#16a34a">
              {d.matches}
            </text>
            <text x={x + BAR_W / 2} y={H + PAD - 6} textAnchor="middle" fontSize={10} fill="#6b7280">
              {d.month}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Area Chart ────────────────────────────────────────────────────────────────
function AreaChart() {
  const max = Math.max(...MONTHLY_DATA.map((d) => d.revenue))
  const W = 420; const H = 160; const PAD = 32
  const n = MONTHLY_DATA.length

  const pts = MONTHLY_DATA.map((d, i) => {
    const x = 36 + i * ((W - 44) / (n - 1))
    const y = H - ((d.revenue / max) * (H - 20))
    return { x, y, ...d }
  })

  const linePoints = pts.map((p) => `${p.x},${p.y}`).join(' ')
  const areaPoints = `${pts[0].x},${H} ` + linePoints + ` ${pts[n - 1].x},${H}`

  return (
    <svg viewBox={`0 0 ${W} ${H + PAD}`} className="w-full">
      {/* Grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const y = H - t * (H - 20)
        return (
          <g key={t}>
            <line x1={28} y1={y} x2={W - 8} y2={y} stroke="#f0f0f0" strokeWidth={1} />
            <text x={22} y={y + 4} textAnchor="end" fontSize={9} fill="#9ca3af">
              {Math.round(t * max / 100) * 100}
            </text>
          </g>
        )
      })}
      {/* Area */}
      <polygon points={areaPoints} fill="#16a34a" opacity={0.08} />
      {/* Line */}
      <polyline points={linePoints} fill="none" stroke="#16a34a" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {/* Dots + labels */}
      {pts.map((p) => (
        <g key={p.month}>
          <circle cx={p.x} cy={p.y} r={4} fill="white" stroke="#16a34a" strokeWidth={2} />
          <text x={p.x} y={p.y - 9} textAnchor="middle" fontSize={9} fontWeight="600" fill="#16a34a">
            {(p.revenue / 100).toFixed(0)}만
          </text>
          <text x={p.x} y={H + PAD - 6} textAnchor="middle" fontSize={10} fill="#6b7280">
            {p.month}
          </text>
        </g>
      ))}
    </svg>
  )
}

// ── Match Request Table ────────────────────────────────────────────────────────
const INQ_STATUS: Record<string, { label: string; cls: string }> = {
  new:       { label: '신규',     cls: 'bg-red-50 text-red-700 border border-red-200' },
  reviewed:  { label: '검토중',   cls: 'bg-yellow-50 text-yellow-700 border border-yellow-100' },
  responded: { label: '답변완료', cls: 'bg-blue-50 text-blue-700 border border-blue-100' },
  converted: { label: '예약전환', cls: 'bg-green-50 text-green-700 border border-green-100' },
}

function MatchRequestTable() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const rows = [...mockHospitalInquiries].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-2 pr-4">환자</th>
            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-2 pr-4">관심 시술</th>
            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-2 pr-4">에이전트</th>
            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-2 pr-4">희망일</th>
            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-2 pr-3">상태</th>
            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-2">액션</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map((inq) => {
            const s = INQ_STATUS[inq.status]
            const isOpen = expanded === inq.id
            return (
              <Fragment key={inq.id}>
                <tr className={`hover:bg-gray-50 transition-colors ${isOpen ? 'bg-green-50/30' : ''}`}>
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{NAT_FLAG[inq.nationality] ?? '🌍'}</span>
                      <div>
                        <p className="font-medium text-gray-900 leading-tight">{inq.patientName}</p>
                        <p className="text-xs text-gray-400">{inq.nationality}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 pr-4">
                    <p className="text-gray-700 text-xs max-w-[140px] truncate">{inq.treatmentInterest}</p>
                  </td>
                  <td className="py-2.5 pr-4">
                    <p className="text-xs text-gray-500 max-w-[100px] truncate">{inq.agentName ?? '—'}</p>
                  </td>
                  <td className="py-2.5 pr-4">
                    <p className="text-xs text-gray-500 whitespace-nowrap">{inq.preferredDate ?? '미정'}</p>
                  </td>
                  <td className="py-2.5 pr-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${s.cls}`}>{s.label}</span>
                  </td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setExpanded(isOpen ? null : inq.id)}
                        className="text-xs text-green-600 hover:bg-green-50 px-2 py-1 rounded-md transition-colors"
                      >
                        {isOpen ? '접기' : '내용'}
                      </button>
                      <Link href="/hospital/inquiries"
                        className="text-xs text-gray-500 hover:bg-gray-100 px-2 py-1 rounded-md transition-colors">
                        답변
                      </Link>
                    </div>
                  </td>
                </tr>
                {isOpen && (
                  <tr className="bg-green-50/20">
                    <td colSpan={6} className="px-3 py-3">
                      <div className="text-xs text-gray-600 leading-relaxed bg-white border border-green-100 rounded-lg p-3">
                        <span className="font-medium text-gray-700">문의 내용: </span>{inq.message}
                        <div className="flex gap-4 mt-2 text-gray-400">
                          <span>📧 {inq.email}</span>
                          <span>📞 {inq.phone}</span>
                          <span>접수: {inq.createdAt}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Pricing Table ──────────────────────────────────────────────────────────────
const CAT_COLORS: Record<string, string> = {
  수술: 'bg-red-50 text-red-700', 시술: 'bg-purple-50 text-purple-700',
  건강검진: 'bg-green-50 text-green-700', 내과: 'bg-blue-50 text-blue-700',
  외과: 'bg-orange-50 text-orange-700', 재생의학: 'bg-teal-50 text-teal-700',
}

function PricingTable() {
  const [items, setItems] = useState<HospitalPricingItem[]>(mockHospitalPricing)
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  function togglePublish(id: string) {
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, isPublished: !it.isPublished } : it))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-gray-400">{items.filter((i) => i.isPublished).length}개 공개 · {items.length}개 등록</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          + 수가 추가
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['시술명', '영문명', '구분', '최저가', '최고가', '소요시간', '회복', '공개', ''].map((h) => (
                <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-2 pr-3 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map((item) => (
              <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${!item.isPublished ? 'opacity-50' : ''}`}>
                <td className="py-2.5 pr-3">
                  <p className="font-medium text-gray-900 text-xs whitespace-nowrap">{item.treatmentName}</p>
                </td>
                <td className="py-2.5 pr-3">
                  <p className="text-xs text-gray-400 max-w-[140px] truncate">{item.treatmentNameEn}</p>
                </td>
                <td className="py-2.5 pr-3">
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${CAT_COLORS[item.category] ?? 'bg-gray-100 text-gray-600'}`}>
                    {item.category}
                  </span>
                </td>
                <td className="py-2.5 pr-3 text-xs font-medium text-gray-800 whitespace-nowrap">{formatPrice(item.priceMin)}</td>
                <td className="py-2.5 pr-3 text-xs font-medium text-gray-800 whitespace-nowrap">{formatPrice(item.priceMax)}</td>
                <td className="py-2.5 pr-3 text-xs text-gray-500 whitespace-nowrap">{item.duration}</td>
                <td className="py-2.5 pr-3 text-xs text-gray-500 whitespace-nowrap">{item.recovery}</td>
                <td className="py-2.5 pr-3">
                  <button
                    onClick={() => togglePublish(item.id)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                      item.isPublished ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                      item.isPublished ? 'translate-x-4' : 'translate-x-0.5'
                    }`} />
                  </button>
                </td>
                <td className="py-2.5">
                  <button
                    onClick={() => setEditId(editId === item.id ? null : item.id)}
                    className="text-xs text-gray-400 hover:text-green-600 hover:bg-green-50 px-2 py-1 rounded transition-colors"
                  >
                    수정
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add row hint */}
      {showAdd && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 flex items-center justify-between">
          <span>수가 추가 폼 — 실제 구현 시 모달 또는 인라인 폼 연결</span>
          <button onClick={() => setShowAdd(false)} className="text-green-500 hover:text-green-700 font-medium">닫기</button>
        </div>
      )}
    </div>
  )
}

// ── Profile Form ───────────────────────────────────────────────────────────────
function ProfileForm() {
  const [editing, setEditing] = useState(false)
  const p = mockHospitalProfile

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex gap-4 py-3 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 w-32 flex-shrink-0 pt-0.5">{label}</span>
      {editing ? (
        <input defaultValue={value} className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-green-400" />
      ) : (
        <span className="text-sm text-gray-800">{value}</span>
      )}
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-gray-400">마지막 수정: 2026-05-15</p>
        <button
          onClick={() => setEditing(!editing)}
          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
            editing
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {editing ? '저장' : '수정'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-x-12">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">기본 정보</p>
          <Row label="병원명" value={p.name} />
          <Row label="영문명" value={p.nameEn} />
          <Row label="주소" value={p.address} />
          <Row label="대표 전화" value={p.phone} />
          <Row label="이메일" value={p.email} />
          <Row label="웹사이트" value={p.website} />
          <Row label="병상 수" value={`${p.bedCount.toLocaleString()}병상`} />
          <Row label="설립 연도" value={`${p.establishedYear}년`} />
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">국제진료센터</p>
          <Row label="운영 여부" value={p.internationalDept ? '운영 중' : '미운영'} />
          <Row label="담당자" value={p.internationalDeptContact} />
          <Row label="전용 이메일" value={p.internationalDeptEmail} />
          <div className="py-3 border-b border-gray-50">
            <p className="text-xs text-gray-400 mb-2">전문과</p>
            <div className="flex flex-wrap gap-1.5">
              {p.specialties.map((s) => (
                <span key={s} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{s}</span>
              ))}
            </div>
          </div>
          <div className="py-3 border-b border-gray-50">
            <p className="text-xs text-gray-400 mb-2">언어 지원</p>
            <div className="flex flex-wrap gap-1.5">
              {p.languages.map((l) => (
                <span key={l} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{l}</span>
              ))}
            </div>
          </div>
          <div className="py-3">
            <p className="text-xs text-gray-400 mb-2">인증</p>
            <div className="flex flex-wrap gap-1.5">
              {p.accreditations.map((a) => (
                <span key={a} className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">{a}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function HospitalDashboard() {
  const [profileTab, setProfileTab] = useState<'info' | 'pricing'>('info')

  // ── Computed stats ──────────────────────────────
  const TODAY = '2026-06-18'
  const todayInquiries = mockHospitalInquiries.filter((i) => i.createdAt === TODAY).length
  const newInquiries   = mockHospitalInquiries.filter((i) => i.status === 'new').length
  const thisMonthApts  = mockHospitalAppointments.filter((a) =>
    (a.confirmedDate ?? a.requestedDate).startsWith('2026-06')).length
  const totalPatients  = mockHospitalAppointments.filter((a) => a.status !== 'cancelled').length
  const pendingApts    = mockHospitalAppointments.filter((a) => a.status === 'pending').length
  const pendingSvcs    = mockServiceRequests.filter((r) => r.status === 'pending').length
  const pendingResults = mockMedicalResults.filter((r) => r.status === 'pending').length

  const TOTAL_SETTLED   = 52400000
  const PENDING_SETTLE  = 8200000
  const THIS_MONTH_REV  = 4800   // 만원

  const upcomingApts = mockHospitalAppointments
    .filter((a) => a.status === 'confirmed' && a.confirmedDate && a.confirmedDate > TODAY)
    .sort((a, b) => (a.confirmedDate ?? '').localeCompare(b.confirmedDate ?? ''))
    .slice(0, 5)

  const APT_STATUS: Record<string, { label: string; cls: string }> = {
    pending:   { label: '대기',   cls: 'bg-yellow-50 text-yellow-700' },
    confirmed: { label: '확정',   cls: 'bg-green-50 text-green-700' },
    rejected:  { label: '거절',   cls: 'bg-red-50 text-red-700' },
    completed: { label: '완료',   cls: 'bg-gray-100 text-gray-500' },
    cancelled: { label: '취소',   cls: 'bg-gray-100 text-gray-400' },
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">대시보드</h1>
          <p className="text-sm text-gray-500 mt-0.5">세브란스병원 — {TODAY}</p>
        </div>
        <div className="flex items-center gap-2">
          {newInquiries > 0 && (
            <Link href="/hospital/inquiries"
              className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors font-medium">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              신규 문의 {newInquiries}건
            </Link>
          )}
          <Link href="/hospital/appointments"
            className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
            전체 예약 →
          </Link>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: '오늘 신규 문의',
            value: todayInquiries,
            sub: `총 신규 ${newInquiries}건 미처리`,
            color: 'text-red-600', bg: 'bg-red-50', icon: '📨',
            href: '/hospital/inquiries',
          },
          {
            label: '이달 환자',
            value: thisMonthApts,
            sub: `누적 ${totalPatients}명`,
            color: 'text-blue-600', bg: 'bg-blue-50', icon: '👤',
            href: '/hospital/appointments',
          },
          {
            label: '누적 정산',
            value: formatPrice(TOTAL_SETTLED),
            sub: `대기 ${formatPrice(PENDING_SETTLE)}`,
            color: 'text-green-600', bg: 'bg-green-50', icon: '💰',
            href: '/hospital/settlements',
            isText: true,
          },
          {
            label: '미처리',
            value: pendingApts + pendingSvcs + pendingResults,
            sub: `예약대기 ${pendingApts} · 서비스 ${pendingSvcs} · 결과 ${pendingResults}`,
            color: 'text-orange-600', bg: 'bg-orange-50', icon: '⚡',
            href: '/hospital/requests',
          },
        ].map((card) => (
          <Link key={card.label} href={card.href}
            className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:border-gray-300 transition-all group">
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm text-gray-500 font-medium">{card.label}</p>
              <span className={`text-xl w-9 h-9 ${card.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                {card.icon}
              </span>
            </div>
            <p className={`font-bold ${(card as { isText?: boolean }).isText ? 'text-2xl' : 'text-3xl'} ${card.color} leading-none mb-1`}>
              {card.value}
            </p>
            <p className="text-xs text-gray-400">{card.sub}</p>
          </Link>
        ))}
      </div>

      {/* ── Match Request List + Upcoming ── */}
      <div className="grid grid-cols-5 gap-4">
        {/* Match requests table */}
        <div className="col-span-3 bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900">매칭 요청 리스트</h2>
              <p className="text-xs text-gray-400 mt-0.5">최근 8건 · 신규순</p>
            </div>
            <Link href="/hospital/inquiries" className="text-xs text-green-600 hover:underline font-medium">
              전체 {mockHospitalInquiries.length}건 →
            </Link>
          </div>
          <div className="px-5 py-4">
            <MatchRequestTable />
          </div>
        </div>

        {/* Upcoming appointments */}
        <div className="col-span-2 bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">예정 예약</h2>
            <Link href="/hospital/appointments" className="text-xs text-green-600 hover:underline font-medium">전체 →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {upcomingApts.map((apt) => {
              const s = APT_STATUS[apt.status]
              return (
                <div key={apt.id} className="px-5 py-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{NAT_FLAG[apt.nationality] ?? '🌍'}</span>
                        <p className="text-sm font-medium text-gray-900 truncate">{apt.patientName}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{apt.treatment}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{apt.doctor}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.cls}`}>{s.label}</span>
                      <p className="text-xs text-gray-400 whitespace-nowrap">{apt.confirmedDate}</p>
                      <div className="flex gap-1">
                        {apt.needsInterpreter && <span className="text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">통역</span>}
                        {apt.needsVehicle && <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">차량</span>}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            {upcomingApts.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-gray-400">예정된 예약이 없습니다</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-bold text-gray-900">월별 매칭 건수</h2>
            <span className="text-xs text-gray-400">2026년 상반기</span>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-bold text-green-600">
              {MONTHLY_DATA.reduce((s, d) => s + d.matches, 0)}건
            </span>
            <span className="text-xs text-gray-400">상반기 누계</span>
            <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full ml-auto">
              전월 대비 −25% ▼
            </span>
          </div>
          <BarChart />
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-bold text-gray-900">월별 수익 추이</h2>
            <span className="text-xs text-gray-400">2026년 상반기 (만원)</span>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-bold text-green-600">
              {MONTHLY_DATA.reduce((s, d) => s + d.revenue, 0).toLocaleString()}만원
            </span>
            <span className="text-xs text-gray-400">상반기 누계</span>
            <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full ml-auto">
              전월 대비 −23% ▼
            </span>
          </div>
          <AreaChart />
        </div>
      </div>

      {/* ── Profile & Pricing ── */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {/* Tab bar */}
        <div className="border-b border-gray-100 flex">
          {([
            { id: 'info',    label: '병원 프로필' },
            { id: 'pricing', label: '수가 등록' },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setProfileTab(tab.id)}
              className={`px-6 py-3.5 text-sm font-medium transition-colors border-b-2 ${
                profileTab === tab.id
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {profileTab === 'info' && <ProfileForm />}
          {profileTab === 'pricing' && <PricingTable />}
        </div>
      </div>

    </div>
  )
}
