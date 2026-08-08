## Problem Statement

主题目录没有 `index.html`，dev 时 HTML 由 `tona-vite` 中间件虚拟提供（共享 `public/index.html` + `/templates/*.html`）。Vite 依赖扫描器启动时只在项目根 glob `**/*.html` 找入口，找不到 → 初始 Dependency Pre-bundling 集合为空 → 真实 node_modules 依赖（simple 的 `notyf`、shadcn 的 `react`/`preact` 等）在首屏加载时才被运行时发现，触发 `new dependencies optimized: X` 提示 + 一次整页刷新。`themes/simple` 手动加 `optimizeDeps.include: ['notyf']` 只是局部补丁，不覆盖其他主题、不随依赖增长自动扩展。

## Solution

`tona-vite` 插件在 `config()` hook 注入 `optimizeDeps.entries`，指向主题入口（`src/main.ts` 优先，否则 `src/main.js`），交给 Vite 原生扫描器爬取完整依赖图。`optimizeDeps.entries` 是公开类型化 API，`computeEntries` 中优先级最高，扫描经 `pluginContainer.resolveId(..., { scan: true })` 使 alias/插件链生效。仅注入 dev（`command === 'serve'`）；构建不受影响。同时回退 `themes/simple/vite.config.ts` 的手动 `include`，统一由插件路径处理。

## User Stories

1. As a 使用 `tona-vite` 的主题维护者（simple / geek / view / reacg）, I want dev 冷启动即完成全量依赖预打包, so that 首屏不再出现 `new dependencies optimized` 提示和整页刷新。
2. As a 依赖丰富的主题维护者（shadcn）, I want 新增 node_modules 依赖无需手动配置即可被扫描发现, so that 不必逐主题维护 optimizeDeps 清单。
3. As a 构建用户, I want dev 注入不影响构建产物, so that Theme Dist 形态与现有契约保持不变。
4. As a 显式配置了 `optimizeDeps.entries` 的主题作者, I want 我的显式配置优先于插件默认, so that 插件不会覆盖我的意图。

## Implementation Decisions

- 落点：`packages/tona-vite/src/index.ts` 的 `config()` hook，复用已有入口解析逻辑（`src/main.ts` 存在则用 TS，否则 `src/main.js`；均不存在则保持现状不注入）
- 注入值：`optimizeDeps.entries = [相对路径]`，锚点为 `baseDir`（`process.cwd()`，与现有入口解析一致），即 `path.relative(baseDir, resolvedEntryPath)` → `src/main.js` / `src/main.ts`
- 守卫：
  - `command === 'serve'` 才注入（`optimizeDeps` 本身 dev-only，`disabled: 'build'` 兜底；build 分支不触碰）
  - 用户已显式提供 `optimizeDeps.entries` 时不覆盖（合并语义：`optimizeDeps` 不存在则新建，存在且无 `entries` 则补 `entries`，已有 `entries` 则尊重用户值）
  - 入口文件不存在 → 不注入，原样返回 config
- 回退 `themes/simple/vite.config.ts` 的 `optimizeDeps.include: ['notyf']`
- 生效前提：`tona-vite` 需重建（入口 `dist/index.mjs`）

## Testing Decisions

- 缝 A（`config()` hook 单测，新文件 `test/deps-entries.test.ts`，复用 theme-dist.test.ts 的 fixture 模式：临时目录 + `process.chdir`）：
  - `src/main.js` 存在 → `optimizeDeps.entries` 为 `['src/main.js']`
  - `src/main.ts` 存在（且 main.js 也占位）→ `['src/main.ts']`（TS 优先）
  - `command === 'build'` → 不注入 `optimizeDeps`
  - 用户显式传 `optimizeDeps.entries` → 插件不覆盖，保留用户值
  - 无 `src/main.*` → 不注入
- 缝 B（dev 集成测试，同文件或独立 describe）：临时 fixture 内造本地包 `node_modules/fake-dep`（`package.json` + ESM `index.js`），`src/main.js` 静态 `import` 它；`vite.createServer()` 冷启动，请求入口模块触发加载，断言 `server._optimizeDepsMetadata`（或等价 metadata）的 `optimized` 含 `fake-dep` 且 `discovered` 为空；`afterEach` 关闭 server 并清理
- 运行：`pnpm --filter tona-vite test`（沿用现有 `vp test`）

## Out of Scope

- 改动虚拟 HTML 架构（中间件提供共享 index.html + templates）
- 自写依赖爬虫递归收集 `optimizeDeps.include`
- 给主题根目录补真实 `index.html`
- 构建模式（lib 输出 / Theme Dist 形态）改动
- `holdUntilCrawlEnd` / `exclude` / `needsInterop` 等 dev 调优（见 Deferred）

## Further Notes

- 对齐来源：`docs/monorail/tona-vite-deps-entries/align.md`
- 决策：`docs/monorail/adr/001-tona-vite-optimize-deps-entries.md`
- 术语：`docs/monorail/CONTEXT.md` — Dependency Pre-bundling、Dev Scan Entry
- 实证依据：shadcn 设 `entries: ['src/main.ts']` 冷启动一次预打包全部 19 个真实依赖，`discovered` 为空、日志零提示
