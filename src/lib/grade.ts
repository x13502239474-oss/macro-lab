import type { Q } from './types'

/** 全角转半角、去空白与常见标点，便于填空题宽口径判分 */
export function norm(s: string): string {
  if (!s) return ''
  let t = s
    .replace(/[\uFF01-\uFF5E]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/\u3000/g, ' ')
    .toLowerCase()
    .trim()
  t = t.replace(/[，。、；：！？“”‘’（）【】《》,;:!?"'()[\]<>\s]/g, '')
  t = t.replace(/[¥$€£%％]/g, '')
  t = t.replace(/元|美元|个百分点/g, '')
  return t
}

const num = (s: string): number | null => {
  const t = s
    .replace(/[\uFF01-\uFF5E]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[\s，,]/g, '')
    .replace(/[%％]/g, '')
    .replace(/[¥$€£]/g, '')
    .replace(/元|美元|个百分点/g, '')
    .trim()
  if (!t || !/^-?\d+(\.\d+)?$/.test(t)) return null
  return Number(t)
}

export function sameNumber(a: string, b: string): boolean {
  const x = num(a)
  const y = num(b)
  if (x === null || y === null) return false
  return Math.abs(x - y) <= Math.max(0.011, Math.abs(y) * 0.001)
}

const YES = ['对', '正确', '√', 'true', 't', '是', 'yes', 'y']
const NO = ['错', '错误', '×', 'x', 'false', 'f', '否', 'no', 'n']

export interface Grade {
  ok: boolean
  /** 缺哪些要点（简答题） */
  missing?: string[]
  /** 判分依据，给学员看 */
  basis: string
}

export function grade(q: Q, answer: string): Grade {
  const a = (answer ?? '').trim()
  if (!a) return { ok: false, basis: '未作答' }

  if (q.type === 'single') {
    const letter = a.toUpperCase().replace(/[^A-D]/g, '')
    return { ok: letter === q.answer.toUpperCase(), basis: `正确答案 ${q.answer}` }
  }

  if (q.type === 'judge') {
    const t = norm(a)
    const truth = q.answer === '对'
    const yes = YES.some((k) => t === norm(k))
    const no = NO.some((k) => t === norm(k))
    return { ok: (truth && yes) || (!truth && no), basis: `正确答案：${q.answer}` }
  }

  if (q.type === 'fill') {
    const pool = [q.answer, ...(q.accepted ?? [])]
    const ok = pool.some((v) => norm(v) === norm(a) || sameNumber(v, a))
    return { ok, basis: ok ? '与参考答案一致' : `参考答案：${q.answer}` }
  }

  // 简答：要点组命中率 ≥ 70%
  const groups = (q.keywords ?? []).map((g) => g.split('|'))
  const t = norm(a)
  const hit: string[] = []
  const missing: string[] = []
  groups.forEach((g) => {
    const any = g.some((k) => t.includes(norm(k)))
    if (any) hit.push(g[0])
    else missing.push(g[0])
  })
  const need = Math.ceil(groups.length * 0.7)
  const ok = groups.length > 0 && hit.length >= need
  return {
    ok,
    missing: ok ? [] : missing,
    basis: `命中要点 ${hit.length}/${groups.length}（需 ${need} 个）`,
  }
}

export function scoreOf(qs: { q: Q; ok: boolean }[]) {
  const total = qs.length
  const right = qs.filter((x) => x.ok).length
  return { total, right, pct: total ? Math.round((right / total) * 100) : 0 }
}
