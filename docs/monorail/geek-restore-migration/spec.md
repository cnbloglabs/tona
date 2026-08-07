# Spec: geek 迁移丢失功能恢复

## Problem Statement

geek 主题在 monorepo 迁移（提交 `654fde48`）时丢失了两类功能：

1. **左下角 GitHub 按钮注入逻辑**：旧 `build/leftSide/index.js` 的 `buildLeftsideBottomBtns` 生成「Fork me on GitHub」按钮（GitHub 链接 + 头像 + 昵称），注入 `#left-side`。当前 `modules/left-sidebar/index.js` 迁移了 `buildLeftSidebarContainer`/`buildLogo`/`buildCustomLinks`/`removeHeaderToLeftSidebar`，唯独缺 `buildLeftsideBottomBtns`。而 `.follow-me`/`.developer`/`.leftside-bottom` 样式仍残留在 `modules/left-sidebar/index.scss`——样式有、注入没了，左下角空置。
2. **4 个代码插件未接回**：旧 `.use()` 链上的 `highlight`/`linenumbers`/`copyCode`/`codeLanguage` 对应新系统的 `codeHighlight`/`codeLinenumbers`/`codeCopy`/`codeLang`，当前 `main.js` 全缺，`plugins.scss` 也未 `@use` 它们的样式（只有 `codeTrafficLight`）。`icons.scss`/`markdown.scss` 里 `copy-btns`/`hljs` 样式残留。

症状：geek 左下角无 GitHub 关注按钮；代码块无语法高亮/行号/复制按钮/Markdown 语言标签。

## Solution

### 1. 补回左下角 GitHub 按钮

在 `themes/geek/src/modules/left-sidebar/index.js` 新增 `buildLeftsideBottomBtns()`，从提交 `654fde48^` 的 `build/leftSide/index.js` 恢复逻辑，`install()` 中调用：

```js
import { getGithubOptions } from 'tona-options'
import { getBlogName } from '../../utils/cnblog'
import { avatar } from '../../constants/cnblog'

function buildLeftsideBottomBtns() {
  const { enable, url } = getGithubOptions()
  if (!enable) return
  const userName = getBlogName()
  const el = `
    <div class="leftside-bottom">
      <a href="${url}" class="follow-me" target="_blank">
        <span class="follow-text"><i class="fas fa-github"></i><span>Fork me on GitHub</span></span>
        <span class="developer">
          <img src="${avatar}">
          <span>${userName}</span>
        </span>
      </a>
    </div>`
  $('#left-side').append(el)
}
```

样式已存在，无需改 scss。

### 2. 接回 4 个代码插件

- `themes/geek/src/main.js`：import 补 `codeHighlight`、`codeLinenumbers`、`codeCopy`、`codeLang`；`.use()` 链补 4 个 `{ enable: true }`。
- `themes/geek/src/style/plugins.scss`：`@use` 补 `codeHighlight/index.scss`、`codeLinenumbers/index.scss`、`codeCopy/index.scss`、`codeLang/index.scss`。

## User Stories

1. As a geek 主题用户，I want 左下角有「Fork me on GitHub」按钮（GitHub 链接 + 头像 + 昵称），so that 恢复 GitHub 关注入口与皮肤原有观感。
2. As a geek 主题用户，I want 代码块有语法高亮，so that 恢复代码阅读体验。
3. As a geek 主题用户，I want 代码块有复制按钮，so that 恢复一键复制代码功能。
4. As a geek 主题用户，I want 代码块有行号，so that 恢复行号显示。
5. As a geek 主题用户，I want Markdown 代码块显示语言标签，so that 恢复代码语言标识。

## Implementation Decisions

- **GitHub 按钮模块函数补回**：不新建模块，在现有 `modules/left-sidebar/index.js` 内加 `buildLeftsideBottomBtns` 并在 `install()` 末尾调用（置于 `removeHeaderToLeftSidebar` 之后，保持 `#left-side` 注入顺序：container→logo→links→nav→bottom）。
- **插件接入**：`main.js` 4 个 `.use()` 均 `{ enable: true }`（与 reacg 的 enable 行为一致）。`plugins.scss` 的 `@use` 无 `with` 配置，`as *` 风格。
- **依赖确认**：`getGithubOptions`/`getCodeHighlightOptions`/`getCodeLinenumbersOptions`/`getCodeCopyOptions`/`getCodeLangOptions` 均已在 `tona-options` 导出；`codeHighlight`/`codeLinenumbers`/`codeCopy`/`codeLang` 均已在 `tona-plugins` 导出。`avatar` 从 `constants/cnblog` 取（`getThemeOptions().avatar`）。`getBlogName` 在 `utils/cnblog` 已有。
- **与 reacg 并行**：改动文件与 `reacg-restore-migration` 完全隔离（`themes/geek/` vs `themes/reacg/`），可并行构建验证。

## Testing Decisions

- **构建验证**：`pnpm --filter tona-theme-geek build`，断言产物 `dist/geek.js`：
  - 含 `leftside-bottom`、`follow-me`、`Fork me on GitHub`、`getGithubOptions` 相关字符串（证明 GitHub 按钮注入逻辑进入产物）
  - 含 `codeHighlight`/`codeLinenumbers`/`codeCopy`/`codeLang` 相关字符串
  - inline CSS 含 `copy-btns`、`awes-lang`、`.follow-me` 样式
- **不做**：DOM 集成测试（同 reacg 决策——恢复旧代码，逻辑已被旧版本验证）。

## Out of Scope

- `removeClearel`（CSS 等价替代）
- reacg 主题恢复（`reacg-restore-migration` effort）
- 迁移时未迁入的旧主题（bilibili/csdn/element/silence/simple/view/demo）

## Further Notes

- 迁移源提交：`654fde48^`（`src/themes/geek/build/leftSide/index.js`）。
- 对齐文件：`docs/monorail/geek-restore-migration/align.md`。
