# 05 — reacg / simple / view 主题迁移到显式按钮列表

Status: done
Blocked by: 02, 03

## Comments

Batch 2026-08-11: start — f384c1bd（未提交模式，工作区叠加于 issue 01 与 geek-sidebar-toggle 挂起成果之上）
done — reacg/simple 迁移为 5 工厂（回顶/推荐/关注/收藏/评论，保持默认 html icon 与 enable 语义；reacg 保留 .use(darkMode) 插件、无深色按钮，simple 无 darkMode）；view 迁移为 6 工厂（options 覆盖 className icons：fa-rocket/fa-adjust/fa-thumbs-up/fa-heart/fa-star/fa-comment-dots，数组顺序 = 原 reverse 后视觉顺序），移除 .use(darkMode)（按钮自包含避免双触发）；3 主题构建全绿；产物字符串核对 PASS（reacg/simple 深色按钮工厂 🌜 摇除，simple 无任何 darkMode 残留，view 含全部 6 icons + darkMode 插件委托入口摇除）；按钮数量对齐 5/5/6；全量 270/271（唯一失败 pre-existing musicPlayer）
Review 2026-08-12 fixes：view 的 darkMode 按钮改默认三态图标（iconType:'className'，深色 fa-moon/浅色 fa-sun/跟随系统 fa-adjust，恢复 per-mode 图标切换）；example/index.js 迁移为 6 工厂（含 createDarkModeButton 默认三态，移除 .use(darkMode) 防双触发，修复 dev playground 按钮 inert）；产物 10/10 字符串 PASS（view 含 fa-moon/fa-sun/fa-adjust）
Review 2026-08-12 fix（view 顺序回归）：view 迁移时误将数组翻转（原配置 comment-dots…rocket 为视觉顺序）。已恢复原顺序（comment→favorite→follow→like→darkMode→backTop，即 comment-dots 顶部、fa-rocket 靠 toggle），与重构前视觉一致。reacg/simple 数组顺序核对正确（回顶顶、评论靠 toggle），无回归；产物字符串 PASS（view 10/10，reacg/simple 5/5）

## What to build

三个主题（reacg/simple/view）的 `main.js` 从「依赖 tools 默认按钮集（含按 index 深合并）」迁移为全显式按钮工厂列表（按需 import、数组顺序 = 视觉顺序）：

- **reacg**（原 `.use(tools, { enable: true })` 依赖默认 6 项，默认 mode-change `enable:false` 不渲染）：显式引入启用按钮（回顶/推荐/关注/收藏/评论 等，按现状 enable 语义）
- **simple**（原零配置依赖默认 6 项，同上）：显式引入启用按钮列表
- **view**（原 6 项 icon 覆盖默认 + `fa-adjust` 深色项 + `.use(darkMode)`）：迁移为对应工厂 + options 覆盖 icon（如 `createBackTopButton({ icon: 'fa-rocket' })`）；深色按钮用 `createDarkModeButton({ icon: 'fa-adjust' })`（保留 `.use(darkMode)` 或由按钮自包含，与 03 决策一致）
- 各主题仅 import 实际使用的按钮工厂，未用按钮逻辑不进产物（tree-shaking）

## Acceptance criteria

- [ ] `pnpm --filter tona-theme-{reacg,simple,view} build` 全部成功
- [ ] 各主题产物含其按钮的 icon/tooltip 字符串（如 view 的 `fa-adjust`、回顶 tooltip 等）
- [ ] **tree-shaking**：各主题产物不含未引入按钮的行为逻辑
- [ ] reacg/simple/view 工具栏按钮数量与迁移前一致（复现页或产物核对；view 的深色按钮 `fa-adjust` 可点击切换）
- [ ] 全量 `pnpm test` 无新增失败
