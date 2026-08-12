# Domain glossary

## Reacg Migration Loss

reacg 主题在 monorepo 迁移（提交 654fde48）时丢失的 5 类功能：iconfont 图标系统、移动端菜单（`#side-btn`）、侧边栏个人信息（`custom-avatar`/`custom-info`）、滚动隐藏导航（`header-hide`）、三个代码插件（codeHighlight/codeCopy/codeLinenumbers）。对应 effort 见 `docs/monorail/reacg-restore-migration/`。

## Legacy Theme Migration

monorepo 迁移（提交 654fde48）时未迁入的旧主题补迁。仅 `simple`/`view` 两个（用户指定），其余 7 个（bilibili/bilibiliv1/csdn/demo/element/elementv1/silence）不迁。simple 保留自研 catalog（不用新 catalog 插件）；view 用新 catalog 插件。对应 effort 见 `docs/monorail/migrate-simple-view-themes/`。

## Geek Migration Loss

geek 主题在 monorepo 迁移（提交 654fde48）时丢失的 1 个模块逻辑 + 4 个代码插件：左下角 GitHub 按钮（`buildLeftsideBottomBtns`）、`codeHighlight`/`codeLinenumbers`/`codeCopy`/`codeLang`。对应 effort 见 `docs/monorail/geek-restore-migration/`。

## Live2D Mute

live2d 插件 `live2d` 配置里的布尔键 `mute`（默认 `false`）：为 true 时模型互动照常触发动画，但播放 motion sound 的 audio 不发声。

## Custom Links

用户通过主题配置 `links` 提供的外链列表（`name` + `link`）。宽屏下以侧边栏文字列表呈现；收起态下通过 Custom Links Popover 呈现。

## Collapsed Sidebar

geek 左侧栏在视口 ≤1366px 时的纯图标态：`#cnblog-nav` 只显示图标、隐藏文案；宽屏下的 `.links` 文字列表在此态隐藏。

## Custom Links Popover

Collapsed Sidebar 下挂在 `#cnblog-nav` 末尾 `fa-link` 图标上的浮层：列出 Custom Links，支持 hover 与 click 打开/关闭。

## Sidebar Toggle

geek 主题在 769–1366px 下收起/展开双侧栏的开关（tools 浮动工具栏内 toolbar item，`className` 为 `sidebar-toggle`）：收起态 `#left-side` 与 `#sideBar` 全部隐藏、主区占满全宽；展开态恢复 Collapsed Sidebar + 右栏 280px。图标随状态互换（显示 `fa-compress` / 隐藏 `fa-expand`），tooltip 表示当前状态（展开态「侧栏展开」/ 收起态「侧栏收起」），localStorage 持久化。对应 effort 见 `docs/monorail/geek-sidebar-toggle/`。

## Theme Dist

主题经 `tona-vite` 构建后的可分发产物目录（通常为 `dist/`）。默认形态为带 File Hash 的 IIFE JS + 独立 CSS；可选 Inline CSS Dist。GitHub Release 产物契约（ADR-002）为无 hash 双文件 `{themeName}.min.js` + `{themeName}.min.css`。

## Release Theme Artifacts

GitHub Release 上随 `v*` tag 发布、供博客用户直接下载使用的主题产物：5 个主题（geek/reacg/shadcn/simple/view）各一个 zip，内含稳定命名的 `{themeName}.min.js` + `{themeName}.min.css`（无 hash、CSS 独立、zip 扁平无说明文档）。对应 ADR-002。

## Inline CSS Dist

Theme Dist 的一种形态：样式不单独输出 `.css`，由构建把 CSS 打进 IIFE JS，运行时通过 `document.createElement('style')` 注入。由 `tona-vite` 的 `inlineCss` 开启。

## File Hash

Theme Dist JS 文件名中的内容哈希段（如 `geek.DOZM4b0L.js`）。`tona-vite` 的 `hash` 控制是否写入；默认开启。

## Dependency Pre-bundling

dev 模式下 Vite 启动时把模块图中真实 node_modules 依赖预先打包（rolldown/esbuild），浏览器直接加载预打包产物，避免运行时逐个发现导致整页刷新。主题目录无 `index.html`，默认扫描器找不到入口，需 `tona-vite` 用 `optimizeDeps.entries` 显式指定 Dev Scan Entry。对应 effort 见 `docs/monorail/tona-vite-deps-entries/`。

## Dev Scan Entry

Vite 依赖扫描器在 dev 启动时爬取依赖图的入口文件。`computeEntries` 优先级：`optimizeDeps.entries` → `build.rollupOptions.input` → 兜底 glob `**/*.html`。主题场景下由 `tona-vite` 注入 `optimizeDeps.entries` 指向 `src/main.(ts|js)`，使扫描器经 `pluginContainer.resolveId`（alias/插件链生效）发现全部真实依赖。

## Toolbar Button

tools 浮动工具栏内一个可插拔、可独立定义的按钮单元（即原 toolbar item 的规范称谓）：自包含 `{ enable, page, icon, iconType, tooltip, className, callback, setup? }`。按钮由工厂函数（如 `createBackTopButton`）创建，主题以 `toolbarItems` 声明式列表选择；未引入的按钮代码不进入主题产物（tree-shaking）。对应 effort 见 `docs/monorail/tools-buttons/`。

## Plugin CSS Variables

plugins 包内插件样式的可配置 CSS 变量，命名 `--<插件slug>-<kebab-case-key>`（如 `--post-message-categories-background`）。默认值在插件 css 文件顶部 `:root` 声明块集中定义，规则体以 `var(--xxx)` 引用；主题通过覆盖同名变量定制插件样式，替代原 sass `@use ... with()` 配置机制。对应 ADR-003 与 effort `docs/monorail/plugins-scss-to-css/`。

## Package Entry Contract

monorepo 包的统一入口规则：所有包（含 plugins）`exports` 一律指向 `dist/` 产物，无源码分发包；纯 JS/CSS 包同样产物分发。plugins 的 dist 为扁平布局（`dist/<plugin>/index.css`，不保留 `src/plugins/` 前缀）。对应 ADR-004 与 effort `docs/monorail/plugins-dist-contract/`。

## Plugin CSS Subpath

插件 CSS 的裸包名引用 `tona-plugins/<plugin>/index.css`（如 `@import 'tona-plugins/catalog/index.css'`），经 `exports` 通配 `"./*": "./dist/*"` 映射到 `dist/<plugin>/index.css`。替代原 tona-vite 内置 `@tona-plugins` alias（已移除）；残留旧引用映射到不存在的路径，显式报错。对应 ADR-004。
