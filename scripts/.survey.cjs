const fs = require('fs')
const path = require('path')
const dir = 'src/content/lessons'
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts') && f !== 'index.ts')
const all = []
for (const f of files) {
  const s = fs.readFileSync(path.join(dir, f), 'utf8')
  // 提取每个 Lesson 对象：匹配 id: 'x-x'
  const ids = [...s.matchAll(/id: '(\d+-\d+)'/g)].map(m => m[1])
  const titles = [...s.matchAll(/title: '([^']+)'/g)].map(m => m[1])
  for (let i = 0; i < ids.length; i++) {
    // 找到该 id 之后到下一个 id 之间的片段
    const start = s.indexOf(`id: '${ids[i]}'`)
    const end = i + 1 < ids.length ? s.indexOf(`id: '${ids[i+1]}'`) : s.length
    const seg = s.slice(start, end)
    const secCount = (seg.match(/\{\s*h:/g) || []).length
    const qCount = (seg.match(/type: '(single|judge|fill|short)'/g) || []).length
    const fCount = (seg.match(/\{\s*f:/g) || []).length
    const chCount = (seg.match(/\{\s*ch:/g) || []).length
    const cCount = (seg.match(/\{\s*c:/g) || []).length
    const wCount = (seg.match(/\{\s*w:/g) || []).length
    const tbCount = (seg.match(/\{\s*tb:/g) || []).length
    const hasHistory = /历史|发展|起源|提出|学派|凯恩斯|弗里德曼|古典|1960|1970|大萧条|战后/.test(seg)
    const hasLimit = /局限|适用条件|前提|边界|并非|不适用|假设条件/.test(seg)
    all.push({ id: ids[i], title: titles[i] || '', sec: secCount, q: qCount, f: fCount, ch: chCount, c: cCount, w: wCount, tb: tbCount, hist: hasHistory, lim: hasLimit })
  }
}
// 按阶段分组打印
const byPhase = {}
for (const x of all) { const p = x.id.split('-')[0]; (byPhase[p] ||= []).push(x) }
for (const p of Object.keys(byPhase).sort()) {
  console.log(`\n===== 阶段 ${p} =====`)
  for (const x of byPhase[p]) {
    console.log(`${x.id.padEnd(4)} ${x.title.padEnd(22,'　')} 节${x.sec} 题${x.q} 式${x.f} 图${x.ch} 案${x.c} 错${x.w} 表${x.tb} ${x.hist?'史':'-'}${x.lim?'限':'-'}`)
  }
}
console.log(`\n总计 ${all.length} 课；题<5 的课：${all.filter(x=>x.q<5).length}；无历史：${all.filter(x=>!x.hist).length}；无局限：${all.filter(x=>!x.lim).length}`)
