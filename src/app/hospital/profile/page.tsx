'use client'

import { useState } from 'react'
import { mockHospitalProfile } from '@/lib/hospital-mock-data'

const TYPE_LABELS: Record<string, string> = {
  general: 'General Hospital (상급종합병원)',
  premium: 'Premium Hospital (프리미엄)',
  checkup: 'Checkup Center (건강검진센터)',
  regenerative: 'Regenerative Medicine Center (재생의학)',
}

export default function ProfilePage() {
  const [profile, setProfile] = useState({ ...mockHospitalProfile })
  const [specialtiesInput, setSpecialtiesInput] = useState(mockHospitalProfile.specialties.join(', '))
  const [languagesInput, setLanguagesInput] = useState(mockHospitalProfile.languages.join(', '))
  const [accreditationsInput, setAccreditationsInput] = useState(mockHospitalProfile.accreditations.join(', '))
  const [saved, setSaved] = useState(false)

  function set(field: string, value: string | boolean | number) {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">병원 프로필 관리</h1>
          <p className="text-sm text-gray-500 mt-0.5">환자에게 노출되는 병원 정보를 관리합니다</p>
        </div>
        <button
          onClick={handleSave}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            saved ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {saved ? '저장 완료 ✓' : '변경사항 저장'}
        </button>
      </div>

      <div className="space-y-4">
        {/* 기본 정보 */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">기본 정보</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">병원명 (한국어)</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => set('name', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">병원명 (영문)</label>
              <input
                type="text"
                value={profile.nameEn}
                onChange={(e) => set('nameEn', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">병원 유형</label>
              <select
                value={profile.type}
                onChange={(e) => set('type', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400 bg-white"
              >
                {Object.entries(TYPE_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">설립 연도</label>
              <input
                type="number"
                value={profile.establishedYear}
                onChange={(e) => set('establishedYear', Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">병원 소개</label>
              <textarea
                value={profile.description}
                onChange={(e) => set('description', e.target.value)}
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400 resize-none"
              />
            </div>
          </div>
        </div>

        {/* 연락처 및 위치 */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">연락처 및 위치</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">주소</label>
              <input
                type="text"
                value={profile.address}
                onChange={(e) => set('address', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">대표 전화</label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => set('phone', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">대표 이메일</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => set('email', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">웹사이트</label>
              <input
                type="text"
                value={profile.website}
                onChange={(e) => set('website', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">병상 수</label>
              <input
                type="number"
                value={profile.bedCount}
                onChange={(e) => set('bedCount', Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
              />
            </div>
          </div>
        </div>

        {/* 진료 정보 */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">진료 정보</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">진료 과목 (쉼표로 구분)</label>
              <input
                type="text"
                value={specialtiesInput}
                onChange={(e) => setSpecialtiesInput(e.target.value)}
                placeholder="암센터, 심장혈관병원, 신경과..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {specialtiesInput.split(',').filter(Boolean).map((s, i) => (
                  <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{s.trim()}</span>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">지원 언어 (쉼표로 구분)</label>
              <input
                type="text"
                value={languagesInput}
                onChange={(e) => setLanguagesInput(e.target.value)}
                placeholder="영어, 중국어, 러시아어..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {languagesInput.split(',').filter(Boolean).map((l, i) => (
                  <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{l.trim()}</span>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">인증 현황 (쉼표로 구분)</label>
              <input
                type="text"
                value={accreditationsInput}
                onChange={(e) => setAccreditationsInput(e.target.value)}
                placeholder="JCI 국제인증, 의료기관 인증..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {accreditationsInput.split(',').filter(Boolean).map((a, i) => (
                  <span key={i} className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full">{a.trim()}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 국제 진료팀 */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">국제 진료팀 (International Department)</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={profile.internationalDept}
                onChange={(e) => set('internationalDept', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-600">운영 중</span>
            </label>
          </div>
          {profile.internationalDept && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">담당 코디네이터</label>
                <input
                  type="text"
                  value={profile.internationalDeptContact}
                  onChange={(e) => set('internationalDeptContact', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">국제진료팀 이메일</label>
                <input
                  type="email"
                  value={profile.internationalDeptEmail}
                  onChange={(e) => set('internationalDeptEmail', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
