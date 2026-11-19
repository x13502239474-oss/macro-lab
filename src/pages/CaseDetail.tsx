import { Link, useParams } from 'react-router-dom'
import { caseById, cases } from '../content/cases'
import { byId } from '../content/lessons'

const sectionsOrder = ['background', 'shock', 'model', 'policy', 'outcome', 'lesson']

export default function CaseDetail() {
  const { id = '' } = useParams()
  const c = caseById(id)

  if (!c) {
    return (
      <div className="shell py-16 text-center">
        <p className="text-slate">没有找到这个案例。</p>
        <Link to="/cases" className="btn-ghost mt-4">
          返回案例库
        </Link>
      </div>
    )
  }

  const idx = cases.findIndex((x) => x.id === c.id)
  const next = cases[(idx + 1) % cases.length]

  const sections = [
    { no: '01', title: '背景', body: c.background },
    { no: '03', title: '经济冲击', body: c.shock },
    { no: '04', title: '理论模型', body: c.model },
    { no: '05', title: '政策应对', body: c.policy },
    { no: '06', title: '结果分析', body: c.outcome },
    { no: '07', title: '现实启示', body: c.lesson },
  ]

  return (
    <div className="shell max-w-[760px] py-4">
      <Link to="/cases" className="text-[11.5px] text-slate hover:text-ink">
        ← 案例库
      </Link>

      <header className="mt-3">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-semibold tracking-[0.2em] text-gold">{c.no}</span>
          <span className="chip !py-0.5 !text-[9px]">{c.tag}</span>
        </div>
        <h1 className="mt-2 font-serif text-[24px] font-semibold leading-tight">{c.title}</h1>
        <p className="mt-1 text-[11.5px] text-slate">
          {c.region} · {c.period}
        </p>
        <p className="mt-2.5 border-l-2 border-gold pl-3 text-[13.5px] leading-[1.85] text-ink/80">{c.brief}</p>
      </header>

      {/* 核心指标 */}
      <section className="card mt-4 overflow-hidden">
        <div className="border-b border-line/70 bg-[#FBFAF6] px-3.5 py-2">
          <span className="eyebrow">02 · 核心经济指标</span>
        </div>
        <div className="divide-y divide-line/60">
          {c.indicators.map((ind) => (
            <div key={ind.name} className="flex items-start gap-3 px-3.5 py-2.5">
              <span className="w-[38%] shrink-0 text-[11.5px] text-ink/80">{ind.name}</span>
              <span className="num flex-1 text-[12.5px] text-ink">{ind.value}</span>
              <span className="w-[34%] shrink-0 text-right text-[9.5px] leading-relaxed text-slate">{ind.note}</span>
            </div>
          ))}
        </div>
      </section>

      <article className="mt-2">
        {sections.map((s) => (
          <section key={s.no} className="border-t border-line/80 py-4 first:border-t-0">
            <div className="mb-2 flex items-baseline gap-2.5">
              <span className="num text-[10px] tracking-widest text-gold">{s.no}</span>
              <h2 className="font-serif text-[17px] font-semibold">{s.title}</h2>
            </div>
            <p className="text-[14px] leading-[1.9] text-ink/85">{s.body}</p>
          </section>
        ))}
      </article>

      {c.debate && (
        <section className="rounded-2xl border border-line bg-white px-4 py-3.5">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-[9px] font-semibold tracking-[0.18em] text-gold">DEBATE</span>
            <span className="text-[10px] text-slate">学派分歧</span>
          </div>
          <p className="text-[12.5px] leading-[1.85] text-ink/75">{c.debate}</p>
        </section>
      )}

      <section className="mt-4">
        <div className="mb-2 eyebrow">RELATED LESSONS</div>
        <div className="flex flex-wrap gap-2">
          {c.links.map((l) => {
            const lesson = byId(l)
            return (
              <Link key={l} to={`/lesson/${l}`} className="chip !bg-white hover:!border-ink/30">
                {l} {lesson?.title}
              </Link>
            )
          })}
        </div>
      </section>

      <div className="mt-5 flex items-center justify-between border-t border-line pt-3">
        <Link to="/cases" className="text-[11.5px] text-slate">
          ← 全部案例
        </Link>
        <Link to={`/case/${next.id}`} className="text-[11.5px] text-ink">
          下一个：{next.title} →
        </Link>
      </div>

      <p className="mt-4 text-[10px] leading-relaxed text-slate/70">
        数据说明：案例中的指标来自公开统计与机构报告的教学整理，年份与口径已逐项标注；不同来源存在修订与口径差异时，以正文说明为准。理论模型仅用于解释机制，不构成对现实的完整描述。
      </p>
    </div>
  )
}
