'use client'

// OMNI 옴니 — 일반·비즈니스 통역 매칭 플랫폼 홈
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ClientQuote, SellerSettlement } from '@/components/omni/QuoteBreakdown'
import { catalog, industryChildren, searchIndustries } from '@/lib/omni/catalog'
import { MODE_LABELS, PURPOSE_LABELS, ROLE_LABELS } from '@/lib/omni/labels'
import { MODES, PURPOSES, ROLES } from '@/lib/omni/types'

const STEPS = [
  ['의뢰 등록', '언어·역할·통역 방식·실제 업무·산업·날짜별 일정과 장소·예산을 입력합니다.'],
  ['최대 3명 추천', '가능한 사람을 먼저 추리고, 검증된 유사 프로젝트와 해당 분야 직접 통역 경력으로 순위를 매깁니다.'],
  ['비교·선택', '가격·경력 근거·가능 일정을 비교해 의뢰사가 한 명을 고릅니다. 통역사가 조건을 수락하면 결제합니다.'],
  ['현장 수행', '전날 확인 → 3시간 전 안내 → 출발·도착·시작·종료. 연장은 양측 승인 후 차액만 결제합니다.'],
  ['자동 정산', '완료가 확인되면 옴니가 지급대행사에 통역사 실지급액을 자동 요청합니다.'],
] as const

const EXAMPLES = ['SCR', 'EPC', 'FTA', '전해액', 'HBM', 'PV', '의료기기 수출']

function IndustryExplorer() {
  const [q, setQ] = useState('')
  const hits = useMemo(() => (q.trim() ? searchIndustries(q, 8) : []), [q])
  const roots = industryChildren(null)
  const counts = { root: roots.length, branch: catalog.nodes.filter((n) => n.level === 2).length, leaf: catalog.nodes.filter((n) => n.level === 3).length }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
      <div>
        <p className="text-[13px] font-semibold text-brand">산업 사전</p>
        <h2 className="mt-2 text-[28px] font-bold leading-tight tracking-[-0.03em] text-ink">
          무슨 제품·기술·제도를<br />다루는 자리인가요?
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          {counts.root}개 대분류 · {counts.branch}개 중분류 · {counts.leaf}개 세부분야. 같은 화학이라도 탈질 촉매 기술회의와 전시장 안내는
          필요한 경험이 다르기 때문에, 세부분야 단위로 경력을 비교합니다.
        </p>
        <div className="mt-6">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="검색해 보세요: SCR, EPC, 전해액 …"
            aria-label="산업 분야 검색"
            className="h-12 w-full rounded-md border border-line-strong bg-surface px-4 text-[15px] outline-none focus:border-brand"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {EXAMPLES.map((x) => (
              <button key={x} type="button" onClick={() => setQ(x)} className="h-7 rounded-full border border-line px-2.5 text-[12px] text-ink-2 hover:border-ink">
                {x}
              </button>
            ))}
          </div>
          {hits.length > 0 && (
            <ul className="mt-3 divide-y divide-line overflow-hidden rounded-md border border-line bg-surface">
              {hits.map((h) => (
                <li key={h.code} className="flex items-baseline justify-between gap-3 px-4 py-2.5 text-[13px]">
                  <span className="text-ink">{h.path}</span>
                  <code className="shrink-0 text-[11px] text-subtle">{h.code}</code>
                </li>
              ))}
            </ul>
          )}
          {q.trim() && hits.length === 0 && <p className="mt-3 text-[13px] text-muted">일치하는 분야가 없으면 의뢰 시 ‘직접 입력’으로 설명할 수 있습니다.</p>}
        </div>
      </div>
      <ul className="grid grid-cols-2 gap-px self-start overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3">
        {roots.map((r) => (
          <li key={r.code} className="bg-surface px-3 py-2.5 text-[13px] text-ink-2">{r.label_ko}</li>
        ))}
      </ul>
    </div>
  )
}

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:px-8 lg:py-20">
          <div>
            <p className="text-[13px] font-semibold text-brand">일반·비즈니스 통역 매칭</p>
            <h1 className="mt-3 text-[34px] font-bold leading-[1.2] tracking-[-0.035em] text-ink sm:text-[44px]">
              검증된 경력으로 고르는<br />비즈니스 통역사
            </h1>
            <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-muted">
              박람회 부스 상담, 바이어 미팅, 기술회의, 협상, 품질실사, 의전까지. 조건에 맞는 통역사를 최대 3명 추천하고,
              예약·현장 출근·결제·정산을 한 흐름으로 처리합니다.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              <Link href="/client/requests/new" className="inline-flex h-12 items-center rounded-md bg-brand px-6 text-[15px] font-semibold text-white hover:bg-brand-hover">
                통역 의뢰하기
              </Link>
              <Link href="/signup" className="inline-flex h-12 items-center rounded-md border border-line-strong px-6 text-[15px] font-medium text-ink hover:border-ink hover:bg-wash">
                통역사로 등록
              </Link>
            </div>
            <p className="mt-4 text-[12px] text-subtle">환자 진료·진료동행은 별도 의료통역 서비스로 안내합니다.</p>
          </div>
          <div className="rounded-lg border border-line bg-canvas p-5">
            <p className="text-[12px] font-semibold text-muted">의뢰 예시</p>
            <p className="mt-1 text-[16px] font-semibold text-ink">한↔영 순차 · 부산 벡스코 · 배터리 전해액 수출 상담 · 10시간</p>
            <p className="mt-1 text-[13px] text-muted">이차전지·에너지저장 → 배터리 소재·부품 → 전해액·고체전해질</p>
            <ul className="mt-4 space-y-2">
              {[
                ['1', '92.4', '배터리 전해액 관련 직접 통역 5일 · 바이어 부스 상담 1건'],
                ['2', '81.0', '이차전지 소재 기업 품질 담당 3년 · 순차 협상 4건'],
                ['3', '74.6', '화학공학 전공 · 영어권 체류 2년'],
              ].map(([rank, score, why]) => (
                <li key={rank} className="flex items-center gap-3 rounded-md border border-line bg-surface px-3 py-2.5">
                  <span className="tabular text-[12px] text-subtle">{rank}순위</span>
                  <span className="min-w-0 flex-1 truncate text-[13px] text-ink-2">{why}</span>
                  <span className="tabular text-[15px] font-bold text-brand">{score}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] text-subtle">예시 화면입니다. 점수는 명세의 순위 산식(100점)으로 계산됩니다.</p>
          </div>
        </div>
      </section>

      {/* How */}
      <section id="how" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-[13px] font-semibold text-brand">이용 방법</p>
        <h2 className="mt-2 text-[28px] font-bold tracking-[-0.03em] text-ink">한 건의 거래가 끝나는 방식</h2>
        <ol className="mt-8 grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-5">
          {STEPS.map(([t, d], i) => (
            <li key={t} className="bg-surface px-5 py-5">
              <span className="tabular text-[12px] font-semibold text-subtle">0{i + 1}</span>
              <p className="mt-2 text-[15px] font-semibold text-ink">{t}</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-line bg-surface p-5">
            <p className="text-[13px] font-semibold text-ink">역할</p>
            <p className="mt-2 text-[13px] text-muted">{ROLES.map((r) => ROLE_LABELS[r]).join(' · ')}</p>
          </div>
          <div className="rounded-lg border border-line bg-surface p-5">
            <p className="text-[13px] font-semibold text-ink">통역 방식</p>
            <p className="mt-2 text-[13px] text-muted">{MODES.map((m) => MODE_LABELS[m]).join(' · ')} · 화상/전화 진행</p>
          </div>
          <div className="rounded-lg border border-line bg-surface p-5">
            <p className="text-[13px] font-semibold text-ink">실제 업무</p>
            <p className="mt-2 text-[13px] text-muted">{PURPOSES.filter((p) => p !== 'OTHER').map((p) => PURPOSE_LABELS[p]).join(' · ')}</p>
          </div>
        </div>
      </section>

      {/* Industries */}
      <section id="industries" className="scroll-mt-20 border-y border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <IndustryExplorer />
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-[13px] font-semibold text-brand">요금 안내</p>
        <h2 className="mt-2 text-[28px] font-bold tracking-[-0.03em] text-ink">수수료는 의뢰사만, 통역사는 0원</h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
          옴니 중개수수료는 약정 통역료의 30%이며, 부가세 10%는 수수료에만 붙습니다. 아래는 시급 30,000원 × 10시간, 별도 경비 0원 거래입니다.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-line bg-surface p-5">
            <p className="mb-2 text-[14px] font-semibold text-ink">의뢰사 결제 화면</p>
            <ClientQuote workKrw={300000} />
          </div>
          <div className="rounded-lg border border-line bg-surface p-5">
            <p className="mb-2 text-[14px] font-semibold text-ink">통역사 정산 화면 <span className="font-normal text-muted">· 국내 거주 프리랜서</span></p>
            <SellerSettlement workKrw={300000} />
          </div>
        </div>
        <p className="mt-4 text-[12px] text-subtle">연장·감액은 누적 금액 기준으로 다시 계산해 차액만 추가 결제하거나 취소합니다. 거래명세에는 통역사 보수와 옴니 수수료·부가세가 구분 표시됩니다.</p>
      </section>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-8 text-[12px] text-subtle sm:px-6 lg:px-8">
          <span>OMNI 옴니 · 일반·비즈니스 통역 매칭 플랫폼</span>
          <span className="flex gap-4">
            <Link href="/login" className="hover:text-ink">로그인</Link>
            <Link href="/signup" className="hover:text-ink">회원가입</Link>
          </span>
        </div>
      </footer>
    </div>
  )
}
