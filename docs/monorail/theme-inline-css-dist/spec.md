## Problem Statement

博客园皮肤常见分发方式是上传/引用单个 JS。geek 需要 Theme Dist 为 Inline CSS Dist：样式打进 IIFE，运行时注入，不再另出 `.css`。当前 `tona-vite` 固定 `cssCodeSplit: false`，产物为带 File Hash 的 JS + `{theme}.min.css`，无法满足该契约；又不希望悄悄改掉所有主题的默认产物形态。

## Solution

在 `tona-vite` 增加两个独立布尔选项：`inlineCss`（默认 `false`）、`hash`（默认 `true`）。`inlineCss: true` 时走 Vite 原生路径（`cssCodeSplit: true`），IIFE 构建将 CSS 注入 JS。geek 显式开启 `inlineCss`，hash 保持默认。同步更新插件 README。

## User Stories

1. As a geek 主题维护者, I want `pnpm build` 产出 Inline CSS Dist（单 JS、无独立主题 CSS）, so that 我可以按博客园单文件方式分发。
2. As a 使用 `tona-vite` 的其他主题维护者, I want 默认 Theme Dist 行为不变, so that 现有 JS+CSS 分发不受影响。
3. As a 主题作者, I want 能显式关闭 File Hash, so that 需要稳定文件名时不必手改 `fileName`。
4. As a 阅读 `tona-vite` 文档的开发者, I want README 写清 `inlineCss` / `hash` 默认值与效果, so that 不必翻源码猜契约。

## Implementation Decisions

- 选项挂在 `tona({ themeName, inlineCss?, hash? })`；两布尔彼此独立
- `inlineCss: true` → 插件将 `build.cssCodeSplit` 设为 `true`（若调用方已显式传入 `build.cssCodeSplit`，仍尊重已有覆盖语义与当前插件合并方式一致）
- `inlineCss: false`（默认）→ 保持现有：`cssCodeSplit: false` + `cssFileName: '{themeName}.min'`
- `hash: true`（默认）→ `fileName` 为 `{themeName}.[hash].js`；`hash: false` → `{themeName}.js`
- geek：`tona({ themeName: 'geek', inlineCss: true })`
- 不引入第三方 CSS-in-JS 注入插件；不自写 `generateBundle` 拼 CSS
- README（中英）补充选项说明与构建产物表

## Testing Decisions

- 最高缝：Theme Dist 产物形态（构建后断言，不做插件 `config()` 单测）
- `inlineCss: true`（geek）：`dist/` 仅有匹配 `geek.*.js` 的文件；无主题 `.css`；JS 含 `createElement('style')`（或等价注入）
- 默认路径回归：未开 `inlineCss` 的主题仍为 JS + 独立 `.min.css`（可用现有 reacg dist 约定或构建验证，不强制改 reacg 配置）

## Out of Scope

- reacg / shadcn / create-tona 默认改为 Inline CSS Dist
- 将 Inline CSS Dist 设为 `tona-vite` 全局默认
- geek 关闭 File Hash
- 移动端或运行时主题行为变更

## Further Notes

- 对齐来源：`docs/monorail/theme-inline-css-dist/align.md`
- 术语：`docs/monorail/CONTEXT.md` — Theme Dist、Inline CSS Dist、File Hash
