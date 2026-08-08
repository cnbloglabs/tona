# Align: reacg 迁移丢失功能恢复

## Intent

reacg 主题在 monorepo 迁移（提交 654fde48）时丢失了 5 类功能。用户要全部修复，恢复皮肤原有的观感与行为。修复采用「方案 2」——从旧提交 `654fde48^` 恢复图标 iconfont 系统，而非简单引入 Font Awesome。

丢失清单（对齐时确认，全修）：
1. **图标系统** `build/icons/` + `style/icons.scss` —— iconfont SVG 注入 + `.icon` 样式
2. **移动端菜单** `build/mobileMenu/` —— `#side-btn` 汉堡按钮注入 + 样式
3. **侧边栏个人信息** `build/profile/` —— `custom-avatar` + `custom-info`（昵称/园龄/粉丝/关注）
4. **滚动隐藏导航** `build/scroll/` —— `header-hide` / `catalog-scroll-up`
5. **三个插件未接回** —— `codeHighlight` / `codeCopy` / `codeLinenumbers`（旧 highlight/copyCode/linenumbers）

## Decisions settled

- **图标资源只迁移 iconfont**：`//at.alicdn.com/t/font_1595820_xb2hu5wpss.js`。Font Awesome 不引入——旧 `style/icons.scss` 虽 import 了 FA CSS，但 `build/icons/` 全部用 iconfont SVG symbol，FA 那段 `*::before/*::after` 从未被实际使用（是其他皮肤的遗留）。geek 保留 FA 是因为它真用 `fa-` 类，reacg 不需要。
- **iconfont 加载失败静默降级**：`loadScript(fontUrl, build)` 失败时不注入图标、无占位、无报错（沿用旧行为）。
- **导航栏 friends 选择器修复**：旧 `sidebarWraps.friends = '#sidebar_links1065840'` 是写死的死链（几乎肯定不存在），会导致 `poll` 轮询 180s 超时。改为 `[id^="sidebar_links"]` —— 博客园友情链接 widget 的 id 是博客专属的（模板为 `sidebar_links1978167`、旧 reacg 为 `sidebar_links1065840`），固定 `#sidebar_links` 匹配不到，需前缀匹配同时兼容两种情况。
- **滚动隐藏导航完整迁移**：`header-hide` 样式补进 `index.scss`（`transform: translate3d(0,-100%,0)`）；`catalog-scroll-up` 样式已在 plugins.scss 保留，无需重复。滚动 JS 原样迁入。
- **移动端菜单完整迁移**：`#side-btn` 注入逻辑 + `unpass()` 滚动锁定保留；`side-btn` 样式补进 `response.scss`（旧版桌面也构建按钮、靠 `@media` 隐藏，保留此行为）。
- **三个代码插件接回**：`.use(codeHighlight)` / `.use(codeCopy)` / `.use(codeLinenumbers)` 加进 main.js；对应 scss 加进 plugins.scss 的 `@use` 列表。
- **模块放置结构**：沿用 geek 主题的 `src/modules/**` + `export function install()` 约定，而非旧 `build/` 结构。reacg 主入口从旧的 `build()` 手动调用改为与 geek 一致的 `import.meta.glob` 自动注册。

## Deferred

None

## Out of scope

- Font Awesome 引入（决策已否，reacg 不使用 `fa-` 类）
- 旧 `comments` 构建模块（旧代码已注释 `// import comments from './comments'`，从未启用）
- 旧 `build/mobileMenu` 里被注释的 clip-path 圆形展开效果（旧版即注释，非丢失）
- 其他主题（geek 等）的迁移核查

## Domain pointers

- `docs/monorail/CONTEXT.md` —— 新增术语「Reacg Migration Loss」；「Custom Links」相关（footer 插件已接回，无需恢复）
- 无 ADR 变更（决策均有旧实现可对照，非全新设计，不构成 ADR）
