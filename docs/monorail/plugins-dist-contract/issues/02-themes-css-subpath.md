# 02 — 5 主题插件 CSS 引用改写为裸包名子路径

- Status: claimed
- Blocked by: 01

## Comments

Batch 2026-08-12: start — 28a9bd31

## What to build

将 5 个主题（geek/reacg/simple/view）`src/style/plugins.css` 中的插件 CSS 引用从私有 alias 语法改写为标准裸包名子路径：`@import '@tona-plugins/src/plugins/<x>/index.css'` → `@import 'tona-plugins/<x>/index.css'`（共 67 处：geek 16 / reacg 26 / simple 14 / view 11）。`:root` 覆盖块与引用顺序不动。同步更新 `themes/test/plugins-css.test.ts` 的模块 id 断言。

## Acceptance criteria

- [ ] 4 个主题（geek/reacg/simple/view）`plugins.css` 全部引用改写为 `tona-plugins/<x>/index.css`，无 `@tona-plugins` 残留
- [ ] `@import` 数量与顺序不变（geek 16 / reacg 26 / simple 14 / view 11），`:root` 覆盖块内容不变
- [ ] `themes/test/plugins-css.test.ts` 断言更新为裸包名模块 id（`@import 'tona-plugins/`），`/node_modules/` 绝对路径断言保持，测试通过
- [ ] 任一主题 `pnpm --dir themes/<t> build` 成功（exports 通配解析 css 的端到端验证），产物含插件样式
- [ ] 全仓 grep 无 `@tona-plugins/src/plugins/` 残留（含 create-tona）
