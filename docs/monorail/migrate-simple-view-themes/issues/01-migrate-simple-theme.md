# 01 — 迁移 simple 主题

Status: done
Blocked by: None

## What to build

从提交 `654fde48^` 的 `src/themes/simple/` 完整迁移 simple 主题到 `themes/simple/`，接入 monorepo 构建，忠实还原皮肤。

**结构**（对齐 geek/reacg）：
```
themes/simple/
├── package.json          # geek 同款（tona/tona-options/tona-plugins deps + tona-vite devDep）
├── vite.config.ts        # tona({ themeName: 'simple', inlineCss: true, hash: false })
└── src/
    ├── main.js           # import.meta.glob 注册 + .use() 链
    ├── constants/        # 从 geek 复制 cnblog.js / links.js
    ├── utils/            # 从 geek 复制 cnblog.js / helpers.js / shared.js
    ├── modules/
    │   ├── header/       # 自研：昵称/头像/移动端菜单/自定义链接/随笔页标题/首页滚动锁定
    │   ├── side/         # 自研：侧边栏分类折叠 + 日历标题
    │   ├── catalog/      # 自研目录（保留，不用新 catalog 插件）
    │   └── scroll/       # 自研：滚动隐藏 header / 目录上移
    └── style/            # index.scss + markdown.scss + scroll.scss + tools.scss + plugins.scss + index.m.scss
```

**插件 `.use()` 链**（均 `{ enable: true }`）：
colorMode、footer、codeHighlight、codeCopy、codeLinenumbers、imagePreview、donation、emoji、musicPlayer、postMessage、license、notice、signature、commentsAvatars、tools

**自研模块迁移要点**：
- `modules/header/`：`#navList` after 加 `.navbar-end`、`#blog_nav_newpost` 移入、`#Header1_HeaderTitle` 设昵称、`#blogLogo` 设头像、`#navbarBurger` 移动端菜单、`.custom-links`（github/gitee）、随笔页标题 `.header-posttitle`、首页 `.navlist-fix`。import 路径改当前结构。
- `modules/side/`：`#blog-calendar-title` 前缀 + 14 个侧边栏分类折叠 toggle。`poll` 从 `utils/helpers`。
- `modules/catalog/`：自研目录生成。`catalogConfig` 改为 `getCatalogOptions()` 取 `enable`；`userAgent`/`getClientRect`/`throttle`/`poll` 从 `utils/helpers`；`isPostDetailsPage`/`hasPostTitle` 从 `utils/cnblog`。`catalog-sticky`/`catalog-active`/`catalog-scroll-up` 逻辑保留。
- `modules/scroll/`：滚动方向判定 + `#header` `is-active` + `#catalog` `catalog-scroll-up/down`。`userAgent`/`isPostDetailsPage` 从 utils。

**样式**：旧 `style/` 各 scss 原样迁入；`build/header|side|catalog/index.scss` 并入对应模块 `index.scss`；plugins.scss 旧 `@import 'plugins/X'` 改 `@use '/node_modules/tona-plugins/src/plugins/X/index.scss' as * with (...)`（含 `$footer`/`$toolMenu`/`$donation`/`$player`/`$postMessage`/`$signature`/`$emoji` 变量）。Font Awesome `@import url(...)` 保留。

**不写** `window.opts`（旧代码不依赖）。

## Acceptance criteria

- [x] `themes/simple/` 完整结构就位（package.json + vite.config.ts + src/）
- [x] main.js 用 `import.meta.glob` 注册模块 + 15 个插件 `.use()` 链
- [x] 4 个自研模块（header/side/catalog/scroll）`install()` 就位，逻辑忠实迁移
- [x] catalog 用 `getCatalogOptions` 取 enable，保留自研逻辑（不用新 catalog 插件）
- [x] 样式迁移完整，plugins.scss 的 `@use ... with (...)` 映射正确，Font Awesome 保留
- [x] `pnpm --filter tona-theme-simple build` 构建成功，产物 `dist/simple.js` 存在
- [x] 产物含 `navbarBurger`、`catalog-sticky`、`catalog-scroll-up`、`custom-links`、`.header-posttitle` 等关键字符串
- [x] inline CSS 含 simple 关键样式（`#catalog`、`.custom-links`、`.navbar-burger` 等）

## Comments

Batch 2026-08-07: start — 00634ffe
done — 9e3eec45 (build green: dist/simple.js 87.67 kB contains navbarBurger/catalog-sticky/catalog-scroll-up/custom-links/header-posttitle; inline CSS has #catalog/.custom-links/.navbar-burger; regression: string counts match 654fde48^ dist/simple.js exactly. Note: old shared style/reset.scss + hideAds.scss vendored into src/style/ with ./-relative imports — rendered CSS identical)
