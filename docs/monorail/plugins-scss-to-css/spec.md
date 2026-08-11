# Spec: Plugins SCSS → CSS + CSS Variables

## Problem Statement

`packages/plugins` 内 30 个插件的样式全部为 scss，且依赖 sass 模块系统的
`@use '.../index.scss' as * with ($xxx: (...))` 配置机制：插件内置默认 map
（`$xxx: () !default` + `map.merge`），主题通过 `with()` 编译期覆盖。
这导致插件样式只能在 sass 环境消费，且主题定制绑定编译期。目标是把 plugins 包
所有 scss 重写为纯 CSS + CSS 变量（`--<插件slug>-<kebab-key>`，见 ADR-003），
并把下游 4 个主题（geek/reacg/simple/view）的引用与配置同步迁移，
使插件样式可被任意环境直接消费、主题以运行时变量覆盖定制。

## Solution

### A. 插件 scss → css（packages/plugins 内 31 个文件）

每个 `src/plugins/<name>/index.scss` 改写为 `index.css`，并删除原 scss 文件：

1. **配置变量化**：`$xxx: () !default` + `map.merge(...)` 的 map 逐键展开为
   插件 css 顶部的 `:root { --<插件slug>-<kebab-key>: <默认值>; }` 声明块
   （kebab-case，规则见 `## Implementation Decisions`），规则体中 `$var` 引用
   全部替换为 `var(--<插件slug>-<kebab-key>)`。
2. **嵌套展开**：按 sass 编译语义展开为扁平 CSS——子选择器拼合、`&` 父选择器
   展开、嵌套 `@media` 提升到顶层、`@keyframes` 原样保留。不使用 CSS nesting。
3. **postMessage 特例**：`sass:list` + `@for` 循环（`tagsBackground`）固定展开
   6 条 `.message-tags a:nth-child(1..6)` 规则，边框色分别引用
   `var(--post-message-tags-background-1)` ~ `-6`；默认值按原内置 list 逐项
   （第 5、6 项给兜底色）。
4. **`@import url(...)`**（如 example 与个别文件的 CDN url import）原样保留。
5. **example demo**：`example/index.scss` → `example/index.css`，内部插件引用
   用包内相对路径 `@import '../src/plugins/<name>/index.css'`；
   `example/index.js` 的 `import './index.scss'` 改为 `import './index.css'`。

### B. tona-vite 注入 alias（下游联动一）

`tona-vite` 插件的 `config()` hook 中新增 `resolve.alias` 注入：
`@tona-plugins` → `path.resolve(config.root ?? process.cwd(), 'node_modules/tona-plugins')`
（workspace symlink → `packages/plugins`）。与既有注入（build.lib、css 配置、
optimizeDeps）并列。保留 `css.preprocessorOptions.scss.charset` 配置不变。

已实证：vite 的 postcss-import 对 css `@import '/node_modules/...'` 按文件系统
绝对路径解析（ENOENT），对裸模块 id（`@tona-plugins/...`）经 resolveId 命中 alias，
解析到真实文件；scss 中部 `@import './plugins.css'` 被 sass 保留为原生 @import 后
由 postcss-import 递归内联，层叠顺序保持原位。

### C. 主题下游改写（下游联动二）

每个使用插件的主题（geek/reacg/simple/view）`src/style/plugins.scss` → `plugins.css`：

1. 顶部为插件 css `@import '@tona-plugins/src/plugins/<name>/index.css';` 列表
   （沿用原 `@use` 的顺序）。
2. 紧随其后 `:root { --<插件slug>-<kebab-key>: <原with()覆盖值>; }` 覆盖块——
   原 `with($xxx: (...))` 的每个 key 迁移为同名 CSS 变量覆盖；覆盖值本身是
   CSS 变量（如 `var(--geek-color-6)`）时直接引用。
3. 原主题自定义样式（如 geek 的 `#catalog {...}`、`.custom-comment-avatar` 等）
   原样保留在 plugins.css 中。
4. 主题 `index.scss` 引用同步：geek/reacg 的 `@use './plugins.scss' as *` →
   `@import './plugins.css';`；simple/view 的 `@import './plugins.scss'` 仅改扩展名。
   已实证无需 `as *`（主题未引用插件暴露的 sass 变量）。

## User Stories

1. 作为**主题作者**，我希望插件样式可用 CSS 变量定制（覆盖 `--post-message-categories-background`
   等），以便不再依赖 sass 编译期 `with()` 配置。
2. 作为**插件开发者**，我希望插件样式是纯 CSS + CSS 变量，以便任何无 sass 的环境
   都能直接 `@import` 消费。
3. 作为**仓库维护者**，我希望 4 个下游主题同步迁移且构建产物不回归，以便发布链路
   （`scripts/build-theme.ts`、Release Theme Artifacts）不受影响。

## Implementation Decisions

- **命名**：CSS 变量 `--<前缀>-<kebab-case-key>`。**前缀取配置 map 变量名**（`$xxx` 的
  `xxx`，如 `$player` → `player`、`$toolMenu` → `tool-menu`、`$mode` → `mode`），
  kebab-case；map key 转 kebab-case（`categoriesBackground` → `categories-background`、
  `bodyBackground` → `body-background`）。issue 01 已按此落地，实际命名表：
  `charts→--chart-*`、`codeCopy→--copy-*`、`codeLang→--code-language-*`、
  `codeLinenumbers→--line-numbers-*`、`darkMode→--mode-*`、`donation→--donation-*`、
  `emoji→--emoji-*`、`footer→--footer-*`、`imagePreview→--imagebox-*`、
  `license→--post-signature-*`、`musicPlayer→--player-*`、`postBottomImage→--post-bottomimage-*`、
  `postMessage→--post-message-*`、`postTopImage→--post-topimage-*`、`signature→--signature-*`、
  `tools→--tool-menu-*`。下游主题覆盖（issue 03）以此表为准。
- **默认值声明**：插件 css 顶部集中 `:root { ... }` 声明块；规则体一律 `var(--xxx)`，
  不写内联 fallback。语义等价于原「默认 map + 主题 merge 覆盖」。
- **作用域**：`:root` 全局。
- **嵌套展开**：扁平 CSS，不用 CSS nesting（浏览器兼容面）。
- **postMessage list**：固定 6 条 nth-child 规则 + 6 个独立变量（覆盖最大配置 5 + 余量）。
- **下游引用**：tona-vite 注入 alias `@tona-plugins`；主题 plugins.css 用
  `@import '@tona-plugins/src/plugins/<name>/index.css'`。
- **主题 plugins.css 结构**：插件 import 列表（置顶）→ `:root` 覆盖块 →
  主题自定义样式。
- **删除**：迁移后删除所有 `index.scss`（plugins 包内），不留双份。
- **示例映射**（用于实现对照，非穷尽清单）：
  - `darkMode`: `$mode.bg-light/bg-dark` → `--mode-bg-light` / `--mode-bg-dark`
    （slug 取 `mode` 或 `dark-mode`，实现时按命名规则统一）
  - `codeCopy`: `$copy.bg/hover-bg/color/hover-color` → `--copy-*`
  - `postMessage`: `$postMessage.*` → `--post-message-*`，
    `tagsBackground` list → `--post-message-tags-background-1..6`
  - `tools`: `$toolMenu.*` → `--tool-menu-*`
  - `codeHighlight`: 保持既有 `--hl-*` 变量体系不变，仅将 sass 变量引用改直用
    `var(--hl-*)`（该文件已 CSS 变量化，仅需去除 `$background` 等中间 sass 变量层）。

## Testing Decisions

- **主缝（构建验证）**：迁移后对 geek/reacg/simple/view 各执行一次 `vp build`，
  全部成功；产物 CSS 抽查插件关键规则存在且变量引用正确，例如：
  `.post-message a:nth-child(6)` 规则存在、`:root` 含
  `--post-message-tags-background-1` 默认值、`.dark-to-light` 使用 `var(--mode-bg-dark)`、
  `.message-tags a` 使用 `var(--post-message-tags-background-N)`。
- **基线产物对比**：迁移前留存 `/tmp/geek.min.css.before`、`/tmp/geek.min.js.before`
  （已存）；迁移后 geek 构建产物对比——JS 产物应保持不变，CSS 产物做规则级
  spot-check（minify 后不做文本 diff）。
- **单测回归**：`pnpm test` 全部通过（覆盖 buttons/darkMode/tools 逻辑，
  防止 example/index.js 与 tona-vite 改动引入回归）。
- **dev 预览（可选）**：`pnpm dev` 人工目检插件样式渲染。

## Out of Scope

- 主题自身 scss（`index.scss` 及主题内其余 scss）的 CSS 化
- shadcn 主题（不使用 plugins scss）
- plugins 包 JS 逻辑改动（仅 example/index.js 的 import 路径跟随改名）
- tona-vite 除 alias 注入外的其他构建配置调整

## Further Notes

- 实现时每个插件 css 迁移后建议对照原 sass 编译产物抽查一次（可临时用
  `sass` CLI 编译旧文件比对规则集合）。
- postMessage 的 `@for` 展开第 5/6 条兜底色建议沿用原 list 的循环延展色
  （如第 5 项复用第 1 项、第 6 项复用第 2 项），实现时在 issue 中定稿。
- 覆盖值含 `var(--geek-color-*)` 等主题变量的场景已实证可行（CSS 变量可引用
  其他 CSS 变量），无需特殊处理。
- 关联：`docs/monorail/adr/003-plugin-css-variables.md`；
  术语 **Plugin CSS Variables** 见 `docs/monorail/CONTEXT.md`。
