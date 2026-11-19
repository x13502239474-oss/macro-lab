import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { LabHead, LabNote, Panel, Slider, Stat } from './ui'

interface Row {
  name: string
  w: number
  p0: number
  p1: number
}

const INIT: Row[] = [
  { name: '食品烟酒', w: 30, p0: 100, p1: 110 },
  { name: '居住', w: 24, p0: 100, p1: 103 },
  { name: '交通通信', w: 14, p0: 100, p1: 98 },
  { name: '教育文娱', w: 14, p0: 100, p1: 105 },
  { name: '医疗保健', w: 9, p0: 100, p1: 102 },
  { name: '其他', w: 9, p0: 100, p1: 101 },
]

export default function CpiLab() {
  const [rows, setRows] = useState<Row[]>(INIT)
  const totalW = rows.reduce((s, r) => s + r.w, 0)
  const basket0 = rows.reduce((s, r) => s + r.w * r.p0, 0)
  const basket1 = rows.reduce((s, r) => s + r.w * r.p1, 0)
  const cpi = (basket1 / basket0) * 100
  const infl = cpi - 100

  const contrib = useMemo(
    () => rows.map((r) => ({ name: r.name, v: ((r.w * (r.p1 - r.p0)) / basket0) * 100 })),
    [rows, basket0],
  )

  const update = (idx: number, key: 'w' | 'p1', v: number) => {
    setRows((rs) => rs.map((r, i) => (i === idx ? { ...r, [key]: v } : r)))
  }

  return (
    <div>
      <LabHead
        no="EXPERIMENT 02"
        title="通货膨胀模拟器"
        sub="给每个商品类别设定权重与价格变化，看它们怎样合成 CPI 与通胀率。"
        formula="CPI = Σ(wᵢ·Pᵢ¹) / Σ(wᵢ·Pᵢ⁰) × 100"
      />

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <Stat label="CPI（基期=100）" value={cpi.toFixed(1)} />
        <Stat label="通货膨胀率" value={infl.toFixed(2)} unit="%" tone={infl >= 0 ? 'up' : 'down'} />
        <Stat label="100 元的购买力" value={(100 / (cpi / 100)).toFixed(1)} unit="元" delta="一年后等值" />
      </div>

      <Panel title="商品篮子（价格指数，基期=100）" right={<span className="text-[9.5px] text-slate">权重合计 {totalW}</span>}>
        <div className="space-y-4">
          {rows.map((r, i) => (
            <div key={r.name} className="rounded-lg border border-line/70 px-3 py-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] font-medium">{r.name}</span>
                <span className={`num text-[11px] ${r.p1 - r.p0 > 0 ? 'text-up' : r.p1 - r.p0 < 0 ? 'text-down' : 'text-slate'}`}>
                  {r.p1 - r.p0 > 0 ? '+' : ''}
                  {(((r.p1 - r.p0) / r.p0) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
                <Slider label="权重" value={r.w} min={0} max={50} step={1} unit="%" onChange={(v) => update(i, 'w', v)} />
                <Slider label="当期价格" value={r.p1} min={80} max={140} step={1} unit="指数" onChange={(v) => update(i, 'p1', v)} />
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="各分项对 CPI 的贡献（百分点）">
        <div className="h-[190px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={contrib} margin={{ top: 6, right: 10, left: -12, bottom: 0 }}>
              <CartesianGrid stroke="#EDE9E0" strokeDasharray="3 4" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#5D7185' }} interval={0} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#5D7185' }} axisLine={false} tickLine={false} />
              <ReferenceLine y={0} stroke="#B9B2A5" />
              <Tooltip formatter={(v: number) => [`${v.toFixed(2)} 个百分点`, '贡献']} contentStyle={{ borderRadius: 10, border: '1px solid #E2DDD3', fontSize: 11 }} />
              <Bar dataKey="v" radius={[3, 3, 0, 0]} maxBarSize={26}>
                {contrib.map((d) => (
                  <Cell key={d.name} fill={d.v >= 0 ? '#B4462F' : '#2E6B54'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-ink/70">
          <p>降低食品权重、提高交通权重，你会发现同样的涨价幅度对 CPI 的影响完全不同——这就是「权重决定指数」。</p>
          <p>
            当前篮子成本：基期 <span className="num">{basket0.toFixed(0)}</span> → 当期 <span className="num">{basket1.toFixed(0)}</span>，涨幅{' '}
            <span className="num">{infl.toFixed(2)}%</span>。
          </p>
        </div>
      </Panel>

      <LabNote>
        权重参照中国 CPI 八大类结构做了简化，并非官方权重；国家统计局按居民消费支出调查确定权重并定期调整。本实验只演示固定篮子指数，不含替代偏差与质量调整。
      </LabNote>
    </div>
  )
}
