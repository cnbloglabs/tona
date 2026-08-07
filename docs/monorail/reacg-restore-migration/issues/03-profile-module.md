# 03 — profile 模块（侧边栏头像与信息）

Status: open
Blocked by: 01

## What to build

从提交 `654fde48^` 的 `src/themes/reacg/build/profile/` 恢复侧边栏个人信息，迁入 `themes/reacg/src/modules/profile/`：

- `index.js`：原样迁入 `buildAvatar`（`#blog-news` prepend `<img class='custom-avatar'>`）、`hideFollowButton`（`isOwner()` 时隐藏 `#p_b_follow`）、`buildInfo`（`#profile_block` 前插入 `custom-info`：昵称/园龄/粉丝/关注链接）。导出 `export function install()`。
- `index.scss`：原样迁入 `#blog-news` grid 布局、`.custom-avatar`、`.custom-info`、`#profile_block`、`#p_b_follow`、`move`/`pulse` keyframes。

**适配改动（相对旧代码）**：
- import 改为当前结构：`avatar` 从 `../../constants/cnblog`（已有导出，读取 `getThemeOptions().avatar`）；`followersDetailsUrl`/`followingDetailsUrl`/`index`/`userDetails` 从 `../../constants/links`（已存在）；`isOwner`/`getBlogName`/`getBlogAge`/`getFollowers`/`getFollowing` 从 `../../utils/cnblog`；`poll` 从 `../../utils/helpers`。
- 注意当前 `getBlogName()` 已是函数名（旧代码是 `getBlogname`），调用处用当前名称。

## Acceptance criteria

- [ ] `modules/profile/` 两文件就位，`index.js` 导出 `install()`
- [ ] `response.scss` 中残留的 `.custom-avatar` 移动端样式（在 `#sidebar_news #blog-news` 内）现在有注入来源
- [ ] 构建成功；产物 `dist/reacg.js` 含 `custom-avatar`、`custom-info`、`p_b_follow` 注入逻辑
- [ ] 产物 inline CSS 含 `#blog-news` grid 与 `.custom-avatar` 尺寸样式
