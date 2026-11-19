import { useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { LabHead, LabNote, Panel, Slider, Stat } from './ui'

/** 基期名义汇率：两国物价指数同为 100 时的汇率（元/美元） */
const E0 = 6.9

export default function FxLab() {
  const [e, setE] = useState(7.1)
  const [pCn, setPCn] = useState(110)
  const [pUs, setPUs] = useState(105)

  // 实际汇率指数：以基期为 100，（e/e0）×(P*/P)
  const eps = ((e / E0) * (pUs / pCn)) * 100
  // PPP 隐含汇率：两国物价指数之比乘以基期汇率
  const ppp = (E0 * pCn) / pUs

  const deviation = (e / ppp - 1) * 100

  const curve = useMemo(
    () =>
      Array.from({ length: 33 }, (_, i) => {
        const ee = 5 + i * 0.125
        return { e: Number(ee.toFixed(2)), eps: Number((((ee / E0) * (pUs / pCn)) * 100).toFixed(1)) }
      }),
    [pCn, pUs],
  )

  return (
    <div>
      <LabHead
        no="EXPERIMENT 07"
        title="汇率模拟器"
        sub="调整名义汇率与两国物价，理解名义汇率、实际汇率与购买力平价之间的关系。"
        formula="ε = (e/e₀) × (P*/P) × 100；PPP：ê = e₀ × P/P*"
      />

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <Stat label="实际汇率指数 ε" value={eps.toFixed(1)} delta={`基期=${E0} 元/美元时为 100`} tone="gold" />
        <Stat label="PPP 隐含汇率" value={ppp.toFixed(2)} unit="元/美元" />
        <Stat label="名义汇率偏离 PPP" value={`${deviation >= 0 ? '+' : ''}${deviation.toFixed(1)}`} unit="%" tone={deviation > 0 ? 'up' : 'down'} />
        <Stat label="1 元在中国的购买力" value={(1 / (pCn / 100)).toFixed(3)} delta="以基期篮子计" />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1.1fr]">
        <Panel title="参数">
          <div className="space-y-4">
            <Slider label="名义汇率 e（元/美元）" value={e} min={5} max={9} step={0.01} onChange={setE} hint="数值上升 = 人民币贬值" />
            <Slider label="中国价格水平 P" value={pCn} min={80} max={150} step={1} onChange={setPCn} hint="基期=100" />
            <Slider label="美国价格水平 P*" value={pUs} min={80} max={150} step={1} onChange={setPUs} hint="基期=100" />
          </div>
          <div className="mt-4 space-y-1.5 text-[11px] leading-relaxed text-ink/70">
            <p>
              物价指数：中国 <span className="num">{pCn}</span>、美国 <span className="num">{pUs}</span>（基期均为 100）。按基期汇率{' '}
              <span className="num">{E0.toFixed(2)}</span> 折算，PPP 隐含汇率为 <span className="num">{ppp.toFixed(2)}</span> 元/美元。
            </p>
            <p>
              {deviation > 0.5
                ? '名义汇率高于 PPP 水平，人民币相对购买力被低估（实际贬值），出口竞争力较强。'
                : deviation < -0.5
                  ? '名义汇率低于 PPP 水平，人民币相对购买力被高估（实际升值），出口竞争力较弱。'
                  : '名义汇率基本处于 PPP 水平，实际汇率接近基期。'}
            </p>
          </div>
        </Panel>

        <Panel title="实际汇率随名义汇率变化">
          <div className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={curve} margin={{ top: 8, right: 14, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="#EDE9E0" strokeDasharray="3 4" vertical={false} />
                <XAxis dataKey="e" tick={{ fontSize: 9, fill: '#5D7185' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#5D7185' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} tickFormatter={(v: number) => v.toFixed(0)} />
                <Tooltip labelFormatter={(v) => `名义汇率 ${v}`} formatter={(v: number) => [v, '实际汇率指数 ε']} contentStyle={{ borderRadius: 10, border: '1px solid #E2DDD3', fontSize: 11 }} />
                <ReferenceLine y={100} stroke="#B9B2A5" strokeDasharray="3 4" label={{ value: 'PPP：ε=100', fontSize: 8, fill: '#5D7185', position: 'insideTopRight' }} />
                <ReferenceLine x={Number(e.toFixed(2))} stroke="#A98753" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="eps" stroke="#0E2136" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-[10.5px] leading-relaxed text-slate">
            名义汇率与物价同比例变化时，实际汇率不变——这就是为什么「贬值 5%、物价涨 5%」等于没有贬值。
          </p>
        </Panel>
      </div>

      <LabNote>
        购买力平价假设一价定律成立、贸易自由、商品同质。现实中非贸易品、运输成本、关税、品牌溢价会使汇率长期偏离 PPP，短期偏离更大。本模型不含资本流动与利率差，不能用于汇率预测。
      </LabNote>
    </div>
  )
}
