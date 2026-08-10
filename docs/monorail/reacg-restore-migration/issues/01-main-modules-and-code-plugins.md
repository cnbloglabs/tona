# 01 — main.js 接入模块注册与代码插件

Status: done
Blocked by: None

## What to build

把 reacg 主入口从「手动调用旧 build()」迁移到 geek 同款的自动模块注册，并接回三个代码相关插件：

- `themes/reacg/src/main.js` 加入：
  ```js
  Object.values(import.meta.glob('./modules/**/*.js', { eager: true })).forEach(
    (i) => {
      i.install()
    },
  )
  ```
  放在 `import './style/index.scss'` 之后、`createTheme()` 之前（对齐 geek）。
- import 列表补 `codeHighlight`、`codeCopy`、`codeLinenumbers`。
- `.use()` 链补 `.use(codeHighlight, { enable: true })`、`.use(codeCopy, { enable: true })`、`.use(codeLinenumbers, { enable: true })`。
- `plugins.scss` 的 `@use` 列表补 `codeHighlight/index.scss`、`codeCopy/index.scss`、`codeLinenumbers/index.scss`（无 with 配置，`as *` 风格）。

本 ticket 不创建任何 `modules/` 目录——glob 对不存在目录为空数组，不会报错。

## Acceptance criteria

- [ ] `main.js` 含 `import.meta.glob('./modules/**/*.js', { eager: true })` 注册块，位于 style import 之后
- [ ] `main.js` import 了 `codeHighlight` / `codeCopy` / `codeLinenumbers` 且在 `.use()` 链上均 `{ enable: true }`
- [ ] `plugins.scss` 含三个代码插件的 `@use`
- [ ] `pnpm --filter tona-theme-reacg build` 构建成功
- [ ] 产物 `dist/reacg.js` 含 `codeHighlight` 相关字符串（codeHighlight 会在 post 页注入 highlight 主题样式）

## Comments

- 2026-08-07 build: 全部验收点通过（TDD red→green）。red: dist 无 copy-btns/awes-linenumber/buildMarkdownHighlight；green: `pnpm --filter tona-theme-reacg build` 成功，dist/reacg.js 含 `--hl-base`(×2, codeHighlight themes)、`copy-btns`(×2)、`awes-linenumber`(×2)。glob 注册块位于 style import 之后 (main.js:29-35)，无 modules/ 目录（空 glob 不报错）。commits: a571126f（实现，claim 见 00634ffe）。全量测试 211/212 通过，1 个失败为 main 上既有问题（packages/options 音乐播放器默认配置测试，与本次改动无关）；vue-tsc 未安装，typecheck 不可用。
