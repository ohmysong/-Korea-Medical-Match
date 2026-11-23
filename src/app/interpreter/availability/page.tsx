'use client'

// 통역사 가능 일정 — 열려 있는 시간 / 불가 시간. 등록하지 않은 시간은 추천 시 ‘확인 필요’로 표시된다.
import { useState } from 'react'
import useSWR from 'swr'
import * as interpreterApi from '@/lib/api/interpreter'
import type { AvailabilitySlot } from '@/lib/api/interpreter'
import { Empty, Field, Notice, Page, PageHeader, Section, Spinner, btnGhost, btnPrimary, errorMessage, inputCls, selectCls } from '@/components/omni/ui'

function SlotEditor({ initial }: { initial: AvailabilitySlot[] }) {
  const [slots, setSlots] = useState<AvailabilitySlot[]>(() => [...initial].sort((a, b) => a.availableDate.localeCompare(b.availableDate)))
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const upd = (i: number, patch: Partial<AvailabilitySlot>) => setSlots(slots.map((s, j) => (j === i ? { ...s, ...patch } : s)))

  function addRange() {
    const a = Date.parse(`${from}T00:00:00Z`)
    const b = Date.parse(`${to || from}T00:00:00Z`)
    if (!Number.isFinite(a) || !Number.isFinite(b) || b < a) return
    const existing = new Set(slots.map((s) => s.availableDate))
    const added: AvailabilitySlot[] = []
    for (let t = a; t <= b && added.length < 92; t += 86400000) {
      const d = new Date(t).toISOString().slice(0, 10)
      if (!existing.has(d)) added.push({ availableDate: d, startTime: '09:00', endTime: '18:00', available: true })
    }
    setSlots([...slots, ...added].sort((x, y) => x.availableDate.localeCompare(y.availableDate)))
  }

  async function save() {
    const bad = slots.find((s) => s.startTime && s.endTime && s.startTime >= s.endTime)
    if (bad) return setMsg({ tone: 'danger', text: `${bad.availableDate}: 종료시각이 시작시각보다 늦어야 합니다.` })
    setSaving(true)
    setMsg(null)
    try {
      await interpreterApi.saveMyAvailability(slots)
      setMsg({ tone: 'success', text: `${slots.length}개 일정을 저장했습니다.` })
    } catch (err) {
      setMsg({ tone: 'danger', text: errorMessage(err, '저장하지 못했습니다.') })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Section
      title="날짜별 가능 시간"
      desc="시간은 현지 시간 기준입니다. 확정 예약과 겹치는 시간은 서버가 UTC 로 충돌을 검사합니다."
      aside={<button type="button" className={btnPrimary} disabled={saving} onClick={save}>{saving && <Spinner />}전체 저장</button>}
    >
      <div className="mb-4 flex flex-wrap items-end gap-2">
        <Field label="시작일"><input type="date" className={inputCls} value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
        <Field label="종료일"><input type="date" className={inputCls} value={to} onChange={(e) => setTo(e.target.value)} /></Field>
        <button type="button" className={btnGhost + ' mb-1'} onClick={addRange} disabled={!from}>+ 기간 추가</button>
      </div>
      {msg && <div className="mb-3"><Notice tone={msg.tone}>{msg.text}</Notice></div>}
      {slots.length === 0 ? (
        <Empty title="등록된 일정이 없습니다">가능한 기간을 추가해 주세요. 미등록 시간은 의뢰사에게 ‘확인 필요’로 표시됩니다.</Empty>
      ) : (
        <ul className="divide-y divide-line rounded-md border border-line">
          {slots.map((s, i) => (
            <li key={s.availableDate + i} className="grid grid-cols-2 items-center gap-2 px-3 py-2 sm:grid-cols-[8rem_7rem_6.5rem_6.5rem_1fr_auto]">
              <span className="tabular text-[13px] font-medium text-ink">
                {s.availableDate} <span className="text-subtle">{new Date(`${s.availableDate}T00:00:00Z`).toLocaleDateString('ko-KR', { weekday: 'short', timeZone: 'UTC' })}</span>
              </span>
              <select className={selectCls + ' h-9'} value={s.available === false ? 'N' : 'Y'} onChange={(e) => upd(i, { available: e.target.value === 'Y' })} aria-label="가능 여부">
                <option value="Y">가능</option>
                <option value="N">불가</option>
              </select>
              <input type="time" className={inputCls + ' h-9'} value={s.startTime ?? ''} onChange={(e) => upd(i, { startTime: e.target.value })} aria-label="시작" />
              <input type="time" className={inputCls + ' h-9'} value={s.endTime ?? ''} onChange={(e) => upd(i, { endTime: e.target.value })} aria-label="종료" />
              <input className={inputCls + ' h-9'} value={s.note ?? ''} placeholder="메모" onChange={(e) => upd(i, { note: e.target.value })} />
              <button type="button" className={btnGhost} onClick={() => setSlots(slots.filter((_, j) => j !== i))}>삭제</button>
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}

export default function AvailabilityPage() {
  const { data, error, isLoading } = useSWR('interpreter/availability', () => interpreterApi.getMyAvailability(), { shouldRetryOnError: false })
  return (
    <Page>
      <PageHeader title="가능 일정" desc="열려 있는 시간과 불가 시간을 등록하세요. 동일 시간대에는 한 예약만 확정됩니다." />
      {isLoading ? (
        <p className="text-[14px] text-muted">불러오는 중…</p>
      ) : (
        <>
          {error && <div className="mb-4"><Notice tone="warning">일정을 불러오지 못했습니다 ({errorMessage(error, '')}).</Notice></div>}
          <SlotEditor initial={data ?? []} />
        </>
      )}
    </Page>
  )
}
