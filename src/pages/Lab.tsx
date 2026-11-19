import { Link } from 'react-router-dom'

const items = [
  { id: 'gdp', no: '01', title: 'GDP 计算器', desc: '拆解 C+I+G+NX，观察结构占比与分项影响。', f: 'GDP = C + I + G + NX', tag: '核算' },
  { id: 'cpi', no: '02', title: '通货膨胀模拟器', desc: '编辑商品篮子与权重，合成 CPI 与通胀率。', f: 'CPI = ΣwP¹/ΣwP⁰', tag: '物价' },
  { id: 'growth', no: '03', title: '经济增长模拟器', desc: '索洛模型：储蓄、人口、技术如何决定长期路径。', f: 'Δk = sAk^α − (δ+n+g)k', tag: '长期' },
  { id: 'money', no: '04', title: '货币政策模拟器', desc: '调整政策利率，观察投资、需求、通胀的联动。', f: '缺口 = −1.2(r−r*)+冲击', tag: '政策' },
  { id: 'fiscal', no: '05', title: '财政政策模拟器', desc: '政府支出与税率，如何改变乘数、赤字与债务。', f: 'm = 1/[1−MPC(1−t)]', tag: '政策' },
  { id: 'unemp', no: '06', title: '失业率模拟器', desc: '存量分类与流量动态，理解失业率的两种视角。', f: 'u* = s/(s+f)', tag: '就业' },
  { id: 'fx', no: '07', title: '汇率模拟器', desc: '名义汇率、物价与实际汇率，检验购买力平价。', f: 'ε = e·P*/P', tag: '开放' },
  { id: 'adas', no: '08', title: '总需求—总供给模拟器', desc: '移动 AD 与 SRAS，看需求冲击与供给冲击的差别。', f: 'NX(ε) = NCO', tag: '周期' },
]

export default function Lab() {
  return (
    <div className="shell py-4 md:py-6">
      <div className="eyebrow">DATA LABORATORY</div>
      <h1 className="mt-1 font-serif text-[24px] font-semibold">宏观经济数据实验室</h1>
      <p className="mt-2 max-w-[58ch] text-[12.5px] leading-relaxed text-slate">
        八个可交互模型，每个都有真实计算逻辑。调参数、看曲线、读结论——把公式变成手感。所有模型均为教学简化，页内会明确说明假设与局限。
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <Link key={it.id} to={`/lab/${it.id}`} className="card group flex flex-col justify-between p-4 transition hover:border-ink/25">
            <div>
              <div className="flex items-center justify-between">
                <span className="num text-[10px] tracking-[0.18em] text-gold">{it.no}</span>
                <span className="chip !py-0.5 !text-[9px]">{it.tag}</span>
              </div>
              <h2 className="mt-2 font-serif text-[16.5px] font-semibold leading-snug">{it.title}</h2>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-slate">{it.desc}</p>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-line/70 pt-2.5">
              <code className="text-[9.5px] text-slate/70">{it.f}</code>
              <span className="text-[11px] text-slate transition group-hover:text-ink">进入 →</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-line bg-[#FBFAF6] px-3.5 py-3 text-[11px] leading-relaxed text-slate">
        <span className="font-medium text-ink">使用说明：</span>
        所有参数与结果都保存在当前页面，刷新后恢复默认值；学习记录（课程进度、答题、笔记）保存在浏览器本地（localStorage），不上传服务器。清理浏览器数据会丢失记录，可在「我的」中导出备份。
      </div>
    </div>
  )
}
