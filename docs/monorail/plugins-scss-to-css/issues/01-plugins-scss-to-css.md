# 01 — 插件 scss→css 迁移（packages/plugins 全量）

Status: done
Blocked by: None

## Comments

Batch 2026-08-12: start — be935e14
Batch 2026-08-12: done — d5998e47（31 scss→css + example + css-schema.test.ts，plugins 全量 61 passed；sass CLI 交叉验证选择器一致）

## What to build

把 `packages/plugins` 内全部 scss（30 个插件 `src/plugins/*/index.scss` + `example/index.scss`）
改写为纯 CSS + CSS 变量，并删除原 scss 文件。这是 prefactor：下游主题与 alias 注入
（issue 02/03）都依赖此处的产物形态。

迁移规则（详见 `docs/monorail/plugins-scss-to-css/spec.md` 与 ADR-003）：

1. **配置变量化**：`$xxx: () !default` + `map.merge(...)` 的每个 key 展开为插件 css
   顶部 `:root { --<插件slug>-<kebab-key>: <默认值>; }` 声明块；规则体中 `$var` 引用
   全部替换为 `var(--<插件slug>-<kebab-key>)`。命名 kebab-case，如
   `$postMessage.categoriesBackground` → `--post-message-categories-background`、
   `$player.bodyBackground` → `--player-body-background`、
   `$toolMenu.background` → `--tool-menu-background`。
2. **嵌套展开**：按 sass 编译语义展开为扁平 CSS——子选择器拼合、`&` 父选择器展开、
   嵌套 `@media` 提升到顶层、`@keyframes` 原样保留。不使用 CSS nesting。
3. **postMessage 特例**：`sass:list` + `@for` 循环固定展开 6 条
   `.message-tags a:nth-child(1..6)` 规则，边框色引用
   `var(--post-message-tags-background-1)` ~ `-6`；默认值按原内置 list 逐项
   （第 5/6 项兜底色建议循环延展色，如第 5 项复用第 1 项、第 6 项复用第 2 项）。
4. **codeHighlight**：该文件已 CSS 变量化（`var(--hl-*)`），仅去除 `$background` 等
   中间 sass 变量层、展开嵌套，`--hl-*` 体系保持不变。
5. **example demo**：`example/index.scss` → `example/index.css`，插件引用用包内相对
   路径 `@import '../src/plugins/<name>/index.css';`（CDN url import 原样保留）；
   `example/index.js` 的 `import './index.scss'` 改为 `import './index.css'`。

无 sass 变量被用作颜色函数参数（已核实），CSS 变量直接存最终颜色值即可。

## Acceptance criteria

- [ ] `src/plugins/*/index.scss`（30 个）与 `example/index.scss` 全部改写为 `index.css`，原 scss 删除
- [ ] `packages/plugins` 内无残留 `*.scss`
- [ ] 每个插件 css 顶部 `:root` 声明块含全部配置变量默认值，命名符合 kebab-case 规则
- [ ] 规则体仅 `var(--xxx)` 引用，无 `@use` / `sass:map` / `$var` / `map.get` 等 sass 语法残留
- [ ] 嵌套全部展开为扁平选择器，嵌套 `@media` 提升至顶层
- [ ] `postMessage` 展开 6 条 `nth-child` 规则，变量 `--post-message-tags-background-1..6`
- [ ] `codeHighlight` 保持 `--hl-*` 变量体系
- [ ] `example/index.js` 的 import 已改为 `./index.css`
