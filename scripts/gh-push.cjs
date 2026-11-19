/**
 * 通过 GitHub REST API 推送当前 HEAD 的文件树。
 * 用于本机 github.com:443 不可达、只能访问 api.github.com 的场景。
 *
 *   GH_TOKEN=xxx GH_REPO=owner/name node scripts/gh-push.cjs
 *
 * 行为：把 HEAD 的全部文件压成「一个」提交，父提交为远端当前 head，
 * 然后快进更新远端分支引用。远端只保留最终文件树，提交信息由 GH_MESSAGE 指定。
 */
const { execSync } = require('node:child_process')

const TOKEN = process.env.GH_TOKEN
const REPO = process.env.GH_REPO
const BRANCH = process.env.GH_BRANCH || 'main'
const MESSAGE = process.env.GH_MESSAGE || 'feat: MACRO LAB 宏观经济学自学网站'
const CONCURRENCY = 4

if (!TOKEN || !REPO) {
  console.error('缺少 GH_TOKEN / GH_REPO')
  process.exit(1)
}

const API = `https://api.github.com/repos/${REPO}`
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function gh(path, method = 'GET', body) {
  let lastErr
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const res = await fetch(API + path, {
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
      if (res.ok) return data
      // 4xx 不重试（除 429/次生限流）
      if (res.status < 500 && res.status !== 429) {
        throw new Error(`${method} ${path} → ${res.status} ${text.slice(0, 400)}`)
      }
      lastErr = new Error(`${method} ${path} → ${res.status} ${text.slice(0, 200)}`)
    } catch (e) {
      if (e.message.includes('→ 4')) throw e
      lastErr = e
    }
    await sleep(800 * (attempt + 1))
  }
  throw lastErr
}

function localEntries() {
  const raw = execSync('git ls-tree -r HEAD', { maxBuffer: 1 << 28 }).toString().trim()
  return raw.split('\n').map((line) => {
    const [meta, path] = line.split('\t')
    const [mode, type, sha] = meta.split(/\s+/)
    if (type !== 'blob') throw new Error(`不支持的 tree 条目类型：${type} ${path}`)
    return { path, mode, sha }
  })
}

function blobOf(sha) {
  return execSync(`git cat-file blob ${sha}`, { maxBuffer: 1 << 28, encoding: 'buffer' })
}

async function main() {
  console.log(`仓库 ${REPO}，分支 ${BRANCH}`)
  const headSha = execSync('git rev-parse HEAD').toString().trim()
  const files = localEntries()
  console.log(`本地 HEAD ${headSha.slice(0, 8)}，文件 ${files.length} 个`)

  // 1. 远端当前 head 作为父提交
  let parent = null
  try {
    const ref = await gh(`/git/ref/heads/${BRANCH}`)
    parent = ref.object.sha
    console.log(`远端 ${BRANCH} 当前 ${parent.slice(0, 8)}`)
  } catch (e) {
    if (!/→ 404/.test(e.message)) throw e
    console.log(`远端还没有 ${BRANCH}，将创建首次提交`)
  }

  // 2. 上传 blob（并发）
  const entries = new Array(files.length)
  let done = 0
  let cursor = 0
  async function worker() {
    while (cursor < files.length) {
      const i = cursor++
      const f = files[i]
      const buf = blobOf(f.sha)
      const res = await fetch(`${API}/git/blobs`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
          'User-Agent': 'macro-lab-deploy',
        },
        body: JSON.stringify({ content: buf.toString('base64'), encoding: 'base64' }),
      })
      if (!res.ok) throw new Error(`blob ${f.path} 上传失败 ${res.status} ${(await res.text()).slice(0, 200)}`)
      const d = await res.json()
      entries[i] = { path: f.path, mode: f.mode, type: 'blob', sha: d.sha }
      done++
      if (done % 10 === 0 || done === files.length) process.stdout.write(`  已上传 ${done}/${files.length}\r`)
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))
  console.log(`  已上传 ${done}/${files.length}`)

  // 3. 建 tree
  const tree = await gh('/git/trees', 'POST', { tree: entries })
  console.log(`tree ${tree.sha.slice(0, 8)}`)

  // 4. 建 commit
  const commit = await gh('/git/commits', 'POST', {
    message: MESSAGE,
    tree: tree.sha,
    parents: parent ? [parent] : [],
  })
  console.log(`commit ${commit.sha.slice(0, 8)}`)

  // 5. 更新引用
  if (parent) {
    await gh(`/git/refs/heads/${BRANCH}`, 'PATCH', { sha: commit.sha, force: false })
  } else {
    await gh('/git/refs', 'POST', { ref: `refs/heads/${BRANCH}`, sha: commit.sha })
  }
  console.log(`已推送 ${BRANCH} → ${commit.sha.slice(0, 8)}`)
}

main().catch((e) => {
  console.error('\n推送失败：', e.message)
  process.exit(1)
})
