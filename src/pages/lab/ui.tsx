import type { ReactNode } from 'react'

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
  hint,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (v: number) => void
  hint?: string
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between">
        <span className="text-[12px] text-ink/80">{label}</span>
        <span className="num text-[12.5px] font-medium text-ink">
          {value}
          <span className="ml-0.5 text-[9.5px] font-normal text-slate">{unit}</span>
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1.5 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-line accent-ink"
        style={{ accentColor: '#0E2136' }}
      />
      {hint && <span className="mt-1 block text-[9.5px] leading-relaxed text-slate/70">{hint}</span>}
    </label>
  )
}

export function Stat({
  label,
  value,
  unit,
  delta,
  tone = 'ink',
}: {
  label: string
  value: string | number
  unit?: string
  delta?: string
  tone?: 'ink' | 'up' | 'down' | 'gold'
}) {
  const color = tone === 'up' ? 'text-up' : tone === 'down' ? 'text-down' : tone === 'gold' ? 'text-gold' : 'text-ink'
  return (
    <div className="rounded-xl border border-line bg-white px-3 py-2.5">
      <div className="text-[10px] text-slate">{label}</div>
      <div className={`num mt-1 text-[19px] font-medium leading-none ${color}`}>
        {value}
        {unit && <span className="ml-1 text-[9.5px] font-normal text-slate">{unit}</span>}
      </div>
      {delta && <div className="mt-1 text-[9.5px] text-slate">{delta}</div>}
    </div>
  )
}

export function LabHead({ no, title, sub, formula }: { no: string; title: string; sub: string; formula?: string }) {
  return (
    <header>
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-semibold tracking-[0.24em] text-gold">{no}</span>
        <span className="h-px flex-1 bg-line" />
      </div>
      <h1 className="mt-2 font-serif text-[23px] font-semibold leading-tight">{title}</h1>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate">{sub}</p>
      {formula && <div className="num mt-2 inline-block rounded-md bg-[#F1EDE4] px-2.5 py-1 text-[11px] text-ink/70">{formula}</div>}
    </header>
  )
}

export function LabNote({ children }: { children: ReactNode }) {
  return (
    <div className="mt-4 rounded-xl border border-[#E7D3CB] bg-[#FCF4F0] px-3.5 py-2.5">
      <div className="mb-1 text-[9px] font-semibold tracking-[0.18em] text-up">MODEL CAVEAT</div>
      <p className="text-[11px] leading-relaxed text-ink/70">{children}</p>
    </div>
  )
}

export function Panel({ title, children, right }: { title: string; children: ReactNode; right?: ReactNode }) {
  return (
    <section className="card mt-4 overflow-hidden">
      <div className="flex items-center justify-between border-b border-line/70 px-3.5 py-2.5">
        <span className="eyebrow">{title}</span>
        {right}
      </div>
      <div className="p-3.5">{children}</div>
    </section>
  )
}
