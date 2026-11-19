import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { edges, groupColor, groups, nodes } from '../content/graph'
import { byId } from '../content/lessons'
import { cases } from '../content/cases'

export default function Graph() {
  const [sel, setSel] = useState<string | null>('gdp')
  const [group, setGroup] = useState<string>('全部')

  const active = nodes.find((n) => n.id === sel)
  const neighbors = useMemo(() => {
    if (!sel) return new Set<string>()
    const s = new Set<string>()
    edges.forEach((e) => {
      if (e.from === sel) s.add(e.to)
      if (e.to === sel) s.add(e.from)
    })
    return s
  }, [sel])

  const dim = (id: string) => group !== '全部' && nodes.find((n) => n.id === id)?.group !== group

  return (
    <div className="shell py-4 md:py-6">
      <div className="eyebrow">KNOWLEDGE GRAPH</div>
      <h1 className="mt-1 font-serif text-[24px] font-semibold">宏观经济知识图谱</h1>
      <p className="mt-2 max-w-[58ch] text-[12.5px] leading-relaxed text-slate">
        每个节点是一个核心概念，连线是传导关系。点击节点查看定义、相关课程与案例；横向滑动可查看全部。
      </p>

      <div className="no-scrollbar mt-3 flex gap-1.5 overflow-x-auto">
        {['全部', ...groups].map((g) => (
          <button
            key={g}
            onClick={() => setGroup(g)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] ${group === g ? 'border-ink bg-ink text-white' : 'border-line bg-white text-slate'}`}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="relative mt-3">
        <div className="card overflow-x-auto">
          <svg viewBox="0 0 700 570" className="block h-auto w-[620px] max-w-none md:w-full">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="18" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#C9C1B2" />
            </marker>
          </defs>
          {edges.map((e, i) => {
            const a = nodes.find((n) => n.id === e.from)!
            const b = nodes.find((n) => n.id === e.to)!
            const hot = sel === e.from || sel === e.to
            return (
              <line
                key={i}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={hot ? '#A98753' : '#DDD6C8'}
                strokeWidth={hot ? 1.6 : 1}
                markerEnd="url(#arrow)"
                opacity={dim(e.from) || dim(e.to) ? 0.15 : 0.9}
              />
            )
          })}
          {nodes.map((n) => {
            const isSel = sel === n.id
            const isNb = neighbors.has(n.id)
            const faded = dim(n.id) || (sel !== null && !isSel && !isNb && group === '全部' ? false : false)
            return (
              <g key={n.id} onClick={() => setSel(n.id)} className="cursor-pointer" opacity={faded ? 0.25 : 1}>
                {isSel && <circle cx={n.x} cy={n.y} r={15} fill={groupColor[n.group]} opacity={0.16} />}
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={isSel ? 8 : 5.5}
                  fill={isSel ? '#A98753' : groupColor[n.group]}
                  stroke="#fff"
                  strokeWidth={isSel ? 2 : 1}
                />
                <text
                  x={n.x}
                  y={n.y - 13}
                  textAnchor="middle"
                  fontSize={isSel ? 12 : 10.5}
                  fill={isSel ? '#0E2136' : '#3C4C5C'}
                  fontWeight={isSel ? 600 : 400}
                >
                  {n.label}
                </text>
              </g>
            )
          })}
        </svg>
        </div>
        {/* 移动端右侧渐隐，提示还有内容可滑 */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 rounded-r-xl bg-gradient-to-l from-white to-transparent md:hidden" />
      </div>

      <p className="mt-2 text-[10px] text-slate md:hidden">← 左右滑动可查看完整图谱，点击任一节点查看详情 →</p>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate">
        {groups.map((g) => (
          <span key={g} className="inline-flex items-center gap-1">
            <i className="h-2 w-2 rounded-full" style={{ background: groupColor[g] }} />
            {g}
          </span>
        ))}
      </div>

      {active && (
        <section className="card mt-4 p-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: groupColor[active.group] }} />
            <h2 className="font-serif text-[18px] font-semibold">{active.label}</h2>
            <span className="chip ml-auto !py-0.5 !text-[9px]">{active.group}</span>
          </div>
          <p className="mt-2 text-[12.5px] leading-[1.85] text-ink/80">{active.desc}</p>

          <div className="mt-3">
            <div className="text-[9.5px] tracking-[0.16em] text-slate">相关知识</div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {active.lessons.map((l) => (
                <Link key={l} to={`/lesson/${l}`} className="chip !bg-white hover:!border-ink/30">
                  {l} {byId(l)?.title}
                </Link>
              ))}
            </div>
          </div>

          {active.cases && active.cases.length > 0 && (
            <div className="mt-3">
              <div className="text-[9.5px] tracking-[0.16em] text-slate">相关案例</div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {active.cases.map((c) => (
                  <Link key={c} to={`/case/${c}`} className="chip !bg-white hover:!border-ink/30">
                    {cases.find((x) => x.id === c)?.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-3 border-t border-line/70 pt-2.5">
            <div className="text-[9.5px] tracking-[0.16em] text-slate">上下游</div>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-ink/70">
              {edges
                .filter((e) => e.from === active.id)
                .map((e, i) => (
                  <button key={i} onClick={() => setSel(e.to)} className="hover:text-ink">
                    下游 · {nodes.find((n) => n.id === e.to)?.label} →
                  </button>
                ))}
              {edges
                .filter((e) => e.to === active.id)
                .map((e, i) => (
                  <button key={i} onClick={() => setSel(e.from)} className="hover:text-ink">
                    ← 上游 · {nodes.find((n) => n.id === e.from)?.label}
                  </button>
                ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
