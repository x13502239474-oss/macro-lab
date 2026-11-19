export interface Indicator {
  key: string
  label: string
  en: string
  value: string
  unit: string
  delta?: string
  dir?: 'up' | 'down' | 'flat'
  note: string
  spark: number[]
}

/** 首页指标：全部为公开年度统计的教学整理值，非实时行情 */
export const indicators: Indicator[] = [
  {
    key: 'gdp',
    label: '国内生产总值',
    en: 'GDP',
    value: '126.1',
    unit: '万亿元',
    delta: '实际 +5.2%',
    dir: 'up',
    note: '2023 年，现价，国家统计局',
    spark: [64.4, 68.9, 74.4, 82.1, 91.9, 98.7, 101.4, 114.4, 121.0, 126.1],
  },
  {
    key: 'growth',
    label: 'GDP 增长率',
    en: 'Real Growth',
    value: '5.2',
    unit: '%',
    delta: '较 2022 +2.2pct',
    dir: 'up',
    note: '2023 年，不变价同比',
    spark: [7.4, 7.0, 6.8, 6.9, 6.7, 6.0, 2.2, 8.4, 3.0, 5.2],
  },
  {
    key: 'cpi',
    label: '居民消费价格指数',
    en: 'CPI',
    value: '100.2',
    unit: '上年=100',
    delta: '温和',
    dir: 'flat',
    note: '2023 年，国家统计局',
    spark: [102.0, 101.4, 102.0, 101.6, 102.1, 102.9, 102.5, 100.9, 102.0, 100.2],
  },
  {
    key: 'inflation',
    label: '通货膨胀率',
    en: 'Inflation',
    value: '0.2',
    unit: '%',
    delta: '低于目标',
    dir: 'down',
    note: '2023 年 CPI 同比',
    spark: [2.0, 1.4, 2.0, 1.6, 2.1, 2.9, 2.5, 0.9, 2.0, 0.2],
  },
  {
    key: 'unemp',
    label: '城镇调查失业率',
    en: 'Unemployment',
    value: '5.2',
    unit: '%',
    delta: '接近自然率',
    dir: 'flat',
    note: '2023 年平均值，16 岁以上城镇常住人口',
    spark: [4.9, 5.2, 5.6, 5.1, 5.6, 5.2],
  },
  {
    key: 'rate',
    label: '政策利率（1Y LPR）',
    en: 'Policy Rate',
    value: '3.45',
    unit: '%',
    delta: '−70bp（2019 以来）',
    dir: 'down',
    note: '2023 年末，中国人民银行',
    spark: [4.15, 3.85, 3.8, 3.65, 3.45],
  },
  {
    key: 'm2',
    label: '货币供应量',
    en: 'M2',
    value: '292.3',
    unit: '万亿元',
    delta: '同比 +9.7%',
    dir: 'up',
    note: '2023 年末余额，中国人民银行',
    spark: [122.8, 139.2, 155.0, 167.7, 182.7, 198.6, 218.7, 238.3, 266.4, 292.3],
  },
  {
    key: 'fx',
    label: '人民币汇率',
    en: 'USD/CNY',
    value: '7.08',
    unit: '元/美元',
    delta: '年均贬值 4.6%',
    dir: 'up',
    note: '2023 年平均汇率，国家外汇管理局',
    spark: [6.14, 6.23, 6.64, 6.75, 6.62, 6.9, 6.9, 6.45, 6.73, 7.08],
  },
]

export function Spark({ data, tone = '#0E2136' }: { data: number[]; tone?: string }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * 100},${28 - ((v - min) / span) * 24}`)
    .join(' ')
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-8 w-full">
      <polyline points={pts} fill="none" stroke={tone} strokeWidth="1.4" vectorEffect="non-scaling-stroke" opacity="0.75" />
      <polyline points={`0,30 ${pts} 100,30`} fill={tone} opacity="0.06" stroke="none" />
    </svg>
  )
}
