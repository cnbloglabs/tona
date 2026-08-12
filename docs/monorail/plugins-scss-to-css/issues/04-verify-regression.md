# 04 — 验证与回归（构建 + 基线对比 + 单测）

Status: done
Blocked by: 03

## Comments

Build 2026-08-12: start — 94ade5f5
Build 2026-08-12: done — 全部验收通过：

- **构建**：geek/reacg/simple/view 各 `vp build` 成功（vite-plus，tona-vite dist 重建后含 @tona-plugins alias）
- **JS 基线**：geek dist JS 与 `/tmp/geek.min.js.before` 逐字节一致（`cmp` 验证，无逻辑回归）
- **CSS 规则级 spot-check**：`.message-tags a:nth-child(6)` 存在、`:root` 含 `--post-message-tags-background-1..6`、`.dark-to-light` 用 `var(--mode-bg-dark)`、`.message-tags a` 边框色引用 `var(--post-message-tags-background-N)`、主题覆盖值（`--post-message-color-tags:var(--geek-color-10)`、`--player-body-background:var(--geek-color-6)`）全部命中
- **单测**：`pnpm test` **294 passed / 294**（22 文件全绿）
- **残留 scss**：`packages/plugins` 0 个 `*.scss`；`themes/*/src/style/` 无 plugins.scss（4 个 plugins.css 就位）

附带修复（按确认）：`packages/options/test/index.test.ts` 音乐播放器默认配置断言过期——默认 `audio[0]` 在 commit b9fd04a5 有意清空（name/artist 为空串），测试仍断言旧值 `404 not found`/`REOL`，非迁移引入、干净树同样失败；已更新断言匹配当前默认，整套测试由此全绿。

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
