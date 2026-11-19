import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { LabHead, LabNote, Panel, Slider, Stat } from './ui'

const R_STAR = 2

export default function MoneyLab() {
  const [r, setR] = useState(3.5)
  const [demand, setDemand] = useState(0)
  const [supply, setSupply] = useState(0)

  const gap = -1.2 * (r - R_STAR) + demand
  const inflation = 2 + 0.6 * gap + supply
  const growth = 5 + gap
  const invest = -3.5 * (r - R_STAR)
  const consume = -0.9 * (r - R_STAR)
  const unemp = 5 - 0.5 * gap

  const curve = useMemo(
    () =>
      Array.from({ length: 21 }, (_, i) => {
        const rr = i * 0.5
        const gp = -1.2 * (rr - R_STAR) + demand
        return { r: rr, gap: Number(gp.toFixed(2)), pi: Number((2 + 0.6 * gp + supply).toFixed(2)) }
      }),
    [demand, supply],
  )

  const bars = [
    { name: '消费', v: Number(consume.toFixed(2)) },
    { name: '投资', v: Number(invest.toFixed(2)) },
    { name: '产出缺口', v: Number(gap.toFixed(2)) },
    { name: '通胀变化', v: Number((inflation - 2).toFixed(2)) },
  ]

  return (
    <div>
      <LabHead
        no="EXPERIMENT 04"
        title="货币政策模拟器"
        sub="调整政策利率与冲击项，观察消费、投资、产出缺口与通胀在简化模型中的联动。"
        formula="产出缺口 = −1.2×(r − r*) + 需求冲击；π = 2 + 0.6×缺口 + 供给冲击"
      />

      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1.1fr]">
        <Panel title="参数">
          <div className="space-y-4">
            <Slider label="政策利率 r" value={r} min={0} max={10} step={0.25} unit="%" onChange={setR} hint="中性利率假设为 2%" />
            <Slider label="需求冲击" value={demand} min={-4} max={4} step={0.5} unit="pct" onChange={setDemand} hint="财政扩张、信心变化等" />
            <Slider label="供给冲击" value={supply} min={-4} max={4} step={0.5} unit="pct" onChange={setSupply} hint="油价、供应链、进口价格" />
          </div>
          <div className="mt-4 rounded-lg bg-[#FBFAF6] px-3 py-2.5 text-[11px] leading-relaxed text-ink/70">
            当前设定下，利率比中性水平{r > R_STAR ? '高' : r < R_STAR ? '低' : '持平'} {Math.abs(r - R_STAR).toFixed(2)} 个百分点，
            产出缺口为 <span className="num">{gap.toFixed(1)}%</span>。
          </div>
        </Panel>

        <div>
          <div className="grid grid-cols-2 gap-2.5">
            <Stat label="消费变化" value={`${consume >= 0 ? '+' : ''}${consume.toFixed(1)}`} unit="%" tone={consume >= 0 ? 'up' : 'down'} />
            <Stat label="投资变化" value={`${invest >= 0 ? '+' : ''}${invest.toFixed(1)}`} unit="%" tone={invest >= 0 ? 'up' : 'down'} />
            <Stat label="通货膨胀率" value={inflation.toFixed(2)} unit="%" tone={inflation > 3 ? 'up' : inflation < 1 ? 'down' : 'ink'} />
            <Stat label="实际增长" value={growth.toFixed(2)} unit="%" />
            <Stat label="产出缺口" value={`${gap >= 0 ? '+' : ''}${gap.toFixed(2)}`} unit="%" tone={gap >= 0 ? 'up' : 'down'} />
            <Stat label="失业率（奥肯）" value={unemp.toFixed(1)} unit="%" delta="自然率 5%" />
          </div>
        </div>
      </div>

      <Panel title="利率—通胀曲线（给定冲击）">
        <div className="h-[210px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={curve} margin={{ top: 8, right: 14, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="#EDE9E0" strokeDasharray="3 4" vertical={false} />
              <XAxis dataKey="r" tick={{ fontSize: 9, fill: '#5D7185' }} axisLine={false} tickLine={false} unit="%" />
              <YAxis tick={{ fontSize: 9, fill: '#5D7185' }} axisLine={false} tickLine={false} />
              <Tooltip labelFormatter={(v) => `政策利率 ${v}%`} formatter={(v: number, k) => [v, k === 'pi' ? '通胀率' : '产出缺口']} contentStyle={{ borderRadius: 10, border: '1px solid #E2DDD3', fontSize: 11 }} />
              <ReferenceLine x={r} stroke="#A98753" strokeDasharray="4 4" />
              <ReferenceLine y={2} stroke="#B9B2A5" strokeDasharray="3 4" label={{ value: '通胀目标 2%', fontSize: 8, fill: '#5D7185', position: 'insideBottomRight' }} />
              <Line type="monotone" dataKey="pi" stroke="#B4462F" strokeWidth={2} dot={false} name="通胀" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="相对基准的偏离（百分点）">
        <div className="h-[170px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bars} margin={{ top: 6, right: 10, left: -14, bottom: 0 }}>
              <CartesianGrid stroke="#EDE9E0" strokeDasharray="3 4" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 9.5, fill: '#5D7185' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#5D7185' }} axisLine={false} tickLine={false} />
              <ReferenceLine y={0} stroke="#B9B2A5" />
              <Tooltip formatter={(v: number) => [`${v}`, '相对基准']} contentStyle={{ borderRadius: 10, border: '1px solid #E2DDD3', fontSize: 11 }} />
              <Bar dataKey="v" radius={[3, 3, 0, 0]} maxBarSize={34}>
                {bars.map((b) => (
                  <Cell key={b.name} fill={b.v >= 0 ? '#B4462F' : '#2E6B54'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <LabNote>
        这是高度简化的教学模型：系数（−1.2、0.6）是人为设定，不含预期、时滞、金融摩擦与开放部门。模型里的数值变化不是经济预测，也不能用于投资决策。现实中货币政策传导需要 3—6 个季度，且可能因惜贷或资产负债表问题而失效。
      </LabNote>
    </div>
  )
}
