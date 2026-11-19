const KEY = 'macro-lab.store.v1'

export interface Rec {
  ok: boolean
  ans: string
  ts: number
  tries: number
}

export interface Store {
  v: 1
  lessons: Record<string, { done: boolean; ts: number; sec: number }>
  ans: Record<string, Rec>
  fav: string[]
  notes: Record<string, string>
  days: string[]
  tasks: Record<string, string[]>
  lastLesson?: string
}

const empty: Store = { v: 1, lessons: {}, ans: {}, fav: [], notes: {}, days: [], tasks: {} }

let state: Store = load()
const subs = new Set<() => void>()

function load(): Store {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...empty }
    const p = JSON.parse(raw)
    return { ...empty, ...p, v: 1 }
  } catch {
    return { ...empty }
  }
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* 存储配额或隐私模式，忽略 */
  }
  subs.forEach((f) => f())
}

export const store = {
  get: () => state,
  subscribe(f: () => void) {
    subs.add(f)
    return () => subs.delete(f)
  },
  markLesson(id: string, sec = 0) {
    const old = state.lessons[id]
    state = {
      ...state,
      lessons: { ...state.lessons, [id]: { done: true, ts: Date.now(), sec: Math.max(old?.sec ?? 0, sec) } },
      lastLesson: id,
    }
    persist()
  },
  unmarkLesson(id: string) {
    const next = { ...state.lessons }
    delete next[id]
    state = { ...state, lessons: next }
    persist()
  },
  addSeconds(id: string, sec: number) {
    const old = state.lessons[id]
    state = {
      ...state,
      lessons: {
        ...state.lessons,
        [id]: { done: old?.done ?? false, ts: old?.ts ?? 0, sec: (old?.sec ?? 0) + sec },
      },
      lastLesson: id,
    }
    persist()
  },
  answer(qid: string, ok: boolean, ans: string) {
    const old = state.ans[qid]
    state = {
      ...state,
      ans: { ...state.ans, [qid]: { ok, ans, ts: Date.now(), tries: (old?.tries ?? 0) + 1 } },
    }
    persist()
  },
  toggleFav(id: string) {
    const has = state.fav.includes(id)
    state = { ...state, fav: has ? state.fav.filter((x) => x !== id) : [...state.fav, id] }
    persist()
  },
  setNote(id: string, text: string) {
    state = { ...state, notes: { ...state.notes, [id]: text } }
    persist()
  },
  touchToday(task?: string) {
    const d = todayKey()
    const days = state.days.includes(d) ? state.days : [...state.days, d]
    let tasks = state.tasks
    if (task) {
      const list = tasks[d] ?? []
      if (!list.includes(task)) tasks = { ...tasks, [d]: [...list, task] }
    }
    state = { ...state, days, tasks }
    persist()
  },
  reset() {
    state = { ...empty }
    persist()
  },
  exportJSON() {
    return JSON.stringify(state, null, 2)
  },
  importJSON(raw: string) {
    const p = JSON.parse(raw)
    if (!p || typeof p !== 'object' || !p.ans) throw new Error('格式不正确')
    state = { ...empty, ...p, v: 1 }
    persist()
  },
}

export function todayKey(d = new Date()) {
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function dayDiff(a: string, b: string) {
  const ta = new Date(a + 'T00:00:00').getTime()
  const tb = new Date(b + 'T00:00:00').getTime()
  return Math.round((tb - ta) / 86400000)
}

export function streak(days: string[]) {
  if (!days.length) return 0
  const set = new Set(days)
  const today = todayKey()
  let cursor = set.has(today) ? today : null
  if (!cursor) {
    const y = new Date(Date.now() - 86400000)
    const yk = todayKey(y)
    if (!set.has(yk)) return 0
    cursor = yk
  }
  let n = 0
  let d = new Date(cursor + 'T00:00:00')
  while (set.has(todayKey(d))) {
    n++
    d = new Date(d.getTime() - 86400000)
  }
  return n
}

export function answeredToday(qids: string[]) {
  const t = todayKey()
  return qids.filter((q) => {
    const r = state.ans[q]
    return r && todayKey(new Date(r.ts)) === t
  }).length
}
