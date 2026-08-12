# Align: plugins 包产物化 —— 统一包入口契约

## Intent

现状：`packages/plugins` 是唯一一个 `exports` 直接指向 `src/` 的包（源码分发，无构建），其余包（core/options/utils/hooks/ui/sonner）均为 TS/TSX 源码 + `vp pack` 产物分发。皮肤（themes/*）通过 `workspace:*` + 包名消费这些包，主题构建（IIFE）时依赖全部内联。

目标：把「皮肤引用包源码」收敛为**统一产物分发契约**——所有包 `exports` 一律指向 `dist/` 产物；plugins 从源码分发改产物分发；插件 CSS 的按需引用从 tona-vite 私有 alias 改为标准 npm `exports` 子路径。

## Decisions settled

- **统一产物分发契约**：所有包 `exports` 指向 `dist/`；plugins 不再是例外。包边界清晰、npm 发布物一致、未来引入编译步骤不受阻。
- **plugins dist 扁平布局**：`dist/` 顶层 = `index.js`（ESM 聚合，形态同 core 的 `dist/index.js`，未 minify 可 tree-shake）+ 每个插件一个目录 `dist/<plugin>/index.css`。**不**保留 `dist/plugins/` 层——`src/plugins/` 是内部实现细节，产物目录直接对应公共 API 路径（`tona-plugins/catalog/index.css` ↔ `dist/catalog/index.css`）。
- **CSS 子路径经 exports 通配导出**：`packages/plugins/package.json` 的 `exports` 增加 `"./*": "./dist/*"`；主题 CSS 引用改写为裸包名 `tona-plugins/<plugin>/index.css`（5 主题全部替换）。
- **移除 `@tona-plugins` alias**：删除 tona-vite 内置的 `resolve.alias['@tona-plugins']` 特殊逻辑；引用解析交由打包器原生 exports 语义。旧引用残留会因映射到不存在的路径而显式报错（fail fast）。
- **dev 工作流统一**：plugins 增加 `build: vp pack` 与 `dev: vp pack --watch`（watch 同时复制 CSS），与其他包零概念差；开发改插件时开 watch 维护 dist。
- **发布物**：`files` 改为 `["dist", "index.d.ts"]`；`types` 保持手写 `index.d.ts`（JS 源码无 JSDoc，vp pack 自动生成会退化，手写声明是类型契约）。
- **测试**：`import('tona-plugins')` 经 exports 自动跟随到 dist；`../src/...` 相对引用（vi.mock 内部模块）保持。

## Deferred

- `create-tona` 模板是否受影响（模板是最小主题，不直接引插件 CSS）——spec 阶段顺带确认，不作为本 effort 阻塞项。
- dist 顶层暴露 `index.js`/`index.d.ts` 子路径（`"./*"` 通配副作用）——无害，暂不收紧。

## Out of scope

- 其他包（core/options/utils/hooks/ui/sonner）入口形态（已是 dist，不动）。
- 插件 CSS 变量契约（ADR-003）与 CSS 内容本身——仅移动产物位置。
- 主题产物契约（ADR-002：无 hash 双文件）与 tona-vite 的 hash/inlineCss/sourcemap 选项。
- 主题 dev 流程（dev-theme.ts）——依赖各包 watch，维持现状。

## Domain pointers

- 术语（新增）：`docs/monorail/CONTEXT.md` —— Package Entry Contract、Plugin CSS Subpath
- ADR（新增）：`docs/monorail/adr/004-package-entry-contract.md`
- 关联：`docs/monorail/plugins-scss-to-css/`（插件样式已从 SCSS 迁为纯 CSS，本 effort 只移动产物位置）；`docs/monorail/adr/003-plugin-css-variables.md`
