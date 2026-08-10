# 02 — 接回四个代码插件

Status: done
Blocked by: None

## Comments

Batch 2026-08-07: start — af2f8270
done — ef954122, e633e424 (build green: dist/geek.js contains codeHighlight/codeCopy/codeLang option registrations, codeLinenumbers JS body (awes-linenumber addClass), use chain has 4 enable:true uses after clickEffects; inline CSS has copy-btns/awes-lang/awes-linenumber)

## What to build

把 geek 迁移前使用的 4 个代码插件接回新系统：

- `themes/geek/src/main.js`：
  - import 补 `codeHighlight`、`codeLinenumbers`、`codeCopy`、`codeLang`（从 `tona-plugins`）
  - `.use()` 链补 `.use(codeHighlight, { enable: true })`、`.use(codeLinenumbers, { enable: true })`、`.use(codeCopy, { enable: true })`、`.use(codeLang, { enable: true })`
- `themes/geek/src/style/plugins.scss`：
  - `@use` 补 `codeHighlight/index.scss`、`codeLinenumbers/index.scss`、`codeCopy/index.scss`、`codeLang/index.scss`（`as *` 风格，无 `with` 配置）

对应关系：旧 `highlight`→`codeHighlight`、`linenumbers`→`codeLinenumbers`、`copyCode`→`codeCopy`、`codeLanguage`→`codeLang`。

## Acceptance criteria

- [ ] `main.js` import 4 个代码插件且在 `.use()` 链上均 `{ enable: true }`
- [ ] `plugins.scss` `@use` 4 个插件样式
- [ ] `pnpm --filter tona-theme-geek build` 构建成功
- [ ] 产物 `dist/geek.js` 含 `codeHighlight`、`codeLinenumbers`、`codeCopy`、`codeLang` 相关字符串
- [ ] 产物 inline CSS 含 `copy-btns`（codeCopy）、`awes-lang`（codeLang）、行号相关样式
