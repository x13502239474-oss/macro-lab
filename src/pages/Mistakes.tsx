import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { allQuestions, phases } from '../content/lessons'
import { QuestionCard } from '../components/Quiz'
import { grade } from '../lib/grade'
import { store } from '../lib/store'
import { useStore } from '../lib/useStore'

export default function Mistakes() {
  const s = useStore()
  const [phase, setPhase] = useState<number | 0>(0)
  const [type, setType] = useState<string>('all')
  const [openId, setOpenId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [graded, setGraded] = useState(false)
  const [cleared, setCleared] = useState<string[]>([])

  const wrong = useMemo(
    () =>
      allQuestions
        .filter((q) => {
          const r = s.ans[q.id]
          return r && !r.ok
        })
        .filter((q) => (phase === 0 ? true : Number(q.lessonId.split('-')[0]) === phase))
        .filter((q) => (type === 'all' ? true : q.type === type)),
    [s.ans, phase, type],
  )

  const totalWrong = Object.values(s.ans).filter((r) => !r.ok).length

  const start = (id: string) => {
    setOpenId(id)
    setDraft('')
    setGraded(false)
  }

  const submit = (qid: string, ans: string) => {
    const q = allQuestions.find((x) => x.id === qid)!
    const g = grade(q, ans)
    store.answer(qid, g.ok, ans)
    store.touchToday('review:mistake')
    setGraded(true)
    if (g.ok) setCleared((c) => [...c, qid])
  }

  return (
    <div className="shell py-4 md:py-6">
      <div className="flex items-end justify-between">
        <div>
          <div className="eyebrow">ERROR NOTEBOOK</div>
          <h1 className="mt-1 font-serif text-[24px] font-semibold">错题本</h1>
        </div>
        <span className="text-[11px] text-slate">
          待复习 <span className="num text-up">{totalWrong}</span> 题
        </span>
      </div>

      <div className="no-scrollbar mt-3 flex gap-1.5 overflow-x-auto">
        <button
          onClick={() => setPhase(0)}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] ${phase === 0 ? 'border-ink bg-ink text-white' : 'border-line bg-white text-slate'}`}
        >
          全部阶段
        </button>
        {phases.map((p) => (
          <button
            key={p.n}
            onClick={() => setPhase(p.n)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] ${phase === p.n ? 'border-ink bg-ink text-white' : 'border-line bg-white text-slate'}`}
          >
            {p.n} {p.title}
          </button>
        ))}
      </div>

      <div className="mt-2 flex gap-1.5">
        {[
          { k: 'all', l: '全部题型' },
          { k: 'single', l: '选择' },
          { k: 'judge', l: '判断' },
          { k: 'fill', l: '填空' },
          { k: 'short', l: '简答' },
        ].map((t) => (
          <button
            key={t.k}
            onClick={() => setType(t.k)}
            className={`rounded-md px-2.5 py-1 text-[10.5px] ${type === t.k ? 'bg-[#EFEBE2] font-medium text-ink' : 'text-slate'}`}
          >
            {t.l}
          </button>
        ))}
      </div>

      {wrong.length === 0 ? (
        <div className="card mt-5 px-5 py-12 text-center">
          <div className="font-serif text-[17px] text-ink">{totalWrong === 0 ? '错题本是空的' : '当前筛选下没有错题'}</div>
          <p className="mx-auto mt-2 max-w-[30ch] text-[12px] leading-relaxed text-slate">
            {totalWrong === 0 ? '完成课程章节测试后，答错的题会自动收进这里，并附上解析。' : '换一个阶段或题型看看。'}
          </p>
          <Link to="/courses" className="btn-ghost mt-4">
            去上课
          </Link>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {wrong.map((q) => {
            const isOpen = openId === q.id
            const isCleared = cleared.includes(q.id)
            return (
              <div key={q.id} className="card overflow-hidden">
                <div className="flex items-center gap-2 border-b border-line/70 bg-[#FBFAF6] px-3.5 py-2">
                  <Link to={`/lesson/${q.lessonId}`} className="text-[10px] text-ink/80 underline decoration-goldSoft decoration-2 underline-offset-2">
                    {q.lessonId} {q.lessonTitle}
                  </Link>
                  <span className="ml-auto text-[9.5px] text-slate">{s.ans[q.id]?.tries ?? 0} 次作答</span>
                </div>
                <div className="p-3">
                  {isOpen ? (
                    <>
                      <QuestionCard q={q} index={0} value={draft} onChange={setDraft} graded={graded} compact />
                      {!graded ? (
                        <button onClick={() => submit(q.id, draft)} disabled={!draft.trim()} className={`btn-primary mt-2.5 w-full !py-2 !text-[12px] ${!draft.trim() ? 'opacity-40' : ''}`}>
                          提交重做
                        </button>
                      ) : (
                        <div className="mt-2 flex items-center gap-2">
                          {isCleared ? (
                            <span className="text-[11.5px] text-down">✓ 答对了，已移出错题本</span>
                          ) : (
                            <span className="text-[11.5px] text-up">仍未答对，再看一遍解析</span>
                          )}
                          <button onClick={() => setOpenId(null)} className="ml-auto text-[11px] text-slate">
                            收起
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-start gap-3">
                      <p className="line-clamp-2 flex-1 text-[13px] leading-relaxed text-ink/85">{q.stem}</p>
                      <button onClick={() => start(q.id)} className="btn-ghost shrink-0 !px-3 !py-1.5 !text-[11px]">
                        重做
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className="mt-4 text-[10px] leading-relaxed text-slate/70">
        错题记录保存的是每道题的最新作答状态：答对后自动移出，再次答错会重新进入。判分规则见「我的 → 判分说明」。
      </p>
    </div>
  )
}
