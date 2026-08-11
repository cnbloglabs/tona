# tools-buttons — tools 插件 API 重设计：可插拔按钮 + tree-shaking

## Intent

当前 tools 插件的 `toolbarItems` 是静态配置数组，与插件默认按钮集按数组 index 深合并；默认 6 个按钮（回顶/深色/推荐/关注/收藏/评论）及行为硬编码在 tools 插件内，主题按钮行为（darkMode 委托、sidebar-toggle callback）分散在插件/模块各处——增删按钮依赖数组下标、无法按按钮 tree-shake。目标是重构 tools 为「框架 + 可插拔按钮」：每个按钮是独立模块、自包含（配置 + callback + 初始化 setup），主题以声明式列表选择按钮，未使用的按钮代码不进产物。

## Decisions settled

- **可增删语义 = 配置时声明式**：增删按钮即改 `toolbarItems` 列表；不做运行时 API
- **按钮形态 = 独立模块 + 工厂函数**：`createBackTopButton(options?)` 等工厂返回「按钮对象」；与 geek sidebar-toggle 的 `createSidebarToggleToolbarItem` 形态统一
- **零默认、全显式**：tools 不再内置默认按钮集；提供 `toolbarItems` 即完全替换（废除按 index 深合并）；未提供 = 空工具栏（仅展开/收起 toggle 按钮）
- **通用按钮放 tona-plugins**：回顶/深色/推荐/关注/收藏/评论拆为独立按钮模块，主入口 `export *` 导出工厂；主题专属按钮（如 geek sidebar-toggle）留在主题模块
- **按钮契约 = item 配置 + callback + 可选 setup**：`{ enable, page, icon, iconType, tooltip, className, callback, setup? }`；`setup` 在按钮渲染后调用（初始化/状态恢复），按钮自包含
- **darkMode 按钮自包含 + 插件保留**：`createDarkModeButton()` 的 setup 初始化模式、callback 三态切换，复用 darkMode 核心逻辑；darkMode 插件保留导出（无按钮场景：仅跟随系统/代码高亮等）
- **API 形状不变**：`.use(tools, devOptions, pluginOptions)` 三参 + `toolbarItems` 字段
- **数组顺序 = 视觉顺序**：第一项在顶部、最后一项最靠近 toggle；废除 `toolbarItems.reverse()`
- **主题全量迁移**：reacg / simple / view / geek 全部改为显式配置按钮列表

## Deferred

- 运行时增删 API（`toolbar.addButton/removeButton`）——声明式为基，后续迭代
- 子路径导出（`tona-plugins/tools/buttons/...`）——主入口 ESM tree-shaking 已足够
- `toolbarItems` 未提供时的 dev 警告策略
- 非 tools 插件（darkMode 等）的深层行为拆分细节——按钮层先行

## Out of scope

- tools 的容器/展开收起/跨断点布局机制（沿用上轮 absolute 定位修复，行为不变）
- darkMode 插件核心逻辑的重写（仅按钮入口自包含化）
- 其他插件（非工具栏相关）的 API 调整
- 运行时动态增删

## Domain pointers

- `docs/monorail/CONTEXT.md` — Sidebar Toggle 术语（geek sidebar-toggle 按钮）；本次引入规范术语「toolbar button（按钮）」= 可插拔的独立工具栏单元
- 无直接相关 ADR（ADR-001/002 涉及 tona-vite 构建与发布契约，与本项正交）
- 相关 prior effort：`docs/monorail/geek-sidebar-toggle/`（sidebar-toggle 工厂形态先行，本项统一按钮契约）
