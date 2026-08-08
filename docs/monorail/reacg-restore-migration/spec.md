# Spec: reacg 迁移丢失功能恢复

## Problem Statement

reacg 主题在 monorepo 迁移（提交 `654fde48`）时，`src/themes/reacg/` 的 5 类功能被删除且未迁入 `themes/reacg/` 新结构：

1. **图标系统**：iconfont SVG 注入逻辑（`build/icons/index.js`）、图标库定义（`build/icons/icons.js`）、`.icon` 样式（`build/icons/index.scss`）、Font Awesome 引入（`style/icons.scss`）
2. **移动端菜单**：`#side-btn` 汉堡按钮注入（`build/mobileMenu/`）
3. **侧边栏个人信息**：`custom-avatar` + `custom-info` 注入（`build/profile/`）
4. **滚动隐藏导航**：`header-hide` / `catalog-scroll-up`（`build/scroll/`）
5. **三个代码插件未接回**：`highlight`/`copyCode`/`linenumbers` 对应新系统的 `codeHighlight`/`codeCopy`/`codeLinenumbers`

症状：皮肤图标全部消失；移动端无侧边栏开关；侧边栏无个人头像与统计信息；滚动时导航不隐藏；代码块无高亮/复制/行号。`response.scss` 与 `plugins.scss` 仍引用 `.custom-avatar`、`catalog-scroll-up` 等丢失选择器，说明样式层部分残留而注入层整体丢失。

## Solution

从提交 `654fde48^` 恢复 5 类功能，迁入 reacg 主题现有结构，遵循 geek 主题的 `src/modules/**` + `export function install()` 约定。

**新增模块**（放在 `themes/reacg/src/modules/`，与 geek 一致）：

- `modules/icons/` —— iconfont 图标系统（`icons.js` + `index.js` + `index.scss`）
- `modules/mobileMenu/` —— `#side-btn` 汉堡按钮
- `modules/profile/` —— 侧边栏头像 + 信息
- `modules/scroll/` —— 滚动隐藏导航

**main.js 改动**：

- 加入 `Object.values(import.meta.glob('./modules/**/*.js', { eager: true })).forEach((i) => i.install())`（对齐 geek 的模块注册方式）
  - **注意**：glob 会匹配到 `modules/icons/icons.js`（图标定义表，无 `install` 导出），直接调用会抛 `TypeError: i.install is not a function`。因此 4 个主题的 main.js 均改为先 `.filter((m) => typeof m.install === 'function')` 再调用（与 `createThemeApi.ts` 的 `isFunction(plugin.install)` 防御风格一致）。
- `.use()` 链补上 `codeHighlight` / `codeCopy` / `codeLinenumbers`

**样式改动**：

- `plugins.scss` 的 `@use` 列表补上 `codeHighlight` / `codeCopy` / `codeLinenumbers`
- `index.scss` 补 `header-hide` 样式
- `response.scss` 补 `side-btn` 移动端样式

**图标资源决策**：仅迁移 iconfont（`//at.alicdn.com/t/font_1595820_xb2hu5wpss.js`）。Font Awesome 不引入——旧代码实际未使用（`build/icons/` 全用 iconfont symbol）。加载失败静默降级。

## User Stories

1. As a reacg 主题用户，I want 导航栏、侧边栏、文章标题、文章小标题都有 iconfont 图标，so that 恢复皮肤原本的视觉风格。
2. As a reacg 主题用户，I want 移动端有一个汉堡按钮能展开/收起侧边栏，so that 移动端可以正常访问侧边栏内容。
3. As a reacg 主题用户，I want 侧边栏显示头像与昵称/园龄/粉丝/关注信息，so that 恢复博客个人信息展示。
4. As a reacg 主题用户，I want 向下滚动时导航栏上移隐藏、目录随之上升，so that 阅读时获得更多可视区域。
5. As a reacg 主题用户，I want 代码块有语法高亮、复制按钮、行号，so that 恢复代码阅读体验。

## Implementation Decisions

- **模块结构**：`themes/reacg/src/modules/<name>/{index.js,index.scss}`，每个导出 `install()`。`icons` 模块多一个 `icons.js`（iconfont 图标定义表）。对齐 geek 的 `import.meta.glob` 自动注册，reacg 主入口从旧 `build()` 手动调用迁移到自动注册。
- **图标注入**：原样迁入 `build/icons/index.js` 的 `iconInSvg`/`setModeIcon`/`setSidebarIcon`/`setGitee`/`setGithub`/`setIndexPosttitleIcon`/`setIndexPostLookIcon`/`setEntrylistPosttitleIcon`/`setPostTitleIcon`/`nav`。`setIcons` 通过 `loadScript(fontUrl, build)` 加载 iconfont。
  - **已验证**：新 `darkMode` 插件（`packages/plugins/src/plugins/darkMode/index.js`）仍监听 `.mode-change` 点击，且用 `$('html').attr('theme', mode)` 设置模式。与旧 `setModeIcon` 的 `.mode-change` 选择器、`html[theme]` 读取完全兼容。`setModeIcon` 可原样迁移，无需改绑定逻辑；它与 darkMode 的 `.mode-change` 监听各自独立、不冲突（darkMode 只管 html[theme] + 代码主题，setModeIcon 只管图标替换）。
  - `setGitee`/`setGithub` 读取 `getGiteeOptions`/`getGithubOptions`（`tona-options` 已提供）。
- **friends 选择器修复**：`sidebarWraps.friends` 从死链 `'#sidebar_links1065840'` 改为 `'[id^="sidebar_links"]'`（博客园友情链接 widget 的 id 是博客专属的，如模板 `sidebar_links1978167`，需前缀匹配），避免 `poll` 无谓轮询 180s。
- **profile**：`avatar` 从 `getThemeOptions().avatar` 取（`constants/cnblog.js` 已有 `avatar` 导出）；`custom-info` 使用 `constants/links.js` 的 `followersDetailsUrl`/`followingDetailsUrl`/`index`/`userDetails`（均已存在）；`hideFollowButton` 的 `isOwner()` 已存在。
- **scroll**：`header-hide` 样式（`transform: translate3d(0,-100%,0)`）补进 `index.scss`；`catalog-scroll-up` 已在 `plugins.scss`，不重复。滚动 JS 用 `$(window).scroll` 原样迁入，方向判定逻辑保留。
- **mobileMenu**：`#side-btn` 注入 + `unpass()` 滚动锁定保留；样式补进 `response.scss`。桌面端仍构建按钮、靠 `@media (max-width:767px)` 显示（沿用旧行为）。
- **插件接入**：`main.js` `.use(codeHighlight)`/`.use(codeCopy)`/`.use(codeLinenumbers)`，均带 `{ enable: true }`。`plugins.scss` 补对应 `@use`（`codeHighlight/index.scss`、`codeCopy/index.scss`、`codeLinenumbers/index.scss`），后两个与现有 `@use ... as *` 风格一致。
- **iconfont 降级**：`loadScript` 失败静默（无占位、无报错）。

## Testing Decisions

- **主要 seam：构建验证**。运行 `pnpm --filter tona-theme-reacg build`（`vp build`），断言：
  - 构建成功，产物 `dist/reacg.js` 包含 iconfont URL、`custom-avatar`、`side-btn`、`header-hide`、`codeHighlight` 等关键字符串（证明注入逻辑进入产物）。
  - 产物 CSS（inline）包含 `.icon` 样式、`side-btn` 样式、`header-hide` 样式、`copy-btns` 样式。
- **次要 seam：插件存在性**。`packages/plugins` 的导出测试若存在，确认 `codeHighlight`/`codeCopy`/`codeLinenumbers` 已从 `tona-plugins` 导出（`main.js` 的 import 来源）。
- **不做**：DOM 集成测试（`jsdom`/happy-dom 模拟博客园页面）——本次迁移是恢复旧代码，逻辑已被旧版本验证；成本高、收益低。测试重点放在「丢失的选择器/样式/注入逻辑确实回到产物」这一回归护栏。
- **暗色耦合已闭环**：新 `darkMode` 插件的 `.mode-change` / `html[theme]` 机制与旧 `setModeIcon` 兼容，图标切换逻辑无需调整（见 Implementation Decisions）。

## Out of Scope

- Font Awesome 引入（决策已否，reacg 不使用 `fa-` 类）
- 旧 `comments` 构建模块（旧代码已注释，从未启用）
- 旧 `mobileMenu` 中被注释的 clip-path 圆形展开效果（旧版即注释）
- 其他主题（geek 等）的迁移核查
- 老版 `index.m.scss` 中 `.custom-avatar` 移动端样式的调整（`response.scss` 已保留该选择器引用，本次仅恢复注入来源）

## Further Notes

- 迁移源提交：`654fde48^`（`src/themes/reacg/` 各文件）。
- `darkMode` 插件暗色切换机制（`.dark-mode` vs 旧 `.mode-change`）是唯一需要 spec 阶段验证的耦合点，见 Implementation Decisions。
- 对齐文件：`docs/monorail/reacg-restore-migration/align.md`。
