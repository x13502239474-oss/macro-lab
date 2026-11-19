import { useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { LabHead, LabNote, Panel, Slider, Stat } from './ui'

const G0 = 28
const T0 = 0.25
const Y0 = 100

function debtPath(g: number, t: number, mpc: number, r: number, growth: number, b0: number) {
  const m = 1 / (1 - mpc * (1 - t))
  const dY = m * (g - G0 - mpc * (t - T0) * Y0)
  const Y = Y0 + dY
  const deficitRate = ((g - t * Y) / Y) * 100
  const out: { t: number; b: number }[] = []
  let b = b0
  for (let i = 0; i <= 20; i++) {
    out.push({ t: i, b: Number(b.toFixed(1)) })
    b = ((1 + r / 100 - growth / 100) / (1 + growth / 100)) * b + deficitRate
  }
  return out
}

export default function FiscalLab() {
  const [g, setG] = useState(G0)
  const [t, setT] = useState(T0)
  const [mpc, setMpc] = useState(0.8)
  const [r, setR] = useState(3)
  const [growth, setGrowth] = useState(5)
  const [b0, setB0] = useState(60)

  const m = 1 / (1 - mpc * (1 - t))
  const dY = m * (g - G0 - mpc * (t - T0) * Y0)
  const Y = Y0 + dY
  const revenue = t * Y
  const deficit = g - revenue
  const deficitRate = (deficit / Y) * 100

  const path = useMemo(() => {
    const cur = debtPath(g, t, mpc, r, growth, b0)
    const base = debtPath(G0, T0, mpc, r, growth, b0)
    return cur.map((d, i) => ({ t: d.t, cur: d.b, base: base[i].b }))
  }, [g, t, mpc, r, growth, b0])

  return (
    <div>
      <LabHead
        no="EXPERIMENT 05"
        title="财政政策模拟器"
        sub="调整政府支出与税率，观察乘数、产出、赤字与债务路径的变化。"
        formula="ΔY = m×ΔG − MPC×m×ΔT；m = 1 / [1 − MPC(1−t)]"
      />

      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1.1fr]">
        <Panel title="参数（GDP 基准 = 100）">
          <div className="space-y-4">
            <Slider label="政府购买 G" value={g} min={15} max={45} step={0.5} onChange={setG} hint="基准 28" />
            <Slider label="税率 t" value={t} min={0.1} max={0.45} step={0.01} onChange={setT} hint="基准 0.25" />
            <Slider label="边际消费倾向 MPC" value={mpc} min={0.5} max={0.95} step={0.05} onChange={setMpc} />
            <Slider label="名义利率 r" value={r} min={0} max={8} step={0.5} unit="%" onChange={setR} />
            <Slider label="名义增长率 g" value={growth} min={0} max={10} step={0.5} unit="%" onChange={setGrowth} />
            <Slider label="初始债务率 b₀" value={b0} min={20} max={150} step={5} unit="%" onChange={setB0} />
          </div>
        </Panel>

        <div className="grid grid-cols-2 gap-2.5">
          <Stat label="政府购买乘数 m" value={m.toFixed(2)} tone="gold" />
          <Stat label="产出 Y" value={Y.toFixed(1)} delta={`${dY >= 0 ? '+' : ''}${dY.toFixed(1)} 相对基准`} />
          <Stat label="赤字（或盈余）" value={deficit.toFixed(1)} delta={deficit >= 0 ? '赤字' : '盈余'} tone={deficit > 0 ? 'up' : 'down'} />
          <Stat label="赤字率" value={deficitRate.toFixed(1)} unit="%" />
          <Stat label="20 年后债务率" value={path[20].cur.toFixed(0)} unit="%" />
          <Stat label="利息—增长差" value={(r - growth).toFixed(1)} unit="pct" delta={r - growth > 0 ? '债务率趋于上升' : '债务率趋于下降'} tone={r - growth > 0 ? 'up' : 'down'} />
        </div>
      </div>

      <Panel title="债务/GDP 路径（20 年）" right={<span className="text-[9.5px] text-slate">虚线为基准情形</span>}>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={path} margin={{ top: 8, right: 14, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="#EDE9E0" strokeDasharray="3 4" vertical={false} />
              <XAxis dataKey="t" tick={{ fontSize: 9, fill: '#5D7185' }} axisLine={false} tickLine={false} unit="年" />
              <YAxis tick={{ fontSize: 9, fill: '#5D7185' }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip labelFormatter={(v) => `第 ${v} 年`} formatter={(v: number, k) => [`${v}%`, k === 'cur' ? '当前设定' : '基准情形']} contentStyle={{ borderRadius: 10, border: '1px solid #E2DDD3', fontSize: 11 }} />
              <ReferenceLine y={b0} stroke="#B9B2A5" strokeDasharray="3 4" />
              <Line type="monotone" dataKey="cur" stroke="#0E2136" strokeWidth={2} dot={false} name="当前" />
              <Line type="monotone" dataKey="base" stroke="#A98753" strokeWidth={1.6} strokeDasharray="5 4" dot={false} name="基准" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 space-y-1 text-[11px] leading-relaxed text-ink/70">
          <p>
            税率提高到 <span className="num">{(t * 100).toFixed(0)}%</span> 时，乘数从 <span className="num">{m.toFixed(2)}</span> 变化——
            这就是自动稳定器：税制让乘数变小、波动变缓。
          </p>
          <p>
            当 r {r > growth ? '>' : '<'} g 时，债务率 {r > growth ? '即使基本赤字不变也会上升' : '可以靠增长自然下降'}。
          </p>
        </div>
      </Panel>

      <LabNote>
        模型不含挤出效应、李嘉图等价、利率对赤字的反馈与主权风险溢价；债务率路径假设利率与增长率外生不变。真实财政评估需要世代核算与情景分析，不能只看单一路径。
      </LabNote>
    </div>
  )
}
