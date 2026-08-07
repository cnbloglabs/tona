# 02 — icons 模块（iconfont 图标系统）

Status: done
Blocked by: 01

## What to build

从提交 `654fde48^` 的 `src/themes/reacg/build/icons/` 恢复 iconfont 图标系统，迁入 `themes/reacg/src/modules/icons/`：

- `icons.js`：原样迁入 `fontUrl`（`//at.alicdn.com/t/font_1595820_xb2hu5wpss.js`）、`icons` 表、`foodIcons` 表。
- `index.js`：原样迁入 `iconInSvg`/`setModeIcon`/`setSidebarIcon`/`setGitee`/`setGithub`/`setIndexPosttitleIcon`/`setIndexPostLookIcon`/`setEntrylistPosttitleIcon`/`setPostTitleIcon`/`nav`，并导出 `export function install()`（内部 `loadScript(fontUrl, build)`）。
- `index.scss`：原样迁入 `.icon` 及各类目样式。

**适配改动（相对旧代码）**：

- import 路径改为当前结构：`../../constants/cnblog`、`../../constants/links`、`../../utils/helpers`、`../../utils/cnblog`、`tona-options` 的 `getGiteeOptions`/`getGithubOptions`。注意当前 `utils/cnblog.js` 的 `getCurrentPage()` 已存在且逻辑一致。
- **friends 死链修复**：`setSidebarIcon` 的 `sidebarWraps.friends` 从 `'#sidebar_links1065840'` 改为 `'#sidebar_links'`（旧链几乎必不存在，会导致 `poll` 轮询 180s）。
- `setGitee`/`setGithub` 的 `getGiteeOptions()`/`getGithubOptions()` 需传 `devOptions`（若模块 `install(_, devOptions)` 能拿到则透传；否则从 `window.opts` 读取——与 `getThemeOptions().avatar` 同源）。

**图标切换耦合（已验证兼容）**：新 `darkMode` 插件监听 `.mode-change` 点击 + `html[theme]` 属性，与旧 `setModeIcon` 的 `html[theme]` 读取和 `.mode-change` 替换图标逻辑一致，无需改绑定。

## Acceptance criteria

- [ ] `modules/icons/` 三文件就位，`index.js` 导出 `install()`
- [ ] `setSidebarIcon` 的 friends 指向 `#sidebar_links`
- [ ] iconfont 加载失败静默降级（无报错、无占位）
- [ ] 构建成功；产物 `dist/reacg.js` 含 `at.alicdn.com` iconfont URL、`iconInSvg` 逻辑、`custom-gitee`/`custom-github`/`mode-change` 注入
- [ ] 产物 inline CSS 含 `.icon` 尺寸样式（`build/icons/index.scss` 内容）

## Comments

- 2026-08-07 build: 全部验收点通过（TDD red→green）。red: dist 无 iconfont URL / iconInSvg / custom-gitee / sidebar_links / changeModeRotate；green: `pnpm --filter tona-theme-reacg build` 成功（98.59 kB），dist/reacg.js 含 `at.alicdn.com/t/font_1595820_xb2hu5wpss`(×1)、`xlink:href`/`aria-hidden`（iconInSvg 模板，函数名被压缩属正常）、`custom-gitee`(×3)/`custom-github`(×2)/`mode-change`(×6)、`sidebar_links`(×1，死链 `sidebar_links1065840` 为 0)、inline CSS 含 `.icon` 尺寸样式与 `changeModeRotate` keyframes。`install()` 零参注册（main.js glob），`getGiteeOptions`/`getGithubOptions` 无参走 `window.opts`（tona-options `defineOptions`），与旧调用一致。import 用 `../../common/...`（reacg 的 constants/utils 在 `src/common/` 下，区别于 geek 的 `src/constants`）。commits: 1c844351（实现，claim 见 6947eae7）。全量测试 211/212 通过，1 个失败为 main 上既有问题（packages/options 音乐默认配置测试，HEAD 复现确认）；oxlint 配置损坏（`no-banned-types` 等规则不存在）为仓库既有问题，新文件已过 `vp check --no-lint` 格式检查。
