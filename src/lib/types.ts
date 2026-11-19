export type Block =
  | { p: string }
  | { h: string }
  | { f: [string] | [string, string] }
  | { k: [string, string] }
  | { l: string[] }
  | { o: string[] }
  | { n: string }
  | { w: string }
  | { c: [string, string] }
  | { tb: { h: string[]; r: string[][] } }
  | { ch: string }

export type QType = 'single' | 'judge' | 'fill' | 'short'

export interface Q {
  id: string
  type: QType
  stem: string
  options?: string[]
  answer: string
  accepted?: string[]
  keywords?: string[]
  ex: string
}

export interface Lesson {
  id: string
  phase: number
  title: string
  sub: string
  tb: string
  min: number
  obj: string[]
  lead: string
  sec: { h: string; b: Block[] }[]
  sum: string[]
  quiz: Q[]
}

export interface Phase {
  n: number
  key: string
  title: string
  en: string
  desc: string
  tb: string
}

export interface ChartSpec {
  id: string
  kind: 'line' | 'bar' | 'area'
  title: string
  unit?: string
  source: string
  note?: string
  data: Record<string, number | string>[]
  x: string
  series: { key: string; name: string; color?: string; dash?: boolean }[]
  refLine?: { y: number; label: string }
  /** 垂直参考线（如 LRAS），x 轴为数值时使用 */
  verticalX?: { x: number; label: string }
}

export interface CaseStudy {
  id: string
  no: string
  title: string
  region: string
  period: string
  tag: string
  brief: string
  background: string
  indicators: { name: string; value: string; note: string }[]
  shock: string
  model: string
  policy: string
  outcome: string
  lesson: string
  debate?: string
  links: string[]
}

export interface GraphNode {
  id: string
  label: string
  group: string
  x: number
  y: number
  desc: string
  lessons: string[]
  cases?: string[]
}

export interface GraphEdge {
  from: string
  to: string
  label?: string
}
