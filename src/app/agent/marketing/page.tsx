'use client'

import { useMemo, useState } from 'react'
import { mockHospitalProfile, mockHospitalPricing } from '@/lib/hospital-mock-data'
import {
  MARKETING_LANGUAGES,
  LANGUAGE_FLAG,
  generateSNSPost,
  generateBlogDraft,
  generateAdCopy,
  generateTranslations,
  type MarketingMaterial,
} from '@/lib/marketing-data'

const PROFILE_MATERIAL: MarketingMaterial = {
  id: 'profile',
  kind: 'profile',
  label: '병원 소개',
  hospitalName: mockHospitalProfile.name,
  hospitalNameEn: mockHospitalProfile.nameEn,
  specialties: mockHospitalProfile.specialties,
  accreditations: mockHospitalProfile.accreditations,
  description: mockHospitalProfile.description,
}

const TREATMENT_MATERIALS: MarketingMaterial[] = mockHospitalPricing
  .filter((p) => p.isPublished)
  .map((p) => ({
    id: p.id,
    kind: 'treatment',
    label: p.treatmentName,
    hospitalName: mockHospitalProfile.name,
    hospitalNameEn: mockHospitalProfile.nameEn,
    treatmentName: p.treatmentName,
    treatmentNameEn: p.treatmentNameEn,
    priceMin: p.priceMin,
    priceMax: p.priceMax,
    duration: p.duration,
    recovery: p.recovery,
    specialties: mockHospitalProfile.specialties,
    accreditations: mockHospitalProfile.accreditations,
    description: mockHospitalProfile.description,
  }))

const ALL_MATERIALS = [PROFILE_MATERIAL, ...TREATMENT_MATERIALS]

const TABS = [
  { id: 'sns', label: 'SNS 게시물' },
  { id: 'blog', label: '블로그 초안' },
  { id: 'ad', label: '광고 문구' },
  { id: 'translate', label: '국가별 번역본' },
] as const
type TabId = (typeof TABS)[number]['id']

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
        copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {copied ? '복사됨 ✓' : '복사하기'}
    </button>
  )
}

export default function MarketingPage() {
  const [materialId, setMaterialId] = useState(ALL_MATERIALS[0].id)
  const [tab, setTab] = useState<TabId>('sns')
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([...MARKETING_LANGUAGES])

  const material = ALL_MATERIALS.find((m) => m.id === materialId) ?? ALL_MATERIALS[0]

  const sns = useMemo(() => generateSNSPost(material), [material])
  const blog = useMemo(() => generateBlogDraft(material), [material])
  const ad = useMemo(() => generateAdCopy(material), [material])
  const translations = useMemo(
    () => generateTranslations(material, MARKETING_LANGUAGES.filter((l) => selectedLanguages.includes(l))),
    [material, selectedLanguages],
  )

  function toggleLanguage(lang: string) {
    setSelectedLanguages((prev) => (prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]))
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">AI 마케팅 에이전트</h1>
        <p className="text-sm text-gray-500 mt-0.5">병원 자료를 기반으로 SNS·블로그·광고 문구를 자동 생성하고, 7개 언어로 번역합니다</p>
      </div>

      {/* 병원 자료 선택 */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <p className="text-sm font-semibold text-gray-900 mb-3">병원 자료 선택</p>
        <div className="flex flex-wrap gap-2">
          {ALL_MATERIALS.map((m) => (
            <button
              key={m.id}
              onClick={() => setMaterialId(m.id)}
              className={`text-sm px-3.5 py-1.5 rounded-full border font-medium transition-colors ${
                materialId === m.id
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Output tabs */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="border-b border-gray-100 flex overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-6 py-3.5 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                tab === t.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === 'sns' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-900">SNS 게시물 초안</p>
                <CopyButton text={sns} />
              </div>
              <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-xl p-4 font-sans leading-relaxed">
                {sns}
              </pre>
            </div>
          )}

          {tab === 'blog' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-900">블로그 초안</p>
                <CopyButton text={`${blog.title}\n\n${blog.body.join('\n\n')}`} />
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
                <h3 className="text-base font-bold text-gray-900 mb-3">{blog.title}</h3>
                <div className="space-y-3">
                  {blog.body.map((p, i) => (
                    <p key={i} className="text-sm text-gray-700 leading-relaxed">{p}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'ad' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-900">광고 문구</p>
                <CopyButton text={`${ad.headline}\n${ad.subline}\n${ad.cta}`} />
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 text-center">
                <p className="text-lg font-bold text-gray-900 mb-1.5">{ad.headline}</p>
                <p className="text-sm text-gray-500 mb-4">{ad.subline}</p>
                <span className="inline-block bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg">
                  {ad.cta}
                </span>
              </div>
            </div>
          )}

          {tab === 'translate' && (
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-3">번역할 언어 선택</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {MARKETING_LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => toggleLanguage(lang)}
                    className={`text-sm px-3 py-1.5 rounded-full border font-medium transition-colors ${
                      selectedLanguages.includes(lang)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    {LANGUAGE_FLAG[lang]} {lang}
                  </button>
                ))}
              </div>

              {translations.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">번역할 언어를 선택해주세요</p>
              ) : (
                <div className="space-y-4">
                  {translations.map((t) => (
                    <div key={t.language} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2.5">
                        <p className="text-sm font-semibold text-gray-900">{LANGUAGE_FLAG[t.language]} {t.language}</p>
                        <CopyButton text={`${t.snsSnippet}\n\n${t.adHeadline}`} />
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed mb-2" dir={t.language === '아랍어' ? 'rtl' : 'ltr'}>
                        {t.snsSnippet}
                      </p>
                      <p className="text-xs text-gray-400 pt-2 border-t border-gray-200" dir={t.language === '아랍어' ? 'rtl' : 'ltr'}>
                        광고 헤드라인: <span className="text-gray-600 font-medium">{t.adHeadline}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-4">
                ※ AI 자동 번역 초안입니다. 실제 게재 전 현지 언어 검수를 권장합니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
