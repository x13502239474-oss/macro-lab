import type { Block } from '../lib/types'
import { Formula } from './Formula'
import { DataChart } from './DataChart'

function Rich({ text }: { text: string }) {
  // 仅支持 **加粗**，避免引入 markdown 解析器
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**') ? (
          <strong key={i} className="font-semibold text-ink">
            {p.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  )
}

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-3">
      {blocks.map((b, i) => {
        if ('p' in b) {
          return (
            <p key={i} className="text-[15px] leading-[1.9] text-ink/85">
              <Rich text={b.p} />
            </p>
          )
        }
        if ('h' in b) {
          return (
            <h4 key={i} className="pt-2 font-serif text-[15px] font-semibold text-ink">
              {b.h}
            </h4>
          )
        }
        if ('f' in b) {
          return <Formula key={i} tex={b.f[0]} caption={b.f[1]} />
        }
        if ('k' in b) {
          return (
            <div key={i} className="rounded-xl border border-line bg-white px-3.5 py-3">
              <div className="flex items-baseline gap-2">
                <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                <span className="font-serif text-[14px] font-semibold text-ink">{b.k[0]}</span>
              </div>
              <p className="mt-1.5 pl-3.5 text-[13px] leading-relaxed text-slate">{b.k[1]}</p>
            </div>
          )
        }
        if ('l' in b) {
          return (
            <ul key={i} className="space-y-2 pl-1">
              {b.l.map((x, j) => (
                <li key={j} className="flex gap-2 text-[14px] leading-[1.8] text-ink/85">
                  <span className="mt-[9px] inline-block h-1 w-1 shrink-0 rounded-full bg-slate/60" />
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          )
        }
        if ('o' in b) {
          return (
            <ol key={i} className="space-y-2.5">
              {b.o.map((x, j) => (
                <li key={j} className="flex gap-2.5 text-[14px] leading-[1.8] text-ink/85">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-ink text-[10px] font-medium text-white">{j + 1}</span>
                  <span>{x}</span>
                </li>
              ))}
            </ol>
          )
        }
        if ('n' in b) {
          return (
            <div key={i} className="rounded-xl border-l-2 border-gold bg-[#FBF7EE] px-3.5 py-3">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">NOTE · 补充</div>
              <p className="text-[13px] leading-relaxed text-ink/75">{b.n}</p>
            </div>
          )
        }
        if ('w' in b) {
          return (
            <div key={i} className="rounded-xl border border-[#E7D3CB] bg-[#FCF4F0] px-3.5 py-3">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-up">CAUTION · 易错</div>
              <p className="text-[13px] leading-relaxed text-ink/80">{b.w}</p>
            </div>
          )
        }
        if ('c' in b) {
          return (
            <div key={i} className="overflow-hidden rounded-xl border border-line">
              <div className="flex items-center gap-2 bg-ink px-3.5 py-2.5">
                <span className="text-[9px] font-semibold tracking-[0.2em] text-goldSoft">CASE</span>
                <span className="font-serif text-[13px] text-white">{b.c[0]}</span>
              </div>
              <p className="bg-white px-3.5 py-3 text-[13px] leading-[1.85] text-ink/80">{b.c[1]}</p>
            </div>
          )
        }
        if ('tb' in b) {
          return (
            <div key={i} className="-mx-1 my-3 overflow-x-auto px-1">
              <table className="w-full min-w-[420px] border-collapse text-left text-[12.5px]">
                <thead>
                  <tr className="border-b border-ink/20">
                    {b.tb.h.map((h, j) => (
                      <th key={j} className="whitespace-nowrap px-2.5 py-2 text-[11px] font-semibold tracking-wide text-slate">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {b.tb.r.map((r, j) => (
                    <tr key={j} className="border-b border-line/70">
                      {r.map((c, k) => (
                        <td key={k} className={`px-2.5 py-2 leading-relaxed ${k === 0 ? 'font-medium text-ink' : 'text-ink/70'}`}>
                          {c}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
        if ('ch' in b) return <DataChart key={i} id={b.ch} />
        return null
      })}
    </div>
  )
}
