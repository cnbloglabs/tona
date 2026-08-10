# 01 — tona-vite 注入 optimizeDeps.entries（dev）并回退 simple 手动 include

Status: done
Blocked by: None

## Comments

- 2026-08-08 build: 全部验收点通过（TDD red→green 于缝 A）。red: deps-entries 3 个注入用例失败；green: `pnpm --filter tona-vite test` 9/9 通过。`config()` hook 增加 `env: ConfigEnv` 参数，`command === 'serve'` 且入口存在时注入 `optimizeDeps.entries`（`config.root ?? process.cwd()` 相对路径，TS 优先）；用户已显式提供 `entries` 时不注入（merge 会替换数组）。`themes/simple/vite.config.ts` 的手动 `optimizeDeps.include: ['notyf']` 为工作区未提交改动，移除后文件与 HEAD 一致。`tona-vite` 重建成功（dist/index.mjs 含注入逻辑）。全量测试 217/218 通过（1 个失败为 main 上既有 packages/options 音乐播放器默认配置测试，与本次无关）。手动验证：simple 主题清缓存冷启动，首屏加载后日志无 `new dependencies optimized`，metadata `optimized: [notyf]`、`discovered: []`，浏览器渲染正常。

## What to build

使用 `tona-vite` 的主题在 dev 冷启动时即完成全部 node_modules 依赖预打包：`config()` hook 在 `command === 'serve'` 时注入 `optimizeDeps.entries`，指向主题入口（`src/main.ts` 优先，否则 `src/main.js`，相对 `baseDir` 即 `process.cwd()`）。首屏加载不再出现 `new dependencies optimized: X` 提示与整页刷新。同时回退 `themes/simple/vite.config.ts` 手动加的 `optimizeDeps.include: ['notyf']`，统一走插件路径，并重建 `tona-vite` dist 使其对主题 dev 生效。

## Acceptance criteria

- [ ] `packages/tona-vite/src/index.ts` 的 `config()` hook：`command === 'serve'` 且入口存在时注入 `optimizeDeps.entries = ['src/main.js']` 或 `['src/main.ts']`
- [ ] 入口解析复用现有逻辑：`src/main.ts` 存在优先，否则 `src/main.js`；均不存在 → 不注入，原样返回
- [ ] 用户已显式提供 `optimizeDeps.entries` 时不被插件覆盖；`optimizeDeps` 未配置时新建
- [ ] `command === 'build'` 不注入（构建契约不变）
- [ ] 新增 `test/deps-entries.test.ts`（缝 A，复用 theme-dist.test.ts 的临时目录 + chdir fixture 模式），覆盖：main.js → entries、main.ts 优先、build 不注入、用户 entries 保留、无入口不注入
- [ ] `themes/simple/vite.config.ts` 移除 `optimizeDeps.include: ['notyf']`
- [ ] `tona-vite` 重建（`dist/index.mjs` 更新，构建链见 `docs/monorail/tona-build.md` 记忆：`pnpm --filter tona-vite build`）
- [ ] 手动验证：simple 主题清缓存冷启动 + 首屏加载，日志无 `new dependencies optimized`、无整页刷新
