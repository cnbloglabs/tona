# 03 — 主题下游迁移（geek/reacg/simple/view）

Status: open
Blocked by: 01, 02

## What to build

把 4 个使用插件的主题（geek/reacg/simple/view）的 `src/style/plugins.scss` 改写为
`plugins.css`，并同步 `index.scss` 引用。shadcn 不使用 plugins scss，不动。

`plugins.css` 结构：

1. **插件 css `@import` 列表（置顶）**：`@import '@tona-plugins/src/plugins/<name>/index.css';`
   沿用原 `@use` 顺序。不使用 `/node_modules/` 绝对路径（vite 不可解析，见 issue 02）。
2. **`:root` 覆盖块**：原 `@use ... with ($xxx: (...))` 的每个 key 迁移为同名 CSS
   变量覆盖，命名同插件侧 kebab-case（如 `$postMessage.categoriesBackground` →
   `--post-message-categories-background: <原值>;`）。覆盖值本身是 CSS 变量时
   （如 `var(--geek-color-6)`）直接引用，无需特殊处理。
3. **主题自定义样式原样保留**（如 geek 的 `#catalog {...}`、`.custom-comment-avatar`、
   `.message-top`、`.custom-toolbar` 等主题追加的覆盖规则）。

`index.scss` 引用同步：
- geek/reacg：`@use './plugins.scss' as *;` → `@import './plugins.css';`
  （已核实主题未引用插件暴露的 sass 变量，`as *` 无必要）
- simple/view：`@import './plugins.scss';` → `@import './plugins.css';`

## Acceptance criteria

- [ ] 4 个主题 `src/style/plugins.css` 存在，对应 `plugins.scss` 删除
- [ ] 每个 `plugins.css` 顶部为插件 css `@import` 列表（`@tona-plugins` 模块 id，顺序同原 `@use`）
- [ ] `:root` 覆盖块含原 `with()` 配置的全部 key（逐主题对照原 plugins.scss 核对，
      无遗漏、值不变）；覆盖值含 `var(--xxx)` 时原样保留
- [ ] 主题自定义样式（非 `with()` 部分）原样保留在 plugins.css 中
- [ ] 4 个主题 `index.scss` 引用均改为 `@import './plugins.css'`
- [ ] 4 个主题 `vp build` 构建成功（冒烟；完整产物验证见 issue 04）
