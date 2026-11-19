import { useEffect } from 'react'
import { Route, Routes, useLocation, useParams } from 'react-router-dom'
import { Layout } from './components/Layout'
import Home from './pages/Home'
import Courses from './pages/Courses'
import LessonPage from './pages/Lesson'
import Lab from './pages/Lab'
import Mistakes from './pages/Mistakes'
import Me from './pages/Me'
import Cases from './pages/Cases'
import CaseDetail from './pages/CaseDetail'
import Graph from './pages/Graph'
import GdpLab from './pages/lab/GdpLab'
import CpiLab from './pages/lab/CpiLab'
import GrowthLab from './pages/lab/GrowthLab'
import MoneyLab from './pages/lab/MoneyLab'
import FiscalLab from './pages/lab/FiscalLab'
import UnempLab from './pages/lab/UnempLab'
import FxLab from './pages/lab/FxLab'
import AdasLab from './pages/lab/AdasLab'

const labs: Record<string, () => JSX.Element> = {
  gdp: GdpLab,
  cpi: CpiLab,
  growth: GrowthLab,
  money: MoneyLab,
  fiscal: FiscalLab,
  unemp: UnempLab,
  fx: FxLab,
  adas: AdasLab,
}

function LabDetail() {
  const { id = '' } = useParams()
  const C = labs[id]
  if (!C) return <Lab />
  return (
    <div className="shell max-w-[860px] py-4 md:py-6">
      <BackLink />
      <C />
    </div>
  )
}

function BackLink() {
  return (
    <a href="#/lab" className="mb-2 inline-block text-[11.5px] text-slate hover:text-ink">
      ← 数据实验室
    </a>
  )
}

export default function App() {
  const loc = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [loc.pathname])

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/lesson/:id" element={<LessonPage />} />
        <Route path="/lab" element={<Lab />} />
        <Route path="/lab/:id" element={<LabDetail />} />
        <Route path="/mistakes" element={<Mistakes />} />
        <Route path="/me" element={<Me />} />
        <Route path="/cases" element={<Cases />} />
        <Route path="/case/:id" element={<CaseDetail />} />
        <Route path="/graph" element={<Graph />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Layout>
  )
}
