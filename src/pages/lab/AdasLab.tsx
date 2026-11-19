import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { LabHead, LabNote, Panel, Slider, Stat } from './ui'

export default function AdasLab() {
  const [demand, setDemand] = useState(0)
  const [supply, setSupply] = useState(0)

  const model = useMemo(() => {
    const x = (demand / 2 - supply) / (0.5 + 1 / 1.5)
    const y = 100 + x
    const p = 100 + supply + x / 1.5
    const data = Array.from({ length: 13 }, (_, i) => {
      const Y = 70 + i * 5
      return {
        Y,
        ad: Number((100 + (demand - (Y - 100)) / 2).toFixed(2)),
        sras: Number((100 + supply + (Y - 100) / 1.5).toFixed(2)),
      }
    })
    return { y, p, data, gap: x, inflation: p - 100, unemp: 5 - 0.5 * x }
  }, [demand, supply])

  const preset = (d: number, s: number) => {
    setDemand(d)
    setSupply(s)
  }

  return (
    <div>
      <LabHead
        no="EXPERIMENT 08"
        title="总需求—总供给模拟器"
        sub="移动 AD 与 SRAS，观察短期均衡如何偏离潜在产出，以及需求冲击与供给冲击的不同后果。"
        formula="AD: P = 100 + (冲击 − (Y−100))/2；SRAS: P = 100 + 供给冲击 + (Y−100)/1.5"
      />

      <div className="mt-4 flex flex-wrap gap-2">
        {[
          { l: '基准', d: 0, s: 0 },
          { l: '需求扩张', d: 8, s: 0 },
          { l: '需求萎缩', d: -8, s: 0 },
          { l: '供给冲击（滞胀）', d: 0, s: 6 },
          { l: '双冲击', d: -6, s: 5 },
        ].map((x) => (
          <button
            key={x.l}
            onClick={() => preset(x.d, x.s)}
            className={`rounded-full border px-3 py-1.5 text-[11px] transition ${
              demand === x.d && supply === x.s ? 'border-ink bg-ink text-white' : 'border-line bg-white text-slate hover:border-ink/30'
            }`}
          >
            {x.l}
          </button>
        ))}
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-4">
        <Stat label="均衡产出 Y" value={model.y.toFixed(1)} delta={`潜在产出 100`} tone={model.gap < 0 ? 'down' : model.gap > 0 ? 'up' : 'ink'} />
        <Stat label="均衡价格 P" value={model.p.toFixed(1)} />
        <Stat label="产出缺口" value={`${model.gap >= 0 ? '+' : ''}${model.gap.toFixed(1)}`} unit="%" tone={model.gap >= 0 ? 'up' : 'down'} />
        <Stat label="通胀率（较基准）" value={`${model.inflation >= 0 ? '+' : ''}${model.inflation.toFixed(1)}`} unit="%" tone={model.inflation > 0 ? 'up' : 'down'} />
      </div>

      <Panel title="AD—SRAS 均衡" right={<span className="text-[9.5px] text-slate">纵轴 P，横轴 Y</span>}>
        <div className="h-[290px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={model.data} margin={{ top: 10, right: 16, left: -14, bottom: 0 }}>
              <CartesianGrid stroke="#EDE9E0" strokeDasharray="3 4" />
              <XAxis dataKey="Y" type="number" domain={[70, 130]} tick={{ fontSize: 9, fill: '#5D7185' }} axisLine={false} tickLine={false} label={{ value: '产出 Y', fontSize: 9, fill: '#5D7185', position: 'insideBottomRight', offset: -2 }} />
              <YAxis domain={[70, 140]} tick={{ fontSize: 9, fill: '#5D7185' }} axisLine={false} tickLine={false} label={{ value: '价格 P', fontSize: 9, fill: '#5D7185', angle: -90, position: 'insideLeft' }} />
              <Tooltip labelFormatter={(v) => `产出 ${v}`} formatter={(v: number, k) => [v, k === 'ad' ? 'AD 价格' : 'SRAS 价格']} contentStyle={{ borderRadius: 10, border: '1px solid #E2DDD3', fontSize: 11 }} />
              <ReferenceLine x={100} stroke="#8A9AA8" strokeDasharray="4 4" label={{ value: 'LRAS / Y*=100', fontSize: 9, fill: '#5D7185', position: 'insideTopRight' }} />
              <Line type="monotone" dataKey="ad" stroke="#0E2136" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="sras" stroke="#A98753" strokeWidth={2} dot={false} />
              <ReferenceDot x={Number(model.y.toFixed(1))} y={Number(model.p.toFixed(1))} r={4.5} fill="#B4462F" stroke="#fff" strokeWidth={1.5} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate">
          <span className="inline-flex items-center gap-1"><i className="h-[2px] w-4 bg-ink" />AD</span>
          <span className="inline-flex items-center gap-1"><i className="h-[2px] w-4 bg-gold" />SRAS</span>
          <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-up" />短期均衡</span>
        </div>
      </Panel>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="card p-3.5">
          <div className="eyebrow">DEMAND SHOCK</div>
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink/75">
            需求右移：产出与物价同向上升，失业下降（奥肯：u ≈ {model.unemp.toFixed(1)}%）。这是典型的「过热」。
          </p>
        </div>
        <div className="card p-3.5">
          <div className="eyebrow">SUPPLY SHOCK</div>
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink/75">
            供给左移：产出下降、物价上升，即滞胀。此时降息会加剧通胀，加息会加深衰退——政策两难。
          </p>
        </div>
      </div>

      <LabNote>
        模型为线性简化：AD 斜率 −0.5、SRAS 斜率 1/1.5，均为教学设定。真实经济的斜率随闲置产能、预期与开放度变化；长期均衡会因预期调整回到 LRAS，模型未展示这一动态。
      </LabNote>
    </div>
  )
}
