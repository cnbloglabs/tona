# 02 — 5 主题 vite.config.ts 最小化：仅保留 `themeName`

- Status: done
- Blocked by: 01

## Comments

Batch 2026-08-10: start — f9ef9afa
done — d39d33ce (geek/reacg/simple/view 收敛为仅 themeName，保留 simple/view 的 scss silenceDeprecations 块；shadcn 零改动；5 主题构建验证 dist 恰为 xx.min.js + xx.min.css)

## What to build

5 个主题的 `vite.config.ts` 最小化配置，符合无 hash 双文件契约（ADR-002）。`hash` 走插件新默认 `false`、`inlineCss` 走默认 `false`，主题侧无需再写这两个选项：

- geek / reacg / simple / view：移除 `inlineCss: true` 与 `hash: false`，配置收敛为 `tona({ themeName: 'geek' })` 等
- shadcn：已是 `tona({ themeName: 'shadcn' })` 最小形态，无需改动（`hash` 默认 `false` 后自动无 hash）

## Acceptance criteria

- [ ] 5 个主题逐个 `pnpm --dir themes/<name> build` 构建成功
- [ ] 每个主题 `dist/` 恰含 `{themeName}.min.js` + `{themeName}.min.css` 两文件（无 hash、CSS 独立）
- [ ] geek / reacg / simple / view 不再是内联单文件（dist 内 CSS 独立存在，JS 内不再注入 `style` 标签）
- [ ] shadcn 文件名从 `shadcn.[hash].js` 变为 `shadcn.min.js`
- [ ] 5 个主题的 `vite.config.ts` 中无 `hash` / `inlineCss` 显式配置（仅 `themeName`）
