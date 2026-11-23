'use client'

// OMNI 화면 공통 UI — globals.css 의 디자인 토큰(ink/line/brand …)만 사용한다.
import type { ReactNode } from 'react'

export const inputCls =
  'h-10 w-full rounded-md border border-line-strong bg-surface px-3 text-[14px] text-ink outline-none transition-colors placeholder:text-subtle focus:border-brand'
export const selectCls = inputCls + ' pr-8'
export const textareaCls =
  'w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-[14px] text-ink outline-none placeholder:text-subtle focus:border-brand'
export const btnPrimary =
  'inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand px-4 text-[14px] font-semibold text-white transition-colors hover:bg-brand-hover active:bg-brand-press disabled:cursor-not-allowed disabled:opacity-60'
export const btnSecondary =
  'inline-flex h-10 items-center justify-center gap-2 rounded-md border border-line-strong bg-surface px-4 text-[14px] font-medium text-ink transition-colors hover:border-ink hover:bg-wash disabled:cursor-not-allowed disabled:opacity-60'
export const btnGhost =
  'inline-flex h-8 items-center justify-center rounded-md px-2.5 text-[13px] font-medium text-muted transition-colors hover:bg-wash hover:text-ink'

export function PageHeader({ title, desc, actions }: { title: string; desc?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-[22px] font-bold tracking-[-0.02em] text-ink">{title}</h1>
        {desc && <p className="mt-1 text-[14px] text-muted">{desc}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function Page({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return <div className={`mx-auto px-4 py-6 sm:px-6 lg:py-8 ${wide ? 'max-w-7xl' : 'max-w-5xl'}`}>{children}</div>
}

export function Section({ title, desc, children, aside }: { title: string; desc?: ReactNode; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="rounded-lg border border-line bg-surface">
      <header className="flex flex-wrap items-start justify-between gap-2 border-b border-line px-5 py-4">
        <div>
          <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
          {desc && <p className="mt-0.5 text-[13px] text-muted">{desc}</p>}
        </div>
        {aside}
      </header>
      <div className="px-5 py-5">{children}</div>
    </section>
  )
}

export function Field({ label, hint, required, children }: { label: string; hint?: ReactNode; required?: boolean; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-ink-2">
        {label}
        {required && <span className="ml-1 text-danger">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[12px] text-subtle">{hint}</span>}
    </label>
  )
}

/** 다중 선택 칩 */
export function ChipGroup<T extends string>({
  options,
  value,
  onChange,
  labels,
  single = false,
}: {
  options: readonly T[]
  value: T[]
  onChange: (next: T[]) => void
  labels: Record<T, string>
  single?: boolean
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = value.includes(o)
        return (
          <button
            key={o}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(single ? [o] : on ? value.filter((v) => v !== o) : [...value, o])}
            className={`h-8 rounded-full border px-3 text-[13px] transition-colors ${
              on ? 'border-brand bg-brand-soft font-semibold text-brand' : 'border-line-strong bg-surface text-ink-2 hover:border-ink'
            }`}
          >
            {labels[o]}
          </button>
        )
      })}
    </div>
  )
}

type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger'
const TONES: Record<Tone, string> = {
  neutral: 'bg-wash text-ink-2',
  brand: 'bg-brand-soft text-brand',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
}

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`inline-flex items-center rounded-sm px-1.5 py-0.5 text-[12px] font-medium ${TONES[tone]}`}>{children}</span>
}

export function Notice({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  const border: Record<Tone, string> = {
    neutral: 'border-line',
    brand: 'border-brand-line',
    success: 'border-success/25',
    warning: 'border-warning/25',
    danger: 'border-danger/25',
  }
  return (
    <div role={tone === 'danger' ? 'alert' : undefined} className={`rounded-md border px-4 py-3 text-[13px] leading-relaxed ${border[tone]} ${TONES[tone]}`}>
      {children}
    </div>
  )
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-line-strong bg-surface px-6 py-12 text-center">
      <p className="text-[15px] font-semibold text-ink">{title}</p>
      {children && <div className="mt-2 text-[13px] text-muted">{children}</div>}
    </div>
  )
}

export function Spinner() {
  return <span aria-hidden className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
}

export function errorMessage(err: unknown, fallback: string) {
  if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
    return (err as { message: string }).message
  }
  return fallback
}
