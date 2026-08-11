# 02 — 通用按钮工厂：回顶/推荐/关注/收藏/评论

Status: done
Blocked by: 01

## Comments

Batch 2026-08-11: start — f384c1bd（未提交模式，工作区叠加于 issue 01 与 geek-sidebar-toggle 挂起成果之上）
done — buttons/ 5 工厂（backTop/like/follow/favorite/comment + scroll.js 共享滚动行为 + index.js barrel）；src/index.js 追加 export；tools/index.js 移除已迁移的 scrollToTop/scrollToComment；index.d.ts 补 5 工厂类型；test/buttons.test.ts 14 用例（默认字段/options 覆盖/callback 闭包不可覆盖/行为桩验证）；plugins 测试 37/37；全量 258/259（唯一失败 pre-existing musicPlayer）
Review 2026-08-12 fixes：example/index.js 迁移为工厂列表（6 工厂，dev playground 按钮恢复可用行为）

## What to build

在 `packages/plugins/src/plugins/tools/buttons/` 下为每个通用按钮建立独立模块并导出工厂函数（返回按钮对象），主入口（`packages/plugins/src/index.js`）`export *` 导出：

- `createBackTopButton(options?)`：滚动到顶部（默认 `scrollContainer`）；`page: 'all'`、`iconType: 'html'`、icon `🚀`、tooltip「回顶」
- `createLikeButton(options?)`：toast「推荐成功」+ `likePost()`；`page: 'post'`、icon `👍`、tooltip「推荐」
- `createFollowButton(options?)`：toast「关注成功」+ `window.follow()`；`page: 'post'`、icon `💗`、tooltip「关注」
- `createFavoriteButton(options?)`：`window.AddToWz()`；`page: 'post'`、icon `📌`、tooltip「收藏」
- `createCommentButton(options?)`：滚动到评论输入框（默认 `scrollContainer`）；`page: 'post'`、icon `💬`、tooltip「评论」

每个工厂 `options` 合并覆盖默认字段（icon/iconType/tooltip/className/page/enable 等），`callback` 由工厂闭包绑定不接受覆盖。行为逻辑从 tools 插件现有默认项迁移（`scrollToTop`/`scrollToComment`/`toast`+`likePost` 等）。tools 插件内的原默认项与辅助函数移除后，本模块成为唯一来源。

## Acceptance criteria

- [ ] 5 个工厂从 `tona-plugins` 主入口可 import（`import { createBackTopButton } from 'tona-plugins'`）
- [ ] 每个工厂返回按钮对象：默认字段正确、`options` 覆盖生效、`callback` 存在且调用对应行为、`page`/`enable` 语义与 spec 一致
- [ ] `packages/plugins/test/` 新增按钮工厂单测（seam A）：默认值 / options 覆盖 / callback 存在，全部通过
- [ ] tools 插件内不再引用已迁移的默认按钮行为（scrollToTop/scrollToComment 等移出或仅由按钮模块持有）
- [ ] 全量 `pnpm test` 无新增失败
