# 04 — create-tona: template-preact 最小化，移除自定义产物配置

- Status: claimed
- Blocked by: 01

## What to build

`packages/create-tona/template-preact` 的 `vite.config.ts` 收敛为最小配置，与 `template-minimal` 对齐，不再自定义产物。自定义 `build.lib`（`fileName: () => 'theme.js'` 等）会覆盖 tona 插件的 `hash` 逻辑，移除后产物由 tona 插件默认契约决定（`theme.min.js` + `theme.min.css`，见 ADR-002）。

- `packages/create-tona/template-preact/vite.config.ts`：移除 `define`（`process.env.NODE_ENV` 由 Vite 默认按 mode 注入，模板手写为冗余）、`server`（`open` / `port: 8081`）、`build`（`lib` / `rollupOptions.output.assetFileNames` / `cssCodeSplit` / `copyPublicDir` / `emptyOutDir` / `outDir`）；保留 `resolve.alias`（`@`）、`resolve.dedupe`（preact）、插件（`preact()` / `tona()` / `tailwindcss()`）
- `packages/create-tona/template-preact/README.md`：删除 "This starts the Vite dev server at `http://localhost:8081`" 中的端口描述（server 配置移除后回到 Vite 默认端口）

## Acceptance criteria

- [ ] `vite.config.ts` 中无 `build.lib` / `fileName` / `assetFileNames` / `define` / `server` 自定义
- [ ] 模板构建输出 `theme.min.js` + `theme.min.css`（无 hash），与 `template-minimal` 契约一致
- [ ] README 不再引用 `8081` 端口
- [ ] `pnpm --dir packages/create-tona/template-preact build` 构建成功（或等效的模板构建验证）
