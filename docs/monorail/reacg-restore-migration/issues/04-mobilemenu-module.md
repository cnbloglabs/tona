# 04 — mobileMenu 模块（移动端汉堡按钮）

Status: open
Blocked by: 01

## What to build

从提交 `654fde48^` 的 `src/themes/reacg/build/mobileMenu/` 恢复移动端菜单开关，迁入 `themes/reacg/src/modules/mobileMenu/`：

- `index.js`：原样迁入 `build`（body append `#side-btn-wrap`/`#side-btn`/`#side-btn-burger`）与 `toggle`（点击切换 `side-btn-active`，显示/隐藏 `#sideBar`，`unpass()` 滚动锁定 + `html` scroll-behavior 切换）。导出 `export function install()`。
- 样式**不**放模块内 `index.scss`，而是补进 `themes/reacg/src/style/response.scss`（旧 `mobileMenu/index.scss` 全部在 `@media (max-width:767px)` 内，与 response.scss 语义一致；且当前主题的移动端响应样式都集中在 response.scss）。

**适配改动（相对旧代码）**：
- import 改为当前结构：`unpass` 从 `../../utils/helpers`。
- 保留桌面端也构建按钮、靠 `@media` 显示的旧行为。

## Acceptance criteria

- [ ] `modules/mobileMenu/index.js` 就位，导出 `install()`
- [ ] `response.scss` 含旧 `mobileMenu/index.scss` 的 `#side-btn-wrap`/`#side-btn`/`#side-btn-burger` 样式（含 `.side-btn-active` 汉堡变换动画）
- [ ] 构建成功；产物 `dist/reacg.js` 含 `side-btn` 注入逻辑
- [ ] 产物 inline CSS 含 `@media (max-width: 767px)` 下的 `#side-btn` 样式
