import { useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { LabHead, LabNote, Panel, Slider, Stat } from './ui'

export default function GrowthLab() {
  const [s, setS] = useState(0.25)
  const [n, setN] = useState(0.01)
  const [g, setG] = useState(0.02)
  const [d, setD] = useState(0.05)
  const [alpha, setAlpha] = useState(0.35)
  const [A, setA] = useState(1)
  const [k0, setK0] = useState(3)

  const model = useMemo(() => {
    const denom = d + n + g
    const kStar = Math.pow((s * A) / denom, 1 / (1 - alpha))
    const yStar = A * Math.pow(kStar, alpha)
    const cStar = (1 - s) * yStar
    const kGold = Math.pow((alpha * A) / denom, 1 / (1 - alpha))
    const cGold = A * Math.pow(kGold, alpha) - denom * kGold

    let k = k0
    const path: { t: number; y: number; k: number; gr: number }[] = []
    let converge = 60
    for (let t = 0; t <= 60; t++) {
      const y = A * Math.pow(k, alpha)
      const prevY = t > 0 ? path[t - 1].y : y
      path.push({ t, y: Number(y.toFixed(2)), k: Number(k.toFixed(2)), gr: t > 0 ? Number((((y - prevY) / prevY) * 100).toFixed(2)) : 0 })
      if (Math.abs(k - kStar) <= 0.05 * kStar && converge === 60) converge = t
      k = k + s * A * Math.pow(k, alpha) - denom * k
    }
    return { kStar, yStar, cStar, kGold, cGold, path, converge }
  }, [s, n, g, d, alpha, A, k0])

  return (
    <div>
      <LabHead
        no="EXPERIMENT 03"
        title="经济增长模拟器"
        sub="用索洛模型调整储蓄率、人口增长率与技术进步率，观察人均资本与产出的长期路径。"
        formula="Δk = s·A·k^α − (δ+n+g)·k"
      />

      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1.1fr]">
        <Panel title="参数">
          <div className="space-y-3.5">
            <Slider label="储蓄率 s" value={s} min={0.05} max={0.5} step={0.01} onChange={setS} hint="中国长期在 0.4 以上，美国约 0.18" />
            <Slider label="人口增长率 n" value={n} min={-0.01} max={0.04} step={0.005} onChange={setN} />
            <Slider label="技术进步率 g" value={g} min={0} max={0.05} step={0.005} onChange={setG} />
            <Slider label="折旧率 δ" value={d} min={0.02} max={0.1} step={0.005} onChange={setD} />
            <Slider label="资本份额 α" value={alpha} min={0.2} max={0.6} step={0.05} onChange={setAlpha} />
            <Slider label="技术水平 A" value={A} min={0.6} max={1.6} step={0.05} onChange={setA} />
            <Slider label="初始人均资本 k₀" value={k0} min={1} max={20} step={0.5} onChange={setK0} hint="低于 k* 时经济向上积累" />
          </div>
        </Panel>

        <div>
          <div className="grid grid-cols-2 gap-2.5">
            <Stat label="稳态人均资本 k*" value={model.kStar.toFixed(1)} />
            <Stat label="稳态人均产出 y*" value={model.yStar.toFixed(2)} />
            <Stat label="稳态人均消费 c*" value={model.cStar.toFixed(2)} tone="gold" />
            <Stat label="达到 95% 稳态" value={model.converge >= 60 ? '>60' : model.converge} unit="年" delta={k0 < model.kStar ? '由下向上收敛' : k0 > model.kStar ? '由上向下收敛' : '已在稳态'} />
          </div>
          <div className="card mt-3 p-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="eyebrow">GOLDEN RULE</span>
              <span className="text-[9.5px] text-slate">黄金律</span>
            </div>
            <p className="text-[11px] leading-relaxed text-ink/70">
              使稳态人均消费最大的储蓄率约为 <span className="num text-ink">{alpha.toFixed(2)}</span>（= α），对应人均资本{' '}
              <span className="num">{model.kGold.toFixed(1)}</span>、人均消费 <span className="num">{model.cGold.toFixed(2)}</span>。
              当前储蓄率 {s.toFixed(2)} {s > alpha ? '高于' : '低于'}黄金律水平。
            </p>
          </div>
        </div>
      </div>

      <Panel title="人均产出路径（60 年）" right={<span className="text-[9.5px] text-slate">纵轴：产出 y</span>}>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={model.path} margin={{ top: 8, right: 14, left: -8, bottom: 0 }}>
              <CartesianGrid stroke="#EDE9E0" strokeDasharray="3 4" vertical={false} />
              <XAxis dataKey="t" tick={{ fontSize: 9, fill: '#5D7185' }} axisLine={false} tickLine={false} unit="年" />
              <YAxis tick={{ fontSize: 9, fill: '#5D7185' }} axisLine={false} tickLine={false} domain={[0, 'auto']} />
              <Tooltip labelFormatter={(v) => `第 ${v} 年`} formatter={(v: number, k) => [v, k === 'y' ? '人均产出' : '人均资本']} contentStyle={{ borderRadius: 10, border: '1px solid #E2DDD3', fontSize: 11 }} />
              <ReferenceLine y={Number(model.yStar.toFixed(2))} stroke="#A98753" strokeDasharray="4 4" label={{ value: '稳态 y*', fontSize: 9, fill: '#A98753', position: 'insideTopRight' }} />
              <Line type="monotone" dataKey="y" stroke="#0E2136" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 grid gap-2 text-[11px] leading-relaxed text-ink/70 sm:grid-cols-2">
          <p>
            <span className="font-medium text-ink">短期：</span>
            前 10 年人均产出年均增长约{' '}
            <span className="num">{((model.path[10].y / model.path[0].y - 1) * 100 / 10).toFixed(2)}%</span>，资本积累是主引擎。
          </p>
          <p>
            <span className="font-medium text-ink">长期：</span>
            稳态后人均产出增长只等于技术进步率 g ={' '}
            <span className="num">{(g * 100).toFixed(1)}%</span>，继续堆资本不再有效。
          </p>
        </div>
      </Panel>

      <LabNote>
        索洛模型是长期分析工具，假设储蓄率外生、市场出清、技术外生。它不能预测短期波动，也不解释制度差异。中国近年的增速下台阶，可部分用资本边际报酬递减与人口增速下降解释，但制度与 TFP 变化同样重要。
      </LabNote>
    </div>
  )
}
