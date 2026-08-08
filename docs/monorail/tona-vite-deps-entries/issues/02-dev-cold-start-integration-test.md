# 02 — dev 冷启动集成测试：全量预打包、零运行时发现

Status: done
Blocked by: 01

## Comments

- 2026-08-08 build: 全部验收点通过（TDD red→green）。red: 临时禁用 `src/index.ts` 的 entries 注入后，`vi.waitFor` 在测试超时内等不到 `fake-dep` 进入 `optimized`（该 fork 无 entries 时 fake-dep 完全不被预打包）；green: 恢复注入后 `optimized` 含 `fake-dep`、`discovered` 为空。新文件 `test/cold-start.test.ts`（缝 B 集成测试）：临时 fixture（package.json + node_modules/fake-dep + src/main.js 静态 import），`vite.createServer()` + `server.listen(0)` + HTTP 请求 `/src/main.js`（该 fork 的 `transformRequest` 有 ERR_LOAD_URL 问题，走真实 HTTP 请求；需 `server.fs.allow` 放行 /tmp 目录）。metadata 断言经 `server.environments.client.depsOptimizer.metadata`（Vite 7 per-environment 架构，无 `server._optimizeDepsMetadata`）。`pnpm --filter tona-vite test` 10/10 通过（01 缝 A 与 theme-dist 不回归）。

## What to build

自动化证明 01 的真实行为：临时 fixture 主题内建本地包 `node_modules/fake-dep`（`package.json` + ESM `index.js`），`src/main.js` 静态 `import` 它；用 `vite.createServer()` 冷启动（空缓存），请求入口模块触发加载后，断言依赖优化 metadata 的 `optimized` 含 `fake-dep` 且 `discovered` 为空——即扫描器在启动阶段就发现了依赖，不会在运行时触发 `new dependencies optimized` / 整页刷新。沿用 `test/theme-dist.test.ts` 的临时目录 + `process.chdir` 模式（测试直接 `import tona from '../src/index.js'`，走源码不依赖 dist 重建）。

## Acceptance criteria

- [ ] fixture 是合法项目根（含 `package.json`），`node_modules/fake-dep` 含 `package.json`（`type: module` + `main`/`exports`）与 ESM `index.js`
- [ ] `src/main.js` 静态 `import 'fake-dep'`（可加副作用断言，如导出函数在模块中调用）
- [ ] `vite.createServer({ configFile: false, plugins: [tona({ themeName })] })` 冷启动（清空/无缓存），请求入口模块
- [ ] 断言 metadata（`server._optimizeDepsMetadata` 或读取 `node_modules/.vite/deps/_metadata.json`）的 `optimized` 含 `fake-dep`，`discovered` 为空
- [ ] `afterEach` 关闭 server、清理临时目录
- [ ] `pnpm --filter tona-vite test` 全绿（01 与既有 theme-dist 用例不回归）
