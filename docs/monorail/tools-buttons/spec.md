# tools-buttons — Spec

## Problem Statement

tools 插件的 `toolbarItems` 是静态配置数组，与插件内硬编码的默认 6 个按钮（回顶/深色/推荐/关注/收藏/评论）通过 `$.extend(true, ...)` 按数组 index 深合并。三个问题：

1. **增删困难**：主题按钮集与默认集按数组下标对齐合并——增删/排序默认按钮会错位；主题无法直观表达「用哪些按钮」
2. **行为分散**：按钮行为分三处——默认按钮行为内联在 tools 插件（`scrollToTop`/`likePost`/`window.follow`/`AddToWz`）、darkMode 按钮靠 className + 插件委托事件、主题按钮（sidebar-toggle）靠模块 callback/委托
3. **不可 tree-shake**：tools 插件加载即带入全部默认按钮代码；按钮与行为无独立模块边界，主题无法按需排除未用按钮

## Solution

将 tools 重构为「框架 + 可插拔按钮」：

- **按钮即单元**：每个按钮是独立模块 + 工厂函数（`createXxxButton(options?)`），返回**按钮对象** `{ enable, page, icon, iconType, tooltip, className, callback, setup? }`——配置与行为（callback）及初始化（setup）自包含
- **零默认、全显式**：tools 不再内置默认按钮；主题以 `toolbarItems` 数组声明按钮列表，**提供即完全替换**（废除数组深合并）；未提供 = 空工具栏（仅展开/收起 toggle）
- **顺序即视觉**：数组第一项在顶部、最后一项最靠近 toggle（废除 `reverse()`）
- **tree-shaking**：按钮工厂从 tona-plugins 主入口具名导出，主题按需 import；未引入的按钮模块不进产物

## User Stories

1. 作为主题作者，我想只 import 需要的按钮工厂并把它们列进 `toolbarItems`，以便未使用的按钮代码不进产物（tree-shaking）。
2. 作为主题作者，我想增删工具栏按钮只改 `toolbarItems` 列表，以便快速调整工具栏内容。
3. 作为主题作者，我想传入 `options` 覆盖按钮默认 icon/tooltip/className，以便适配主题风格。
4. 作为主题作者，我想按钮自带行为与初始化（callback/setup），以便不需要额外插件或委托事件就能工作。
5. 作为主题作者，我想 `toolbarItems` 数组顺序即视觉顺序，以便直观控制按钮排列。

## Implementation Decisions

### 按钮契约（Toolbar Button）

```js
{
  enable: true,          // false 或缺失则不渲染
  page: 'all',           // tools pageCondition：page === getCurrentPage() || page === 'all'
  icon: 'fas fa-compress',
  iconType: 'className', // 'className' | 'html'
  tooltip: '侧栏展开',   // 表示当前状态（非下一种状态）
  className: 'sidebar-toggle', // 可选，主题 CSS 钩子
  callback(pluginOptions) {},  // 点击行为，tools 创建按钮时绑定
  setup(theme, pluginOptions) {}, // 可选，按钮渲染后调用（初始化/状态恢复）
}
```

工厂函数返回按钮对象，`options` 合并覆盖默认字段（icon/tooltip/className/page/enable 等）；`callback`/`setup` 由工厂内部闭包绑定，不接受覆盖。

### tools 插件重构

- 删除 `pluginDefaultOptions.toolbarItems`（零默认）；`toolbarItems` 直接取 `pluginOptions.toolbarItems`（undefined 时为空数组），**不再 `$.extend(true)` 按 index 合并**
- 渲染不再 `reverse()`；`enable` 过滤 + `pageCondition` 过滤保留；按钮对象含 `setup` 时在 append 后调用
- 容器、toggle 按钮、展开/收起（absolute 定位 + `:visible` 槽位 + resize 重算）机制沿用，行为不变
- `pluginOptions` 其余字段（`menuIcon`/`menuActiveIcon`/`menuIconType`/`scrollContainer`）保持不变

### 通用按钮模块（tona-plugins）

`src/plugins/tools/buttons/` 下每按钮一个模块，主入口 `export *`：

| 工厂 | 默认行为 | 默认字段 |
| --- | --- | --- |
| `createBackTopButton` | 滚回顶部（scrollContainer） | `page:'all'`、`icon:'🚀'`(html) 或 `fa-arrow-up`(className) |
| `createLikeButton` | toast 推荐 + likePost | `page:'post'` |
| `createFollowButton` | toast + window.follow | `page:'post'` |
| `createFavoriteButton` | window.AddToWz | `page:'post'` |
| `createCommentButton` | 滚动到评论 | `page:'post'` |
| `createDarkModeButton` | 三态切换（复用 darkMode 核心），setup 初始化模式 | `page:'all'`、`className:'mode-change'` |

darkMode 按钮复用 `src/plugins/darkMode/index.js` 的核心逻辑（applyMode/setMode/init 等，必要时抽公共导出），darkMode 插件保留（无按钮场景仍可用）。

### 主题迁移（全显式）

- **reacg / simple**（原零配置依赖默认 6 项；默认 mode-change 为 `enable:false` 不渲染）：显式列出启用按钮工厂（回顶/推荐/关注/收藏/评论）
- **view**（原 6 项 icon 覆盖默认，含 `fa-adjust` 深色项 + `.use(darkMode)`）：迁移为对应工厂 + options 覆盖 icon；深色按钮用 `createDarkModeButton({ icon:'fa-adjust' })`
- **geek**（原 6 项 icon 覆盖 + 第 7 项 sidebar-toggle；实际渲染 moon + sidebar-toggle）：迁移为工厂列表；`createSidebarToggleToolbarItem` 升级为按钮对象契约（含 setup 或保留模块 install），按数组顺序 = 视觉顺序排列

## Testing Decisions

沿用既有接缝（无新测试设施引入到主题侧），已与用户确认：

- **A — 按钮工厂单测**（`packages/plugins/test/`，vitest via `vite-plus/test`，纯对象断言无 DOM）：每个工厂返回按钮对象形状（默认字段/options 覆盖/callback+setup 存在）；darkMode 按钮 setup/callback 存在且调用核心逻辑
- **C — 主题构建 + 产物**：`pnpm --filter tona-theme-{geek,reacg,simple,view} build` 成功；各主题产物含其按钮字符串（icon/tooltip/className）；**tree-shaking 验证**——geek 产物不含未用按钮逻辑（如不引入收藏/推荐/评论则无 `AddToWz`/`likePost`/滚动评论）
- **D — 浏览器复现页**：渲染顺序（数组顺序 = 视觉顺序）、展开/收起、callback 触发、setup 调用时机、未提供 toolbarItems 时空工具栏（仅 toggle）

## Out of Scope

- 运行时增删 API（`toolbar.addButton/removeButton`）——声明式为基，后续迭代
- 子路径导出（`tona-plugins/tools/buttons/...`）——主入口 ESM tree-shaking 已足够
- darkMode 插件核心逻辑重写（仅按钮入口自包含化，复用现有核心）
- 非工具栏相关插件（barrage/catalog/musicPlayer 等）的 API 调整
- tools 容器/展开收起布局机制重构（沿用 absolute 定位修复）

## Further Notes

- 数组顺序 = 视觉顺序是**破坏性变化**：geek sidebar-toggle 原为第 7 项（视觉最底），迁移后按新顺序显式排列，视觉位置由主题配置决定
- view 原依赖数组深合并保留默认 callback——零默认后必须显式引入各按钮工厂（含行为），仅列 icon 的旧写法不再获得默认行为
- darkMode 按钮的 `setup` 承担原插件 `init`（localStorage 恢复/系统跟随）；按钮未启用时深色模式不自动应用（无按钮场景走 darkMode 插件）
- 术语：Toolbar Button（按钮）见 `docs/monorail/CONTEXT.md`
