# geek-sidebar-toggle — 双侧栏收起/展开开关 Spec

## Problem Statement

geek 主题在 769–1366px 视口（竖屏/窄窗口）下，左栏折叠为 68px 紧凑图标（Collapsed Sidebar）、右栏保持 280px 展开，两栏合计占掉大量宽度，主区内容被挤压。用户需要一个随时可用的开关：一键收起双侧栏让主区占满全宽，再一键恢复。该开关仅在此尺寸区间出现，收起状态跨页面保持。

## Solution

在 tools 插件浮动工具栏（`.custom-toolbar`，`position: fixed; bottom: 30px; right: 30px`）中新增一个 toolbar item（`className: 'sidebar-toggle'`），作为 geek `main.js` 中 `.use(tools, …)` 的 `toolbarItems` 第 7 项。点击后切换 `#home` 上的状态类 `is-sidebars-collapsed`，驱动 769–1366px 区间内的网格布局：侧栏轨道从 `68px`/`280px` 过渡到 `0`，主区占满全宽。图标与 tooltip 随状态互换，状态写入 localStorage 持久化。实现全部位于 geek 主题侧，不改 tona-plugins（`packages/plugins`）。

## User Stories

1. 作为 769–1366px 视口的访客，我想一键收起双侧栏，以便正文获得全宽阅读空间。
2. 作为同一访客，我想再点一次恢复紧凑布局（左 68px 图标 + 右 280px），以便继续使用侧栏导航。
3. 作为同一访客，我想让按钮图标反映当前状态（显示 `fa-compress` / 隐藏 `fa-expand`），以便预知下一次点击的效果。
4. 作为同一访客，我想让收起状态在刷新、翻页后保持，以便不必每次导航后重新收起。
5. 作为宽屏（>1366px）或手机（≤768px）访客，我想让该按钮不显示，以便界面不被无意义的开关干扰。

## Implementation Decisions

- **按钮声明**：`themes/geek/src/main.js` `.use(tools, …)` 的 `toolbarItems` 追加第 7 项：
  - `enable: true`、**`page: 'all'`**（tools 插件 `pageCondition` 为 `page === getCurrentPage() || page === 'all'`，缺 `page` 会被过滤、常规页面不渲染）
  - `icon: 'fas fa-compress'`、`iconType: 'className'`、`tooltip: '收起双侧栏'`、`className: 'sidebar-toggle'`
  - `callback: () => {}`（空实现——tools 插件对每个 item 绑定 `callback(finalPluginOptions)`，缺 callback 点击会抛 TypeError；实际逻辑走模块委托事件，与默认 `mode-change` item 同款模式）
- **新模块** `themes/geek/src/modules/sidebar-toggle/index.js`（`import './index.scss'`，导出 `install()`，随 glob 自动加载）：
  - 委托点击：`$(document).on('click', '.toolbar-item.sidebar-toggle', toggle)`——tools 工具栏晚于模块渲染，委托事件无需等待 DOM 就位
  - `toggle()`：翻转 `$('#home').toggleClass('is-sidebars-collapsed')` → 写 `localStorage.sidebarsCollapsed`（`'1'`=收起 / `'0'`=展开）→ 图标互换 `i.toggleClass('fa-compress', collapsed).toggleClass('fa-expand', !collapsed)` → tooltip 互换 `.tooltip.text(collapsed ? '展开双侧栏' : '收起双侧栏')`
  - 初始化：从 `localStorage.sidebarsCollapsed` 恢复（`'1'` 时 `addClass('is-sidebars-collapsed')`）；类由 CSS 媒体查询门控，视口在区间外时无副作用（自愈），无需 JS 判断视口
  - 初始图标同步：`install()` 时 `.sidebar-toggle` 尚未渲染，需等其出现后按当前状态设置图标/tooltip——参照 darkMode `watchModeButton`：MutationObserver 监听 `body` 子树，发现 `.sidebar-toggle` 即同步一次并断开，兜底 `setTimeout` 轮询
- **样式** `themes/geek/src/modules/sidebar-toggle/index.scss`：
  - 按钮可见性：`.toolbar-item.sidebar-toggle { display: none }`，仅 `@media screen and (min-width: 769px) and (max-width: 1366px)` 内 `display: block`
  - 过渡：`#home { transition: grid-template-columns 0.3s }`
  - 收起态（仅 769–1366px 内生效）：`#home.is-sidebars-collapsed { grid-template-columns: 0 1fr 1fr 0 }`——轨道数不变（4 轨）可插值，`grid-template-areas` 无需重定义，`#main`（cols 2–3）自然占满全宽；`#left-side`/`#sideBar` 为 0 宽轨道、`overflow: auto` 裁切内容
  - 收起态需处理 `#left-side` 0 宽后的 `border-right: 1px` 露线：`#home.is-sidebars-collapsed #left-side { border-right-color: transparent }`
- **持久化键**：`localStorage.sidebarsCollapsed`（`'1'`/`'0'`，缺省=展开），参照 darkMode `localStorage.modeType` 模式

## Testing Decisions

沿用既有 geek issue 的验收模式（无新测试设施），接缝为构建 + 产物字符串检查 + 浏览器手动验证：

- `pnpm --filter tona-theme-geek build` 构建成功
- 产物 `themes/geek/dist/geek.js` 含：`sidebar-toggle`、`fa-compress`、`fa-expand`、`is-sidebars-collapsed`、`收起双侧栏`、`展开双侧栏`、`sidebarsCollapsed`
- 产物 inline CSS 含：`0 1fr 1fr 0`、`transition:grid-template-columns` 相关规则、`769px` 媒体查询
- 浏览器手动验证（900px 视口）：
  - 点按钮 → 双侧栏消失、主区占满全宽、图标变 `fa-expand`、tooltip 变「展开双侧栏」；再点 → 恢复紧凑态、图标变回 `fa-compress`
  - 收起后刷新/翻页 → 保持收起态（localStorage 生效）
  - 拉宽到 >1366px → 侧栏自动恢复显示、按钮消失；缩回 769–1366px → 按存储状态恢复
  - ≤768px → 按钮不显示，移动端行为不变
  - tools 工具栏菜单开关（fa-angle-up/fa-angle-down）与 darkMode 按钮（`.mode-change`）不受影响

## Out of Scope

- 修改 tona-plugins（`packages/plugins`）代码
- 其他主题（reacg/shadcn/view/simple）
- ≤768px 移动端布局（双侧栏本就隐藏，无可收起对象）
- >1366px 宽屏显示按钮
- 左栏展开为全尺寸文字导航（14vw）的状态
- 修复既有 toolbarItems 缺 `page` 字段导致常规页面不渲染的问题
- 给主题引入单测设施

## Further Notes

- tools 插件 `pageCondition` 过滤是既有行为：geek 现有 6 个 toolbarItems 均无 `page`，在 post/index/tag/list 常规页面全部不渲染（仅 `getCurrentPage()` 返回 `undefined` 的页面会渲染）。本需求新项带 `page: 'all'` 规避；该既有问题本身不在范围内
- 收起态下右栏目录（catalog 挂载于 `.account`）与左栏 GitHub 按钮（`.leftside-bottom`）随栏隐藏，展开后恢复——属「双侧栏全部隐藏」语义的自然结果
- 收起瞬间若 custom-links-popover 处于打开态（fixed 定位、挂 `body`）会残留——边缘场景，deferred，不在本 spec 处理
- 跨断点自愈：>1366px 时收起态媒体查询失效、侧栏自动恢复显示，但 `is-sidebars-collapsed` 类与存储值保留，回到区间后按存储状态恢复
- 相关术语见 `docs/monorail/CONTEXT.md` 的 Collapsed Sidebar、Sidebar Toggle
