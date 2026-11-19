import { useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { LabHead, LabNote, Panel, Slider, Stat } from './ui'

export default function UnempLab() {
  const [pop, setPop] = useState(10000)
  const [emp, setEmp] = useState(7400)
  const [une, setUne] = useState(400)
  const [sep, setSep] = useState(1.5)
  const [find, setFind] = useState(25)

  const e = Math.min(emp, pop)
  const u = Math.min(une, pop - e)
  const nonLabor = Math.max(0, pop - e - u)
  const labor = e + u
  const rate = labor > 0 ? (u / labor) * 100 : 0
  const part = pop > 0 ? (labor / pop) * 100 : 0
  const empRatio = pop > 0 ? (e / pop) * 100 : 0

  const steady = sep / (sep + find)
  const path = useMemo(() => {
    const out: { m: number; u: number }[] = []
    let cur = labor > 0 ? u / labor : steady
    for (let i = 0; i <= 24; i++) {
      out.push({ m: i, u: Number((cur * 100).toFixed(2)) })
      cur = cur + (sep / 100) * (1 - cur) - (find / 100) * cur
    }
    return out
  }, [sep, find, u, labor, steady])

  return (
    <div>
      <LabHead
        no="EXPERIMENT 06"
        title="失业率模拟器"
        sub="先看存量：谁在劳动力里；再看流量：离职率与再就业率如何决定长期失业水平。"
        formula="u = U/(E+U)；稳态 u* = s/(s+f)"
      />

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <Stat label="失业率" value={rate.toFixed(1)} unit="%" tone={rate > 6 ? 'up' : 'ink'} />
        <Stat label="劳动参与率" value={part.toFixed(1)} unit="%" />
        <Stat label="就业人口比" value={empRatio.toFixed(1)} unit="%" />
        <Stat label="非劳动力" value={nonLabor.toLocaleString()} unit="万人" />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Panel title="存量：劳动力分类">
          <div className="space-y-3.5">
            <Slider label="成年人口" value={pop} min={8000} max={12000} step={100} unit="万人" onChange={setPop} />
            <Slider label="就业人数 E" value={e} min={3000} max={9000} step={50} unit="万人" onChange={setEmp} />
            <Slider label="失业人数 U" value={u} min={0} max={1500} step={10} unit="万人" onChange={setUne} />
          </div>
          <div className="mt-3 flex h-4 w-full overflow-hidden rounded-full bg-line">
            <div className="bg-ink" style={{ width: `${(e / pop) * 100}%` }} />
            <div className="bg-up" style={{ width: `${(u / pop) * 100}%` }} />
            <div className="bg-[#D9D2C4]" style={{ width: `${(nonLabor / pop) * 100}%` }} />
          </div>
          <div className="mt-2 flex flex-wrap gap-3 text-[9.5px] text-slate">
            <span className="inline-flex items-center gap-1"><i className="h-1.5 w-1.5 rounded-full bg-ink" />就业 {e}</span>
            <span className="inline-flex items-center gap-1"><i className="h-1.5 w-1.5 rounded-full bg-up" />失业 {u}</span>
            <span className="inline-flex items-center gap-1"><i className="h-1.5 w-1.5 rounded-full bg-[#D9D2C4]" />非劳动力 {nonLabor}</span>
          </div>
          <p className="mt-2 text-[10.5px] leading-relaxed text-slate">
            注意：失业人数不变、就业人数减少时，若减少的人退出劳动力，失业率反而可能下降——这就是「沮丧工人效应」。
          </p>
        </Panel>

        <Panel title="流量：离职与再就业">
          <div className="space-y-3.5">
            <Slider label="月离职率 s" value={sep} min={0.2} max={5} step={0.1} unit="%" onChange={setSep} />
            <Slider label="月再就业率 f" value={find} min={2} max={60} step={1} unit="%" onChange={setFind} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-[#FBFAF6] px-2.5 py-2">
              <div className="text-[9.5px] text-slate">稳态失业率 u*</div>
              <div className="num text-[17px]">{(steady * 100).toFixed(1)}%</div>
            </div>
            <div className="rounded-lg bg-[#FBFAF6] px-2.5 py-2">
              <div className="text-[9.5px] text-slate">平均失业时长</div>
              <div className="num text-[17px]">{(100 / find).toFixed(1)} 月</div>
            </div>
          </div>
          <div className="mt-2 h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={path} margin={{ top: 8, right: 10, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="#EDE9E0" strokeDasharray="3 4" vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 8.5, fill: '#5D7185' }} axisLine={false} tickLine={false} unit="月" />
                <YAxis tick={{ fontSize: 8.5, fill: '#5D7185' }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip labelFormatter={(v) => `第 ${v} 个月`} formatter={(v: number) => [`${v}%`, '失业率']} contentStyle={{ borderRadius: 10, border: '1px solid #E2DDD3', fontSize: 11 }} />
                <ReferenceLine y={Number((steady * 100).toFixed(2))} stroke="#A98753" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="u" stroke="#0E2136" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <LabNote>
        存量数据为教学示例，不对应任何年份的官方统计。流量模型假设离职率与再就业率外生不变，忽略了周期波动、劳动力退出与技能错配。真实失业率由存量与流量共同决定，需结合调查口径解读。
      </LabNote>
    </div>
  )
}
