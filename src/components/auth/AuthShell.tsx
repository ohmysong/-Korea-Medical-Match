import Link from 'next/link'

/** Shared input styling for auth forms. `invalid` switches to the danger border. */
export function fieldCls(invalid = false) {
  return `h-11 w-full rounded-md border bg-surface px-3 text-[15px] text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-subtle ${
    invalid
      ? 'border-danger focus:shadow-[0_0_0_3px_var(--color-danger-soft)]'
      : 'border-line-strong hover:border-subtle focus:border-brand focus:shadow-[0_0_0_3px_var(--color-brand-soft)]'
  }`
}

export function FieldLabel({
  htmlFor,
  required,
  children,
}: {
  htmlFor: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline justify-between text-[13px] font-medium text-ink-2">
      <span>{children}</span>
      {required ? <span className="text-[12px] font-normal text-subtle">필수</span> : null}
    </label>
  )
}

export function FieldError({ id, children }: { id: string; children?: string }) {
  if (!children) return null
  return (
    <p id={id} role="alert" className="mt-1.5 text-[12px] text-danger">
      {children}
    </p>
  )
}

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div className="grid min-h-[100dvh] bg-surface lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      {/* Brand panel */}
      <aside className="hidden flex-col justify-between bg-ink px-12 py-10 text-white lg:flex">
        <Link href="/" className="flex items-center gap-2.5">
          <span aria-hidden className="grid h-7 w-7 place-items-center rounded-[5px] bg-white">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="4.6" stroke="#161d2e" strokeWidth="2.2" />
            </svg>
          </span>
          <span className="text-[15px] font-semibold tracking-[-0.02em]">OMNI 옴니</span>
        </Link>

        <div className="max-w-sm">
          <p className="text-[28px] font-bold leading-[1.3] tracking-[-0.03em]">
            비즈니스 통역,<br />검증된 경력으로 매칭
          </p>
          <p className="mt-4 text-[14px] leading-[1.7] text-white/60">
            박람회 부스 상담부터 기술회의·협상·실사까지. 조건에 맞는 통역사를 최대 3명 추천하고 예약·결제·정산을 한 곳에서 처리합니다.
          </p>
          <dl className="mt-10 grid grid-cols-3 border-t border-white/15 pt-5">
            {[
              ['618', '세부 산업분야'],
              ['3명', '최대 추천'],
              ['0원', '통역사 수수료'],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="text-[12px] text-white/50">{l}</dt>
                <dd className="tabular mt-1 text-[20px] font-semibold tracking-[-0.02em]">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="text-[12px] text-white/40">일반·비즈니스 통역 · 수행 · 가이드 · 리에종</p>
      </aside>

      {/* Form column */}
      <div className="flex flex-col px-5 py-8 sm:px-8 lg:px-16">
        <Link href="/" className="mb-10 flex items-center gap-2 text-[14px] font-semibold text-ink lg:hidden">
          <span aria-hidden className="grid h-6 w-6 place-items-center rounded-[4px] bg-ink">
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="4.6" stroke="#fff" strokeWidth="2.2" />
            </svg>
          </span>
          OMNI 옴니
        </Link>
        <div className="m-auto w-full max-w-[25rem]">
          <h1 className="text-[26px] font-bold tracking-[-0.03em] text-ink">{title}</h1>
          {subtitle && <p className="mt-1.5 text-[14px] text-muted">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8">{footer}</div>}
        </div>
        <p className="mt-10 text-center lg:text-left">
          <Link href="/" className="text-[13px] text-subtle transition-colors duration-150 hover:text-ink">
            ← 홈으로 돌아가기
          </Link>
        </p>
      </div>
    </div>
  )
}
