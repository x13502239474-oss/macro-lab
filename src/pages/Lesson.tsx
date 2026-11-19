import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Blocks } from '../components/Blocks'
import { QuizBlock } from '../components/Quiz'
import { byId, nextLesson, phases, prevLesson } from '../content/lessons'
import { useStore } from '../lib/useStore'
import { store } from '../lib/store'

export default function LessonPage() {
  const { id = '' } = useParams()
  const lesson = byId(id)
  const s = useStore()
  const [progress, setProgress] = useState(0)
  const [noteOpen, setNoteOpen] = useState(false)
  const [note, setNote] = useState('')
  const seconds = useRef(0)

  useEffect(() => {
    window.scrollTo(0, 0)
    setNote(store.get().notes[id] ?? '')
    setNoteOpen(false)
  }, [id])

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      setProgress(h > 0 ? Math.min(100, Math.round((window.scrollY / h) * 100)) : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [id])

  useEffect(() => {
    const t = window.setInterval(() => {
      seconds.current += 15
      if (seconds.current >= 60) {
        store.addSeconds(id, seconds.current)
        seconds.current = 0
      }
    }, 15000)
    return () => {
      window.clearInterval(t)
      if (seconds.current > 0) store.addSeconds(id, seconds.current)
    }
  }, [id])

  const prev = prevLesson(id)
  const next = nextLesson(id)
  const phase = useMemo(() => phases.find((p) => p.n === lesson?.phase), [lesson])
  const done = s.lessons[id]?.done
  const fav = s.fav.includes(id)

  if (!lesson) {
    return (
      <div className="shell py-16 text-center">
        <p className="text-slate">没有找到这节课。</p>
        <Link to="/courses" className="btn-ghost mt-4">
          返回课程
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="fixed inset-x-0 top-14 z-30 h-[2px] bg-transparent">
        <div className="h-full bg-gold transition-[width] duration-150" style={{ width: `${progress}%` }} />
      </div>

      <div className="shell max-w-[760px] py-4">
        <div className="flex items-center justify-between">
          <Link to="/courses" className="text-[11.5px] text-slate hover:text-ink">
            ← 课程体系
          </Link>
          <div className="flex items-center gap-3">
            <button onClick={() => store.toggleFav(id)} className={`text-[11px] ${fav ? 'text-gold' : 'text-slate'}`}>
              {fav ? '★ 已收藏' : '☆ 收藏'}
            </button>
            <button onClick={() => setNoteOpen((v) => !v)} className="text-[11px] text-slate">
              ✎ 笔记
            </button>
          </div>
        </div>

        <header className="mt-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip !border-ink/15 !bg-ink !text-[9.5px] !text-goldSoft">
              第 {lesson.phase} 阶段 · {phase?.title}
            </span>
            <span className="chip !py-0.5 !text-[9.5px]">教材{lesson.tb}</span>
            <span className="text-[10px] text-slate">{lesson.min} 分钟</span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="num text-[12px] text-gold">{lesson.id}</span>
            <h1 className="font-serif text-[24px] font-semibold leading-tight md:text-[27px]">{lesson.title}</h1>
          </div>
          <p className="mt-1.5 font-serif text-[13.5px] leading-relaxed text-slate">{lesson.sub}</p>
        </header>

        {noteOpen && (
          <div className="card mt-4 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="eyebrow">MY NOTE</span>
              <span className="text-[9.5px] text-slate">自动保存在本机</span>
            </div>
            <textarea
              value={note}
              onChange={(e) => {
                setNote(e.target.value)
                store.setNote(id, e.target.value)
              }}
              rows={4}
              placeholder="用自己的话记下这节的核心结论、疑问或反例……"
              className="w-full resize-y rounded-lg border border-line bg-[#FBFAF6] px-3 py-2 text-[13px] leading-relaxed outline-none focus:border-ink"
            />
          </div>
        )}

        {/* 学习目标 */}
        <section className="card mt-4 overflow-hidden">
          <div className="border-b border-line/70 bg-[#FBFAF6] px-4 py-2.5">
            <span className="eyebrow">OBJECTIVES · 学完你能</span>
          </div>
          <ul className="space-y-2 px-4 py-3">
            {lesson.obj.map((o, i) => (
              <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-ink/80">
                <span className="num mt-[2px] text-[10px] text-gold">{String(i + 1).padStart(2, '0')}</span>
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 导入 */}
        <div className="mt-4 border-l-2 border-gold pl-3.5">
          <p className="font-serif text-[15px] leading-[1.9] text-ink/85">{lesson.lead}</p>
        </div>

        {/* 目录 */}
        <nav className="no-scrollbar mt-4 flex gap-1.5 overflow-x-auto pb-1">
          {lesson.sec.map((sec, i) => (
            <a
              key={i}
              href={`#sec-${i}`}
              className="shrink-0 rounded-full border border-line bg-white px-2.5 py-1 text-[10.5px] text-slate hover:border-ink/25 hover:text-ink"
            >
              {sec.h}
            </a>
          ))}
        </nav>

        {/* 正文 */}
        <article className="mt-2">
          {lesson.sec.map((sec, i) => (
            <section key={i} id={`sec-${i}`} className="scroll-mt-24 border-t border-line/80 py-5 first:border-t-0">
              <div className="mb-3 flex items-baseline gap-2.5">
                <span className="num text-[10px] tracking-widest text-gold">{String(i + 1).padStart(2, '0')}</span>
                <h2 className="font-serif text-[18px] font-semibold leading-snug">{sec.h}</h2>
              </div>
              <Blocks blocks={sec.b} />
            </section>
          ))}
        </article>

        {/* 小结 */}
        <section className="mt-2 overflow-hidden rounded-2xl bg-ink px-4 py-4 text-white">
          <div className="text-[9px] tracking-[0.24em] text-goldSoft">TAKEAWAYS · 本节小结</div>
          <ul className="mt-2.5 space-y-2">
            {lesson.sum.map((x, i) => (
              <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-white/85">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-goldSoft" />
                <span>{x}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 测试 */}
        <div className="mt-6">
          <QuizBlock lesson={lesson} />
        </div>

        {/* 完成与翻页 */}
        <div className="mt-6 flex items-center gap-2">
          <button
            onClick={() => {
              if (done) store.unmarkLesson(id)
              else {
                store.markLesson(id, lesson.min * 60)
                store.touchToday()
              }
            }}
            className={`btn flex-1 ${done ? 'border border-line bg-white text-slate' : 'bg-ink text-white'}`}
          >
            {done ? '✓ 已标记学完（点击取消）' : '标记本课学完'}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {prev ? (
            <Link to={`/lesson/${prev.id}`} className="card px-3 py-3">
              <div className="text-[9px] tracking-[0.16em] text-slate">PREV</div>
              <div className="mt-1 truncate text-[12px] text-ink">
                {prev.id} {prev.title}
              </div>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link to={`/lesson/${next.id}`} className="card px-3 py-3 text-right">
              <div className="text-[9px] tracking-[0.16em] text-gold">NEXT</div>
              <div className="mt-1 truncate text-[12px] text-ink">
                {next.id} {next.title}
              </div>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  )
}
