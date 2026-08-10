# 03 — profile 模块（侧边栏头像与信息）

Status: done
Blocked by: 01

## What to build

从提交 `654fde48^` 的 `src/themes/reacg/build/profile/` 恢复侧边栏个人信息，迁入 `themes/reacg/src/modules/profile/`：

- `index.js`：原样迁入 `buildAvatar`（`#blog-news` prepend `<img class='custom-avatar'>`）、`hideFollowButton`（`isOwner()` 时隐藏 `#p_b_follow`）、`buildInfo`（`#profile_block` 前插入 `custom-info`：昵称/园龄/粉丝/关注链接）。导出 `export function install()`。
- `index.scss`：原样迁入 `#blog-news` grid 布局、`.custom-avatar`、`.custom-info`、`#profile_block`、`#p_b_follow`、`move`/`pulse` keyframes。
- `style/response.scss`：补回旧 `index.m.scss`（654fde48^）的 `.custom-avatar` 移动端样式——spec 声称 response.scss 仍残留该选择器，实际迁移时整棵新树已丢失（AC 修正，见 Comments）。

**适配改动（相对旧代码）**：
- import 改为当前结构：`avatar` 从 `../../constants/cnblog`（已有导出，读取 `getThemeOptions().avatar`）；`followersDetailsUrl`/`followingDetailsUrl`/`index`/`userDetails` 从 `../../constants/links`（已存在）；`isOwner`/`getBlogName`/`getBlogAge`/`getFollowers`/`getFollowing` 从 `../../utils/cnblog`；`poll` 从 `../../utils/helpers`。
- 注意当前 `getBlogName()` 已是函数名（旧代码是 `getBlogname`），调用处用当前名称。

## Acceptance criteria

- [ ] `modules/profile/` 两文件就位，`index.js` 导出 `install()`
- [ ] `response.scss` 含旧 `index.m.scss` 的 `.custom-avatar` 移动端样式（`#sidebar_news #blog-news` 内：@768px column flex + avatar 100%×140px，@767px avatar height 200px）
- [ ] 构建成功；产物 `dist/reacg.js` 含 `custom-avatar`、`custom-info`、`p_b_follow` 注入逻辑
- [ ] 产物 inline CSS 含 `#blog-news` grid 与 `.custom-avatar` 尺寸样式

## Comments

- 2026-08-07 build: AC-2 修正——spec 声称 response.scss 残留 `.custom-avatar` 选择器，实际 `654fde48` 迁移时整棵 `themes/reacg/` 树均已丢失该选择器（grep 全树零命中；旧样式在 `src/themes/reacg/style/index.m.scss` @768px/@767px 两个 media block）。经用户确认：本次一并补回移动端样式（不再视为 out of scope）。
- 2026-08-07 build: 全部验收点通过（TDD red→green）。red: dist 无 custom-avatar/custom-info/p_b_follow；green: `pnpm --filter tona-theme-reacg build` 成功（101.18 kB），dist/reacg.js 含 custom-avatar(×4)/custom-info(×4)/p_b_follow(×3)，inline CSS 含 `grid-template:'avatar info'/'follow follow'`、`.custom-avatar` 80×80、@768px `width:100%;height:140px`、@767px `height:200px` 移动端样式。response.scss 补回旧 index.m.scss 两个 media block。全量测试 211/212 通过（1 个失败为 main 上既有 packages/options 音乐播放器配置测试，与本次无关）；vue-tsc 未安装，typecheck 不可用。commits: 761b0301（实现），claim 见 453a8bec。
