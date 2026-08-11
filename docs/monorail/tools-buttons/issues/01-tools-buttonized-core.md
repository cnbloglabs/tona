# 01 — tools 插件按钮化重构：零默认、按钮对象、setup、顺序即视觉

Status: done
Blocked by: None

## Comments

Build 2026-08-11: 零默认按钮化重构完成（未提交，工作区叠加于 geek-sidebar-toggle 挂起成果之上，按用户决定由用户自行整理提交）
- `tools/index.js`：删除 `pluginDefaultOptions.toolbarItems` 默认 6 项（零默认）；`toolbarItems` 数组整体替换（默认对象不再含 toolbarItems，无按 index 深合并）；废除 `toolbarItems.reverse()`（顺序即视觉）；新增 `setup` 支持——append 后调用并透传 `(theme, pluginOptions)`；缺失字段按默认处理（`enable` 视为 true、`page` 视为 'all'，按钮渲染、行为需显式 callback）；无 callback 的按钮不绑定 click（过渡兼容）；删除未用 import（likePost/toast）
- 新集成测试 `packages/plugins/test/tools.integration.test.ts` 8 用例（happy-dom + 真实 jQuery + createTheme）：空工具栏（仅 toggle）/ 整体替换（1 元素渲染 1 按钮）/ setup 调用时机与参数 / 顺序即视觉（DOM 断言）/ enable+page 过滤保留 / 无 callback 点击不抛错 / 展开收起切换 / 展开态 resize 重算位移
- `darkMode.integration.test.ts` 与 `example/index.js`：mode-change 按钮显式化 `className: 'mode-change'`（零默认后不再从默认项深合并继承）
- 验证：plugins 包测试 22/22 全绿；全量 `pnpm test` 244/245（唯一失败为 pre-existing musicPlayer，与本次无关）；`build:pkg` + geek/view/reacg/simple 4 主题构建全绿；lint 因 oxlint 配置解析错误不可用（项目既有环境问题，与本次无关）
- 遗留：`scrollToTop`/`scrollToComment` 保留待 issue 02 迁移进按钮工厂；view/reacg/simple 主题为空/无行为工具栏，属 issue 04/05 迁移范围
Review 2026-08-12 fixes：tools 渲染时 `$('body').append($toolbar)` 提前到 items 循环前（setup 执行时按钮已在文档，可同步图标/测量布局）；click 绑定透传 event 给 callback（`callback(finalPluginOptions, event)`，供 darkMode 按钮 stopPropagation 防双触发）；删除集成测试死 stub `w.getCurrentPage`（tools 读真实 utils/cnblog.getCurrentPage，happy-dom 空 body 返回 undefined，pageCondition 语义不变）；新增 createDarkModeButton 经 tools 的集成用例（append 后图标同步 + 点击三态循环）
Review 2026-08-12 fix（顺序方向）：`transformed` 位移分配修正——数组第一项在顶部（位移最远）、最后一项最靠近 toggle（-50px）；此前实现方向相反（用户复现页目检确认「顺序反了」）。新增展开态位移方向测试（2 按钮断言 -100px/-50px）

## What to build

重构 `packages/plugins/src/plugins/tools/index.js`，使 tools 从「静态 toolbarItems + 默认按钮集 + 按 index 深合并」变为「框架 + 可插拔按钮对象」：

- **零默认**：删除 `pluginDefaultOptions.toolbarItems` 及其默认 6 项（回顶/深色/推荐/关注/收藏/评论）。`toolbarItems` 直接取 `pluginOptions.toolbarItems`，未提供时为空数组——**不再 `$.extend(true, ...)` 按数组 index 合并**（数组整体替换；其余 pluginOptions 字段如 menuIcon/menuActiveIcon/menuIconType/scrollContainer 的合并行为不变）
- **按钮对象**：toolbarItems 元素为按钮对象 `{ enable, page, icon, iconType, tooltip, className, callback, setup? }`；`setup`（可选函数）在按钮创建并 append 后调用；渲染保留 `enable` 过滤与 `pageCondition` 过滤
- **顺序即视觉**：废除 `toolbarItems.reverse()`——数组第一项渲染在顶部、最后一项最靠近 toggle（展开态自上而下）
- **空工具栏**：未提供 toolbarItems 时仅渲染展开/收起 toggle 按钮，不报错
- 容器、toggle 按钮、展开/收起（absolute 定位 + `:visible` 槽位 + resize 重算）机制沿用，行为不变

## Acceptance criteria

- [ ] `pnpm --filter tona-plugins build`（或等价）构建成功，无默认按钮相关引用残留
- [ ] 提供 `toolbarItems` 时数组整体替换（不按 index 深合并）：传 1 个元素只渲染 1 个按钮
- [ ] 未提供 `toolbarItems` 时渲染空工具栏（仅 toggle），无运行时错误
- [ ] 按钮对象含 `setup` 时在渲染后调用；不含时不报错
- [ ] 数组顺序 = 视觉顺序：第一项在顶部、最后一项最靠近 toggle（复现页或 DOM 断言）
- [ ] 展开/收起、`:visible` 槽位、resize 重算行为与重构前一致（回归验证）
