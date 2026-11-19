/**
 * 通过 GitHub REST API 推送仓库（适用于 github.com:443 被网络阻断、只能访问 api.github.com 的环境）
 *
 * 原理：按本地提交顺序逐个重放 —— 上传 blob → 建 tree → 建 commit → 更新 ref。
 * 由于内容与元数据完全一致，远程生成的 commit SHA 与本地相同，日后在能访问 github.com
 * 的机器上可直接 git push 快进。
 *
 * 用法：
 *   GH_TOKEN=xxx GH_REPO=owner/name node scripts/api-push.cjs main
 *   GH_TOKEN=xxx GH_REPO=owner/name node scripts/api-push.cjs gh-pages dist
 *
 * 第二个参数为要发布的分支名，第三个参数（可选）为静态目录：给出时把该目录内容做成一个
 * 独立的孤儿提交发布到该分支（用于 GitHub Pages）。
 */
const { execSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const TOKEN = process.env.GH_TOKEN
const REPO = process.env.GH_REPO
const BRANCH = process.argv[2] || 'main'
const DIST = process.argv[3]
const API = 'https://api.github.com'

if (!TOKEN || !REPO) {
  console.error('需要环境变量 GH_TOKEN 与 GH_REPO（owner/name）')
  process.exit(1)
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function gh(p, method = 'GET', body) {
  let lastErr
  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      const res = await fetch(API + p, {
        method,
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json',
          'User-Agent': 'macro-lab-deploy',
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      })
      const text = await res.text()
      const data = text ? JSON.parse(text) : null
      // 次生限流会以 404/429/5xx 形式出现，一律退避重试
      const retryable = res.status === 404 || res.status === 429 || res.status >= 500
      if (res.ok || res.status === 422 || res.status === 409) return { status: res.status, data }
      if (!retryable) throw new Error(`${method} ${p} → ${res.status} ${text.slice(0, 300)}`)
      lastErr = new Error(`${method} ${p} → ${res.status} ${text.slice(0, 200)}`)
    } catch (e) {
      if (String(e.message).includes('→')) throw e
      lastErr = e
    }
    await sleep(Math.min(1500 * Math.pow(1.7, attempt), 20000))
  }
  throw lastErr
}

const git = (cmd, opts = {}) => execSync(`git ${cmd}`, { maxBuffer: 1 << 28, ...opts })

/** 上传单个 blob，返回远端 sha */
const blobCache = new Map()
async function uploadBlob(localSha) {
  if (blobCache.has(localSha)) return blobCache.get(localSha)
  const buf = git(`cat-file blob ${localSha}`, { encoding: 'buffer' })
  const { data } = await gh(`/repos/${REPO}/git/blobs`, 'POST', { content: buf.toString('base64'), encoding: 'base64' })
  blobCache.set(localSha, data.sha)
  if (data.sha !== localSha) console.warn(`  ! blob sha 不一致 ${localSha.slice(0, 8)} → ${data.sha.slice(0, 8)}`)
  return data.sha
}

/** 由本地 tree 生成远端 tree（扁平列出所有文件，API 会自动建子目录） */
async function pushTree(localTree) {
  const raw = execSync(`git ls-tree -r ${localTree}`, { maxBuffer: 1 << 28 }).toString().trim()
  const rows = raw ? raw.split('\n').map((line) => {
    const [meta, filePath] = line.split('\t')
    const [mode, type, sha] = meta.split(/\s+/)
    return { mode, type, sha, path: filePath }
  }) : []
  if (!rows.length) throw new Error('tree 为空')
  rows.forEach((r) => {
    if (r.type !== 'blob') throw new Error(`不支持的 tree 条目：${r.type} ${r.path}`)
  })

  // 快路径：Git blob 是内容寻址，本地 SHA 与远端一致，只要对象已存在于仓库即可直接引用
  const fast = rows.map((r) => ({ path: r.path, mode: r.mode, type: 'blob', sha: r.sha }))
  const quick = await gh(`/repos/${REPO}/git/trees`, 'POST', { tree: fast })
  if (quick.status === 201 && quick.data?.sha) {
    console.log(`  tree ${quick.data.sha.slice(0, 8)}（${rows.length} 个文件，直接引用本地 blob）`)
    return quick.data.sha
  }

  // 慢路径：逐个上传 blob 后再建 tree（首次推送时走这里）
  console.log(`  tree 直接引用失败（${quick.status}），改为逐个上传 ${rows.length} 个 blob`)
  const entries = []
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]
    entries.push({ path: r.path, mode: r.mode, type: 'blob', sha: await uploadBlob(r.sha) })
    process.stdout.write(`  已上传 ${i + 1}/${rows.length}\r`)
    if ((i + 1) % 10 === 0) await sleep(400) // 避免次生限流
  }
  process.stdout.write('\n')
  const { status, data } = await gh(`/repos/${REPO}/git/trees`, 'POST', { tree: entries })
  if (status !== 201) throw new Error(`创建 tree 失败（${status}）：${JSON.stringify(data).slice(0, 200)}`)
  console.log(`  tree ${data.sha.slice(0, 8)}（${entries.length} 个文件）`)
  return data.sha
}

async function ensureRef(sha) {
  const cur = await gh(`/repos/${REPO}/git/ref/heads/${BRANCH}`)
  if (cur.status === 200) {
    const r = await gh(`/repos/${REPO}/git/refs/heads/${BRANCH}`, 'PATCH', { sha, force: true })
    if (r.status !== 200) throw new Error(`更新 ref 失败：${JSON.stringify(r.data).slice(0, 200)}`)
    console.log(`  ref ${BRANCH}: ${cur.data.object.sha.slice(0, 8)} → ${sha.slice(0, 8)}`)
  } else {
    const r = await gh(`/repos/${REPO}/git/refs`, 'POST', { ref: `refs/heads/${BRANCH}`, sha })
    if (r.status !== 201) throw new Error(`创建 ref 失败：${JSON.stringify(r.data).slice(0, 200)}`)
    console.log(`  ref ${BRANCH} 新建于 ${sha.slice(0, 8)}`)
  }
}

;(async () => {
  console.log(`仓库 ${REPO}，分支 ${BRANCH}`)

  if (DIST) {
    // 静态目录 → 孤儿提交
    const root = path.resolve(DIST)
    if (!fs.existsSync(root)) throw new Error(`目录不存在：${root}`)
    const entries = []
    const walk = (dir) => {
      for (const name of fs.readdirSync(dir)) {
        const full = path.join(dir, name)
        const rel = path.relative(root, full).split(path.sep).join('/')
        if (fs.statSync(full).isDirectory()) walk(full)
        else {
          const buf = fs.readFileSync(full)
          entries.push({ path: rel, mode: '100644', content: buf })
        }
      }
    }
    walk(root)
    console.log(`  静态文件 ${entries.length} 个`)

    const tree = []
    for (const e of entries) {
      const { data } = await gh(`/repos/${REPO}/git/blobs`, 'POST', { content: e.content.toString('base64'), encoding: 'base64' })
      tree.push({ path: e.path, mode: e.mode, type: 'blob', sha: data.sha })
    }
    const { data: t } = await gh(`/repos/${REPO}/git/trees`, 'POST', { tree })
    const { data: c } = await gh(`/repos/${REPO}/git/commits`, 'POST', {
      message: `build: 发布静态站点（${new Date().toISOString()}）`,
      tree: t.sha,
      parents: [],
    })
    console.log(`  commit ${c.sha.slice(0, 8)}`)
    await ensureRef(c.sha)
    console.log('完成')
    return
  }

  // 重放本地提交
  const fmt = '%H%x00%T%x00%P%x00%an%x00%ae%x00%aI%x00%cn%x00%ce%x00%cI%x00%B%x01'
  const out = git(`log --reverse --format=${fmt}`).toString()
  const list = out.split('\x01').map((s) => s.trim()).filter(Boolean).map((rec) => {
    const [sha, tree, parents, an, ae, aI, cn, ce, cI, msg] = rec.split('\x00')
    return { sha, tree, parents: parents ? parents.split(' ') : [], an, ae, aI, cn, ce, cI, msg }
  })
  console.log(`  本地提交 ${list.length} 个`)

  let parentSha = null
  for (const c of list) {
    console.log(`提交 ${c.sha.slice(0, 8)}：${c.msg.split('\n')[0]}`)
    const tree = await pushTree(c.tree)
    const body = {
      message: c.msg,
      tree,
      parents: parentSha ? [parentSha] : [],
      author: { name: c.an, email: c.ae, date: c.aI },
      committer: { name: c.cn, email: c.ce, date: c.cI },
    }
    const { data, status } = await gh(`/repos/${REPO}/git/commits`, 'POST', body)
    if (status !== 201) throw new Error(`创建 commit 失败：${JSON.stringify(data).slice(0, 300)}`)
    parentSha = data.sha
    if (data.sha !== c.sha) console.warn(`  ! commit sha 不一致：本地 ${c.sha.slice(0, 8)} / 远端 ${data.sha.slice(0, 8)}`)
    else console.log(`  ✓ SHA 一致 ${data.sha.slice(0, 8)}`)
  }

  await ensureRef(parentSha)
  console.log('完成')
})().catch((e) => {
  console.error('\n推送失败：', e.message)
  process.exit(1)
})
