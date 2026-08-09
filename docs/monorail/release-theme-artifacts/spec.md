# Spec: Release Theme Artifacts

## Problem Statement

GitHub Release 发布的主题产物不完整且形态不一致：simple / view 已迁移进 monorepo 却未发布；geek / reacg / simple / view 为 `inlineCss` 单文件（`{themeName}.js`），shadcn 为带 hash 的 JS + 独立 CSS（`shadcn.[hash].js` + `shadcn.min.css`）。zip 内文件名带 hash、不稳定，且 5 主题命名不对称，博客用户拿到 zip 后不知道文件名该怎么填进博客设置。

## Solution

统一 Release Theme Artifacts 契约（ADR-002）：5 个主题（geek / reacg / shadcn / simple / view）全部构建并发布，每主题一个 zip，内含无 hash 双文件 `{themeName}.min.js` + `{themeName}.min.css`（CSS 独立输出、文件名稳定）。

落点三处：

1. `packages/tona-vite`：`hash` 默认值改为 `false`；默认输出 `{themeName}.min.js`（原 `hash: false` 输出 `{themeName}.js` 命名废弃），显式 `hash: true` 仍输出带 hash；新增 `sourcemap` 选项默认 `false`，不产 `.map`
2. 5 个主题的 `vite.config.ts`：最小化，仅保留 `themeName`（移除 `inlineCss: true` / `hash: false` 显式项）
3. `.github/workflows/publish.yml`：构建、打包、上传从 3 个主题扩展到 5 个

## User Stories

1. As a 博客用户, I want 下载任一主题 zip 得到稳定的 `geek.min.js` / `geek.min.css` 这类固定文件名, so that 我能直接把文件名填进博客设置、升级时不用对照 hash 猜
2. As a 博客用户, I want 在 GitHub Release 找到全部 5 个主题的 zip, so that simple / view 用户不再缺产物
3. As a 主题作者, I want 5 主题产物形态完全一致（无 hash、JS + CSS 双文件）, so that 安装说明只差主题名、维护成本最低

## Implementation Decisions

- **`tona-vite` 命名与默认**：`hash` 选项默认值 `true` → `false`；`hash: false`（含默认）JS `fileName` 输出 `{themeName}.min.js`，与 CSS 固定命名 `{themeName}.min.css` 对称。lib 构建本就输出压缩产物，`min` 名副其实。显式 `hash: true` 仍输出 `{themeName}.[hash].js`。新增 `sourcemap?: boolean` 选项（默认 `false`），显式应用 `build.sourcemap`，release 产物不产 `.map`；显式 `sourcemap: true` 供调试。`inlineCss` 能力保留
- **主题配置**：geek / reacg / simple / view 移除 `inlineCss: true` 与 `hash: false`，收敛为 `tona({ themeName: 'geek' })` 等最小形态；shadcn 无需改动
- **CI `publish.yml`**：
  - Build themes 步骤逐个执行 `pnpm --dir themes/<name> build`（5 个主题，各主题 `package.json` 已有 `build` 脚本）
  - Package 步骤显式列出两文件打包：`zip -j <name>.zip themes/<name>/dist/<name>.min.js themes/<name>/dist/<name>.min.css`，不用 `dist/*` 通配，避免未来误收 `.map` 等文件
  - Upload 步骤上传 5 个 zip（`--clobber` 保留）
- **release notes**：保持 `changelogithub` 自动生成，不加资产说明（文件名稳定后自解释）

## Testing Decisions

- `packages/tona-vite/test/theme-dist.test.ts`：默认用例断言改为 `{themeName}.min.js` + `{themeName}.min.css`（无 hash）；`inlineCss` 用例断言改为无 hash 单文件 `{themeName}.min.js`；新增显式 `hash: true` 用例保住带 hash 输出；`hash: false` 用例断言 `{themeName}.min.js`；新增 sourcemap 断言（默认无 `.map`、`sourcemap: true` 有 `.map`）
- `deps-entries.test.ts` / `cold-start.test.ts` 不涉及输出文件名，不受影响
- CI 集成验证即构建 + 打包 + 上传全链路；打包命令显式列出文件已保证 zip 内容确定，不新增额外校验步骤

## Out of Scope

- release notes 资产清单 / 安装说明
- zip 内 README / 子目录 / 合并单 zip
- release 产物附带 sourcemap（`sourcemap` 默认 `false`，显式 `true` 仅调试用，不属 release 产物）
- create-tona 脚手架默认产物形态
- 压缩级别、IIFE 格式等构建细节

## Further Notes

- 本 effort 推翻 `docs/monorail/theme-inline-css-dist/align.md` 中 geek `inlineCss: true` 的决策，见 `docs/monorail/adr/002-theme-release-artifacts.md`；`tona-vite` 的 `inlineCss` 选项与 Inline CSS Dist 能力保留（术语仍在 `docs/monorail/CONTEXT.md`）
- `hash` 默认改为 `false` 是 `tona-vite` 使用者的破坏性变更：默认产物从带 hash 变为无 hash（含 create-tona 默认模板生成的皮肤，配置无需改、产物形态变化），随版本发布说明
- **create-tona 模板同步**：`template-preact` 移除自定义产物配置（`build.lib` 的 `fileName: 'theme.js'` / `assetFileNames: 'theme.[ext]'`、`define`、`server`），收敛为最小配置（仅 `resolve.alias` + `dedupe` + 插件），产物随 tona 默认输出 `theme.min.js` + `theme.min.css`；README 删除 8081 端口描述（见 issue 04）。`template-minimal` 已是最小配置，无需改动；create-tona 源码无产物命名引用
