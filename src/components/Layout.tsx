import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useStore } from '../lib/useStore'
import { streak } from '../lib/store'

const items = [
  {
    to: '/',
    label: '首页',
    icon: (
      <path d="M3 10.5 12 3l9 7.5V21H3z" />
    ),
  },
  {
    to: '/courses',
    label: '课程',
    icon: <path d="M4 5h7v7H4zM13 5h7v7h-7zM4 14h7v6H4zM13 14h7v6h-7z" />,
  },
  {
    to: '/lab',
    label: '数据实验室',
    icon: <path d="M4 19V9m5 10V5m5 14v-7m5 7V8" />,
  },
  {
    to: '/mistakes',
    label: '错题',
    icon: <path d="M5 4h14v17l-7-4-7 4z" />,
  },
  {
    to: '/me',
    label: '我的',
    icon: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-8 9a8 8 0 0 1 16 0" />,
  },
]

export function Layout({ children }: { children: ReactNode }) {
  const s = useStore()
  const loc = useLocation()
  const wrong = Object.entries(s.ans).filter(([, r]) => !r.ok).length
  const st = streak(s.days)
  const hiddenNav = loc.pathname.startsWith('/lesson/') || loc.pathname.startsWith('/case/')

  return (
    <div className="min-h-screen bg-paper pb-[76px] md:pb-0">
      <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/90 backdrop-blur">
        <div className="shell flex h-14 items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-ink font-serif text-[11px] font-semibold tracking-tight text-goldSoft">
              ML
            </span>
            <span className="leading-none">
              <span className="block font-serif text-[13.5px] font-semibold tracking-[0.14em] text-ink">MACRO LAB</span>
              <span className="mt-1 block text-[9px] tracking-[0.22em] text-slate">宏观经济学研究所</span>
            </span>
          </NavLink>

          <div className="hidden items-center gap-6 md:flex">
            {items.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                className={({ isActive }) =>
                  `text-[13px] transition ${isActive ? 'font-medium text-ink' : 'text-slate hover:text-ink'}`
                }
              >
                {it.label}
              </NavLink>
            ))}
            <span className="text-[10.5px] text-slate">
              连续 <span className="num text-ink">{st}</span> 天
            </span>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <span className="chip !py-0.5 !text-[9.5px]">教学数据</span>
          </div>
        </div>
      </header>

      <main>{children}</main>

      {!hiddenNav && (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur md:hidden">
          <div className="mx-auto flex max-w-[560px] items-stretch justify-between px-1 pb-[max(6px,env(safe-area-inset-bottom))] pt-1.5">
            {items.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                className={({ isActive }) => `relative flex flex-1 flex-col items-center gap-1 py-1 ${isActive ? 'text-ink' : 'text-slate/70'}`}
              >
                {({ isActive }) => (
                  <>
                    <svg
                      viewBox="0 0 24 24"
                      className="h-[19px] w-[19px]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={isActive ? 1.9 : 1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {it.icon}
                    </svg>
                    <span className={`text-[9.5px] ${isActive ? 'font-medium' : ''}`}>{it.label}</span>
                    {it.to === '/mistakes' && wrong > 0 && (
                      <span className="absolute right-[18%] top-0 min-w-[14px] rounded-full bg-up px-1 text-center text-[8px] leading-[14px] text-white">
                        {wrong > 99 ? '99+' : wrong}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  )
}
