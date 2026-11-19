# MACRO LAB · 宏观经济学研究所

手机端优先的宏观经济学自学网站。以曼昆《经济学原理（第 10 版）：宏观经济学分册》第 24—38 章为骨架，自建 72 节课程、8 个可交互宏观模拟器、10 个案例、知识图谱与完整学习管理。

> 教学用途，非投资建议。站内指标为公开年度统计的教学整理值，不是实时行情。

## 功能

| 模块 | 内容 |
| --- | --- |
| 首页 | 全球经济观察台（8 个核心指标 + 迷你走势）、今日经济学、学习进度、宏观观察 |
| 课程 | 6 阶段 72 节，每节含学习目标、核心概念、理论讲解、公式推导、模型、数据图表、中美/国际案例、小结、章节测试 |
| 数据实验室 | 8 个模拟器：GDP、通胀（CPI）、增长（索洛）、货币政策、财政政策、失业、汇率、AD-AS |
| 案例库 | 10 个案例，统一结构：背景 → 核心指标 → 冲击 → 模型 → 政策 → 结果 → 启示 + 学派分歧 |
| 知识图谱 | 23 个概念节点、25 条传导关系，可点击查看定义、相关课程与案例 |
| 错题本 | 四种题型自动判分，答错自动入库，可单题重做，答对自动移出 |
| 我的 | 进度、时长、连续天数、阶段完成度、知识卡、收藏、笔记、备份导出/导入 |

## 技术栈

React 18 + TypeScript + Vite 5 + Tailwind 3 + KaTeX（公式）+ Recharts（图表）+ LocalStorage（本地存档，无需注册）。

## 本地开发

```bash
npm install
npm run dev      # 开发
npm run build    # 类型检查 + 构建到 dist/
npm run preview  # 预览构建产物
```

## 自检脚本

```bash
# 内容完整性校验（课程/题目/图表/案例/图谱引用）
npx esbuild scripts/validate.ts --bundle --format=cjs --platform=node --outfile=scripts/.tmp-validate.cjs && node scripts/.tmp-validate.cjs

# 判分引擎断言（26 条）
npx esbuild scripts/test-grade.ts --bundle --format=cjs --platform=node --outfile=scripts/.tmp-grade.cjs && node scripts/.tmp-grade.cjs

# 端到端交互回归（需先 npm run preview，默认 http://localhost:4180）
node scripts/e2e.cjs
```

## 部署

### GitHub Pages（推荐，已内置 workflow）

1. 推送到 GitHub 仓库的 `main` 分支；
2. 仓库 Settings → Pages → Build and deployment → Source 选择 **GitHub Actions**；
3. `.github/workflows/deploy.yml` 会自动构建并发布。

路由使用 `HashRouter`，因此 Pages 上刷新子页面不会 404，无需额外的 `404.html` 重写。
`vite.config.ts` 已设置 `base: './'`，可部署在仓库子路径下。

### 其他静态托管

`npm run build` 后把 `dist/` 目录整体上传即可（Vercel / Netlify / 对象存储均可），不需要服务端。

## 预留实时数据接口

`src/lib/dataSource.ts` 是数据源适配层，默认使用构建时打包的静态教学数据。接入实时数据只需：

```bash
# .env.local
VITE_DATA_API=https://api.example.com/macro
```

远端只需返回与首页指标卡同形状的 JSON：

```
GET {VITE_DATA_API}/indicators      -> Indicator[]
GET {VITE_DATA_API}/indicators/gdp  -> Indicator
```

接口异常、超时或结构不符时自动回落到静态数据，页面不会白屏；远端缺失的指标会用静态值补齐。任何远端数据都必须带 `note`（口径与年份），界面上会如实标注来源。

## 目录结构

```
src/
  components/    Layout, Blocks（内容渲染）, Formula, DataChart, Quiz
  content/       课程（72 节）、图表、案例、图谱、每日问题、首页指标
  lib/           types, store（LocalStorage）, grade（判分）, dataSource（数据源适配）
  pages/         Home, Courses, Lesson, Lab(+8 个模拟器), Mistakes, Me, Cases, CaseDetail, Graph
scripts/         validate.ts, test-grade.ts, e2e.cjs
```

## 教材对应

课程按曼昆第 10 版宏观分册的 13 篇 / 15 章（第 24—38 章）组织，每节课在标题下标出对应章节（如 `教材第 24 章 §24.2`）。教材未覆盖的模型（如完整索洛推导、AD-AS 代数形式）在正文中明确标注为「教材之外的扩展」。讲解、案例与图表均为原创整理，不复制教材原文。
