import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { dailyOf } from '../content/daily'
import { Spark } from '../content/indicators'
import { cases } from '../content/cases'
import { lessons, phases, stats } from '../content/lessons'
import { useStore } from '../lib/useStore'
import { useIndicators } from '../lib/useIndicators'
import { streak, todayKey } from '../lib/store'

function Ring({ pct }: { pct: number }) {
  const r = 26
  const c = 2 * Math.PI * r
  return (
    <div className="relative h-[68px] w-[68px] shrink-0">
      <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#E2DDD3" strokeWidth="4" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="#A98753"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * c} ${c}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="num text-[15px] font-medium leading-none">{pct}%</span>
        <span className="mt-0.5 text-[8px] tracking-wider text-slate">完成</span>
      </div>
    </div>
  )
}

export default function Home() {
  const s = useStore()
  const { indicators, live } = useIndicators()
  const [reveal, setReveal] = useState(false)
  const dq = useMemo(() => dailyOf(), [])

  const done = lessons.filter((l) => s.lessons[l.id]?.done).length
  const pct = Math.round((done / lessons.length) * 100)
  const next = lessons.find((l) => !s.lessons[l.id]?.done) ?? lessons[lessons.length - 1]
  const phase = phases.find((p) => p.n === next.phase)!
  const st = streak(s.days)
  const today = todayKey()
  const todayDone = Object.entries(s.lessons).filter(([, v]) => v.done && todayKey(new Date(v.ts)) === today).length
  const quizToday = Object.entries(s.ans).filter(([, v]) => todayKey(new Date(v.ts)) === today).length
  const tasks = [
    { t: `完成 1 节课程（今日 ${Math.min(todayDone, 1)}/1）`, ok: todayDone >= 1 },
    { t: `完成 1 组章节测试（今日 ${quizToday > 0 ? 1 : 0}/1）`, ok: quizToday > 0 },
    { t: '复习 3 个错题或知识点', ok: (s.tasks[today] ?? []).some((x) => x.startsWith('review')) },
  ]

  return (
    <div className="shell py-4 md:py-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-ink px-5 pb-5 pt-5 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative">
          <div className="flex items-center justify-between">
            <span className="text-[9px] tracking-[0.28em] text-goldSoft">GLOBAL ECONOMY DESK</span>
            <span className="rounded-full border border-white/20 px-2 py-0.5 text-[9px] text-white/60">教学数据 · 非实时</span>
          </div>
          <h1 className="mt-3 font-serif text-[26px] font-semibold leading-tight md:text-[30px]">世界经济观察台</h1>
          <p className="mt-2 max-w-[38ch] text-[12.5px] leading-relaxed text-white/65">
            以曼昆《经济学原理·宏观经济学分册》（第 10 版）为骨架，从 GDP 到汇率，把新闻里的数字连成一套可推演的逻辑。
          </p>
          <div className="mt-4 flex items-center gap-5 border-t border-white/15 pt-3 text-[11px] text-white/60">
            <span>
              <span className="num text-[15px] text-white">{stats.lessons}</span> 节课
            </span>
            <span>
              <span className="num text-[15px] text-white">{stats.questions}</span> 道题
            </span>
            <span>
              <span className="num text-[15px] text-white">8</span> 个实验
            </span>
            <span className="ml-auto hidden sm:block">{new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}</span>
          </div>
        </div>
      </section>

      {/* 学习进度 */}
      <section className="mt-4">
        <div className="card flex items-center gap-4 px-4 py-4">
          <Ring pct={pct} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="eyebrow">LEARNING</span>
              <span className="chip !py-0.5 !text-[9.5px]">第 {phase.n} 阶段</span>
            </div>
            <div className="mt-1.5 font-serif text-[16px] font-semibold">{phase.title}</div>
            <div className="mt-1 text-[11.5px] text-slate">
              已完成 <span className="num text-ink">{done}</span> / {lessons.length} 课 · 连续 <span className="num text-ink">{st}</span> 天
            </div>
          </div>
          <Link to={`/lesson/${next.id}`} className="btn-primary shrink-0 !px-3 !py-2 !text-[11.5px]">
            继续
          </Link>
        </div>

        <div className="card mt-3 px-4 py-3.5">
          <div className="flex items-center justify-between">
            <span className="eyebrow">TODAY'S TASKS</span>
            <span className="text-[10.5px] text-slate">{tasks.filter((t) => t.ok).length}/3 完成</span>
          </div>
          <ul className="mt-2.5 space-y-2">
            {tasks.map((t) => (
              <li key={t.t} className="flex items-center gap-2.5 text-[12.5px]">
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[9px] ${
                    t.ok ? 'border-down bg-down text-white' : 'border-slate/40 text-transparent'
                  }`}
                >
                  ✓
                </span>
                <span className={t.ok ? 'text-slate line-through decoration-slate/30' : 'text-ink/80'}>{t.t}</span>
              </li>
            ))}
          </ul>
          <Link to={`/lesson/${next.id}`} className="mt-3 flex items-center justify-between rounded-lg bg-[#FBFAF6] px-3 py-2.5">
            <span className="min-w-0">
              <span className="block text-[9px] tracking-[0.16em] text-gold">NEXT LESSON</span>
              <span className="mt-0.5 block truncate text-[12.5px] text-ink">
                {next.id} {next.title}
              </span>
            </span>
            <span className="text-slate">→</span>
          </Link>
        </div>
      </section>

      {/* 核心指标 */}
      <section className="mt-6">
        <div className="mb-2.5 flex items-end justify-between">
          <div>
            <div className="eyebrow">KEY INDICATORS</div>
            <h2 className="mt-1 font-serif text-[19px] font-semibold">核心经济指标</h2>
          </div>
          <Link to="/lab" className="text-[11px] text-slate hover:text-ink">
            数据实验室 →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
          {indicators.map((m) => (
            <div key={m.key} className="card flex flex-col justify-between px-3.5 pb-2.5 pt-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="kpi-label">{m.label}</div>
                  <div className="mt-0.5 text-[9px] tracking-[0.12em] text-slate/60">{m.en}</div>
                </div>
                <span className={`mt-1 text-[9px] ${m.dir === 'up' ? 'text-up' : m.dir === 'down' ? 'text-down' : 'text-slate'}`}>
                  {m.dir === 'up' ? '▲' : m.dir === 'down' ? '▼' : '—'}
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="num text-[22px] font-medium leading-none tracking-tight">{m.value}</span>
                <span className="text-[9.5px] text-slate">{m.unit}</span>
              </div>
              <div className="mt-1 text-[9.5px] text-slate/80">{m.delta}</div>
              <div className="mt-1 opacity-80">
                <Spark data={m.spark} tone={m.dir === 'up' ? '#B4462F' : m.dir === 'down' ? '#2E6B54' : '#5D7185'} />
              </div>
              <div className="border-t border-line/60 pt-1 text-[8.5px] leading-tight text-slate/60">{m.note}</div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-slate/70">
          以上为公开年度统计的教学整理值（多为 2023 年），用于课堂分析，不代表实时行情；引用时请以统计机构最新发布为准。
          {live ? ' 当前已接入远端数据源，数值随接口更新。' : ''}
        </p>
      </section>

      {/* 今日经济学 */}
      <section className="mt-6">
        <div className="mb-2.5">
          <div className="eyebrow">DAILY QUESTION</div>
          <h2 className="mt-1 font-serif text-[19px] font-semibold">今日经济学</h2>
        </div>
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="flex items-center gap-2 border-b border-line/70 px-4 py-2.5">
            <span className="text-[9px] font-semibold tracking-[0.2em] text-gold">{dq.tag}</span>
            <span className="ml-auto text-[10px] text-slate">{new Date().toLocaleDateString('zh-CN')}</span>
          </div>
          <div className="px-4 py-3.5">
            <p className="font-serif text-[15.5px] leading-relaxed text-ink">{dq.q}</p>
            {reveal ? (
              <p className="mt-3 border-l-2 border-goldSoft pl-3 text-[13px] leading-[1.85] text-ink/75">{dq.a}</p>
            ) : null}
            <div className="mt-3 flex items-center gap-3">
              <button onClick={() => setReveal((v) => !v)} className="text-[11.5px] font-medium text-ink underline decoration-goldSoft decoration-2 underline-offset-4">
                {reveal ? '收起参考答案' : '先自己想 30 秒，再看答案'}
              </button>
              {dq.link && (
                <Link to={`/lesson/${dq.link}`} className="ml-auto text-[10.5px] text-slate">
                  相关课程 {dq.link} →
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 宏观观察 */}
      <section className="mt-6">
        <div className="mb-2.5 flex items-end justify-between">
          <div>
            <div className="eyebrow">MACRO OBSERVER</div>
            <h2 className="mt-1 font-serif text-[19px] font-semibold">宏观经济观察</h2>
          </div>
          <Link to="/cases" className="text-[11px] text-slate hover:text-ink">
            全部案例 →
          </Link>
        </div>
        <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-3 md:px-0">
          {cases.slice(0, 6).map((c) => (
            <Link
              key={c.id}
              to={`/case/${c.id}`}
              className="card w-[248px] shrink-0 snap-start overflow-hidden md:w-auto"
            >
              <div className="flex items-center justify-between border-b border-line/70 px-3.5 py-2">
                <span className="text-[9px] font-semibold tracking-[0.16em] text-gold">{c.no}</span>
                <span className="text-[9px] text-slate">{c.region}</span>
              </div>
              <div className="px-3.5 py-3">
                <div className="font-serif text-[14.5px] font-semibold leading-snug">{c.title}</div>
                <p className="mt-1.5 line-clamp-2 text-[11.5px] leading-relaxed text-slate">{c.brief}</p>
                <div className="mt-2.5 flex items-center gap-2 text-[9.5px] text-slate">
                  <span className="chip !py-0.5 !text-[9px]">{c.period}</span>
                  <span>{c.tag}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 图谱入口 */}
      <section className="mt-6">
        <Link to="/graph" className="relative block overflow-hidden rounded-2xl border border-line bg-white px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="eyebrow">KNOWLEDGE GRAPH</div>
              <h3 className="mt-1 font-serif text-[17px] font-semibold">把 72 节课连成一张网</h3>
              <p className="mt-1.5 max-w-[34ch] text-[11.5px] leading-relaxed text-slate">
                点击概念，查看它依赖什么、通向哪里，以及相关的案例。
              </p>
            </div>
            <svg viewBox="0 0 100 80" className="h-16 w-20 shrink-0">
              <g stroke="#DDC9A6" strokeWidth="1">
                <line x1="20" y1="20" x2="50" y2="40" />
                <line x1="50" y1="40" x2="80" y2="22" />
                <line x1="50" y1="40" x2="30" y2="64" />
                <line x1="50" y1="40" x2="76" y2="62" />
              </g>
              <g fill="#0E2136">
                <circle cx="20" cy="20" r="4" />
                <circle cx="80" cy="22" r="4" />
                <circle cx="30" cy="64" r="4" />
                <circle cx="76" cy="62" r="4" />
                <circle cx="50" cy="40" r="6" fill="#A98753" />
              </g>
            </svg>
          </div>
        </Link>
      </section>

      <footer className="mt-8 border-t border-line pt-4 text-[10px] leading-relaxed text-slate/70">
        课程以曼昆《经济学原理（第 10 版）：宏观经济学分册》第 24—38 章为骨架自主编写，讲解与案例为原创整理，不引用教材原文；教材未覆盖的模型（如索洛模型完整推导）已逐处标注。
        本站不使用付费 API，所有数据为教学用途，非投资建议。
      </footer>
    </div>
  )
}
