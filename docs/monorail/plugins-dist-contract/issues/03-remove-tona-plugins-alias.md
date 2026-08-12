# 03 — 移除 tona-vite 的 @tona-plugins alias，重写 alias.test.ts

- Status: done
- Blocked by: 01, 02

## Comments

Batch 2026-08-12: start — 28a9bd31
done — (config() 不再注入 resolve.alias；alias.test.ts 删 5 注入断言、集成用例改裸包名经 exports 通配解析；tona-vite 13 测试 + 5 主题构建全绿；全仓 grep 无 @tona-plugins 残留)

## What to build

删除 tona-vite 内置的 `@tona-plugins` 私有 alias（ADR-004）：`packages/tona-vite/src/index.ts` 的 `config()` 钩子不再注入 `resolve.alias['@tona-plugins']`（用户 alias 照旧透传），清理相关注释。重写 `packages/tona-vite/test/alias.test.ts`：删除 5 个 alias 注入断言用例；保留并改写集成用例——临时目录 symlink `node_modules/tona-plugins` → `packages/plugins`，主题 css 写 `@import 'tona-plugins/darkMode/index.css'`，`vite build` 后断言产物 css 含 darkMode 样式、js 不含。

## Acceptance criteria

- [ ] `tona-vite` 的 `config()` 不再注入任何 `resolve.alias`（`@tona-plugins` 逻辑与注释清除）
- [ ] `alias.test.ts` 删除 5 个注入断言用例；集成用例改写为裸包名 `tona-plugins/darkMode/index.css` 经 exports 通配解析，`vite build` 产物 css 含 `.dark-to-light` 与 `--mode-bg-dark`、js 不含
- [ ] `pnpm --dir packages/tona-vite test` 全部通过（前置：plugins dist 已构建）
- [ ] 5 主题 `vite build` 全部成功（无 alias 依赖）
- [ ] 全仓 grep 无 `@tona-plugins` 残留
