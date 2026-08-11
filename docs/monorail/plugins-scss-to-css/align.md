# Align: Plugins SCSS → CSS + CSS Variables

## Intent

把 `packages/plugins` 包内所有 scss（30 个插件 + example demo）重写为纯 CSS + CSS 变量，
并联动改写下游 4 个主题（geek/reacg/simple/view）的样式引用与配置方式，使插件样式
可在无 sass 环境直接消费，主题定制从 sass 编译期 `with()` 配置迁移为 CSS 变量覆盖。

## Decisions settled

- **命名约定**：CSS 变量采用 `--<插件slug>-<kebab-case-key>`（如
  `$postMessage.categoriesBackground` → `--post-message-categories-background`），
  与现有 `--geek-color-*` / `--hl-*` / `--color-primary` 风格一致。
- **默认值策略**：每个插件 css 文件顶部集中声明 `:root { --xxx: 默认值; }` 块，
  规则体一律 `var(--xxx)`；语义等价于原「默认 map + 主题 merge 覆盖」。
- **作用域**：`:root` 全局声明（插件样式作用于 body 级 DOM，无统一插件根容器）。
- **嵌套展开**：按 sass 编译语义展开为扁平 CSS（`&` 父选择器、嵌套 `@media` 提升顶层），
  不使用 CSS nesting，保证浏览器兼容面。
- **list/@for**（仅 `postMessage.tagsBackground`）：固定展开 6 条
  `.message-tags a:nth-child(N)` 规则 + 独立变量
  `--post-message-tags-background-1` ~ `-6`，主题按需覆盖前 k 个；
  覆盖现有最大配置长度 5（view）并留 1 个余量。
- **主题下游改写**：`themes/<t>/src/style/plugins.scss` → `plugins.css`，结构为
  「插件 css `@import` 列表（置顶）+ `:root` 覆盖块（原 `with()` 配置逐键迁移，
  值本身为 CSS 变量时直接引用）+ 主题自定义样式原样保留」；
  `index.scss` 引用改 `@import './plugins.css'`（geek/reacg 原 `@use ... as *` 未使用
  插件变量，可安全改为 @import）。已实证：scss 中部 `@import './plugins.css'`
  会被 sass 保留为原生 @import、由 postcss-import 递归内联，层叠顺序保持原位。
- **下游引用机制（实证修正）**：css `@import '/node_modules/...'` 在 vite 中不可用
  （postcss-import 按文件系统绝对路径解析，sass `@use` 可用是 sass importer 特例）。
  改由 **tona-vite 注入 alias `@tona-plugins` → `<主题root>/node_modules/tona-plugins`**
  （workspace symlink → packages/plugins），主题 `plugins.css` 以
  `@import '@tona-plugins/src/plugins/<name>/index.css'` 引入。已实证 alias 命中。
- **example demo**：`example/index.scss` → `example/index.css`，
  `example/index.js` 的 `import './index.scss'` 同步改为 `./index.css`；
  example 在包内，用相对路径 `@import '../src/plugins/<name>/index.css'`。
- **范围**：主题自身 `index.scss` 及其余 scss（仍是 scss）不在本次范围；
  shadcn 主题不使用 plugins scss，不动；tona-vite 保留 `scss.charset` 配置
  （主题端仍需 scss 预处理），仅新增 alias 注入。

## Deferred

None

## Out of scope

- 主题自身 scss（index.scss 及主题内其他 scss 文件）的 CSS 化
- shadcn 主题样式
- plugins 包 JS 逻辑改动（仅 example/index.js 的 import 路径跟随改名）
- tona-vite 构建配置调整

## Domain pointers

- 术语：`docs/monorail/CONTEXT.md` → **Plugin CSS Variables**
- ADR：`docs/monorail/adr/003-plugin-css-variables.md`
