# Spec: plugins 包产物化 —— 统一包入口契约（plugins-dist-contract）

## Problem Statement

`packages/plugins` 是 monorepo 中唯一 `exports` 直接指向 `src/` 的包（源码分发、无构建脚本），其余包均为 TS/TSX 源码 + `vp pack` 产物分发（`exports` 指 `dist/`）。皮肤通过 `workspace:*` + 包名消费这些包，插件 CSS 的按需引用依赖 tona-vite 内置的 `@tona-plugins` alias（私有引用语法 `@tona-plugins/src/plugins/<x>/index.css`，仅本仓库可解析）。

后果：包入口契约隐式分叉（新包无决策依据）、npm 发布物形态不一致（plugins 发布 `src`，其余发布 `dist`）、plugins 未来引入编译步骤无路可走、CSS 引用语法非标准 npm 机制。

## Solution

将 plugins 从源码分发迁移为产物分发，与其余包统一（ADR-004）：

1. **构建**：plugins 增加 `build: vp pack`（vite.config.ts 加 `pack` 段：entry `./src/index.js`、format `esm`、clean；不启用 dts，类型契约保持手写 `index.d.ts`），产出 `dist/index.js`（ESM 聚合 re-export，未 minify，可二次 tree-shake）。
2. **CSS 复制**：构建流程将 `src/plugins/**/index.css` 原样复制为 `dist/**/index.css`（**去掉 `plugins/` 前缀，dist 扁平布局**）；watch 模式同样复制。
3. **入口契约**：`exports` 改为 `"."` 指 `./dist/index.js` + 通配 `"./*": "./dist/*"`；`files` 改为 `["dist", "index.d.ts"]`。
4. **移除 alias**：删除 tona-vite `config()` 钩子中 `resolve.alias['@tona-plugins']` 注入。
5. **主题引用改写**：5 个主题 `src/style/plugins.css` 的 `@import '@tona-plugins/src/plugins/<x>/index.css'` 改写为 `@import 'tona-plugins/<x>/index.css'`（裸包名，经 exports 通配解析；残留旧引用映射到不存在路径，显式报错）。

## User Stories

1. As a 主题开发者, I want 所有包用一致的 `dist` 入口契约, so that 引用规则单一、不记忆哪个包特殊。
2. As a 主题开发者, I want 插件 CSS 用裸包名子路径引用, so that 引用语法是标准 npm 机制、无仓库私有 alias。
3. As a 新包作者, I want 包入口决策有明确契约可循, so that 新包直接按产物分发落地。
4. As an npm 消费者, I want 安装 tona-plugins 后拿到自包含产物（dist）, so that 不依赖源码目录结构即可使用。
5. As a 维护者, I want 主题构建在引用残留旧路径时显式失败, so that 迁移遗漏立即暴露而非静默解析。

## Implementation Decisions

- **packages/plugins/package.json**：
  - `exports`：`"."` → `{ types: "./index.d.ts", import: "./dist/index.js" }`；新增 `"./*": "./dist/*"`
  - `files`：`["index.d.ts", "src"]` → `["dist", "index.d.ts"]`
  - `main`/`module` → `./dist/index.js`；`types` 保持 `./index.d.ts`
  - scripts 新增 `"build": "vp pack"`、`"dev": "vp pack --watch"`（原 `dev: vp dev` 是 example dev server，迁到独立脚本或保留为 `dev:example`）
- **packages/plugins/vite.config.ts**：`pack` 段 `{ entry: ['./src/index.js'], format: ['esm'], clean: true }`，不启用 `dts`；保留现有 `server` 段（example dev）
- **CSS 复制**：构建后处理（`vp pack` 无 css 入口可打包——css 不经 `src/index.js` 模块图，由主题按需 `@import`）。实现为复制步骤：glob `src/plugins/**/*.css` → 目标 `dist/<相对路径去 plugins/ 前缀>`；`watch` 模式复用同一复制逻辑（可封装为 `packages/plugins/scripts/copy-css.ts` 或 vite 插件，slice 定）
- **packages/tona-vite/src/index.ts**：删除 `resolve.alias['@tona-plugins']` 注入段；`resolve` 不再注入任何 alias（用户 alias 照旧透传）。注释与 `@tona-plugins` 引用一并清理
- **主题改写**：geek（16）/reacg（26）/simple（14）/view（11）共 67 处 `@tona-plugins/src/plugins/` → `tona-plugins/`；`plugins.css` 内 `:root` 覆盖块与顺序不动
- **发布链路**：无改动——publish.yml 已 `pnpm build:pkg`（`-F './packages/**' build`），plugins 加 `build` 脚本后自动纳入

## Testing Decisions

接缝（已确认）：

1. **`packages/tona-vite/test/alias.test.ts`**：删除 5 个 alias 注入断言用例；改写保留的集成用例——临时目录 symlink `node_modules/tona-plugins` → `packages/plugins`，主题 css 写 `@import 'tona-plugins/darkMode/index.css'`，`vite build` 后断言产物 css 含 darkMode 内容（验证 exports 通配端到端解析）。前置：plugins dist 存在
2. **`themes/test/plugins-css.test.ts`**：断言从 `@import '@tona-plugins/src/plugins/` 改为 `@import 'tona-plugins/`（模块 id 断言 + 数量断言保持）；`/node_modules/` 绝对路径断言保持
3. **新增 `packages/plugins/test/dist-contract.test.ts`**：静态断言——`dist/index.js` 存在且为 ESM 聚合；`dist/<plugin>/index.css` 齐全（对照 `src/plugins/` 清单）；`dist/plugins/` 层不存在；package.json `exports` 含 `"./*": "./dist/*"`、`files` 为 `["dist", "index.d.ts"]`
4. **现有 `packages/plugins/test/*`**：零改动（`import('tona-plugins')` 自动跟随 exports；`../src/` vi.mock 保持）

流程约束：本地跑 plugins / tona-vite 测试前先 `pnpm build:pkg`（dist 为前置）；publish.yml 顺序已满足。

## Out of Scope

- 其余包（core/options/utils/hooks/ui/sonner）入口形态——已是 dist，不动
- 插件 CSS 内容与 CSS 变量契约（ADR-003）——仅移动产物位置
- 主题产物契约（ADR-002：无 hash 双文件）与 tona-vite 的 hash/inlineCss/sourcemap 选项
- dev-theme.ts / 主题 dev 流程——依赖各包 watch，维持现状
- `create-tona` 模板引用确认（顺带检查，非阻塞）

## Further Notes

- `"./*"` 通配顺带暴露 `tona-plugins/index.js` / `index.d.ts` 子路径——内容与 `.` 主入口相同，无害，暂不收紧（ADR-004 已记）
- dist 扁平布局：`dist/<plugin>/index.css` ↔ `tona-plugins/<plugin>/index.css` 一一对应，产物目录即公共 API 形态；`src/plugins/` 前缀是内部实现细节
- 主题构建（`pnpm build:theme` / publish.yml）本身就是端到端验证：引用改写后构建通过即证明 exports 解析链路成立
