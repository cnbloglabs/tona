# Align: geek 迁移丢失功能恢复

## Intent

geek 主题在 monorepo 迁移（提交 654fde48）时，丢失了 1 个模块的注入逻辑和 4 个代码插件。用户要全部修复，恢复主题原有的观感与功能。与 `reacg-restore-migration` 同根（同一迁移事故），但 geek 的丢失范围更小、更集中。

丢失清单（对齐时确认，全修）：
1. **左下角 GitHub 按钮注入逻辑** `buildLeftsideBottomBtns` —— 样式 `.follow-me`/`.developer`/`.leftside-bottom` 残留在 `modules/left-sidebar/index.scss`，但生成按钮的 JS 丢失，左下角空置
2. **4 个代码插件未接回** —— `highlight`/`linenumbers`/`copyCode`/`codeLanguage` 对应新系统 `codeHighlight`/`codeLinenumbers`/`codeCopy`/`codeLang`，`.use()` 链与 plugins.scss `@use` 均缺失

## Decisions settled

- **gitHub 按钮作为独立模块函数补回**：在 `modules/left-sidebar/index.js` 内新增 `buildLeftsideBottomBtns` 函数（恢复旧逻辑），`install()` 中调用。旧函数依赖 `getGithubOptions`（`tona-options` 已提供）、`avatar`（`constants/cnblog` 已有）、`getBlogName`（`utils/cnblog` 已有）。
- **4 个代码插件接回**：`.use(codeHighlight)` / `.use(codeLinenumbers)` / `.use(codeCopy)` / `.use(codeLang)` 加进 `main.js`；对应 scss 加进 `plugins.scss` 的 `@use` 列表。
- **与 reacg 修复不冲突**：reacg 接回 codeHighlight/codeCopy/codeLinenumbers（3 个），geek 接回 4 个（多 codeLang）。两者改动文件不同（`themes/reacg/` vs `themes/geek/`），可独立并行。
- **范围不扩**：geek 的其他模块（cards/left-sidebar/right-sidebar/searchbar/profile/footer/mobileMenu→searchbar）已核对完整，不在此 effort 范围内。

## Deferred

None

## Out of scope

- `removeClearel`（`.clear` 用 CSS `display:none` 等价替代，不算丢失）
- reacg 主题的恢复（属 `reacg-restore-migration` effort）
- 其他已删除的迁移前主题（bilibili/csdn/element/silence/simple/view/demo——迁移时未迁入 monorepo，疑似有意移除，非本 effort 范围）

## Domain pointers

- `docs/monorail/CONTEXT.md` —— 新增术语「Geek Migration Loss」
- 无 ADR 变更
