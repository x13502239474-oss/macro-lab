import { lessons, phases, allQuestions } from '../src/content/lessons'
import { charts } from '../src/content/charts'
import { cases } from '../src/content/cases'
import { nodes, edges } from '../src/content/graph'

const errs: string[] = []
const warn: string[] = []

const ids = new Set<string>()
const qids = new Set<string>()

for (const l of lessons) {
  if (ids.has(l.id)) errs.push(`重复课程 id: ${l.id}`)
  ids.add(l.id)
  if (!phases.find((p) => p.n === l.phase)) errs.push(`${l.id} 阶段不存在`)
  if (l.sec.length < 4) errs.push(`${l.id} 章节少于 4 节`)
  if (l.quiz.length < 3) errs.push(`${l.id} 题目少于 3 道`)
  if (!l.obj.length) errs.push(`${l.id} 缺学习目标`)
  for (const s of l.sec) {
    if (!s.b.length) errs.push(`${l.id} 空章节 ${s.h}`)
    for (const b of s.b) {
      if ('ch' in b && !charts[b.ch]) errs.push(`${l.id} 引用不存在的图表 ${b.ch}`)
      if ('f' in b && !b.f[0]) errs.push(`${l.id} 空公式`)
      if ('tb' in b && b.tb.r.some((r) => r.length !== b.tb.h.length)) errs.push(`${l.id} 表格列数不一致`)
    }
  }
  for (const q of l.quiz) {
    if (qids.has(q.id)) errs.push(`重复题目 id: ${q.id}`)
    qids.add(q.id)
    if (!q.stem) errs.push(`${q.id} 缺题干`)
    if (!q.ex) errs.push(`${q.id} 缺解析`)
    if (q.type === 'single') {
      if (!q.options || q.options.length < 3) errs.push(`${q.id} 选项不足`)
      if (!/^[A-D]$/.test(q.answer)) errs.push(`${q.id} 答案不是字母`)
      if (q.options && !q.options.some((o) => o.startsWith(q.answer + '.'))) errs.push(`${q.id} 答案无对应选项`)
    }
    if (q.type === 'judge' && !['对', '错'].includes(q.answer)) errs.push(`${q.id} 判断题答案错误`)
    if (q.type === 'fill' && !q.answer) errs.push(`${q.id} 填空题缺答案`)
    if (q.type === 'short' && (!q.keywords || q.keywords.length < 3)) errs.push(`${q.id} 简答题要点不足`)
  }
}

for (const p of phases) {
  const n = lessons.filter((l) => l.phase === p.n).length
  if (n === 0) errs.push(`阶段 ${p.n} 无课程`)
}

for (const c of cases) {
  if (!l_ok(c.links)) warn.push(`案例 ${c.id} 关联课程不存在: ${c.links.filter((x) => !ids.has(x)).join(',')}`)
}
function l_ok(links: string[]) {
  return links.every((x) => ids.has(x))
}

for (const n of nodes) {
  const bad = n.lessons.filter((x) => !ids.has(x))
  if (bad.length) warn.push(`图谱节点 ${n.id} 关联课程不存在: ${bad.join(',')}`)
}
for (const e of edges) {
  if (!nodes.find((n) => n.id === e.from)) errs.push(`图谱边起点不存在 ${e.from}`)
  if (!nodes.find((n) => n.id === e.to)) errs.push(`图谱边终点不存在 ${e.to}`)
}

const types = allQuestions.reduce<Record<string, number>>((a, q) => ({ ...a, [q.type]: (a[q.type] ?? 0) + 1 }), {})

console.log('课程数', lessons.length)
console.log('题目数', allQuestions.length, types)
console.log('图表数', Object.keys(charts).length)
console.log('案例数', cases.length)
console.log('图谱节点', nodes.length, '边', edges.length)
if (warn.length) console.log('WARN:\n' + warn.join('\n'))
if (errs.length) {
  console.error('ERROR:\n' + errs.join('\n'))
  process.exit(1)
}
console.log('OK')
