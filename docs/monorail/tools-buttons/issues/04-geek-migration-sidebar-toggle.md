# 04 — geek 主题迁移 + sidebar-toggle 适配按钮对象契约

Status: done
Blocked by: 02, 03

## Comments

Batch 2026-08-11: start — f384c1bd（未提交模式，工作区叠加于 issue 01 与 geek-sidebar-toggle 挂起成果之上）
done — geek main.js 迁移：移除 .use(darkMode)（按钮自包含，避免与委托双触发）；toolbarItems = [createDarkModeButton({icon:'fa-moon', iconType:'className'}), createSidebarToggleToolbarItem()]（顺序即视觉：moon 顶部、sidebar-toggle 靠 toggle）；sidebar-toggle 模块零改动（已满足按钮契约：callback 真实 toggle + install 初始化，无委托残留）；构建成功，产物 9/9 必须包含字符串 PASS，AddToWz/likePost/scrollToComment 均摇除，getDarkModeOptions（插件入口）被摇除；全量 270/271（唯一失败 pre-existing musicPlayer）；复现页浏览器验证为手动步骤
Review 2026-08-12 fixes：createDarkModeButton 改默认三态图标（iconType:'className'，深色 fa-moon/浅色 fa-sun/跟随系统 fa-adjust，恢复 per-mode 图标切换）；sidebar-toggle 工厂限制覆盖面（icon/className 固定，消除 updateToggleButton 选择器/图标重置陷阱，其余字段可覆盖）；产物 10/10 字符串 PASS（含 fa-moon），tree-shaking 3/3
Review 2026-08-12 fix（按钮数量回归）：spec 04「实际渲染 moon + sidebar-toggle」有误——用户复现页目检发现按钮相比重构前变少。geek 恢复全部 7 个工厂按钮（回顶 fas-fa-rocket/深色三态/推荐/关注/收藏/评论/收起双侧栏），数组顺序 = 视觉顺序（rocket 顶、sidebar-toggle 靠 toggle）。产物 15/15 字符串 PASS（含全部 icon/tooltip/行为字符串，AddToWz/推荐成功/关注成功 在产物；likePost/scrollToComment 因 minify 重命名不直接匹配，tooltip 与行为字符串佐证逻辑在产物）；darkMode 插件委托入口仍摇除
Optimize 2026-08-12：sidebar-toggle tooltip 改为表示当前状态（展开态「侧栏展开」/ 收起态「侧栏收起」），替代原先的下一状态提示（收起双侧栏/展开双侧栏）；产物含新文案、旧文案已移除，其余 sidebar 字符串完整

## What to build

geek 主题（`themes/geek/src/main.js`）迁移到全显式按钮列表，并适配 `createSidebarToggleToolbarItem` 到按钮对象契约：

- **toolbarItems 全显式**：`createTheme().use(tools, ...)` 的 `toolbarItems` 改为显式工厂列表（按需 import），按「数组顺序 = 视觉顺序」排列；保留既有 moon（darkMode 按钮，经 `createDarkModeButton` 引入或等价）与 sidebar-toggle（`createSidebarToggleToolbarItem()`）
- **sidebar-toggle 适配**：`themes/geek/src/modules/sidebar-toggle/index.js` 的 `createSidebarToggleToolbarItem` 返回按钮对象契约（含 `setup` 或在模块内完成初始化的等价实现）；按钮自包含——callback 已为真实 toggle（沿用上轮重构），初始图标同步与 localStorage 恢复由 setup/install 承担；移除不再需要的委托事件（如有残留）
- **tree-shaking 验证**：geek 只引入实际使用的按钮工厂（如 darkMode + sidebar-toggle），未引入的（收藏/推荐/评论/回顶等）逻辑不进产物
- 上一轮行为不回归：图标居中（`i` 的 line-height 修复）、展开/收起间距（absolute + `:visible`）、769–1366px 显示、localStorage 持久化、跨断点自愈

## Acceptance criteria

- [ ] `pnpm --filter tona-theme-geek build` 成功
- [ ] 产物含 geek 使用按钮的字符串：`sidebar-toggle`/`fa-compress`/`fa-expand`/`is-sidebars-collapsed`/`收起双侧栏`/`展开双侧栏`/`sidebarsCollapsed`（以及 darkMode 按钮相关）
- [ ] **tree-shaking**：geek 产物不含未引入按钮的行为字符串（如未用收藏/推荐/评论则无 `AddToWz`/`likePost`/滚动评论逻辑）
- [ ] 复现页/浏览器验证：按钮按数组顺序渲染（第一项顶部、最后一项靠 toggle）；点击 sidebar-toggle 经 callback 单次触发；darkMode 按钮可切换且 html theme 变化；展开/收起与上轮一致
- [ ] 全量 `pnpm test` 无新增失败
