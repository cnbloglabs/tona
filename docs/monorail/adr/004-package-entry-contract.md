# ADR-004: 包入口契约 —— 统一产物分发，plugins 从源码分发迁移 + CSS 子路径经 exports 通配导出

- Status: Accepted
- Date: 2026-08-12
- Scope: `packages/plugins` + `packages/tona-vite` + 5 个主题的 CSS 引用 + `themes/test/plugins-css.test.ts`

## Context

monorepo 内皮肤通过 `workspace:*` + 包名消费 packages，主题构建（IIFE）时依赖全部内联。除 `tona-plugins` 外所有包均 TS/TSX 源码 + `vp pack` 产物分发（`exports` 指 `dist/`）；`tona-plugins` 是唯一例外——纯 JS + CSS，`exports` 直接指 `./src/index.js`，`files` 发布 `src`，无 build 脚本（源码分发）。

源码分发带来形态分叉：包入口契约隐式（新包不知道选哪种）、npm 发布物不一致、未来 plugins 引入编译步骤无路可走。插件 CSS 的按需引用依赖 tona-vite 内置的 `@tona-plugins` alias（私有引用语法，仅本仓库可解析，非标准 npm 机制）。

## Decision

统一**产物分发契约**：

- 所有包 `exports` 一律指向 `dist/` 产物；`tona-plugins` 从源码分发迁移为产物分发。
- `packages/plugins` 构建：`vp pack` 产出 `dist/index.js`（ESM 聚合 re-export，未 minify，可二次 tree-shake）；CSS 从 `src/plugins/**/index.css` 复制为 `dist/**/index.css`（**去掉 `plugins/` 前缀，dist 扁平布局**——`src/plugins/` 是内部实现细节，产物目录直接对应公共 API 路径）。
- `exports` 增加通配子路径 `"./*": "./dist/*"`；插件 CSS 引用为裸包名 `tona-plugins/<plugin>/index.css`（如 `@import 'tona-plugins/catalog/index.css'`）。
- 删除 tona-vite 内置 `resolve.alias['@tona-plugins']`；引用解析交由打包器原生 exports 语义（vite/rolldown 支持通配）。残留旧引用映射到不存在的路径，显式报错（fail fast）。
- `files` 改为 `["dist", "index.d.ts"]`；`types` 保持手写 `index.d.ts`（JS 源码无 JSDoc，自动生成会退化）。
- dev 工作流：plugins 增加 `build: vp pack` + `dev: vp pack --watch`（watch 含 CSS 复制），与其他包一致。

## Consequences

- 包入口契约显式统一：纯 JS 包也走产物分发，无源码分发包。
- 主题 CSS 引用从 `@tona-plugins/plugins/<x>/index.css` 改为 `tona-plugins/<x>/index.css`，5 个主题全部替换；tona-vite 少一段私有 alias 逻辑。
- plugins 的 npm 发布物从 `src/` 变为 `dist/`（+ 手写 `index.d.ts`）；第三方消费方拿到标准产物包。
- 日常改插件源码需 watch 构建（`vp pack --watch`），不再实时直读源码。
- `"./*"` 通配同时暴露 `dist/index.js` / `index.d.ts` 子路径——内容与 `.` 主入口相同，无害，暂不收紧。

## Alternatives considered

- **保留 plugins 源码分发（现状）**：形态分叉、契约隐式、npm 发布物不一致 → 否决（本 ADR 的动机）。
- **全部包源码分发**：TS/TSX 包必须编译，不可行 → 否决。
- **CSS 合并单文件 `dist/index.css`**：破坏按需引用，主题产物背全部插件样式 → 否决。
- **仅 JS 产物化、CSS 继续走 src alias**：半产物化，契约不彻底 → 否决。
- **dist 镜像 src（保留 `dist/plugins/` 层）+ alias 仅改指向**：`dist/plugins` 与包名语义重复，产物目录未对齐公共 API 路径 → 否决，改扁平布局 + exports 通配。
- **exports 精确列出每个插件子路径**：30+ 项维护繁琐 → 否决，用 `"./*"` 通配。
