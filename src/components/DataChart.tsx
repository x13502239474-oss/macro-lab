import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { charts } from '../content/charts'

const axis = { fontSize: 10, fill: '#5D7185' }

export function DataChart({ id, height = 230 }: { id: string; height?: number }) {
  const c = charts[id]
  if (!c) return null
  const numericX = typeof c.data[0]?.[c.x] === 'number'
  const common = (
    <>
      <CartesianGrid stroke="#EDE9E0" strokeDasharray="3 4" vertical={false} />
      <XAxis
        dataKey={c.x}
        tick={axis}
        tickLine={false}
        axisLine={{ stroke: '#E2DDD3' }}
        type={numericX ? 'number' : 'category'}
        domain={numericX ? ['dataMin', 'dataMax'] : undefined}
        tickFormatter={(v) => (typeof v === 'number' ? `${v}` : `${v}`)}
        minTickGap={8}
      />
      <YAxis tick={axis} tickLine={false} axisLine={false} width={38} />
      <Tooltip
        contentStyle={{ borderRadius: 10, border: '1px solid #E2DDD3', fontSize: 11, boxShadow: '0 8px 24px -16px rgba(14,33,54,.4)' }}
        labelFormatter={(v) => `${c.x === 'Y' ? '产出 Y' : c.x === 'u' ? '失业率' : ''}${v}${c.unit && c.x !== 'Y' && c.x !== 'u' ? ' ' + c.unit : ''}`}
        formatter={(v: number, n: string) => [`${v}${c.unit && c.x !== 'Y' ? ' ' + c.unit : ''}`, n]}
      />
    </>
  )

  const body = () => {
    if (c.kind === 'bar') {
      return (
        <BarChart data={c.data} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
          {common}
          <Bar dataKey={c.series[0].key} name={c.series[0].name} fill={c.series[0].color ?? '#0E2136'} radius={[3, 3, 0, 0]} maxBarSize={38} />
        </BarChart>
      )
    }
    if (c.kind === 'area') {
      return (
        <AreaChart data={c.data} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`g-${c.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c.series[0].color ?? '#5D7185'} stopOpacity={0.28} />
              <stop offset="100%" stopColor={c.series[0].color ?? '#5D7185'} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          {common}
          {c.refLine && <ReferenceLine y={c.refLine.y} stroke="#B08D57" strokeDasharray="3 4" label={{ value: c.refLine.label, fontSize: 9, fill: '#A98753', position: 'insideTopRight' }} />}
          <Area
            type="monotone"
            dataKey={c.series[0].key}
            name={c.series[0].name}
            stroke={c.series[0].color ?? '#5D7185'}
            strokeWidth={1.8}
            fill={`url(#g-${c.id})`}
          />
        </AreaChart>
      )
    }
    return (
      <ComposedChart data={c.data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
        {common}
        {c.refLine && <ReferenceLine y={c.refLine.y} stroke="#B08D57" strokeDasharray="3 4" label={{ value: c.refLine.label, fontSize: 9, fill: '#A98753', position: 'insideTopRight' }} />}
        {c.verticalX && (
          <ReferenceLine x={c.verticalX.x} stroke="#8A9AA8" strokeDasharray="4 4" label={{ value: c.verticalX.label, fontSize: 9, fill: '#5D7185', position: 'insideTop' }} />
        )}
        {c.series.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={s.color ?? '#0E2136'}
            strokeWidth={1.9}
            strokeDasharray={s.dash ? '5 4' : undefined}
            dot={{ r: 2.2, strokeWidth: 0, fill: s.color ?? '#0E2136' }}
            activeDot={{ r: 4 }}
          />
        ))}
      </ComposedChart>
    )
  }

  return (
    <figure className="card my-4 overflow-hidden">
      <div className="flex items-start justify-between gap-3 border-b border-line/80 px-3.5 pb-2 pt-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">FIGURE</div>
          <figcaption className="font-serif text-[13px] leading-snug text-ink">{c.title}</figcaption>
        </div>
        <span className="chip shrink-0">教学数据</span>
      </div>
      <div className="px-1 pt-2" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {body()}
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 pb-2">
        {c.series.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1 text-[10px] text-slate">
            <i className="inline-block h-[2px] w-4 rounded" style={{ background: s.color ?? '#0E2136' }} />
            {s.name}
          </span>
        ))}
        {c.verticalX && (
          <span className="inline-flex items-center gap-1 text-[10px] text-slate">
            <i className="inline-block h-[2px] w-4 rounded border-t border-dashed border-slate" />
            {c.verticalX.label}
          </span>
        )}
      </div>
      <div className="border-t border-line/70 bg-[#FBFAF6] px-3.5 py-2 text-[10px] leading-relaxed text-slate">
        数据来源与口径：{c.source}
        {c.note ? `。${c.note}` : ''}。图为教学整理，非实时行情。
      </div>
    </figure>
  )
}
