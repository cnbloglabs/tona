# 04 — 验证与回归（构建 + 基线对比 + 单测）

Status: open
Blocked by: 03

## What to build

对迁移结果做完整验证：4 个主题构建、基线产物对比、单测回归。

基线已留存：`/tmp/geek.min.css.before`、`/tmp/geek.min.js.before`（迁移前 geek
主题构建产物）。

## Acceptance criteria

- [ ] geek/reacg/simple/view 各执行 `vp build` 全部成功
- [ ] geek 构建产物 JS 与 `/tmp/geek.min.js.before` 一致（无逻辑回归）
- [ ] geek 构建产物 CSS 规则级 spot-check 通过：
  - `.post-message a:nth-child(6)` 规则存在
  - `:root` 含 `--post-message-tags-background-1` 等默认值
  - `.dark-to-light` 使用 `var(--mode-bg-dark)`（或对应变量名）而非硬编码色值
  - `.message-tags a` 边框色引用 `var(--post-message-tags-background-N)`
- [ ] `pnpm test` 全部通过（覆盖 buttons/darkMode/tools 逻辑）
- [ ] `packages/plugins` 与 `themes/*/src/style/` 无残留 `*.scss` 插件文件
