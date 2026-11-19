/**
 * 数据源适配层（预留实时经济数据接口）
 * ------------------------------------------------------------------
 * 全站目前默认使用「静态教学数据源」，即构建时打包进前端的公开年度统计值。
 * 若将来接入实时数据（国家统计局、FRED、World Bank、自建后端等），
 * 只需实现 `DataSource` 接口并通过环境变量切换，页面代码无需改动：
 *
 *   .env.local
 *   VITE_DATA_API=https://api.example.com/macro
 *
 * 远端返回的 JSON 只要满足 `IndicatorSnapshot` 的形状即可，例如：
 *   GET {VITE_DATA_API}/indicators        -> IndicatorSnapshot[]
 *   GET {VITE_DATA_API}/indicators/gdp    -> IndicatorSnapshot
 *
 * 设计约束：
 * 1. 任何远端失败都必须回落到静态数据，页面不能白屏；
 * 2. 返回结果必须带 source / period，界面上要能标注口径与年份；
 * 3. 不在此层做插值或估算，缺失就是缺失。
 */
import { indicators, type Indicator } from '../content/indicators'

export type IndicatorId = 'gdp' | 'growth' | 'cpi' | 'inflation' | 'unemp' | 'rate' | 'm2' | 'fx'

/** 与首页指标卡一致的数据形状 */
export type IndicatorSnapshot = Indicator

export interface DataSource {
  /** static = 构建时打包的年度统计值；remote = 实时/准实时接口 */
  kind: 'static' | 'remote'
  /** 界面上展示的数据源名称 */
  label: string
  list(): Promise<IndicatorSnapshot[]>
  get(id: string): Promise<IndicatorSnapshot | undefined>
}

/** 默认：静态教学数据（同步返回，保证首屏零等待） */
export const staticSource: DataSource = {
  kind: 'static',
  label: '静态教学数据（公开年度统计整理）',
  async list() {
    return indicators
  },
  async get(id) {
    return indicators.find((i) => i.key === id)
  },
}

/**
 * 远端数据源。带 3 秒超时与静态回落：
 * 网络异常、结构不符、超时，都会返回静态数据而不是抛错。
 */
export function createHttpSource(baseUrl: string, timeoutMs = 3000): DataSource {
  const base = baseUrl.replace(/\/$/, '')

  const fetchJSON = async <T,>(path: string): Promise<T | null> => {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), timeoutMs)
    try {
      const res = await fetch(`${base}${path}`, { signal: ctrl.signal, headers: { Accept: 'application/json' } })
      if (!res.ok) return null
      return (await res.json()) as T
    } catch {
      return null
    } finally {
      clearTimeout(timer)
    }
  }

  const isSnapshot = (x: unknown): x is IndicatorSnapshot => {
    const o = x as IndicatorSnapshot
    return !!o && typeof o.key === 'string' && typeof o.value === 'string' && Array.isArray(o.spark)
  }

  return {
    kind: 'remote',
    label: base,
    async list() {
      const data = await fetchJSON<unknown>('/indicators')
      if (!Array.isArray(data)) return indicators
      const ok = data.filter(isSnapshot)
      // 远端只给了部分指标时，用静态数据补齐，避免首页空卡
      const missing = indicators.filter((i) => !ok.some((k) => k.key === i.key))
      return [...ok, ...missing]
    },
    async get(id) {
      const one = await fetchJSON<unknown>(`/indicators/${id}`)
      if (isSnapshot(one)) return one
      return indicators.find((i) => i.key === id)
    },
  }
}

/** 根据构建环境选择数据源；默认静态 */
export function getDataSource(): DataSource {
  const url = (import.meta.env.VITE_DATA_API as string | undefined)?.trim()
  return url ? createHttpSource(url) : staticSource
}

/** 当前数据是否可被视为「实时」——界面上据此决定是否显示实时标记 */
export function isLive(src: DataSource = getDataSource()): boolean {
  return src.kind === 'remote'
}
