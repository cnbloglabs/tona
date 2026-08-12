# 01 — plugins 包产物化：build + dist 扁平产物 + 入口契约

- Status: claimed
- Blocked by: None

## Comments

Batch 2026-08-12: start — 28a9bd31

## What to build

将 `packages/plugins` 从源码分发迁移为产物分发（ADR-004）：构建产出 `dist/index.js`（ESM 聚合 re-export），插件 CSS 复制为 dist 扁平布局（`dist/<plugin>/index.css`，去掉 `src/plugins/` 前缀），`exports`/`files`/scripts 切换到产物契约。

- `packages/plugins/vite.config.ts`：新增 `pack` 段 `{ entry: ['./src/index.js'], format: ['esm'], clean: true }`（不启用 `dts`，类型契约保持手写 `index.d.ts`）；保留现有 `server` 段（example dev，可移至独立脚本 `dev:example`）
- CSS 复制步骤：glob `src/plugins/**/*.css` → `dist/<相对路径去 plugins/ 前缀>/index.css`；`build` 与 `dev`（`vp pack --watch`）都要执行（封装为 plugins 包内脚本或 vite 插件，实现形态自定）
- `packages/plugins/package.json`：
  - `exports`：`"."` → `{ types: "./index.d.ts", import: "./dist/index.js" }`；新增 `"./*": "./dist/*"`
  - `main`/`module` → `./dist/index.js`；`types` 保持 `./index.d.ts`
  - `files`：`["index.d.ts", "src"]` → `["dist", "index.d.ts"]`
  - scripts：新增 `"build": "vp pack"`、`"dev": "vp pack --watch"`（原 `dev: vp dev` 为 example dev server，更名 `dev:example` 保留）

## Acceptance criteria

- [ ] `pnpm --dir packages/plugins build` 产出 `dist/index.js`（ESM 聚合，含全部插件 re-export，未 minify）
- [ ] `dist/<plugin>/index.css` 与 `src/plugins/<plugin>/index.css` 一一对应（对照清单全量，含 tools 子目录），`dist/plugins/` 层不存在
- [ ] `dev: vp pack --watch` 下改插件 js/css 后 dist 同步更新
- [ ] `import { catalog } from 'tona-plugins'` 与 `@import 'tona-plugins/catalog/index.css'` 均解析到 dist（在任一主题或测试中验证）
- [ ] 新增 `packages/plugins/test/dist-contract.test.ts` 通过：dist 扁平结构、`exports` 含 `"./*": "./dist/*"`、`files` 为 `["dist", "index.d.ts"]`
- [ ] 现有 `packages/plugins/test/*` 全部通过（`import('tona-plugins')` 跟随 exports 到 dist，`../src/` vi.mock 保持）
