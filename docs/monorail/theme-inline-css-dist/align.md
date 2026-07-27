## Intent

geek 主题需要像线上参考那样，构建后只交付一个 JS 文件，CSS 在运行时注入页面。当前 `tona-vite` 默认吐出带 hash 的 JS + 独立 `.min.css`，不符合该分发契约。期望在插件层提供可选项，由 geek 显式开启。

## Decisions settled

- 目标契约：开启后产物为「CSS 内联进 JS」的单文件，不再另出主题 CSS
- 落点：在 `tona-vite` 增加可选项；默认行为不变；geek 显式开启
- API：`inlineCss?: boolean`（默认 `false`）、`hash?: boolean`（默认 `true`）
- geek：`inlineCss: true`，hash 保持默认（产物如 `geek.[hash].js`）
- 实现：Vite 原生路径——`inlineCss: true` 时使用 `cssCodeSplit: true`，IIFE 下由 Vite 注入 `style` 标签
- 范围含更新 `tona-vite` README 说明两选项

## Deferred

- 其他主题（reacg / shadcn）是否开启 `inlineCss`
- create-tona 脚手架默认是否改为内联
- 需要稳定文件名时再显式 `hash: false`（本轮 geek 不关）

## Out of scope

- 改 reacg / shadcn / create-tona 的默认构建产物形态
- 引入 `vite-plugin-css-injected-by-js` 或自写 `generateBundle` 拼 CSS
- 把「单文件内联」做成 `tona-vite` 全局默认

## Domain pointers

- `docs/monorail/CONTEXT.md` — Theme Dist、Inline CSS Dist、File Hash
