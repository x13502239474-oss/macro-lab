import type { Lesson, Phase } from '../../lib/types'
import { p1a } from './p1a'
import { p1b } from './p1b'
import { p2a } from './p2a'
import { p2b } from './p2b'
import { p2c } from './p2c'
import { p3a } from './p3a'
import { p3b } from './p3b'
import { p3c } from './p3c'
import { p4a } from './p4a'
import { p4b } from './p4b'
import { p4c } from './p4c'
import { p5a } from './p5a'
import { p5b } from './p5b'
import { p5c } from './p5c'
import { p5d } from './p5d'
import { p6a } from './p6a'
import { p6b } from './p6b'
import { p6c } from './p6c'

export const phases: Phase[] = [
  {
    n: 1,
    key: 'foundation',
    title: '宏观经济学基础',
    en: 'Foundations',
    desc: '从 GDP 与物价指数开始，学会读懂一国经济的体检报告。',
    tb: '教材第24—25章',
  },
  {
    n: 2,
    key: 'growth',
    title: '长期经济增长',
    en: 'Long-Run Growth',
    desc: '生产率、资本、人力资本与技术，决定几代人的生活水平。',
    tb: '教材第26—28章',
  },
  {
    n: 3,
    key: 'money',
    title: '货币与金融体系',
    en: 'Money & Banking',
    desc: '货币如何被创造，央行如何调节，通胀从何而来。',
    tb: '教材第30—31章',
  },
  {
    n: 4,
    key: 'cycles',
    title: '失业与经济波动',
    en: 'Unemployment & Cycles',
    desc: '失业的四种类型，以及总需求—总供给模型如何解释衰退。',
    tb: '教材第29、34章',
  },
  {
    n: 5,
    key: 'policy',
    title: '宏观经济政策',
    en: 'Policy',
    desc: '财政与货币工具箱、乘数、挤出、菲利普斯曲线与六大争论。',
    tb: '教材第35—37章',
  },
  {
    n: 6,
    key: 'open',
    title: '开放经济与国际经济',
    en: 'Open Economy',
    desc: '汇率、贸易余额、资本流动，以及全球化下的政策约束。',
    tb: '教材第32—33章',
  },
]

export const lessons: Lesson[] = [
  ...p1a,
  ...p1b,
  ...p2a,
  ...p2b,
  ...p2c,
  ...p3a,
  ...p3b,
  ...p3c,
  ...p4a,
  ...p4b,
  ...p4c,
  ...p5a,
  ...p5b,
  ...p5c,
  ...p5d,
  ...p6a,
  ...p6b,
  ...p6c,
].sort((a, b) => {
  if (a.phase !== b.phase) return a.phase - b.phase
  const na = Number(a.id.split('-')[1])
  const nb = Number(b.id.split('-')[1])
  return na - nb
})

export const byId = (id: string) => lessons.find((l) => l.id === id)

export const lessonsOf = (phase: number) => lessons.filter((l) => l.phase === phase)

export const globalIndex = (id: string) => lessons.findIndex((l) => l.id === id)

export const prevLesson = (id: string) => {
  const i = globalIndex(id)
  return i > 0 ? lessons[i - 1] : undefined
}

export const nextLesson = (id: string) => {
  const i = globalIndex(id)
  return i >= 0 && i < lessons.length - 1 ? lessons[i + 1] : undefined
}

export const allQuestions = lessons.flatMap((l) => l.quiz.map((q) => ({ ...q, lessonId: l.id, lessonTitle: l.title })))

export const totalMinutes = lessons.reduce((s, l) => s + l.min, 0)

export const stats = {
  lessons: lessons.length,
  questions: allQuestions.length,
  minutes: totalMinutes,
  phases: phases.length,
}
