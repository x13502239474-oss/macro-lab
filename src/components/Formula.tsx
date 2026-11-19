import { useMemo } from 'react'
import katex from 'katex'

export function Formula({ tex, caption }: { tex: string; caption?: string }) {
  const html = useMemo(
    () => katex.renderToString(tex, { displayMode: true, throwOnError: false, strict: false }),
    [tex],
  )
  return (
    <figure className="my-4 overflow-hidden rounded-xl border border-line bg-[#FBFAF6]">
      <div className="overflow-x-auto px-3 py-3.5" dangerouslySetInnerHTML={{ __html: html }} />
      {caption && <figcaption className="border-t border-line/70 px-3 py-2 text-[11px] leading-relaxed text-slate">{caption}</figcaption>}
    </figure>
  )
}

export function InlineMath({ tex }: { tex: string }) {
  const html = useMemo(() => katex.renderToString(tex, { throwOnError: false, strict: false }), [tex])
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}
