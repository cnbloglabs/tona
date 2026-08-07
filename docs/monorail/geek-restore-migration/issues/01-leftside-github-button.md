# 01 — 补回左下角 GitHub 关注按钮

Status: claimed
Blocked by: None

## Comments

Batch 2026-08-07: start — af2f8270

## What to build

在 `themes/geek/src/modules/left-sidebar/index.js` 补回 `buildLeftsideBottomBtns` 函数，恢复左下角「Fork me on GitHub」按钮：

- 从提交 `654fde48^` 的 `src/themes/geek/build/leftSide/index.js` 恢复逻辑：读取 `getGithubOptions()`（`enable`/`url`），`enable` 时生成 `.leftside-bottom` > `.follow-me`（`fa-github` 图标 + "Fork me on GitHub" 文案）+ `.developer`（头像 `avatar` + 昵称 `getBlogName()`）注入 `#left-side`。
- 新增 import：`getGithubOptions`（`tona-options`）、`getBlogName`（`../../utils/cnblog`）、`avatar`（`../../constants/cnblog`）。
- 在 `install()` 中于 `removeHeaderToLeftSidebar(links)` 之后调用。
- 样式无需改动（`.follow-me`/`.developer`/`.leftside-bottom` 已在 `index.scss` 存在）。

## Acceptance criteria

- [ ] `buildLeftsideBottomBtns` 函数就位，`install()` 末尾调用
- [ ] `enable` 为 false 时不注入（`getGithubOptions().enable` 短路）
- [ ] import `getGithubOptions` / `getBlogName` / `avatar` 正确（`avatar` 从 `constants/cnblog`，`getBlogName` 从 `utils/cnblog`）
- [ ] `pnpm --filter tona-theme-geek build` 构建成功
- [ ] 产物 `dist/geek.js` 含 `leftside-bottom`、`follow-me`、`Fork me on GitHub` 字符串
- [ ] 产物 inline CSS 含 `.follow-me` 样式（已有，确认未被 tree-shake）
