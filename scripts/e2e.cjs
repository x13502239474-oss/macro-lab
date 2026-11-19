/**
 * 端到端回归测试（Playwright，直接驱动 npx 缓存里的浏览器）
 * 覆盖：答题判分 → 错题入库 → 标记学完 → 刷新恢复 → 错题本/我的页渲染
 *
 * 运行：node scripts/e2e.cjs
 */
const path = require('path')
const PW = 'C:/Users/1/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright'
const { chromium } = require(PW)

const BASE = process.env.BASE || 'http://localhost:4180'
const SHOTS = path.join(__dirname, '..', '.shots')

const log = (...a) => console.log('·', ...a)

;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))

  // 1) 打开课程 1-5，故意乱答
  await page.goto(`${BASE}/#/lesson/1-5`, { waitUntil: 'networkidle' })
  await page.waitForSelector('text=章节测试')
  log('课程页打开，标题：', await page.locator('h1').first().innerText())

  // 单选：每题点第一个选项；判断：点「对」；填空：随便填
  const singleBtns = page.locator('section#quiz button:has(span:text-is("A"))')
  const singleCount = await singleBtns.count()
  for (let i = 0; i < singleCount; i++) await singleBtns.nth(i).click()
  const judgeBtns = page.locator('section#quiz button:text-is("对")')
  const judgeCount = await judgeBtns.count()
  for (let i = 0; i < judgeCount; i++) await judgeBtns.nth(i).click()
  const inputs = page.locator('section#quiz input')
  const inputCount = await inputs.count()
  for (let i = 0; i < inputCount; i++) await inputs.nth(i).fill('测试答案')
  log(`作答：单选 ${singleCount}、判断 ${judgeCount}、填空 ${inputCount}`)

  // 2) 提交，读分数
  await page.locator('button:has-text("提交并查看解析")').click()
  await page.waitForSelector('#quiz-result')
  const score = (await page.locator('#quiz-result').innerText()).split('\n').slice(0, 4).join(' | ')
  log('判分结果：', score)

  // 3) 读 LocalStorage，确认错题已写入
  const afterSubmit = await page.evaluate(() => JSON.parse(localStorage.getItem('macro-lab.store.v1') || '{}'))
  const ansRows = Object.entries(afterSubmit.ans || {})
  const wrong = ansRows.filter(([, v]) => !v.ok).length
  log(`存储中答题记录 ${ansRows.length} 条，其中错 ${wrong} 条`)
  if (ansRows.length < 4) throw new Error('答题记录未全部写入')
  if (wrong < 1) throw new Error('故意答错却没有产生错题')

  // 4) 标记学完 + 笔记 + 收藏
  await page.locator('button:has-text("标记本课学完")').click()
  await page.locator('button:has-text("收藏")').first().click()
  await page.locator('button:has-text("笔记")').first().click()
  await page.locator('textarea').last().fill('GDP 是流量，不是存量。')
  await page.keyboard.press('Escape').catch(() => {})
  await page.waitForTimeout(300)

  // 5) 刷新，验证进度、收藏、笔记都恢复
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForSelector('text=章节测试')
  const persisted = await page.evaluate(() => JSON.parse(localStorage.getItem('macro-lab.store.v1') || '{}'))
  const doneFlag = !!persisted.lessons['1-5']?.done
  const favFlag = (persisted.fav || []).includes('1-5')
  const noteOk = (persisted.notes?.['1-5'] || '').includes('流量')
  log(`刷新后：已学完=${doneFlag} 收藏=${favFlag} 笔记=${noteOk}`)
  if (!doneFlag || !favFlag || !noteOk) throw new Error('刷新后学习记录未恢复')

  // 6) 错题本
  await page.goto(`${BASE}/#/mistakes`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  const mistakeCount = await page.locator('.card').count()
  log('错题本卡片数：', mistakeCount)
  await page.screenshot({ path: path.join(SHOTS, 'e2e-mistakes.png'), fullPage: false })

  // 7) 我的：连续天数 / 已完成 / 收藏 / 笔记
  await page.goto(`${BASE}/#/me`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  const meText = await page.locator('main').innerText()
  for (const kw of ['已完成课程', '收藏课程', 'GDP 是流量']) {
    if (!meText.includes(kw)) throw new Error(`我的页缺少「${kw}」`)
  }
  await page.screenshot({ path: path.join(SHOTS, 'e2e-me.png'), fullPage: false })

  // 8) 首页进度应为 1/72
  await page.goto(`${BASE}/#/`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  const homeText = await page.locator('main').innerText()
  if (!/1\s*\/\s*72/.test(homeText)) throw new Error('首页未显示 1/72 进度')
  log('首页进度：1/72 ✓')

  if (errors.length) {
    console.log('\n浏览器控制台错误：')
    errors.forEach((e) => console.log('  !', e))
  }

  // ---- 场景二：按参考答案重做，应得满分且不再新增错题 ----
  await page.goto(`${BASE}/#/lesson/1-5`, { waitUntil: 'networkidle' })
  await page.waitForSelector('text=章节测试')
  const cards = page.locator('section#quiz .space-y-3 > div')
  const n = await cards.count()

  // 先乱答一次，收集每题的参考答案
  const chosen = []
  for (let i = 0; i < n; i++) {
    const c = cards.nth(i)
    if (await c.locator('input').count()) {
      await c.locator('input').fill('乱答')
      chosen.push('乱答')
    } else if (await c.locator('button:text-is("错")').count()) {
      await c.locator('button:text-is("错")').click()
      chosen.push('错')
    } else {
      const b = c.locator('button').first()
      chosen.push((await b.innerText()).trim().slice(0, 1))
      await b.click()
    }
  }
  await page.locator('button:has-text("提交并查看解析")').click()
  await page.waitForSelector('#quiz-result')

  // 正确答案来源：错题显式给出参考答案；原本答对的题，用高亮边框找出正确项；兜底沿用原作答
  const keys = await page.evaluate((fallback) => {
    const list = Array.from(document.querySelectorAll('section#quiz .space-y-3 > div'))
    return list.map((c, i) => {
      const p = Array.from(c.querySelectorAll('p')).find((x) => (x.textContent || '').startsWith('参考答案：'))
      if (p) return ((p.querySelector('span') || p).textContent || '').trim()
      const right = c.querySelector('[class*="border-down/50"]')
      if (right) {
        const t = (right.textContent || '').trim()
        // 单选题的按钮文本是「A某选项」，取首字母；判断题直接是「对/错」
        return /^[A-D]/.test(t) ? t.slice(0, 1) : t
      }
      return fallback[i]
    })
  }, chosen)
  log('参考答案：', keys.join(' / '))
  if (keys.filter(Boolean).length < n) throw new Error('未能识别全部正确答案')

  // 重做并按参考答案作答
  await page.locator('button:has-text("重做本课")').click()
  await page.waitForTimeout(200)
  for (let i = 0; i < n; i++) {
    const c = cards.nth(i)
    const k = keys[i]
    if (await c.locator('input').count()) await c.locator('input').fill(k)
    else if (await c.locator('button:text-is("对")').count()) await c.locator(`button:text-is("${k}")`).click()
    else await c.locator('button').nth(k.charCodeAt(0) - 65).click()
  }
  await page.locator('button:has-text("提交并查看解析")').click()
  await page.waitForSelector('#quiz-result')
  const score2 = await page.locator('#quiz-result').innerText()
  const got = score2.match(/(\d+)\s*\/\s*(\d+)/)
  log(`按答案重做得分：${got ? got[0] : '?'}`)
  if (!got || got[1] !== got[2]) throw new Error('按参考答案作答未得满分')

  const after2 = await page.evaluate(() => JSON.parse(localStorage.getItem('macro-lab.store.v1') || '{}'))
  const stillWrong = Object.entries(after2.ans || {}).filter(([id, v]) => !v.ok && id.startsWith('1-5')).length
  log(`1-5 剩余错题：${stillWrong} 条（答对后应清空）`)
  if (stillWrong !== 0) throw new Error('答对后错题未从错题本移除')

  // ---- 场景三：模拟器交互（拖动滑块后结果应实时变化且算术自洽） ----
  await page.goto(`${BASE}/#/lab/gdp`, { waitUntil: 'networkidle' })
  await page.waitForSelector('input[type=range]')
  const gdpVal = async () => {
    const t = await page.locator('main').innerText()
    const m = t.match(/GDP\s*\n\s*([\d.]+)/)
    return m ? m[1] : ''
  }
  const before = await gdpVal()
  const range = page.locator('input[type=range]').first() // 居民消费 C
  await range.focus()
  for (let i = 0; i < 10; i++) await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(400)
  const afterDrag = await gdpVal()
  log(`GDP 滑块交互：${before} → ${afterDrag}`)
  if (!before || before === afterDrag) throw new Error('拖动滑块后 GDP 结果没有变化')

  // ---- 场景四：知识图谱点击节点 ----
  await page.goto(`${BASE}/#/graph`, { waitUntil: 'networkidle' })
  await page.waitForSelector('svg g')
  const titleBefore = await page.locator('section.card h2').first().innerText()
  await page.locator('svg g').nth(6).dispatchEvent('click')
  await page.waitForTimeout(300)
  const titleAfter = await page.locator('section.card h2').first().innerText()
  log(`图谱节点点击：${titleBefore} → ${titleAfter}`)
  if (titleBefore === titleAfter) throw new Error('点击图谱节点后详情未切换')

  await browser.close()
  console.log('\nE2E 全部通过')
})().catch((e) => {
  console.error('\nE2E 失败：', e.message)
  process.exit(1)
})
