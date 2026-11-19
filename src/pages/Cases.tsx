import { Link } from 'react-router-dom'
import { cases } from '../content/cases'

export default function Cases() {
  return (
    <div className="shell py-4 md:py-6">
      <div className="eyebrow">CASE LIBRARY</div>
      <h1 className="mt-1 font-serif text-[24px] font-semibold">宏观经济案例库</h1>
      <p className="mt-2 max-w-[58ch] text-[12.5px] leading-relaxed text-slate">
        十个真实案例，统一按「背景 → 核心指标 → 冲击 → 模型 → 政策 → 结果 → 启示」拆解。指标均注明年份与口径；存在学派分歧时，并列呈现双方理由。
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {cases.map((c) => (
          <Link key={c.id} to={`/case/${c.id}`} className="card group overflow-hidden">
            <div className="flex items-center justify-between border-b border-line/70 px-4 py-2.5">
              <span className="text-[9px] font-semibold tracking-[0.18em] text-gold">{c.no}</span>
              <span className="text-[9.5px] text-slate">
                {c.region} · {c.period}
              </span>
            </div>
            <div className="px-4 py-3.5">
              <h2 className="font-serif text-[16px] font-semibold leading-snug">{c.title}</h2>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-slate">{c.brief}</p>
              <div className="mt-2.5 flex items-center justify-between">
                <span className="chip !py-0.5 !text-[9px]">{c.tag}</span>
                <span className="text-[10.5px] text-slate transition group-hover:text-ink">阅读案例 →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
