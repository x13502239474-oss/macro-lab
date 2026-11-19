# 课程深度扩充进度（任务追踪）

> 用途：本文件记录「72 课深度扩充」的统一标准与逐文件完成情况。
> 每次续做前先读本文件，确保新增内容的体例、结构、口径完全一致。

## 一、统一扩充标准（每课必须落到 12 项）

| # | 标准 | 落位方式 |
|---|---|---|
| 1 | 本章导读与学习目标 | `obj`（4—5 条，含 1 条历史/假设类目标）+ `lead` |
| 2 | 核心概念详细解释 | `{k:[术语, 大白话定义]}`，3—5 张卡 |
| 3 | 理论背景及历史发展 | 新增一节 `理论背景：…`，写人物、年份、著作、争论 |
| 4 | 经济模型与基本假设 | 在 `理论讲解` 中显式列出「三条假设」并说明失效后果 |
| 5 | 公式及变量的逐一解释 | 公式后用 `{p:'**变量逐一解释**…'}` 或 `{o:[...]}` 逐项拆 |
| 6 | 模型推导与计算示例 | 公式给出「怎么推出来的」，再配一个手算数字例 |
| 7 | 经济曲线和图形分析 | 图表后加 `**读图五问**` + 5 条 `{o}`：横纵轴/形状原因/移动原因/均衡/经济含义 |
| 8 | 现实经济案例 | `{c:[标题, 正文]}`，保留原有 + 补机制解释 |
| 9 | 理论的适用条件和局限 | 新增末节 `适用条件、局限与常见错误` 第一部分 |
| 10 | 常见理解错误 | 同节，`{w:'错误一/二/三…'}` 至少 3 条 |
| 11 | 至少 5 道练习题 | `quiz` ≥ 5 题，新增题放在末尾 |
| 12 | 完整答案及解析 | 每题 `ex` 写清「为什么错」「怎么算」，计算题必须给步骤 |

### 硬性约束
- **不得**新增 Block 类型（渲染器 `src/components/Blocks.tsx` 不改）。
- **不得**改动 `lesson.id` 与已有 `quiz.id`（LocalStorage 学习记录按 id 存）。
- 新增题目 id 规则：`<lessonId>-<序号>`，接着已有最大序号往上加。
- 所有事实数据必须注明来源与年份；理论推演与事实数据分开表述。
- 学派分歧要标明「本课程采信方案」，不得混为一谈。
- 公式字符串注意反斜杠转义（TS 内写 `\\frac`）。

## 二、逐文件进度

| 文件 | 课程 | 状态 |
|---|---|---|
| `p1a.ts` | 1-1 ~ 1-5 | ✅ 已完成（5 课全部 12 项，题 4→5） |
| `p1b.ts` | 1-6 ~ 1-10 | ✅ 已完成（5 课，1-7/1-10 原已 5 题） |
| `p2a.ts` | 2-1 ~ 2-4 | ✅ 已完成（4 课全部补 5 题） |
| `p2b.ts` | 2-5 ~ 2-8 | ✅ 已完成（4 课全部补 5 题） |
| `p2c.ts` | 2-9 ~ 2-12 | ✅ 已完成（4 课，2-11 扩为 32 分钟含完整数值求解） |
| `p3a.ts` | 3-1 ~ 3-4 | ✅ 已完成（4 课全部 12 项，题 4→5） |
| `p3b.ts` | 3-5 ~ 3-8 | ✅ 已完成（4 课，含通胀偏差推导、利率走廊数值） |
| `p3c.ts` | 3-9 ~ 3-12 | ✅ 已完成（新增 `money-market-demo` 图，31 图） |
| `p4a.ts` | 4-1 ~ 4-4 | ✅ 已完成（4 课全部 12 项，含稳态失业率与匹配函数计算） |
| `p4b.ts` | 4-5 ~ 4-8 | ✅ 已完成（4 课，含最低工资供求算例、奥肯双向计算） |
| `p4c.ts` | 4-9 ~ 4-12 | ✅ 已完成（4 课，含 AD-AS 数值解、衰退类型定量辨识） |
| `p5a.ts` | 5-1 ~ 5-3 | ✅ 已完成（含均衡产出四步推导、转移支付乘数对比、税率—乘数对照表） |
| `p5b.ts` | 5-4 ~ 5-6 | ✅ 已完成（新增 `loanable-funds-demo`、`fiscal-balance-demo` 两图；`debt-dynamics` 数据改为严格按债务动态方程递推） |
| `p5c.ts` | 5-7 ~ 5-10 | ✅ 已完成（新增 `rate-corridor-demo`、`fed-bs`、`cn-m2-tsf` 三图；含泰勒规则、LPR 加点、购债派生算例） |
| `p5d.ts` | 5-11 ~ 5-14 | ✅ 已完成（新增 `policy-lag-demo` 图；挤出三形态、牺牲率算例、时滞判据） |
| `p6a.ts` | 6-1 ~ 6-4 | ✅ 已完成（新增 `cn-openness`、`cn-fx-reserves` 两图；NX=S−I 数值闭合演示、马歇尔—勒纳算例、三元悖论） |
| `p6b.ts` | 6-5 ~ 6-8 | ✅ 已完成（新增 `cn-bop`、`real-fx-demo`、`bigmac-demo` 三图；利率平价与相对 PPP 算例） |
| `p6c.ts` | 6-9 ~ 6-12 | ✅ 已完成（新增 `us-trade-balance`、`small-open-demo` 两图；吸收法、两市场框架、蒙代尔—弗莱明结论） |

## 二之二、最终统计（全部完成）

| 指标 | 扩充前 | 完成后 |
|---|---|---|
| 课程数 | 72 | 72（id 未改） |
| 题目数 | 300 | **361**（judge 72 / single 162 / fill 115 / short 12） |
| 图表数 | 30 | **44** |
| 每课题量 | 部分仅 4 题 | 全部 ≥ 5 题（6-11 为 6 题） |
| 校验状态 | — | `tsc --noEmit` 通过，`validate` OK |

## 三、每批完成后的验收命令

```bash
npx tsc --noEmit
npx esbuild scripts/validate.ts --bundle --format=cjs --platform=node \
  --outfile=scripts/.tmp-validate.cjs --log-level=error
node scripts/.tmp-validate.cjs
```

基线数据（扩充前）：72 课 / 300 题 / 30 图 / 10 案例 / 23 节点。
扩充后题量应逐批上升，**最终目标 ≥ 72×5 = 360 题**。

## 四、图表补齐情况（已完成）

用户点名要求的图形已全部补齐，图表总数 **30 → 44**（新增 14 张）：

| 用户点名的图 | 对应 id |
|---|---|
| 货币供给与货币需求 | `money-market-demo` |
| 可贷资金市场 / 财政政策冲击 | `loanable-funds-demo`、`fiscal-balance-demo` |
| 货币政策传导 | `rate-corridor-demo`、`fed-bs`、`cn-m2-tsf` |
| 政策时滞 | `policy-lag-demo` |
| 汇率变化机制 | `cn-openness`、`cn-fx-reserves`、`cn-bop`、`real-fx-demo`、`bigmac-demo` |
| 开放经济与贸易 | `us-trade-balance`、`small-open-demo` |

原有图形（GDP 核算 `cn-expenditure`、CPI `cpi-basket` / `gdp-deflator-cn`、名义实际对比 `real-nominal-demo`、AD-AS `adas-static` 等）保持不变。

修正记录：`debt-dynamics` 数据改为严格按 `bₜ₊₁=(1+r−g)/(1+g)·bₜ+赤字率` 递推；`cn-unemp` 参考线由 `y=5` 却标注 5.5% 改为 `y=5.5`；`small-open-demo` 参考线改为数值横轴 + 垂直虚线（r*=4%），读图五问文案同步改正。

## 五、部署记录（2026-11-19 完成）

- 线上：https://x13502239474-oss.github.io/macro-lab/ （Pages，`build_type=workflow`，push 到 main 自动触发 Actions）
- 本次推送：commit `433bf8c5`，tree `456ee35` 与本地 HEAD 完全一致；Actions run `44540770247` → `completed / success`
- 线上验证：HTTP 200；实时构建包内含 `small-open-demo`、`money-market-demo`、`loanable-funds-demo`、`鲍莫尔`、`巨无霸指数` 等新版标记，确认非旧缓存
- **推送一律用 `node scripts/gh-push.cjs`（REST API 压缩提交），不要用 `git push`**：远端 main 由压缩提交维护，本地 5 个提交的历史与远端不同步；`git push` 会因无关历史分叉被拒，强行 `merge --allow-unrelated-histories` 会产生全文件 add/add 冲突（本次踩过，已 `git merge --abort` 回退）。
- **token 坑**：`GH_TOKEN` 必须核对拼写。错一个字符会返回 401，脚本报失败但容易误判成"远端没变"。推送前先 `curl -o /dev/null -w "%{http_code}"` 验证仓库访问为 200。
- LocalStorage 学习记录未触碰：全程未改 `lesson.id` 与已有 `quiz.id`。
