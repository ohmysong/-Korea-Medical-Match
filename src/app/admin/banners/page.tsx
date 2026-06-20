'use client'

import { useState } from 'react'

type BannerType = 'hospital' | 'promo' | 'service' | 'notice'
type Position   = '홈 히어로' | '카테고리 배너' | '사이드바' | '홈 하단' | '검색 결과'

interface Banner {
  id: string; title: string; subtitle: string
  position: Position; type: BannerType
  active: boolean; startDate: string; endDate: string
  clicks: number; views: number; link: string
}

const INIT_BANNERS: Banner[] = [
  { id: 'b1', title: '세브란스병원 건강검진 패키지',     subtitle: '외국인 전용 VIP 검진 · 당일 결과 제공',           position: '홈 히어로',    type: 'hospital', active: true,  startDate: '2026-06-01', endDate: '2026-06-30', clicks: 1284, views: 18420, link: '/hospitals/1' },
  { id: 'b2', title: '피부과·성형 여름 시즌 프로모션',   subtitle: '6월 특별 할인 · 시술 20%~30% 절감',               position: '카테고리 배너', type: 'promo',    active: true,  startDate: '2026-06-10', endDate: '2026-07-10', clicks: 893,  views: 12100, link: '/hospitals?specialty=피부과' },
  { id: 'b3', title: '외국인 환자 VIP 케어 프로그램',   subtitle: '전담 코디네이터 · 24h 지원 · 통역 포함',           position: '사이드바',     type: 'service',  active: false, startDate: '2026-07-01', endDate: '2026-07-31', clicks: 0,    views: 0,     link: '/services/vip' },
  { id: 'b4', title: '척추·관절 수술 전문병원 안내',     subtitle: '최소침습 수술 · 빠른 회복 · 러시아어 지원',         position: '홈 하단',      type: 'hospital', active: true,  startDate: '2026-05-15', endDate: '2026-06-30', clicks: 542,  views: 8930,  link: '/hospitals?specialty=척추' },
  { id: 'b5', title: '아랍어 전담 코디네이터 서비스',   subtitle: 'UAE·사우디·이집트 환자 맞춤 지원',                  position: '검색 결과',    type: 'service',  active: false, startDate: '2026-06-20', endDate: '2026-07-20', clicks: 0,    views: 0,     link: '/services/arabic' },
  { id: 'b6', title: '2026 여름 AI 매칭 서비스 출시',  subtitle: '질환 입력 → 최적 병원 자동 추천 · 무료 체험',       position: '홈 히어로',    type: 'notice',   active: true,  startDate: '2026-06-18', endDate: '2026-08-31', clicks: 211,  views: 4500,  link: '/ai-matching' },
]

const TYPE_COLOR: Record<BannerType, string> = {
  hospital: 'bg-blue-50 text-blue-700 border border-blue-200',
  promo:    'bg-orange-50 text-orange-700 border border-orange-200',
  service:  'bg-purple-50 text-purple-700 border border-purple-200',
  notice:   'bg-gray-100 text-gray-700',
}
const TYPE_LABEL: Record<BannerType, string> = {
  hospital: '병원', promo: '프로모션', service: '서비스', notice: '공지',
}
const POS_COLOR: Record<Position, string> = {
  '홈 히어로':    'bg-blue-100 text-blue-700',
  '카테고리 배너': 'bg-green-100 text-green-700',
  '사이드바':     'bg-purple-100 text-purple-700',
  '홈 하단':     'bg-amber-100 text-amber-700',
  '검색 결과':   'bg-teal-100 text-teal-700',
}
const GRADIENTS = [
  'from-blue-500 to-blue-700',
  'from-orange-400 to-pink-600',
  'from-purple-500 to-indigo-700',
  'from-teal-500 to-emerald-600',
  'from-amber-400 to-orange-600',
  'from-sky-400 to-blue-600',
]

const EMPTY: Omit<Banner, 'id' | 'clicks' | 'views'> = {
  title: '', subtitle: '', position: '홈 히어로', type: 'hospital',
  active: true, startDate: '2026-06-18', endDate: '2026-07-18', link: '',
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>(INIT_BANNERS)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [editing, setEditing] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState<typeof EMPTY>(EMPTY)

  const visible = banners.filter((b) =>
    filter === 'all' ? true : filter === 'active' ? b.active : !b.active
  )

  function toggle(id: string) {
    setBanners((bs) => bs.map((b) => b.id === id ? { ...b, active: !b.active } : b))
  }
  function remove(id: string) {
    setBanners((bs) => bs.filter((b) => b.id !== id))
    if (editing === id) setEditing(null)
  }
  function save() {
    if (!form.title.trim()) return
    setBanners((bs) => [...bs, { ...form, id: `b${Date.now()}`, clicks: 0, views: 0 }])
    setForm(EMPTY)
    setShowNew(false)
  }

  const activeCount   = banners.filter((b) => b.active).length
  const totalClicks   = banners.reduce((s, b) => s + b.clicks, 0)
  const totalViews    = banners.reduce((s, b) => s + b.views, 0)
  const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0'

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">배너 · 콘텐츠 관리</h1>
          <p className="text-sm text-gray-500 mt-0.5">공개 사이트 배너 등록 및 노출 설정</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="bg-blue-600 text-white text-sm px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-medium">
          + 배너 추가
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: '활성 배너', value: `${activeCount}개`, sub: `전체 ${banners.length}개`, color: 'text-blue-600' },
          { label: '총 노출수', value: totalViews.toLocaleString(), sub: '전체 기간', color: 'text-purple-600' },
          { label: '총 클릭수', value: totalClicks.toLocaleString(), sub: '전체 기간', color: 'text-green-600' },
          { label: '평균 CTR', value: `${ctr}%`, sub: '클릭률', color: 'text-amber-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-4">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* New banner form */}
      {showNew && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900">새 배너 추가</h2>
            <button onClick={() => setShowNew(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 block mb-1">배너 제목 *</label>
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="배너 주제를 입력하세요" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 bg-white" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 block mb-1">부제목</label>
              <input value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                placeholder="간단한 설명 문구" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 bg-white" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">노출 위치</label>
              <select value={form.position} onChange={(e) => setForm((f) => ({ ...f, position: e.target.value as Position }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 bg-white">
                {(Object.keys(POS_COLOR) as Position[]).map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">유형</label>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as BannerType }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 bg-white">
                {(Object.keys(TYPE_LABEL) as BannerType[]).map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">시작일</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 bg-white" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">종료일</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 bg-white" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 block mb-1">랜딩 URL</label>
              <input value={form.link} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                placeholder="/hospitals/1 또는 /services/vip" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 bg-white font-mono" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={save} disabled={!form.title.trim()}
              className="bg-blue-600 text-white text-sm px-5 py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium">
              저장
            </button>
            <button onClick={() => setShowNew(false)}
              className="border border-gray-200 text-gray-600 text-sm px-4 py-2.5 rounded-xl hover:bg-white transition-colors">
              취소
            </button>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-2 mb-4">
        {(['all', 'active', 'inactive'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'
            }`}>
            {f === 'all' ? `전체 ${banners.length}` : f === 'active' ? `활성 ${activeCount}` : `비활성 ${banners.length - activeCount}`}
          </button>
        ))}
      </div>

      {/* Banner list */}
      <div className="space-y-3">
        {visible.map((bn, i) => (
          <div key={bn.id} className={`bg-white border rounded-2xl overflow-hidden transition-all ${
            bn.active ? 'border-gray-200' : 'border-gray-100 opacity-70'
          }`}>
            <div className="flex">
              {/* Preview */}
              <div className={`w-44 h-28 flex-shrink-0 bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} relative flex flex-col justify-end p-3`}>
                <div className="absolute inset-0 opacity-10 text-white font-black text-6xl flex items-center justify-center select-none">★</div>
                <p className="text-white text-xs font-bold leading-tight line-clamp-2 relative z-10">{bn.title}</p>
                {bn.subtitle && <p className="text-white/70 text-[10px] mt-0.5 line-clamp-1 relative z-10">{bn.subtitle}</p>}
              </div>

              {/* Details */}
              <div className="flex-1 px-5 py-3.5 flex flex-col justify-between min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${TYPE_COLOR[bn.type]}`}>{TYPE_LABEL[bn.type]}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${POS_COLOR[bn.position]}`}>{bn.position}</span>
                      {!bn.active && <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md">비활성</span>}
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{bn.title}</p>
                    <p className="text-xs text-gray-400">{bn.subtitle}</p>
                  </div>
                  {/* Toggle */}
                  <button onClick={() => toggle(bn.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${bn.active ? 'bg-blue-600' : 'bg-gray-200'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${bn.active ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex gap-4 text-xs text-gray-400">
                    <span>📅 {bn.startDate} ~ {bn.endDate}</span>
                    <span>👁 {bn.views.toLocaleString()}노출</span>
                    <span>🖱 {bn.clicks.toLocaleString()}클릭</span>
                    {bn.views > 0 && (
                      <span className="text-blue-600 font-medium">
                        CTR {((bn.clicks / bn.views) * 100).toFixed(1)}%
                      </span>
                    )}
                    {bn.link && <span className="font-mono text-gray-300 truncate max-w-[120px]">{bn.link}</span>}
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => setEditing(editing === bn.id ? null : bn.id)}
                      className="text-xs border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                      {editing === bn.id ? '접기' : '수정'}
                    </button>
                    <button onClick={() => remove(bn.id)}
                      className="text-xs border border-red-100 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Inline edit */}
            {editing === bn.id && (
              <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-3 grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">제목</label>
                      <input defaultValue={bn.title}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 bg-white" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">부제목</label>
                      <input defaultValue={bn.subtitle}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 bg-white" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">노출 위치</label>
                    <select defaultValue={bn.position}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 bg-white">
                      {(Object.keys(POS_COLOR) as Position[]).map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">시작일</label>
                    <input type="date" defaultValue={bn.startDate}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 bg-white" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">종료일</label>
                    <input type="date" defaultValue={bn.endDate}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 bg-white" />
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setEditing(null)}
                    className="text-xs bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    저장
                  </button>
                  <button onClick={() => setEditing(null)}
                    className="text-xs border border-gray-200 text-gray-500 px-3 py-2 rounded-lg hover:bg-white transition-colors">
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
