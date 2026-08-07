# 02 — icons 模块（iconfont 图标系统）

Status: open
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
