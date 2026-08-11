# 01 — 双侧栏收起/展开开关按钮

Status: done
Blocked by: None

## Comments

Build 2026-08-11: 实现完成。产物按 ADR-002 契约（release-theme-artifacts 已 done）为 `dist/geek.min.js` + `dist/geek.min.css`（issue 验收文本写的 `geek.js`/inline CSS 为 ADR-002 前旧契约，未再启用 inlineCss）——JS 字符串检查落在 `geek.min.js`、CSS 字符串检查落在 `geek.min.css`，10 项字符串全部命中。

- main.js 追加第 7 项 toolbar item（`page: 'all'` + 空 callback）；tools 插件 `$.extend(true, default, options)` 按 index 深合并，前 6 项与默认 `mode-change` className 均保留，darkMode 按钮不受影响
- 新模块 `src/modules/sidebar-toggle/index.js` + `index.scss`：委托点击、图标/tooltip 互换、localStorage 持久化、`watchToggleButton`（MutationObserver + 兜底 500ms/轮询 200ms，参照 darkMode）
- TDD red→green：改动前构建产物 10 项字符串全 0 → 改动后全部命中；`pnpm --filter tona-theme-geek build` 绿（63 modules）
- 全量 `pnpm test`：236/237 绿，唯一失败 `packages/options`「应该返回默认音乐播放器配置」（期望 `audio[0].name === '404 not found'`，实现为 `''`）为 pre-existing（断言自 b9fd04a5 起存在），与本次改动零依赖
- `vp check --no-lint`：新增/修改代码文件无格式问题（42 个格式问题文件均为既有代码）
- 浏览器手动验证（900px 视口、>1366px、≤768px、刷新保持、darkMode 不受影响）留给用户

Fix 2026-08-11（用户反馈两问题，浏览器复现页验证）：

**问题 1：图标未居中** —— 根因：`fas` 前缀触发 FA 的 `.fa,.fas{line-height:1}`，`i` 行高塌缩为 20px、只占按钮上半部（对比 `fa-moon` 无前缀继承 40px）。修复：`index.scss` 给 `.toolbar-item.sidebar-toggle i` 补 `line-height: 40px; align-items: center`，浏览器实测 `iconRect` 40×20 → 40×40，居中。

**问题 2：按钮隐藏时 toggle 与其他按钮间距大** —— 根因：`if (!item.enable) return` 使真实工具栏仅渲染 `enable:true` 的 moon + sidebar-toggle 两项；sidebar-toggle 位于 transform 槽位 0（文档流最前），`display:none` 后 moon 文档流上移但槽位不变 → 展开态间距 100px（正常 10px）。修复（用户选定方案 B，改 tona-plugins 根治）：
- `packages/plugins/src/plugins/tools/index.js`：
  1. `createToolbarItem`：items 改 `position: absolute; top: 0; left: 0`（相对 fixed 容器），彼此脱离文档流，任一 item 被 CSS 隐藏不再导致其余项错位；初始全叠容器顶
  2. `transformed()`：抽为独立函数 + `.filter(':visible')` 只遍历可见项（隐藏项槽位让给下一个可见按钮），步长由 `translateY - 40` 改为 `translateY`（absolute 下位移即视觉位置，保持原展开/收起视觉不变：展开空隙 10px、收空隙 50px）
  3. `createToolbar`：移除 translateY 槽位累加；内部绑定 `$(window).resize` —— 展开态跨断点（>1366px ⇄ 769–1366px）重算位移，避免隐藏项空槽位残留间距
- 浏览器验证（复现 tools 插件逻辑）：
  - 900px 显示：展开 sidebar-toggle 底部间距 10px、图标 40px 居中；收起仅 toggle
  - 1500px 隐藏：展开 moon 间距 10px（原 100px）；收起仅 toggle；展开态拉宽 900→1500 resize 重算后间距 10px
  - 3 按钮场景：可见项从 toggle 上方 10px 起等距
- 回归：全量 `pnpm test` 仍 236/237（唯一失败仍为 pre-existing musicPlayer）；geek/view/reacg/simple 4 主题构建全绿；darkMode 12 测试通过（resize 绑定原放模块顶层导致测试环境 `$(window).on` 报错，已移入 createToolbar）
- 视觉一致性：absolute + 步长调整后展开/收起视觉与原实现完全一致（展开空隙 10px、收空隙 50px、初始叠容器顶被 toggle 覆盖），其他主题无行为变化

Refactor 2026-08-11（rail-grill 决策后实施）：sidebar-toggle 重构为「tool 插件」——包一层、用起 callback。
- 决策（rail-grill）：geek 模块内（不改 tona-plugins）；导出配置函数；callback 做完整 toggle；只改 sidebar-toggle（darkMode 保持现状）；`createSidebarToggleToolbarItem(options?)` 支持覆盖
- `modules/sidebar-toggle/index.js`：新增导出 `createSidebarToggleToolbarItem(options?)`（返回 `{enable, page:'all', icon, iconType, tooltip, className, callback: () => toggle()}`，options 覆盖默认字段）；**移除 `$(document).on('click', ...)` 委托事件**（callback 由 tools 绑定，保留会双触发）；install() 保留 restore + 初始图标 watch
- `main.js`：显式 import + `toolbarItems` 第 7 项替换为 `createSidebarToggleToolbarItem()`
- 验证（复现页 900px）：初始 fa-compress/收起双侧栏 → 点击 1 次 collapsed+fa-expand+展开双侧栏+stored='1'（单次触发，无双触发）→ 再点恢复；刷新后保持收起态（fa-expand）；初始图标同步 watch 生效
- 回归：全量 `pnpm test` 236/237（唯一失败仍为 pre-existing musicPlayer）；构建绿、产物字符串全命中；改动文件无格式问题

## What to build

在 geek tools 浮动工具栏中新增一个双侧栏收起/展开开关按钮，实现全在 geek 主题侧（不改 tona-plugins）：

- **按钮声明**：`themes/geek/src/main.js` 的 `.use(tools, …)` 配置中，`toolbarItems` 追加第 7 项：
  `{ enable: true, page: 'all', icon: 'fas fa-compress', iconType: 'className', tooltip: '收起双侧栏', className: 'sidebar-toggle', callback: () => {} }`
  —— `page: 'all'` 必须带（tools 插件 `pageCondition` 过滤，否则常规页面不渲染）；空 callback 避免 tools 插件对未定义 callback 的 TypeError（同默认 `mode-change` item 模式）
- **新模块** `themes/geek/src/modules/sidebar-toggle/index.js` + `index.scss`（导出 `install()`，随 `import.meta.glob` 自动加载）：
  - 委托点击 `$(document).on('click', '.toolbar-item.sidebar-toggle', toggle)`（工具栏晚于模块渲染，委托事件无需等待）
  - `toggle()`：翻转 `#home.is-sidebars-collapsed` → 写 `localStorage.sidebarsCollapsed`（`'1'`=收起 / `'0'`=展开）→ 图标互换 `fa-compress` ↔ `fa-expand` → tooltip 互换「收起双侧栏」↔「展开双侧栏」
  - 初始化：按 `localStorage.sidebarsCollapsed === '1'` 恢复 `is-sidebars-collapsed`（类由 CSS 媒体查询门控，区间外自愈）
  - 初始图标同步：工具栏渲染晚于模块 `install()`，需等 `.sidebar-toggle` 出现后按当前状态同步图标/tooltip——MutationObserver 监听 + 兜底轮询（参照 darkMode 的 `watchModeButton` 模式）
  - 样式：`.toolbar-item.sidebar-toggle` 仅 `769px–1366px` 显示；`#home { transition: grid-template-columns 0.3s }`；`#home.is-sidebars-collapsed { grid-template-columns: 0 1fr 1fr 0 }`（轨道数不变、可插值、areas 无需重定义，主区 cols 2–3 占满全宽）；收起态处理 `#left-side` 0 宽后的 `border-right: 1px` 露线（`border-right-color: transparent`）
- **行为**：收起 = `#left-side` 与 `#sideBar` 全部隐藏、主区全宽；展开 = 恢复紧凑态（左 68px 图标 + 右 280px）；>1366px 与 ≤768px 按钮隐藏，侧栏布局由既有媒体查询自愈

## Acceptance criteria

- [ ] `pnpm --filter tona-theme-geek build` 构建成功
- [ ] 产物 `themes/geek/dist/geek.js` 含：`sidebar-toggle`、`fa-compress`、`fa-expand`、`is-sidebars-collapsed`、`收起双侧栏`、`展开双侧栏`、`sidebarsCollapsed`
- [ ] 产物 inline CSS 含收起态网格规则（`0 1fr 1fr 0`）与 `769px` 媒体查询
- [ ] 900px 视口：点按钮 → 双侧栏消失、主区占满全宽、图标变 `fa-expand`、tooltip 变「展开双侧栏」；再点 → 恢复紧凑态、图标变回 `fa-compress`
- [ ] 收起后刷新/翻页 → 保持收起态（localStorage 生效）
- [ ] 拉宽 >1366px → 侧栏自动恢复显示、按钮消失；缩回 769–1366px → 按存储状态恢复
- [ ] ≤768px → 按钮不显示，移动端布局行为不变
- [ ] tools 工具栏菜单开关（fa-angle-up/fa-angle-down）与 darkMode 按钮（`.mode-change`）不受影响
