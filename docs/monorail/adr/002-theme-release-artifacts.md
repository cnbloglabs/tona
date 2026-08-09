# ADR-002: GitHub Release 主题产物契约 —— 无 hash 双文件 `xx.min.js` + `xx.min.css`

- Status: Accepted
- Date: 2026-08-10
- Scope: `.github/workflows/publish.yml` + `packages/tona-vite` + 5 个主题的 `vite.config.ts`

## Context

GitHub Release 的发布流程（`publish.yml`）目前只构建并打包 geek / reacg / shadcn 三个主题，simple / view 已迁移进 monorepo 且能构建，却未进入 release。产物形态也不一致：

- geek / reacg / simple / view：`inlineCss: true, hash: false` → 单文件 `{themeName}.js`（CSS 内联，无独立 CSS）
- shadcn：默认配置 → `shadcn.[hash].js` + `shadcn.min.css`（带内容 hash，每次构建文件名变化）

后果：主题不全；文件名不稳定（带 hash）且命名不对称（`shadcn.min.css` vs `geek.js`），博客用户拿到 zip 后不知道文件名该怎么填进博客设置。

此决策推翻 `docs/monorail/theme-inline-css-dist/align.md` 中「geek 用 `inlineCss: true` 单文件」的分发契约。

## Decision

发布产物统一为**无 hash 双文件契约**：

- 5 个主题（geek / reacg / shadcn / simple / view）全部构建并发布到 GitHub Release，每主题一个 zip，不合并
- 每个 zip 内含稳定命名的 `{themeName}.min.js` + `{themeName}.min.css` 双文件：
  - `hash` 默认改为 `false` → JS 文件名稳定（无 hash）
  - `inlineCss` 默认 `false` → CSS 独立输出（命名天然为 `{themeName}.min.css`）
- zip 扁平打包（等价 `zip -j`），仅含两个构建文件，无 README / 无子目录
- release notes 保持 `changelogithub` 自动生成，不追加资产说明（稳定文件名自解释）
- `tona-vite` 层改动：`hash` 选项默认值 `true` → `false`，默认输出 `{themeName}.min.js`（原 `hash: false` 输出 `{themeName}.js` 命名废弃；显式 `hash: true` 仍输出带 hash）；新增 `sourcemap?: boolean` 选项（默认 `false`），显式应用 `build.sourcemap`，release 产物不产 `.map`（显式 `true` 供调试）；同步更新 `theme-dist.test.ts` 断言（README 不更新）
- 主题侧最小配置：5 主题 `vite.config.ts` 仅保留 `themeName`（移除 `inlineCss: true` / `hash: false` 显式项；shadcn 已是最小形态，无需改动）

## Consequences

- 博客用户下载任一主题 zip，得到固定的 `geek.min.js` / `geek.min.css` 等文件名，CSS 贴页面定制、JS 贴页脚，安装步骤稳定可预期
- `tona-vite` 的 `hash` 默认值变化（`true` → `false`，默认产物从带 hash 变为无 hash，含 create-tona 默认模板生成的皮肤）对使用者是破坏性变更，需随版本发布说明
- geek / reacg / simple / view 的构建产物从单文件回归双文件，博客安装从「只贴一段 JS」变为「CSS + JS 两段」
- CI 构建从 3 个主题扩展到 5 个主题
- create-tona 模板同步最小化：template-preact 移除自定义 `build.lib` / `define` / `server`，收敛为最小配置，产物随 tona 默认（`theme.min.js` + `theme.min.css`）；template-minimal 已是最小配置，无需改动

## Alternatives considered

- **保持内联单文件、仅统一无 hash**：用户明确要求 `xx.min.js + xx.min.css` 双文件命名 → 否决
- **zip 内带 README / 子目录 / 合并单 zip**：用户明确要求每主题一个 zip、zip 内仅构建文件、说明放 release notes，且最终连 release notes 也不加 → 否决
- **在打包脚本里把 `xx.js` 重命名为 `xx.min.js`**：命名不对称问题扩散到打包层，且 dev 产物与 release 产物不一致 → 否决，改为 `tona-vite` 源头统一
- **保留 `hash` 默认 `true`、各主题显式 `hash: false`**：每个主题仍要写 `hash: false`，皮肤侧配置不最小化 → 否决，改为插件默认 `false`，主题配置收敛为仅 `themeName`
