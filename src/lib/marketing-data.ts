export const MARKETING_LANGUAGES = ['영어', '중국어', '러시아어', '일본어', '태국어', '몽골어', '아랍어'] as const
export type MarketingLanguage = (typeof MARKETING_LANGUAGES)[number]

export const LANGUAGE_FLAG: Record<MarketingLanguage, string> = {
  영어: '🇺🇸', 중국어: '🇨🇳', 러시아어: '🇷🇺', 일본어: '🇯🇵',
  태국어: '🇹🇭', 몽골어: '🇲🇳', 아랍어: '🇦🇪',
}

export interface MarketingMaterial {
  id: string
  kind: 'profile' | 'treatment'
  label: string
  hospitalName: string
  hospitalNameEn: string
  treatmentName?: string
  treatmentNameEn?: string
  priceMin?: number
  priceMax?: number
  duration?: string
  recovery?: string
  specialties: string[]
  accreditations: string[]
  description: string
}

function formatPrice(n: number) {
  if (n >= 10000) return `${Math.round(n / 10000).toLocaleString()}만원`
  return `${n.toLocaleString()}원`
}

function primaryAccreditation(m: MarketingMaterial) {
  const jci = m.accreditations.find((a) => a.includes('JCI'))
  return jci ? 'JCI' : (m.accreditations[0] ?? '의료기관 인증')
}

function subjectKo(m: MarketingMaterial) {
  return m.treatmentName ?? m.specialties[0] ?? '국제진료'
}

function subjectEn(m: MarketingMaterial) {
  return m.treatmentNameEn ?? 'world-class healthcare'
}

export function generateSNSPost(m: MarketingMaterial): string {
  const acc = primaryAccreditation(m)
  const subject = subjectKo(m)
  const priceLine = m.priceMin ? `\n💰 ${formatPrice(m.priceMin)}~${formatPrice(m.priceMax ?? m.priceMin)}` : ''
  return (
    `✨ ${m.hospitalName}에서 ${subject}을 만나보세요!\n\n` +
    `${m.description.slice(0, 80)}${m.description.length > 80 ? '...' : ''}\n` +
    `${acc} 인증으로 검증된 의료 서비스, 전 세계 환자들이 신뢰하는 이유입니다. 🇰🇷${priceLine}\n\n` +
    `#${m.hospitalName.replace(/\s/g, '')} #의료관광 #한국의료 #${subject.replace(/[()]/g, '').replace(/\s/g, '')}`
  )
}

export function generateBlogDraft(m: MarketingMaterial): { title: string; body: string[] } {
  const subject = subjectKo(m)
  const body: string[] = [
    `${m.hospitalName}는 ${m.specialties.slice(0, 3).join(', ')} 분야에서 국제 환자를 위한 전문 진료를 제공하고 있습니다.`,
    m.description,
  ]
  if (m.treatmentName) {
    body.push(
      `${subject}은 평균 ${m.duration} 정도 소요되며, 회복 기간은 ${m.recovery} 수준입니다. ` +
      `예상 비용은 ${formatPrice(m.priceMin ?? 0)}~${formatPrice(m.priceMax ?? m.priceMin ?? 0)} 사이로, 사전 상담을 통해 정확한 견적을 안내받을 수 있습니다.`,
    )
  }
  body.push(
    `${m.accreditations.join(', ')} 등의 인증을 보유하고 있어 의료 품질에 대한 신뢰도가 높습니다.`,
    `해외에서도 코디네이터를 통한 사전 상담, 통역, 숙박·차량 지원까지 한 번에 받을 수 있어 처음 한국을 방문하는 환자도 안심하고 진료를 받을 수 있습니다.`,
  )
  return { title: `${m.hospitalName}에서 만나는 ${subject} — 외국인 환자를 위한 안내`, body }
}

export function generateAdCopy(m: MarketingMaterial): { headline: string; subline: string; cta: string } {
  const subject = subjectKo(m)
  const acc = primaryAccreditation(m)
  return {
    headline: `${subject}, ${m.hospitalName}에서 안전하게`,
    subline: `${acc} 인증 병원 · 전담 코디네이터 · 다국어 상담 지원`,
    cta: '지금 무료 상담 신청하기 →',
  }
}

interface LangTemplate {
  sns: (hospital: string, subject: string, acc: string) => string
  adHeadline: (hospital: string, subject: string) => string
}

const LANG_TEMPLATES: Record<MarketingLanguage, LangTemplate> = {
  영어: {
    sns: (h, s, a) => `✨ Discover expert ${s} at ${h} in Korea! ${a}-certified, trusted by patients worldwide. 🇰🇷 #MedicalTourism #KoreaHealthcare`,
    adHeadline: (h, s) => `${s} in Korea, Done Right — ${h}`,
  },
  중국어: {
    sns: (h, s, a) => `✨ 在韩国${h}体验专业的${s}服务！获${a}认证，深受全球患者信赖。🇰🇷 #医疗旅游 #韩国医疗`,
    adHeadline: (h, s) => `值得信赖的韩国${s} — ${h}`,
  },
  러시아어: {
    sns: (h, s, a) => `✨ Качественное лечение «${s}» в клинике ${h}, Корея! Сертификат ${a}, доверие пациентов со всего мира. 🇰🇷 #МедицинскийТуризм #КорейскаяМедицина`,
    adHeadline: (h, s) => `${s} в Корее — ${h}`,
  },
  일본어: {
    sns: (h, s, a) => `✨ 韓国の${h}で安心の${s}を。${a}認証、世界中の患者様から信頼されています。🇰🇷 #医療観光 #韓国医療`,
    adHeadline: (h, s) => `信頼の韓国${s} — ${h}`,
  },
  태국어: {
    sns: (h, s, a) => `✨ สัมผัสบริการ ${s} ระดับมืออาชีพที่ ${h} ประเทศเกาหลี! ได้รับการรับรอง ${a} เชื่อถือได้จากผู้ป่วยทั่วโลก 🇰🇷 #ท่องเที่ยวเชิงการแพทย์ #เกาหลี`,
    adHeadline: (h, s) => `${s} ที่เกาหลี ไว้ใจ ${h}`,
  },
  몽골어: {
    sns: (h, s, a) => `✨ Солонгос улсын ${h}-д мэргэжлийн ${s} үйлчилгээг авч үзээрэй! ${a} гэрчилгээтэй, дэлхийн өвчтөнүүдийн итгэлийг хүлээсэн. 🇰🇷 #ЭмнэлгийнАялал #СолонгосЭмнэлэг`,
    adHeadline: (h, s) => `Солонгост ${s} — ${h}`,
  },
  아랍어: {
    sns: (h, s, a) => `✨ اكتشف رعاية ${s} المتخصصة في ${h} بكوريا! حاصل على شهادة ${a}، موثوق من المرضى حول العالم. 🇰🇷 #السياحة_العلاجية #كوريا_الطبية`,
    adHeadline: (h, s) => `${s} في كوريا بثقة — ${h}`,
  },
}

export interface Translation {
  language: MarketingLanguage
  snsSnippet: string
  adHeadline: string
}

export function generateTranslations(m: MarketingMaterial, languages: readonly MarketingLanguage[]): Translation[] {
  const acc = primaryAccreditation(m)
  const subject = subjectEn(m)
  const hospital = m.hospitalNameEn
  return languages.map((lang) => {
    const t = LANG_TEMPLATES[lang]
    return { language: lang, snsSnippet: t.sns(hospital, subject, acc), adHeadline: t.adHeadline(hospital, subject) }
  })
}
