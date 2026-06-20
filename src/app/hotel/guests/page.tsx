'use client'

import { useState, useMemo } from 'react'
import { mockHotelGuests, type HotelGuest, type GuestStatus } from '@/lib/hotel-mock-data'

const STATUS_LABELS: Record<GuestStatus, string> = {
  reserved: '예약',
  checked_in: '체크인',
  checked_out: '체크아웃',
  cancelled: '취소',
}
const STATUS_STYLES: Record<GuestStatus, string> = {
  reserved: 'bg-blue-50 text-blue-700',
  checked_in: 'bg-green-50 text-green-700 border border-green-200',
  checked_out: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-50 text-red-500',
}

const ROOM_TYPES = ['슈페리어 싱글', '슈페리어 더블', '디럭스 싱글', '디럭스 더블', '디럭스 트윈', '스위트']
const HOSPITALS = ['세브란스병원', '삼성서울병원', '서울아산병원', 'JK성형외과', '강남세란병원', 'BGN밝은눈안과']

function RegisterModal({ onClose, onSave }: {
  onClose: () => void
  onSave: (guest: HotelGuest) => void
}) {
  const [form, setForm] = useState({
    name: '',
    nationality: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    roomType: '디럭스 더블',
    hospital: '세브란스병원',
    treatmentPurpose: '',
    agentName: '',
    specialRequests: '',
  })

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function calcNights() {
    if (!form.checkIn || !form.checkOut) return 0
    const diff = new Date(form.checkOut).getTime() - new Date(form.checkIn).getTime()
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
  }

  function handleSave() {
    if (!form.name || !form.checkIn || !form.checkOut) return
    const newGuest: HotelGuest = {
      id: `hg-${Date.now()}`,
      ...form,
      nights: calcNights(),
      roomNumber: `${Math.floor(Math.random() * 12 + 1).toString().padStart(2, '0')}${Math.floor(Math.random() * 15 + 1).toString().padStart(2, '0')}`,
      status: 'reserved',
      createdAt: '2026-06-18',
    }
    onSave(newGuest)
    onClose()
  }

  const nights = calcNights()

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-base font-bold text-gray-900">신규 고객 등록</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">기본 정보</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">이름 *</label>
                <input value={form.name} onChange={(e) => set('name', e.target.value)}
                  placeholder="Hong Gil-dong"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">국적 *</label>
                <input value={form.nationality} onChange={(e) => set('nationality', e.target.value)}
                  placeholder="중국, UAE, 러시아..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">이메일</label>
                <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">연락처</label>
                <input value={form.phone} onChange={(e) => set('phone', e.target.value)}
                  placeholder="+86-135-0000-0000"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">숙박 정보</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">체크인 날짜 *</label>
                <input type="date" value={form.checkIn} onChange={(e) => set('checkIn', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">체크아웃 날짜 *</label>
                <input type="date" value={form.checkOut} onChange={(e) => set('checkOut', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">객실 유형</label>
                <select value={form.roomType} onChange={(e) => set('roomType', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400 bg-white">
                  {ROOM_TYPES.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex items-end">
                {nights > 0 && (
                  <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 w-full text-center">
                    <p className="text-xs text-amber-600">숙박 기간</p>
                    <p className="text-lg font-bold text-amber-700">{nights}박</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">진료 연계</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">담당 병원</label>
                <select value={form.hospital} onChange={(e) => set('hospital', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400 bg-white">
                  {HOSPITALS.map((h) => <option key={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">진료 목적</label>
                <input value={form.treatmentPurpose} onChange={(e) => set('treatmentPurpose', e.target.value)}
                  placeholder="수술, 검진, 치료..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">에이전트 (선택)</label>
                <input value={form.agentName} onChange={(e) => set('agentName', e.target.value)}
                  placeholder="에이전트 회사명"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">특별 요청 사항</label>
                <textarea value={form.specialRequests} onChange={(e) => set('specialRequests', e.target.value)}
                  rows={2} placeholder="식이 제한, 언어 지원 등"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400 resize-none" />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              disabled={!form.name || !form.checkIn || !form.checkOut}
              className="flex-1 bg-amber-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-amber-600 disabled:opacity-40"
            >
              고객 등록
            </button>
            <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50">
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function GuestsPage() {
  const [guests, setGuests] = useState(mockHotelGuests)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<GuestStatus | ''>('')
  const [showRegister, setShowRegister] = useState(false)
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  function handleCheckIn(id: string) {
    setGuests((prev) => prev.map((g) => g.id === id ? { ...g, status: 'checked_in' as GuestStatus } : g))
    showToast('체크인 처리되었습니다.')
  }

  function handleCheckOut(id: string) {
    setGuests((prev) => prev.map((g) => g.id === id ? { ...g, status: 'checked_out' as GuestStatus } : g))
    showToast('체크아웃 처리되었습니다.')
  }

  function handleRegister(guest: HotelGuest) {
    setGuests((prev) => [guest, ...prev])
    showToast(`${guest.name} 고객이 등록되었습니다.`)
  }

  const stats = [
    { label: '전체 고객', value: guests.length },
    { label: '현재 체크인', value: guests.filter((g) => g.status === 'checked_in').length },
    { label: '예약', value: guests.filter((g) => g.status === 'reserved').length },
    { label: '체크아웃', value: guests.filter((g) => g.status === 'checked_out').length },
  ]

  const filtered = useMemo(() => {
    return guests.filter((g) => {
      const q = search.toLowerCase()
      const matchSearch =
        !search ||
        g.name.toLowerCase().includes(q) ||
        g.nationality.toLowerCase().includes(q) ||
        g.treatmentPurpose.toLowerCase().includes(q) ||
        (g.agentName ?? '').toLowerCase().includes(q)
      const matchStatus = !statusFilter || g.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [guests, search, statusFilter])

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg">{toast}</div>
      )}
      {showRegister && <RegisterModal onClose={() => setShowRegister(false)} onSave={handleRegister} />}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">고객 등록</h1>
          <p className="text-sm text-gray-500 mt-0.5">입원·요양 중인 외국인 환자 고객 등록 및 체크인 관리</p>
        </div>
        <button
          onClick={() => setShowRegister(true)}
          className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-600"
        >
          + 신규 고객 등록
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

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex gap-3">
        <input
          type="text"
          placeholder="이름, 국적, 진료 목적, 에이전트 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as GuestStatus | '')}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white"
        >
          <option value="">전체 상태</option>
          {(['reserved', 'checked_in', 'checked_out', 'cancelled'] as GuestStatus[]).map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm text-gray-500">총 <span className="font-semibold text-gray-900">{filtered.length}</span>명</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['이름', '국적', '객실', '체크인', '체크아웃', '박수', '병원', '진료 목적', '에이전트', '상태', ''].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((g) => (
                <tr key={g.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900 whitespace-nowrap">{g.name}</p>
                    {g.specialRequests && (
                      <p className="text-xs text-orange-500 mt-0.5 truncate max-w-[120px]">⚠ {g.specialRequests}</p>
                    )}
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500">{g.nationality}</td>
                  <td className="py-3 px-4 text-xs font-medium text-gray-700">{g.roomNumber}호 <span className="text-gray-400 font-normal">({g.roomType})</span></td>
                  <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{g.checkIn}</td>
                  <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{g.checkOut}</td>
                  <td className="py-3 px-4 text-xs font-medium text-gray-700">{g.nights}박</td>
                  <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{g.hospital}</td>
                  <td className="py-3 px-4 text-xs text-gray-600">{g.treatmentPurpose}</td>
                  <td className="py-3 px-4 text-xs text-gray-400 whitespace-nowrap">
                    {g.agentName ? <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{g.agentName}</span> : <span className="text-gray-300">-</span>}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[g.status]}`}>
                      {STATUS_LABELS[g.status]}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2 whitespace-nowrap">
                      {g.status === 'reserved' && (
                        <button onClick={() => handleCheckIn(g.id)}
                          className="text-xs bg-green-600 text-white px-2.5 py-1 rounded hover:bg-green-700">
                          체크인
                        </button>
                      )}
                      {g.status === 'checked_in' && (
                        <button onClick={() => handleCheckOut(g.id)}
                          className="text-xs border border-gray-300 text-gray-600 px-2.5 py-1 rounded hover:bg-gray-50">
                          체크아웃
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
