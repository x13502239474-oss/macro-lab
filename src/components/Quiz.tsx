import { useMemo, useState } from 'react'
import type { Lesson, Q } from '../lib/types'
import { grade } from '../lib/grade'
import { store } from '../lib/store'

const TYPE_LABEL: Record<string, string> = { single: '单项选择', judge: '判断', fill: '填空', short: '简答' }

export function QuestionCard({
  q,
  index,
  value,
  onChange,
  graded,
  compact,
}: {
  q: Q
  index: number
  value: string
  onChange: (v: string) => void
  graded: boolean
  compact?: boolean
}) {
  const g = useMemo(() => (graded ? grade(q, value) : null), [graded, q, value])

  return (
    <div className={`rounded-xl border bg-white p-3.5 ${graded ? (g?.ok ? 'border-down/30' : 'border-up/30') : 'border-line'}`}>
      <div className="mb-2 flex items-center gap-2">
        <span className="num text-[11px] text-slate">{String(index + 1).padStart(2, '0')}</span>
        <span className="chip !py-0.5 !text-[10px]">{TYPE_LABEL[q.type]}</span>
        {graded && (
          <span className={`ml-auto text-[11px] font-medium ${g?.ok ? 'text-down' : 'text-up'}`}>{g?.ok ? '正确' : '再想想'}</span>
        )}
      </div>
      <p className="text-[14px] leading-relaxed text-ink">{q.stem}</p>

      <div className="mt-3 space-y-1.5">
        {q.type === 'single' &&
          q.options?.map((o) => {
            const letter = o.slice(0, 1)
            const active = value === letter
            const isRight = graded && q.answer === letter
            return (
              <button
                key={o}
                onClick={() => !graded && onChange(letter)}
                className={`flex w-full items-start gap-2.5 rounded-lg border px-3 py-2 text-left text-[13px] leading-relaxed transition ${
                  isRight
                    ? 'border-down/50 bg-[#EEF4F0]'
                    : active
                      ? 'border-ink bg-[#F3F5F7]'
                      : 'border-line/80 bg-white hover:border-slate/40'
                }`}
              >
                <span className={`mt-[1px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[9px] ${active ? 'border-ink bg-ink text-white' : 'border-slate/50 text-slate'}`}>
                  {letter}
                </span>
                <span className="text-ink/85">{o.slice(2)}</span>
              </button>
            )
          })}

        {q.type === 'judge' &&
          ['对', '错'].map((o) => {
            const active = value === o
            const isRight = graded && q.answer === o
            return (
              <button
                key={o}
                onClick={() => !graded && onChange(o)}
                className={`mr-2 rounded-lg border px-5 py-2 text-[13px] transition ${
                  isRight ? 'border-down/50 bg-[#EEF4F0] text-ink' : active ? 'border-ink bg-[#F3F5F7]' : 'border-line text-ink/70'
                }`}
              >
                {o}
              </button>
            )
          })}

        {q.type === 'fill' && (
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={graded}
            placeholder="填写关键词或数字"
            className="w-full rounded-lg border border-line bg-[#FBFAF6] px-3 py-2.5 text-[14px] outline-none focus:border-ink disabled:text-ink/70"
          />
        )}

        {q.type === 'short' && (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={graded}
            rows={compact ? 3 : 4}
            placeholder="用 2—3 句话作答，系统按要点判分"
            className="w-full resize-y rounded-lg border border-line bg-[#FBFAF6] px-3 py-2.5 text-[13.5px] leading-relaxed outline-none focus:border-ink disabled:text-ink/70"
          />
        )}
      </div>

      {graded && g && (
        <div className="mt-3 border-t border-line/80 pt-2.5">
          <div className="mb-1 flex flex-wrap items-center gap-2 text-[11px]">
            <span className={g.ok ? 'text-down' : 'text-up'}>{g.ok ? '判分通过' : '未通过'}</span>
            <span className="text-slate">· {g.basis}</span>
          </div>
          {!g.ok && q.type !== 'short' && (
            <p className="mb-1 text-[12px] text-ink/70">
              参考答案：<span className="font-medium text-ink">{q.answer}</span>
            </p>
          )}
          {!g.ok && g.missing && g.missing.length > 0 && (
            <p className="mb-1 text-[12px] text-ink/70">未覆盖要点：{g.missing.join('、')}</p>
          )}
          <p className="text-[12.5px] leading-relaxed text-ink/75">{q.ex}</p>
        </div>
      )}
    </div>
  )
}

export function QuizBlock({ lesson }: { lesson: Lesson }) {
  const [ans, setAns] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const allAnswered = lesson.quiz.every((q) => (ans[q.id] ?? '').trim().length > 0)

  const result = useMemo(() => {
    const rows = lesson.quiz.map((q) => ({ q, ok: grade(q, ans[q.id] ?? '').ok }))
    const right = rows.filter((r) => r.ok).length
    return { rows, right, total: rows.length, pct: Math.round((right / rows.length) * 100) }
  }, [lesson.quiz, ans, submitted])

  const submit = () => {
    lesson.quiz.forEach((q) => {
      const g = grade(q, ans[q.id] ?? '')
      store.answer(q.id, g.ok, ans[q.id] ?? '')
    })
    store.touchToday(`quiz:${lesson.id}`)
    setSubmitted(true)
    window.setTimeout(() => document.getElementById('quiz-result')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60)
  }

  return (
    <section id="quiz" className="scroll-mt-16">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <div className="eyebrow">SECTION TEST</div>
          <h2 className="mt-1 font-serif text-[19px] font-semibold">章节测试</h2>
        </div>
        <span className="text-[11px] text-slate">
          {lesson.quiz.length} 题 · 自动判分
        </span>
      </div>

      <div className="space-y-3">
        {lesson.quiz.map((q, i) => (
          <QuestionCard
            key={q.id}
            q={q}
            index={i}
            value={ans[q.id] ?? ''}
            onChange={(v) => setAns((s) => ({ ...s, [q.id]: v }))}
            graded={submitted}
          />
        ))}
      </div>

      {!submitted ? (
        <div className="mt-4">
          <button onClick={submit} disabled={!allAnswered} className={`btn-primary w-full ${!allAnswered ? 'opacity-40' : ''}`}>
            {allAnswered ? '提交并查看解析' : `还有 ${lesson.quiz.filter((q) => !(ans[q.id] ?? '').trim()).length} 题未作答`}
          </button>
          <p className="mt-2 text-center text-[10.5px] text-slate">答错的题会自动进入错题本，可在「错题」中重做。</p>
        </div>
      ) : (
        <div id="quiz-result" className="mt-4 rounded-2xl border border-ink/10 bg-ink px-4 py-4 text-white">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[10px] tracking-[0.2em] text-goldSoft">SCORE</div>
              <div className="num mt-1 text-[32px] leading-none">
                {result.right}
                <span className="text-[15px] text-white/50"> / {result.total}</span>
              </div>
            </div>
            <div className="text-right text-[11px] text-white/60">
              正确率 {result.pct}%
              <br />
              {result.pct >= 80 ? '可以进入下一课' : '建议重读易错点'}
            </div>
          </div>
          <div className="mt-3 h-1 w-full overflow-hidden rounded bg-white/15">
            <div className="h-full rounded bg-goldSoft" style={{ width: `${result.pct}%` }} />
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => {
                setAns({})
                setSubmitted(false)
              }}
              className="btn flex-1 border border-white/25 text-[12px] text-white"
            >
              重做本课
            </button>
            <a href="#/mistakes" className="btn flex-1 bg-white/10 text-[12px] text-white">
              查看错题本
            </a>
          </div>
        </div>
      )}
    </section>
  )
}
