import { useEffect, useState } from 'react'
import { indicators } from '../content/indicators'
import { getDataSource, type DataSource, type IndicatorSnapshot } from './dataSource'

/**
 * 首页指标卡数据。
 * 默认同步使用静态教学数据（首屏零等待）；若配置了 VITE_DATA_API，
 * 则在挂载后异步拉取远端数据并平滑替换，失败时保持静态数据不变。
 */
export function useIndicators() {
  const [src] = useState<DataSource>(() => getDataSource())
  const [data, setData] = useState<IndicatorSnapshot[]>(indicators)
  const [live, setLive] = useState(false)

  useEffect(() => {
    if (src.kind === 'static') return
    let alive = true
    src
      .list()
      .then((list) => {
        if (!alive || !list.length) return
        setData(list)
        setLive(true)
      })
      .catch(() => {
        /* 静默回落：保持静态数据 */
      })
    return () => {
      alive = false
    }
  }, [src])

  return { indicators: data, source: src, live }
}
