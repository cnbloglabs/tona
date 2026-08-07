# 01 — main.js 接入模块注册与代码插件

Status: claimed
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
