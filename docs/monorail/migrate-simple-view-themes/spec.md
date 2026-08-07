# Spec: 补迁 simple / view 主题

## Problem Statement

monorepo 迁移（提交 `654fde48`）时，9 个旧主题未迁入。用户指定只补迁 `simple` 和 `view` 两个，其余 7 个（bilibili/bilibiliv1/csdn/demo/element/elementv1/silence）不迁。

当前 `themes/` 下只有 geek/reacg/shadcn。`simple` 与 `view` 的完整代码仍在 `654fde48^` 提交的 `src/themes/simple/`、`src/themes/view/`，未接入新 monorepo 的 `tona`/`tona-plugins`/`tona-vite` 体系，无法构建、无法使用。

目标：忠实迁移这两个主题到 `themes/simple/`、`themes/view/`，接入 workspace 构建，恢复皮肤原有观感与功能。

## Solution

### simple（15 插件 + 4 自研 build 模块）

**插件 `.use()` 链**（映射到新系统，均 `{ enable: true }`）：
colorMode(themeColor)、footer、codeHighlight(highlight)、codeCopy(copyCode)、codeLinenumbers(linenumbers)、imagePreview(imagebox)、donation、emoji、musicPlayer(player)、postMessage、license(postSignature)、notice、signature、commentsAvatars、tools(toolMenu)

**自研 build 模块**（`src/modules/`，忠实迁移）：
- `modules/header/` —— 昵称/头像/移动端菜单(`#navbarBurger`)/自定义链接(github+gitee)/随笔页标题/首页滚动锁定
- `modules/side/` —— 侧边栏各分类折叠切换 + 日历标题
- `modules/catalog/` —— **自研目录**（保留，不用新 catalog 插件）：空标题跳过、sticky、活跃标题高亮、折叠
- `modules/scroll/` —— 滚动隐藏 header(`is-active`)/目录上移(`catalog-scroll-up`)

### view（12 插件 + 6 自研 build 函数）

**插件 `.use()` 链**：
footer、emoji、imagePreview(imagebox)、codeCopy(copyCode)、codeLang(codeLanguage)、codeLinenumbers(linenumbers)、license(postSignature)、commentsAvatars、codeHighlight(highlight)、tools(toolMenu, 含 `initialOpen: false` + toolbarItems)、darkMode(mode)、colorMode(themeColor, `color: '#323EBE'`)、catalog(插件版，配置映射)

**view 的 catalog**：用新 `catalog` 插件（非自研）。旧配置 `{ selector: '#mainContent', fn: 'append', updateNavigation: true, showTitle: false, showScrollbar: false }` 映射到新插件的 `mountedNode`/`fn`/`updateNavigation`/`showTitle`/`showScrollbar`。

**自研 build 模块**（`src/modules/`，忠实迁移）：
- `modules/header/` —— headerNickname/buildAva/headerBtn/buildSearchbar/buildGithub/buildMessageCount

### 公共

- 每个主题 `package.json`（geek 同款 workspace deps）+ `vite.config.ts`（`tona({ themeName, inlineCss: true, hash: false })`）
- `main.js`：`import.meta.glob('./modules/**/*.js')` 自动注册 + `.use()` 链
- 样式迁移：`style/` 下所有 scss 原样迁入；plugins.scss 的旧 `@import 'plugins/X'` 改为新 `@use '/node_modules/tona-plugins/src/plugins/X/index.scss' as * with (...)`
- **不写** `window.opts`（两主题旧代码不依赖）
- Font Awesome 保留（两主题 index.scss 直接 `@import` FA CSS，与 geek 一致保留）

## User Stories

1. As a simple 主题用户，I want 皮肤完整迁移到新 monorepo 并可独立构建，so that 继续使用该皮肤。
2. As a simple 主题用户，I want 目录、header、侧边栏折叠、滚动隐藏等原有交互保留，so that 皮肤观感与功能不变。
3. As a view 主题用户，I want 皮肤完整迁移并可独立构建，so that 继续使用该皮肤。
4. As a view 主题用户，I want header 搜索框、GitHub 链接、消息数、移动端菜单等原有功能保留，so that 皮肤观感与功能不变。
5. As a 主题维护者，I want 两个新主题接入 workspace 并能 `pnpm --filter tona-theme-simple/view build`，so that 与 geek/reacg 一致的构建流程。

## Implementation Decisions

- **结构对齐 geek/reacg**：`themes/<name>/src/{modules,style,constants,utils}`。constants/utils 从当前主题（geek）复制（`cnblog.js`/`links.js`/`helpers.js`/`shared.js`），因为这些在迁移时已统一到 monorepo 结构。
- **自研模块 export**：`export function install()`，glob 自动注册。
- **simple catalog**：目录生成数据源用 `getCatalogOptions()` 的 `enable` 替代旧 `catalogConfig()`；逻辑本体（空标题跳过/sticky/活跃高亮/折叠）原样迁移，不接新 `catalog` 插件。
- **view catalog**：用新 `catalog` 插件，旧配置项映射到插件 option（`mountedNode: '#mainContent'`、`fn: 'append'`、`updateNavigation: true`、`showTitle: false`、`showScrollbar: false`）。
- **样式变量**：旧 plugins.scss 的 `$xxx` 变量映射到新 `@use ... with ($xxx: (...))`（geek/reacg 已有先例）。
- **plugins.scss import 取舍**：以 main.js 的 `.use()` 为准，全部接回对应插件样式（含 view 注释掉的 copyCode/postSignature，因 main.js 有 use）。
- **Font Awesome**：两主题 index.scss 的 `@import url(font-awesome)` 原样保留（geek 也保留 FA）。
- **移动端样式**：`index.m.scss` 保留，迁移为 `style/index.m.scss`（或并入 index.scss 的 media query，参照 reacg 的 response.scss 处理——以保留原文件为准，不做重构）。

## Testing Decisions

- **构建验证**：`pnpm --filter tona-theme-simple build`、`pnpm --filter tona-theme-view build`，断言：
  - 构建成功，产物 `dist/simple.js` / `dist/view.js` 存在
  - simple 产物含 `catalog-sticky`、`catalog-scroll-up`、`navbarBurger`、`custom-links` 等自研逻辑字符串
  - view 产物含 `custom-searchbar`、`message-count`、`custom-gtihub`、`catalog` 配置字符串
  - inline CSS 含各主题关键样式（`.header-posttitle`、`.custom-links`、`#catalog` 等）
- **回归对比**：迁移前后产物关键行为字符串对比（`654fde48^` 的构建产物 vs 新构建），确保无遗漏逻辑。
- **不做**：DOM 集成测试（忠实迁移，逻辑已被旧版本验证）。

## Out of Scope

- 其余 7 个旧主题（bilibili/bilibiliv1/csdn/demo/element/elementv1/silence）
- reacg/geek 的恢复（各自 effort）
- simple/view 的功能重构、现代化或 bug 修复（忠实迁移）
- simple 自研 catalog 替换为新 catalog 插件（决策已否，保留自研）

## Further Notes

- 迁移源提交：`654fde48^`（`src/themes/simple/`、`src/themes/view/`）。
- 插件映射表见 `align.md` 的 Decisions settled。
- 对齐文件：`docs/monorail/migrate-simple-view-themes/align.md`。
