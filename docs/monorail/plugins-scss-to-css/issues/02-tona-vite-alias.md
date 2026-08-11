# 02 — tona-vite 注入 @tona-plugins alias

Status: claimed
Blocked by: None

## Comments

Batch 2026-08-12: start — be935e14

## What to build

在 `tona-vite` 插件的 `config()` hook 中新增 `resolve.alias` 注入：
`@tona-plugins` → `path.resolve(config.root ?? process.cwd(), 'node_modules/tona-plugins')`
（workspace symlink 指向 `packages/plugins`）。与既有注入（build.lib、css
preprocessorOptions、optimizeDeps）并列，保留 `css.preprocessorOptions.scss.charset`
配置不变。

背景（已实证）：vite 的 postcss-import 对 css `@import '/node_modules/...'` 按文件系统
绝对路径解析（ENOENT），对裸模块 id（`@tona-plugins/...`）经 resolveId 命中 alias
解析到真实文件。下游主题 `plugins.css`（issue 03）将依赖此 alias。

## Acceptance criteria

- [ ] `config()` hook 注入 `resolve.alias['@tona-plugins']`，解析基准为
      `config.root ?? process.cwd()`，与既有 `baseDir` 逻辑一致
- [ ] `css.preprocessorOptions.scss.charset` 等既有配置不受影响
- [ ] 任选一个主题，临时加 `@import '@tona-plugins/src/plugins/darkMode/index.css';`
      构建能解析到真实路径（issue 01 完成后应成功内联；01 未完成时 ENOENT 但
      报错路径为 `<root>/node_modules/tona-plugins/...`，即证明 alias 命中）
- [ ] 构建产物 JS 无变化（alias 仅影响 css 解析，不影响 JS 打包）
