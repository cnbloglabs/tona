# Align: Release Theme Artifacts

## Intent

GitHub Release 发布的主题产物目前不完整（缺 simple/view）、形态不一致（hash / 内联混杂）、文件名不稳定（shadcn 带 hash），博客用户拿到 zip 不知道文件名该怎么填。目标：5 个主题全部发布，产物统一为稳定命名的双文件，开箱即用。

## Decisions settled

- 5 个主题（geek / reacg / shadcn / simple / view）全部构建并发布到 GitHub Release，每主题一个 zip，不合并
- 产物契约统一为无 hash 双文件：`{themeName}.min.js` + `{themeName}.min.css`（`hash` / `inlineCss` 均走插件默认 `false`）
- 推翻 `theme-inline-css-dist` 中 geek 的 `inlineCss: true` 单文件决策（见 ADR-002）
- zip 扁平打包（`zip -j`），仅含两个构建文件，无 README、无子目录
- release notes 保持 `changelogithub` 自动生成，不加资产说明（稳定文件名自解释）
- `tona-vite`：`hash` 默认值 `true` → `false`，默认输出 `{themeName}.min.js`（原 `{themeName}.js` 命名废弃；显式 `hash: true` 仍输出带 hash）；新增 `sourcemap` 选项默认 `false`（`build.sourcemap` 显式应用，release 产物不产 `.map`，显式 `true` 供调试）；同步更新 `theme-dist.test.ts` 断言（README 不更新）
- 主题侧最小配置：5 主题 `vite.config.ts` 仅保留 `themeName`（移除 `inlineCss: true` / `hash: false` 显式项；shadcn 无需改动）
- create-tona 模板同步：template-preact 移除自定义产物配置（`build.lib` / `assetFileNames` / `define` / `server`），收敛为最小配置（仅 `resolve.alias` + `dedupe` + 插件），README 删除 8081 端口描述；template-minimal 已是最小配置，无需改动

## Deferred

- release 产物附带 sourcemap（默认 `false` 已定，显式 `true` 仅调试场景）
- create-tona 模板产物形态（已核查无需改动，见上）
- release notes 资产清单 / 安装说明
- 其余主题是否恢复 `inlineCss`

## Out of scope

- release notes 改造
- zip 内 README / 子目录 / 合并单 zip
- 构建压缩级别、IIFE 格式等产物细节

## Domain pointers

- `docs/monorail/CONTEXT.md` — Theme Dist（更新）、Release Theme Artifacts（新增）
- `docs/monorail/adr/002-theme-release-artifacts.md` — 本 effort 的 ADR
- `docs/monorail/theme-inline-css-dist/align.md` — 被推翻决策的来源（geek `inlineCss: true`）
