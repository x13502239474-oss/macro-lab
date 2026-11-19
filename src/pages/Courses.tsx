import { useState } from 'react'
import { Link } from 'react-router-dom'
import { lessonsOf, phases, stats } from '../content/lessons'
import { useStore } from '../lib/useStore'

export default function Courses() {
  const s = useStore()
  const firstUndone = phases.find((p) => lessonsOf(p.n).some((l) => !s.lessons[l.id]?.done))?.n ?? 1
  const [open, setOpen] = useState<number | null>(firstUndone)

  return (
    <div className="shell py-4 md:py-6">
      <div className="md:flex md:items-end md:justify-between">
        <div>
          <div className="eyebrow">CURRICULUM</div>
          <h1 className="mt-1 font-serif text-[24px] font-semibold">课程体系</h1>
          <p className="mt-2 max-w-[54ch] text-[12.5px] leading-relaxed text-slate">
            六个阶段、{stats.lessons} 节课，对应曼昆第 10 版宏观分册第 24—38 章。每节课含学习目标、理论讲解、公式推导、图表、案例与章节测试。
          </p>
        </div>
        <div className="mt-3 flex gap-4 text-[11px] text-slate md:mt-0">
          <span>
            <span className="num text-[16px] text-ink">{stats.lessons}</span> 课
          </span>
          <span>
            <span className="num text-[16px] text-ink">{stats.questions}</span> 题
          </span>
          <span>
            <span className="num text-[16px] text-ink">{Math.round(stats.minutes / 60)}</span> 小时
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-line bg-[#FBFAF6] px-3.5 py-3 text-[11px] leading-relaxed text-slate">
        <span className="font-medium text-ink">与教材的对应关系：</span>
        阶段一对应第 24—25 章；阶段二第 26—28 章；阶段三第 30—31 章；阶段四第 29、34 章；阶段五第 35—37 章；阶段六第 32—33 章。
        教材第 38 章（经济学家如何使用数据）的内容融入数据实验室。凡教材未覆盖的扩展模型，课内均标注「教材之外的扩展」。
      </div>

      <div className="mt-4 space-y-3">
        {phases.map((p) => {
          const list = lessonsOf(p.n)
          const done = list.filter((l) => s.lessons[l.id]?.done).length
          const pct = Math.round((done / list.length) * 100)
          const isOpen = open === p.n
          return (
            <section key={p.n} className="card overflow-hidden">
              <button onClick={() => setOpen(isOpen ? null : p.n)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
                <span className="num flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink text-[12px] text-goldSoft">
                  {String(p.n).padStart(2, '0')}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-2">
                    <span className="font-serif text-[15.5px] font-semibold">{p.title}</span>
                    <span className="hidden text-[9px] tracking-[0.14em] text-slate/60 sm:inline">{p.en.toUpperCase()}</span>
                  </span>
                  <span className="mt-0.5 block text-[10.5px] text-slate">
                    {p.tb} · {list.length} 课 · 已完成 {done}
                  </span>
                </span>
                <span className="hidden w-24 shrink-0 sm:block">
                  <span className="block h-1 w-full overflow-hidden rounded bg-line">
                    <span className="block h-full rounded bg-gold" style={{ width: `${pct}%` }} />
                  </span>
                  <span className="mt-1 block text-right text-[9px] text-slate">{pct}%</span>
                </span>
                <svg viewBox="0 0 24 24" className={`h-4 w-4 shrink-0 text-slate transition ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {isOpen && (
                <div className="border-t border-line/70">
                  <p className="border-b border-line/60 bg-[#FBFAF6] px-4 py-2.5 text-[11px] leading-relaxed text-slate">{p.desc}</p>
                  <ul>
                    {list.map((l) => {
                      const st = s.lessons[l.id]
                      return (
                        <li key={l.id} className="border-b border-line/50 last:border-0">
                          <Link to={`/lesson/${l.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-[#FBFAF6]">
                            <span className={`num w-8 shrink-0 text-[11px] ${st?.done ? 'text-down' : 'text-slate/70'}`}>{l.id}</span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[13.5px] font-medium text-ink">{l.title}</span>
                              <span className="mt-0.5 block truncate text-[10.5px] text-slate">{l.sub}</span>
                            </span>
                            <span className="shrink-0 text-right">
                              <span className="block text-[9px] text-slate/70">{l.min} 分钟</span>
                              {st?.done ? (
                                <span className="mt-0.5 block text-[9px] text-down">已完成</span>
                              ) : (
                                <span className="mt-0.5 block text-[9px] text-slate/40">未学习</span>
                              )}
                            </span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
