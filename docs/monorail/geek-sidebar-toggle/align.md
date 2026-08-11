# geek-sidebar-toggle — 双侧栏收起/展开开关

## Intent

geek 主题在 769–1366px（竖屏/窄窗口）下，左栏折叠为 68px 紧凑图标（Collapsed Sidebar）、右栏保持 280px 展开，屏幕宽度有限时主区被严重挤压。期望在右下角 tools 浮动工具栏中新增一个按钮，一键收起/展开双侧栏：收起 = 双侧栏全部隐藏、主区占满全宽；展开 = 恢复紧凑布局。按钮仅在此尺寸区间显示，状态用 localStorage 持久化。

## Decisions settled

- **位置**：按钮作为 tools 插件 `toolbarItems` 的新增一项，渲染进 `.custom-toolbar`（`position: fixed; bottom: 30px; right: 30px` 的右下角浮动工具栏）。注意：用户原述「左下角」，实际落入右下角工具栏，已按用户指示执行
- **不碰 tona-plugins**：实现全部在 geek 主题侧（main.js 配置项 + 新模块），不改 `packages/plugins` 代码
- **语义**：收起 = `#left-side` 与 `#sideBar` 全部隐藏、主区全宽；展开 = 恢复紧凑态（左 68px + 右 280px）
- **布局驱动**：状态类 `#home.is-sidebars-collapsed`；在 769–1366px 区间内生效——网格列从 `68px 1fr 1fr 280px` 过渡到 `0 1fr 1fr 0`（轨道数不变、可插值）
- **动画**：`#home` 上 `grid-template-columns` 0.3s 平滑过渡；收起态需处理 `#left-side` 0 宽后 `border-right: 1px` 露线问题
- **图标**：双侧栏显示时 `fa-compress`（tooltip「收起双侧栏」），隐藏时 `fa-expand`（tooltip「展开双侧栏」）；点击后互换图标与 tooltip
- **持久化**：localStorage 记忆（键名 spec 定，参照 darkMode 的 `localStorage.modeType` 模式），刷新/翻页保持收起态
- **尺寸范围**：按钮仅 769–1366px 显示；>1366px 与 ≤768px 均隐藏。跨断点时媒体查询自愈（>1366px 下即使类/存储为收起态也恢复显示侧栏）
- **渲染保证**：新 toolbar item 必须带 `page: 'all'`（tools 插件 `pageCondition` 过滤，否则常规页面不渲染）
- **实现模式**：main.js `.use(tools)` 的 `toolbarItems` 追加第 7 项（`className: 'sidebar-toggle'`、初始 `fas fa-compress`、tooltip「收起双侧栏」、空 `callback`，与默认 `mode-change` 项同款）；新模块 `src/modules/sidebar-toggle/`（index.js + index.scss）负责委托点击（`$(document).on('click', '.sidebar-toggle', …)`）、图标/tooltip 互换、localStorage、初始状态同步（工具栏晚于模块渲染，参照 darkMode `watchModeButton` 的 MutationObserver + 兜底轮询）

## Deferred

- 收起瞬间若 custom-links-popover 处于打开态（fixed 定位、挂 `body`）的残留处理（边缘场景，暂不处理）
- geek 现有 6 个 toolbarItems 缺 `page` 字段导致常规页面全部不渲染的既有问题（不归本需求，但新项已规避）

## Out of scope

- 修改 tona-plugins（`packages/plugins`）代码
- 其他主题（reacg/shadcn/view/simple）
- ≤768px 移动端布局（双侧栏本就隐藏，无可收起对象）
- >1366px 宽屏显示按钮
- 左栏展开为全尺寸文字导航（14vw）的状态
- 修复既有 toolbarItems 缺 `page` 字段的问题

## Domain pointers

- `docs/monorail/CONTEXT.md` — Collapsed Sidebar（展开态的左栏形态）；新增术语 Sidebar Toggle
