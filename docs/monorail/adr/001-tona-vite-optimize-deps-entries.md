# ADR-001: tona-vite 注入 optimizeDeps.entries 解决无根 HTML 的依赖预打包

- Status: Accepted
- Date: 2026-08-08
- Scope: `packages/tona-vite` + 全部主题 dev 流程

## Context

主题目录没有 `index.html`，dev 时 HTML 由 `tona-vite` 中间件虚拟提供（共享 `public/index.html` + `/templates/*.html`，模板里引用 `<script type="module" src="../src/main.js">`）。Vite 依赖扫描器启动时只在项目根 glob `**/*.html` 找入口，找不到 → Dependency Pre-bundling 初始集合为空 → 真实依赖（simple 的 `notyf`、shadcn 的 `react`/`preact` 等）在首屏加载时才被运行时发现，触发 `new dependencies optimized: X` 提示 + 整页刷新。

实证：shadcn 冷启动日志 `no dependencies found by the scanner or crawling static imports`；设 `optimizeDeps.entries: ['src/main.ts']` 后一次预打包全部 19 个真实依赖，`discovered` 为空。

## Decision

`tona-vite` 插件在 `config()` hook 注入 `optimizeDeps.entries: [入口相对路径]`，入口复用插件已解析的 `src/main.ts` / `src/main.js`；相对路径基于 `config.root`（兜底 `process.cwd()`）。`optimizeDeps.entries` 为 Vite 公开类型化 API（`entries?: string | string[]`），`computeEntries` 中优先级最高，覆盖默认 HTML 推断，扫描经 `pluginContainer.resolveId(..., { scan: true })` 使 alias/插件链生效。仅影响 dev（`optimizeDeps` 默认 `disabled: 'build'`）。

同时回退 `themes/simple/vite.config.ts` 手动加的 `optimizeDeps.include: ['notyf']`，统一由插件路径处理。

## Consequences

- 所有主题冷启动即全量预打包，无 `new dependencies optimized` 提示、无首屏整页刷新
- 新增真实 node_modules 依赖自动被发现，无需逐主题手改配置
- 若某主题未来显式配置 `optimizeDeps.entries`，会覆盖插件注入值（用户显式 > 插件默认）
- 需要 `tona-vite` 重建（入口为 `dist/index.mjs`）后生效

## Alternatives considered

- **给主题根目录补真实 `index.html`**：被中间件共享 HTML 遮蔽、双份语义、每主题维护 → 否决
- **插件自写爬虫递归收集依赖注入 `optimizeDeps.include`**：绕过原生扫描器，alias/插件链需自实现，可靠性差 → 否决
- **`build.rollupOptions.input` 指向入口**：dev 扫描虽也认，但会与 build lib 入口语义混淆，且改动构建配置面更大 → 否决
