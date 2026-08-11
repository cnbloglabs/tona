# 03 — darkMode 按钮工厂：自包含 setup + callback，复用 darkMode 核心

Status: done
Blocked by: 01

## Comments

Batch 2026-08-11: start — f384c1bd（未提交模式，工作区叠加于 issue 01 与 geek-sidebar-toggle 挂起成果之上）
done — buttons/darkMode.js 自包含工厂（setup 经 setModeButtonStyle+init+updateModeButton 初始化，callback 经 cycleMode 三态循环，darkDefault/followSystem 从 options 读取）；darkMode/index.js 抽公共导出（applyMode/setMode/init/updateModeButton/cycleMode/setModeButtonStyle，插件行为不变、委托保留）；barrel 追加；index.d.ts 补声明；test/darkMode.button.test.ts 12 用例；plugins 测试 49/49；全量 270/271（唯一失败 pre-existing musicPlayer）
Review 2026-08-12 fixes：工厂支持 icons/tooltips 三态映射（默认 DEFAULT_ICONS/DEFAULT_TOOLTIPS，单 icon/tooltip 全覆盖）；默认 iconType 改 'className'（与插件一致）；className 强制 'mode-change' 不可覆盖（消除同步失效 + MutationObserver 泄漏）；callback 对 event stopPropagation（防与 darkMode 插件委托双触发，tools 透传 event）；darkMode/index.js 导出 DEFAULT_ICONS/DEFAULT_TOOLTIPS；单测更新+新增（三态映射/默认三态/stopPropagation/className 固定）；plugins 测试 54/54；全量 275/276（唯一失败 pre-existing musicPlayer）

## What to build

在 `packages/plugins/src/plugins/tools/buttons/darkMode.js` 建立 `createDarkModeButton(options?)` 工厂（主入口 `export *`），返回自包含按钮对象，使深色按钮不依赖 `.use(darkMode)` 插件或委托事件即可工作：

- **按钮对象**：`page: 'all'`、`className: 'mode-change'`、icon `🌜`(html)、tooltip「深色」（options 可覆盖）
- **setup(theme, pluginOptions)**：初始化模式状态（读取 `localStorage.modeType`，无存储时按 darkDefault/followSystem 默认逻辑），应用深色/浅色（html theme 属性、代码高亮主题），并初始化按钮图标/tooltip；必要时保留 MutationObserver 等待按钮出现的兜底同步（tools 渲染晚于 setup 调用顺序由实现决定）
- **callback**：dark → light → system → dark 三态循环切换并持久化（复用 darkMode 核心逻辑）
- **复用**：从 `src/plugins/darkMode/index.js` 抽出/导出可复用的核心函数（applyMode/setMode/init 或等价），按钮与 darkMode 插件共用；darkMode 插件保留导出（无按钮场景仍可用），行为不回归

## Acceptance criteria

- [ ] `createDarkModeButton` 从 `tona-plugins` 主入口可 import，返回按钮对象（默认字段/options 覆盖/callback/setup 存在）
- [ ] 不 `.use(darkMode)` 仅用按钮即可三态切换：点击按 dark → light → system 循环、写 `localStorage.modeType`、html theme 属性随之变化
- [ ] `setup` 初始化：`localStorage.modeType` 有值时恢复对应模式；无值时按默认逻辑进入浅色/深色
- [ ] 既有 `darkMode.test.ts` / `darkMode.integration.test.ts` 全部通过（darkMode 插件无回归）
- [ ] 新增按钮工厂单测（seam A）：按钮对象形状 + callback 三态循环 + setup 初始化，通过
- [ ] 全量 `pnpm test` 无新增失败
