import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { LabHead, LabNote, Panel, Slider, Stat } from './ui'

const BASE = { c: 54, i: 42, g: 16, nx: 3.5 }
const COLORS = ['#0E2136', '#A98753', '#5D7185', '#2E6B54']

export default function GdpLab() {
  const [c, setC] = useState(BASE.c)
  const [i, setI] = useState(BASE.i)
  const [g, setG] = useState(BASE.g)
  const [nx, setNx] = useState(BASE.nx)

  const gdp = c + i + g + nx
  const baseGdp = BASE.c + BASE.i + BASE.g + BASE.nx
  const parts = useMemo(
    () => [
      { name: '消费 C', v: c, color: COLORS[0] },
      { name: '投资 I', v: i, color: COLORS[1] },
      { name: '政府购买 G', v: g, color: COLORS[2] },
      { name: '净出口 NX', v: nx, color: COLORS[3] },
    ],
    [c, i, g, nx],
  )

  return (
    <div>
      <LabHead
        no="EXPERIMENT 01"
        title="GDP 计算器"
        sub="调整四个支出分项，观察它们如何相加成 GDP，以及结构占比怎样变化。"
        formula="GDP = C + I + G + NX"
      />

      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1.05fr]">
        <Panel title="参数（万亿元）" right={<span className="text-[9.5px] text-slate">教学参数</span>}>
          <div className="space-y-4">
            <Slider label="居民消费 C" value={c} min={10} max={90} step={0.5} unit="万亿元" onChange={setC} hint="家庭购买的耐用品、非耐用品与服务" />
            <Slider label="企业投资 I" value={i} min={5} max={70} step={0.5} unit="万亿元" onChange={setI} hint="厂房、设备、存货与住宅投资" />
            <Slider label="政府购买 G" value={g} min={0} max={45} step={0.5} unit="万亿元" onChange={setG} hint="不含转移支付（养老金、低保不计入 G）" />
            <Slider label="净出口 NX" value={nx} min={-15} max={20} step={0.5} unit="万亿元" onChange={setNx} hint="出口减进口，可为负" />
          </div>
        </Panel>

        <div>
          <div className="grid grid-cols-2 gap-2.5">
            <Stat label="GDP" value={gdp.toFixed(1)} unit="万亿元" delta={`较基准 ${gdp - baseGdp >= 0 ? '+' : ''}${(gdp - baseGdp).toFixed(1)}`} />
            <Stat label="消费占比" value={((c / gdp) * 100).toFixed(1)} unit="%" tone="gold" />
            <Stat label="投资占比" value={((i / gdp) * 100).toFixed(1)} unit="%" />
            <Stat label="净出口占比" value={((nx / gdp) * 100).toFixed(1)} unit="%" tone={nx < 0 ? 'up' : 'down'} />
          </div>

          <div className="card mt-3 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="eyebrow">STRUCTURE</span>
              <span className="text-[9.5px] text-slate">按支出法</span>
            </div>
            <div className="flex h-3 w-full overflow-hidden rounded-full">
              {parts.map((p) => (
                <div key={p.name} style={{ width: `${(Math.max(p.v, 0) / gdp) * 100}%`, background: p.color }} />
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
              {parts.map((p) => (
                <span key={p.name} className="inline-flex items-center gap-1 text-[9.5px] text-slate">
                  <i className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />
                  {p.name} {((p.v / gdp) * 100).toFixed(1)}%
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Panel title="分项规模对比">
        <div className="h-[210px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={parts} layout="vertical" margin={{ left: 4, right: 18, top: 4, bottom: 4 }}>
              <CartesianGrid stroke="#EDE9E0" strokeDasharray="3 4" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#5D7185' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={78} tick={{ fontSize: 10, fill: '#0E2136' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => [`${v} 万亿元`, '规模']} contentStyle={{ borderRadius: 10, border: '1px solid #E2DDD3', fontSize: 11 }} />
              <Bar dataKey="v" radius={[0, 3, 3, 0]} maxBarSize={22}>
                {parts.map((p, idx) => (
                  <Cell key={p.name} fill={COLORS[idx]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 rounded-lg bg-[#FBFAF6] px-3 py-2.5 text-[11px] leading-relaxed text-ink/70">
          每增加 1 万亿元消费，GDP 直接增加 1 万亿元；但若这 1 万亿元来自政府支出对私人投资的替代，净效应可能小于 1 万亿元（挤出效应，见第 5-11 课）。
        </div>
      </Panel>

      <LabNote>
        这是一个核算恒等式的演示，不含行为反应与乘数。真实 GDP 还受进口漏出、税收、价格变化影响；图中参数为教学设定，不对应任何年份的官方支出法数据。
      </LabNote>
    </div>
  )
}
