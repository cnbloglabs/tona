# 02 — 迁移 view 主题

Status: done
Blocked by: None

## What to build

从提交 `654fde48^` 的 `src/themes/view/` 完整迁移 view 主题到 `themes/view/`，接入 monorepo 构建，忠实还原皮肤。

**结构**（对齐 geek/reacg）：
```
themes/view/
├── package.json          # geek 同款
├── vite.config.ts        # tona({ themeName: 'view', inlineCss: true, hash: false })
└── src/
    ├── main.js           # import.meta.glob 注册 + .use() 链
    ├── constants/        # 从 geek 复制 cnblog.js / links.js
    ├── utils/            # 从 geek 复制 cnblog.js / helpers.js / shared.js
    ├── modules/
    │   └── header/       # 自研：headerNickname/buildAva/headerBtn/buildSearchbar/buildGithub/buildMessageCount
    └── style/            # index.scss + variables.scss + tools.scss + scroll.scss + animate.scss + header.scss + markdown.scss + plugins.scss + build.scss + index.m.scss
```

**插件 `.use()` 链**：
- footer、emoji、imagePreview、codeCopy、codeLang、codeLinenumbers、license、commentsAvatars、codeHighlight（均 `{ enable: true }`）
- tools：`{ enable: true, initialOpen: false }` + toolbarItems（fa-comment-dots/fa-star/fa-heart/fa-thumbs-up/fa-adjust/fa-rocket，iconType className）
- darkMode（mode）：`{ enable: true }`
- colorMode（themeColor）：`{ enable: true, color: '#323EBE' }`
- catalog（新插件）：`{ enable: true }` + `{ mountedNode: '#mainContent', fn: 'append', updateNavigation: true, showTitle: false, showScrollbar: false }`

**自研模块迁移要点**：
- `modules/header/`：`#Header1_HeaderTitle` 设昵称、`#blogLogo` 设头像、`#navbarBurger` 移动端菜单（toggle navigator/custom-searchbar/postTitle svg）、`#navigator` after 加 `#q` 搜索框（`custom-searchbar`，`zzk_go_enter`）、`#navList` 加 `#custom-gtihub` GitHub 链接、`#lnkBlogLogo` 加 `#message-count` 消息数。import 改当前结构（`getGithubOptions`/`avatar`/`getMessageCount`/`message`）。
- 旧注释掉的 buildHeader/customLinks **不迁**（旧代码即注释，从未启用）。

**样式**：旧 `style/` 各 scss 原样迁入；plugins.scss 旧 `@import` 改 `@use '/node_modules/tona-plugins/src/plugins/X/index.scss' as * with (...)`（含 `$postSignature`/`$toolMenu`/`$footer`/`$player`/`$postMeaage`/`$signature`/`$emoji` 变量）。**以 main.js 的 `.use()` 为准**接回全部插件样式（含旧注释掉的 copyCode/postSignature）。Font Awesome `@import url(...)` 保留。

**不写** `window.opts`（view 的 opts 引用均在注释中）。

## Acceptance criteria

- [x] `themes/view/` 完整结构就位（package.json + vite.config.ts + src/）
- [x] main.js 用 `import.meta.glob` 注册模块 + 13 个插件 `.use()` 链
- [x] `modules/header/` `install()` 就位，6 个自研函数逻辑忠实迁移
- [x] catalog 用新插件，配置映射到 `mountedNode`/`fn`/`updateNavigation`/`showTitle`/`showScrollbar`
- [x] 样式迁移完整，plugins.scss 的 `@use ... with (...)` 映射正确（含注释掉的 copyCode/postSignature 接回），Font Awesome 保留
- [x] `pnpm --filter tona-theme-view build` 构建成功，产物 `dist/view.js` 存在
- [x] 产物含 `custom-searchbar`、`message-count`、`custom-gtihub`、`navbarBurger` 等关键字符串
- [x] inline CSS 含 view 关键样式（`#q`/`.custom-searchbar`、`.message-count`、`#custom-gtihub` 等）

## Comments

Batch 2026-08-07: start — 00634ffe
done — 20468658 (build green: dist/view.js 79.83 kB contains custom-searchbar/message-count/custom-gtihub/navbarBurger/zzk_go_enter + catalog config mountedNode/updateNavigation/showTitle/showScrollbar + toolbarItems fa-* icons; inline CSS has .custom-searchbar/.message-count/#custom-gtihub; regression: string counts match 654fde48^ dist/view.js. Note: old shared style/reset.scss + hideAds.scss vendored into src/style/; old build dropped .awes-lang CSS — new bundle includes source block + re-wired codeCopy/codeLang plugin styles per 接回 mandate)
