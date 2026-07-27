# 01 — tona-vite Inline CSS Dist options + geek enable

Status: done
Blocked by: None

## What to build

在 `tona-vite` 增加 `inlineCss` / `hash` 两布尔（默认 `false` / `true`），按 spec 映射到构建产物形态；geek 开启 `inlineCss`；更新插件中英 README。构建 geek 后，Theme Dist 为带 File Hash 的单 JS（Inline CSS Dist），无独立主题 CSS。

## Acceptance criteria

- [x] `tona({ inlineCss?, hash? })` 类型与默认值符合 spec
- [x] `inlineCss: true` 时产物为单 JS 且 CSS 经 `createElement('style')`（或等价）注入；无主题 `.css`
- [x] `hash: false` 时文件名为 `{themeName}.js`；默认仍为 `{themeName}.[hash].js`
- [x] 未开 `inlineCss` 时默认 Theme Dist 仍为 JS + `{theme}.min.css`
- [x] geek 配置为 `inlineCss: true`，构建后 `dist/` 仅有 `geek.*.js`
- [x] `tona-vite` README（中英）写清两选项
