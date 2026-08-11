# ADR-003: Plugin CSS Variables

- **Status**: Accepted
- **Date**: 2026-08-12
- **Related**: `docs/monorail/plugins-scss-to-css/`（effort）

## Context

`packages/plugins` 内 30 个插件的样式全部是 scss，主题通过 sass 模块系统的
`@use '/node_modules/tona-plugins/src/plugins/<name>/index.scss' as * with ($xxx: (...))`
覆盖插件内置配置（`$xxx: () !default` + `map.merge`）。这套机制依赖 sass 预处理，
无法在纯 CSS 环境消费。

## Decision

把 plugins 包的 scss 全部改写为 **CSS + CSS 变量**，配置机制从 sass `with()` 迁移到
CSS 自定义属性覆盖：

1. **命名**：`--<配置变量名前缀>-<kebab-case-key>`（前缀取插件配置 map 变量名
   `$xxx` 的 `xxx`，如 `$postMessage.categoriesBackground`
   → `--post-message-categories-background`；完整命名表见 spec
   `Implementation Decisions`）。
2. **默认值**：每个插件 css 文件顶部集中声明 `:root { --xxx: 默认值; }` 块；
   规则体一律 `var(--xxx)` 引用。语义等价于原「默认 map + 主题 merge 覆盖」。
3. **作用域**：`:root` 全局（插件样式作用于 body 级 DOM，无统一插件根容器）。
4. **嵌套**：按 sass 编译语义展开为扁平 CSS（含 `&` 父选择器、嵌套 `@media` 提升顶层），
   不使用 CSS nesting，保证浏览器兼容面。
5. **list/@for**（`postMessage.tagsBackground`）：CSS 无循环与 list 拆分能力，
   固定展开 6 条 `.message-tags a:nth-child(N)` 规则，每条对应独立变量
   `--post-message-tags-background-1` ~ `--post-message-tags-background-6`，
   主题按需覆盖前 k 个。
6. **下游**：主题 `src/style/plugins.scss` → `plugins.css`，内容为插件 css
   `@import` 列表（置顶）+ `:root` 覆盖块（原 `with()` 配置逐键迁移）+ 主题自定义样式；
   主题 `index.scss` 以 `@import './plugins.css'` 引入。
7. **下游引用机制**：css `@import '/node_modules/...'` 在 vite 构建中不可用
   （postcss-import 按文件系统绝对路径解析，实测 ENOENT）；由 `tona-vite`
   向所有主题注入 `resolve.alias` `@tona-plugins` → `<root>/node_modules/tona-plugins`
   （workspace symlink），主题 `plugins.css` 以
   `@import '@tona-plugins/src/plugins/<name>/index.css'` 引入（实测 alias 命中、
   scss 中部 `@import './plugins.css'` 可被 postcss-import 递归内联）。

## Consequences

- 插件样式可在无 sass 的环境直接消费（纯 CSS @import）。
- 主题定制从「编译期配置」变为「运行时变量覆盖」，覆盖值本身可为 CSS 变量
  （如 `var(--geek-color-6)`），与主题现有变量体系自然打通。
- 代价：sass 的编译期能力（map/list/循环）无法保留，list 类配置固定展开上限 6 条。
- `packages/tona-vite` 的 `scss.charset` 配置保留（主题自身 scss 仍需预处理）。
