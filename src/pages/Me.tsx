import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { byId, lessons, phases } from '../content/lessons'
import { useStore } from '../lib/useStore'
import { store, streak, todayKey } from '../lib/store'

export default function Me() {
  const s = useStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [review, setReview] = useState<{ term: string; def: string; lesson: string } | null>(null)
  const [showDef, setShowDef] = useState(false)

  const done = lessons.filter((l) => s.lessons[l.id]?.done).length
  const seconds = Object.values(s.lessons).reduce((a, b) => a + b.sec, 0)
  const answers = Object.values(s.ans)
  const right = answers.filter((a) => a.ok).length
  const accuracy = answers.length ? Math.round((right / answers.length) * 100) : 0
  const favs = lessons.filter((l) => s.fav.includes(l.id))
  const notes = Object.entries(s.notes).filter(([, v]) => v.trim())
  const st = streak(s.days)

  const terms = useMemo(
    () =>
      lessons.flatMap((l) =>
        l.sec.flatMap((sec) =>
          sec.b.filter((b) => 'k' in b).map((b) => ({ term: (b as { k: [string, string] }).k[0], def: (b as { k: [string, string] }).k[1], lesson: l.id })),
        ),
      ),
    [],
  )

  const draw = () => {
    const t = terms[Math.floor(Math.random() * terms.length)]
    setReview(t)
    setShowDef(false)
  }

  const hours = Math.floor(seconds / 3600)
  const mins = Math.round((seconds % 3600) / 60)

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000)
    const k = todayKey(d)
    return { k, label: ['日', '一', '二', '三', '四', '五', '六'][d.getDay()], on: s.days.includes(k), today: i === 6 }
  })

  return (
    <div className="shell py-4 md:py-6">
      <div className="eyebrow">PROFILE</div>
      <h1 className="mt-1 font-serif text-[24px] font-semibold">我的学习</h1>

      {/* 概览 */}
      <div className="relative mt-4 overflow-hidden rounded-2xl bg-ink px-4 py-4 text-white">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[9px] tracking-[0.22em] text-goldSoft">STUDY RECORD</div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="num text-[34px] leading-none">{st}</span>
              <span className="text-[11px] text-white/60">天连续学习</span>
            </div>
          </div>
          <div className="text-right text-[10.5px] leading-relaxed text-white/60">
            累计 {hours} 小时 {mins} 分
            <br />
            {done}/{lessons.length} 课 · 正确率 {accuracy}%
          </div>
        </div>
        <div className="mt-3 flex justify-between border-t border-white/15 pt-2.5">
          {week.map((d) => (
            <div key={d.k} className="flex flex-col items-center gap-1">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[8px] ${
                  d.on ? 'bg-goldSoft text-ink' : d.today ? 'border border-goldSoft/70 text-white/50' : 'bg-white/10 text-white/40'
                }`}
              >
                {d.on ? '✓' : ''}
              </span>
              <span className={`text-[8.5px] ${d.today ? 'text-goldSoft' : 'text-white/40'}`}>{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {[
          { l: '已完成课程', v: done, u: `/${lessons.length}` },
          { l: '累计答题', v: answers.length, u: '次' },
          { l: '错题待复习', v: answers.filter((a) => !a.ok).length, u: '题' },
          { l: '收藏课程', v: favs.length, u: '节' },
        ].map((x) => (
          <div key={x.l} className="card px-3 py-3">
            <div className="text-[10px] text-slate">{x.l}</div>
            <div className="num mt-1 text-[20px]">
              {x.v}
              <span className="ml-0.5 text-[9.5px] text-slate">{x.u}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 阶段进度 */}
      <section className="card mt-4 p-3.5">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="eyebrow">PROGRESS BY PHASE</span>
          <Link to="/courses" className="text-[10.5px] text-slate">
            课程 →
          </Link>
        </div>
        <div className="space-y-2.5">
          {phases.map((p) => {
            const list = lessons.filter((l) => l.phase === p.n)
            const d = list.filter((l) => s.lessons[l.id]?.done).length
            const pct = Math.round((d / list.length) * 100)
            return (
              <div key={p.n} className="flex items-center gap-3">
                <span className="num w-5 text-[10px] text-slate">{p.n}</span>
                <span className="w-24 shrink-0 truncate text-[11.5px] text-ink/80 sm:w-32">{p.title}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded bg-line">
                  <span className="block h-full rounded bg-ink" style={{ width: `${pct}%` }} />
                </span>
                <span className="num w-10 text-right text-[9.5px] text-slate">{pct}%</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* 知识点复习 */}
      <section className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="eyebrow">FLASHCARDS</span>
          <span className="text-[10px] text-slate">共 {terms.length} 个知识点</span>
        </div>
        {!review ? (
          <button onClick={draw} className="card flex w-full items-center justify-between px-4 py-4 text-left">
            <span>
              <span className="block font-serif text-[15px]">随机抽一张知识卡</span>
              <span className="mt-0.5 block text-[11px] text-slate">先回忆定义，再翻面核对</span>
            </span>
            <span className="text-[11px] text-gold">抽取 →</span>
          </button>
        ) : (
          <div className="card overflow-hidden">
            <div className="border-b border-line/70 bg-[#FBFAF6] px-4 py-2 text-[9.5px] tracking-[0.18em] text-gold">TERM</div>
            <div className="px-4 py-5">
              <div className="font-serif text-[19px] font-semibold">{review.term}</div>
              {showDef && <p className="mt-3 text-[13px] leading-[1.85] text-ink/80">{review.def}</p>}
            </div>
            <div className="flex items-center gap-2 border-t border-line/70 px-4 py-2.5">
              <button onClick={() => setShowDef((v) => !v)} className="text-[11.5px] font-medium text-ink underline decoration-goldSoft decoration-2 underline-offset-4">
                {showDef ? '收起释义' : '翻面看释义'}
              </button>
              <button onClick={draw} className="ml-auto text-[11px] text-slate">
                换一张
              </button>
              <Link to={`/lesson/${review.lesson}`} className="text-[11px] text-slate">
                去课程 {review.lesson}
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* 收藏 */}
      <section className="mt-5">
        <div className="mb-2 eyebrow">FAVORITES</div>
        {favs.length === 0 ? (
          <p className="text-[11.5px] text-slate">还没有收藏。课程页右上角可以收藏重点课程。</p>
        ) : (
          <div className="space-y-2">
            {favs.map((l) => (
              <Link key={l.id} to={`/lesson/${l.id}`} className="card flex items-center gap-3 px-3.5 py-2.5">
                <span className="num text-[10px] text-gold">{l.id}</span>
                <span className="flex-1 truncate text-[12.5px]">{l.title}</span>
                <span className="text-[10px] text-slate">{l.min} 分钟</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 笔记 */}
      <section className="mt-5">
        <div className="mb-2 eyebrow">NOTES</div>
        {notes.length === 0 ? (
          <p className="text-[11.5px] text-slate">还没有笔记。在课程页点「笔记」记录自己的想法。</p>
        ) : (
          <div className="space-y-2">
            {notes.map(([id, text]) => (
              <div key={id} className="card px-3.5 py-3">
                <div className="flex items-center justify-between">
                  <Link to={`/lesson/${id}`} className="text-[11.5px] font-medium text-ink">
                    {id} {byId(id)?.title}
                  </Link>
                  <span className="text-[9px] text-slate">本机保存</span>
                </div>
                <p className="mt-1.5 whitespace-pre-wrap text-[11.5px] leading-relaxed text-ink/70">{text}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 数据管理 */}
      <section className="mt-6 card p-3.5">
        <div className="eyebrow">DATA</div>
        <p className="mt-1.5 text-[11px] leading-relaxed text-slate">
          学习记录保存在浏览器本地，不上传服务器。换设备或清理浏览器前，建议导出备份。
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => {
              const blob = new Blob([store.exportJSON()], { type: 'application/json' })
              const a = document.createElement('a')
              a.href = URL.createObjectURL(blob)
              a.download = `macro-lab-backup-${todayKey()}.json`
              a.click()
              URL.revokeObjectURL(a.href)
            }}
            className="btn-ghost !py-2 !text-[11.5px]"
          >
            导出备份
          </button>
          <button onClick={() => fileRef.current?.click()} className="btn-ghost !py-2 !text-[11.5px]">
            导入备份
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0]
              if (!f) return
              try {
                store.importJSON(await f.text())
                alert('导入成功')
              } catch {
                alert('文件格式不正确')
              }
            }}
          />
          <button
            onClick={() => {
              if (confirm('确定清空所有学习记录？此操作不可撤销，建议先导出备份。')) store.reset()
            }}
            className="btn !py-2 !text-[11.5px] border border-[#E7C9C1] text-up"
          >
            清空记录
          </button>
        </div>
      </section>

      <section className="mt-4 rounded-xl border border-line bg-[#FBFAF6] px-3.5 py-3 text-[10.5px] leading-relaxed text-slate">
        <span className="font-medium text-ink">判分说明：</span>
        选择题比对字母；判断题识别「对/正确/√」与「错/错误/×」；填空题归一化全角标点与空格，支持同义写法与数值容差；简答题按「要点组」命中率 ≥70% 判对，并列出未覆盖要点。
      </section>

      <footer className="mt-6 border-t border-line pt-4 text-[10px] leading-relaxed text-slate/70">
        MACRO LAB · 宏观经济学研究所 · 教学用途，非投资建议。
        <br />
        课程骨架：曼昆《经济学原理（第 10 版）：宏观经济学分册》第 24—38 章；讲解、案例与图表为原创整理。
      </footer>
    </div>
  )
}
