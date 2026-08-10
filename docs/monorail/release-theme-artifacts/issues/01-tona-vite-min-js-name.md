# 01 — tona-vite: `hash` 默认 `false` + 新增 `sourcemap` 默认 `false`，输出 `{themeName}.min.js`

- Status: done
- Blocked by: None

## Comments

Batch 2026-08-10: start — f9ef9afa
done — 4f6037d6 (hash 默认 false + sourcemap 选项 + {themeName}.min.js 输出名；theme-dist.test.ts 5 用例全绿)

## What to build

`packages/tona-vite` 两处默认契约调整：

1. **`hash` 默认值 `true` → `false`**：`hash: false`（含默认）的 JS 输出名由 `{themeName}.js` 改为 `{themeName}.min.js`，与 CSS 固定命名 `{themeName}.min.css` 对称（lib 构建本就输出压缩产物）。显式 `hash: true` 仍输出带 hash 文件名
2. **新增 `sourcemap` 选项，默认 `false`**：显式应用 `build.sourcemap`，主题与 release 产物不产 `.map`（Vite 默认即 `false`，此处为契约显式化）；显式 `sourcemap: true` 可开启（调试用）

实现点：

- `src/index.ts`：`TonaPluginOptions` 增加 `sourcemap?: boolean`（JSDoc `@default false`）；`const { themeName = 'theme', inlineCss = false, hash = false, sourcemap = false } = options`；`hash` 的 JSDoc `@default true` → `@default false`
- `src/index.ts`：`jsFileName` 的 `hash: false`（含默认）分支由 `() => ${themeName}.js` 改为 `() => ${themeName}.min.js`
- `src/index.ts`：`result.build` 增加 `sourcemap`（透传选项值）
- `test/theme-dist.test.ts`：
  - 默认用例（"default Theme Dist is hashed JS plus independent .min.css"）改为断言 `{themeName}.min.js` + `{themeName}.min.css`（无 hash）
  - `inlineCss` 用例：断言改为无 hash 单文件 `{themeName}.min.js`（CSS 内联断言不变）
  - 新增显式 `hash: true` 用例：输出 `{themeName}.[hash].js` + `{themeName}.min.css`，保住带 hash 行为
  - 新增 sourcemap 断言：默认构建 dist 无 `.map` 文件；显式 `sourcemap: true` 构建产出 `.map`

## Acceptance criteria

- [ ] `pnpm --filter tona-vite test` 通过
- [ ] 默认（不传 `hash`）构建输出 `demo.min.js` + `demo.min.css`，无 `demo.js`、无 hash 文件名
- [ ] 显式 `hash: true` 输出 `{themeName}.[hash].js` + `{themeName}.min.css`
- [ ] `inlineCss: true` 行为不变：单文件、CSS 内联、无独立 CSS（文件名随默认变为 `{themeName}.min.js`）
- [ ] 默认（不传 `sourcemap`）构建 dist 中无 `.map` 文件
- [ ] 显式 `sourcemap: true` 构建产出 `.map` 文件
