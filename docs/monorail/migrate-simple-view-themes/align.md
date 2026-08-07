# Align: 补迁 simple / view 主题

## Intent

monorepo 迁移（提交 654fde48）时未迁入的 9 个旧主题中，用户指定只补迁 `simple` 和 `view` 两个。这两个主题功能完整、复杂度中等（simple 15 个插件 + 4 个自研 build 模块；view 12 个插件 + 6 个自研 build 函数）。目标：忠实迁移，恢复皮肤原有观感，接入 monorepo 的 workspace 构建体系。

不迁：bilibili/bilibiliv1/csdn/demo/element/elementv1/silence（用户已明确排除）。

## Decisions settled

- **迁移范围**：仅 `simple`、`view` 两个主题。其余 7 个（bilibili/bilibiliv1/csdn/demo/element/elementv1/silence）不迁，维持现状。
- **结构**：对齐 geek/reacg 的 `themes/<name>/` + `src/` 结构。每个自研 build 逻辑一个模块（`src/modules/<name>/{index.js,index.scss}` + `export function install()`），主入口 `main.js` 用 `import.meta.glob` 自动注册 + `.use()` 链接插件。
- **simple 的 catalog 保留自研**：simple 的 `build/catalog` 是自研目录逻辑（空标题跳过、sticky 定位、活跃标题高亮、折叠切换），**不**改用新 `catalog` 插件。忠实还原原皮肤行为。目录生成数据用 `getCatalogOptions` 替代旧 `catalogConfig`（enable 判断），逻辑本体原样迁入。
- **window.opts**：simple/view 旧代码不依赖 `window.opts`（view 的 opts 引用均在注释中），迁移**不**写 `window.opts`（区别于 reacg）。
- **vite.config.ts**：沿用 geek/reacg 一致的 `tona-vite` 配置（`themeName` + `inlineCss: true` + `hash: false`）。
- **package.json**：沿用 geek 的配置（`tona`/`tona-options`/`tona-plugins` workspace deps + `tona-vite` devDep），`pnpm-workspace.yaml` 已含 `themes/*`，自动纳入。
- **插件映射**：全部旧插件都有新系统对应——
  - simple：themeColor→colorMode、footer→footer、highlight→codeHighlight、copyCode→codeCopy、linenumbers→codeLinenumbers、imagebox→imagePreview、donation→donation、emoji→emoji、player→musicPlayer、postMessage→postMessage、postSignature→license、notice→notice、signature→signature、commentsAvatars→commentsAvatars、toolMenu→tools
  - view：footer→footer、emoji→emoji、imagebox→imagePreview、copyCode→codeCopy、codeLanguage→codeLang、linenumbers→codeLinenumbers、postSignature→license、commentsAvatars→commentsAvatars、highlight→codeHighlight、mode→darkMode、themeColor→colorMode、catalog→catalog
- **自研 build 逻辑**（不映射插件，独立迁移为模块）：
  - simple：header（昵称/头像/移动端菜单/自定义链接/随笔页标题/首页滚动锁定）、side（侧边栏折叠切换/日历标题）、catalog（自研目录）、scroll（滚动隐藏 header/目录上移）
  - view：headerNickname/buildAva/headerBtn/buildSearchbar/buildGithub/buildMessageCount

## Deferred

None

## Out of scope

- 其余 7 个旧主题（bilibili/bilibiliv1/csdn/demo/element/elementv1/silence）
- reacg/geek 的恢复（属各自 effort）
- simple/view 的任何功能重构或现代化（忠实迁移，不做改进）
- 迁移中发现的旧 bug 修复（除非阻塞构建）

## Domain pointers

- `docs/monorail/CONTEXT.md` —— 新增术语「Legacy Theme Migration」
- 无 ADR 变更（有旧实现可对照，忠实迁移非新设计）
