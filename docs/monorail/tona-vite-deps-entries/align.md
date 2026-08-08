## Intent

tona 主题目录没有 `index.html`，dev 时的 HTML 由 `tona-vite` 中间件虚拟提供（共享 `public/index.html` + `/templates/*.html`）。Vite 依赖扫描器启动时只在主题根找 HTML 入口，找不到 → 初始 Dependency Pre-bundling 集合为空 → 真实 node_modules 依赖（simple 的 `notyf`、shadcn 的 `react`/`preact` 等）在首屏加载时才被运行时发现，触发 `new dependencies optimized: X` 提示 + 一次整页刷新。期望在 `tona-vite` 插件层统一解决，让所有主题冷启动即完成全量依赖预打包。

## Decisions settled

- 否决「给主题根目录补真实 `index.html` 作扫描入口」：会被中间件提供的共享 HTML 遮蔽、与虚拟入口语义双份、每个主题都要维护
- 方案：`tona-vite` 的 `config()` hook 注入 `optimizeDeps.entries: [入口相对路径]`（`src/main.ts` 或 `src/main.js`），复用插件已算好的入口解析，交给 Vite 原生扫描器爬取
- `optimizeDeps.entries` 是公开类型化 API（`entries?: string | string[]`），文档明确支持「无 index.html / 自定义入口」场景；`computeEntries` 中优先级最高，覆盖默认 HTML 推断
- 扫描走 `pluginContainer.resolveId(..., { scan: true })`，alias（如 shadcn 的 `@/`）与 Vite 插件链正常生效
- 相对路径计算：相对 `config.root`（未定义时兜底 `process.cwd()`）
- 只影响 dev（`optimizeDeps` 默认 `disabled: 'build'`），构建产物不变
- 回退 `themes/simple/vite.config.ts` 手动加的 `optimizeDeps.include: ['notyf']`，统一由插件路径处理，避免双份配置
- 实证：shadcn 设 `entries: ['src/main.ts']` 冷启动一次预打包全部 19 个依赖（react/preact 全家桶/@base-ui/react/motion 等），`discovered` 为空，无提示、无刷新；simple 同理

## Deferred

- 是否进一步调 `holdUntilCrawlEnd`（默认 `true`；文档提示若扫描器已全量找到依赖，可考虑关闭以让浏览器并行请求更多模块）——不阻塞本轮
- 各主题是否需要 `optimizeDeps` 的其他调优（如 `exclude` / `needsInterop` 的 CJS 互操作）——按需再说

## Out of scope

- 改动虚拟 HTML 架构（中间件提供共享 index.html + templates 的设计）
- 自写依赖爬虫递归收集 `optimizeDeps.include`
- 给主题根目录补真实 `index.html`
- 构建模式（lib 输出 / Theme Dist 形态）的任何改动

## Domain pointers

- `docs/monorail/CONTEXT.md` — 新增术语：Dependency Pre-bundling、Dev Scan Entry
- `docs/monorail/adr/001-tona-vite-optimize-deps-entries.md` — 本次决策 ADR
