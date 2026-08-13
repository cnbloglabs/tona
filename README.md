<p align="center">
  <img src="./assets/tona.png" alt="Tona" width="138" />
</p>

<div align="center">
  <h1>Tona</h1>
  <p>专为博客园（CNBlogs）设计的现代化皮肤开发框架</p>
</div>

<p align="center">
  <a href="https://github.com/guangzan/tona/stargazers"><img src="https://img.shields.io/github/stars/guangzan/tona?style=flat-square" alt="Stars"></a>
  <a href="https://www.npmjs.com/package/tona"><img src="https://img.shields.io/npm/v/tona?style=flat-square" alt="npm version"></a>
  <a href="https://github.com/guangzan/tona/releases"><img src="https://img.shields.io/github/v/tag/guangzan/tona?label=version&style=flat-square" alt="Version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="License"></a>
  <a href="https://github.com/guangzan/tona/commits"><img src="https://img.shields.io/github/commit-activity/m/guangzan/tona?style=flat-square" alt="Commits"></a>
</p>

Tona 为博客园皮肤开发提供了一整套工具链：模块化的核心运行时、基于 Vite 的开发与构建流程、30+ 个开箱即用的插件，以及多套内置主题。通过 `createTheme` 与类型安全的 `defineOptions`，你可以快速创建美观、功能丰富的博客皮肤。

## 特性

- **核心运行时** - `createTheme` 创建主题实例，`defineOptions` 提供类型安全的配置管理，插件系统支持任意组合与扩展
- **Vite 工具链** - `tona-vite` 插件提供开发服务器、热更新、动态脚本注入与共享资源服务，一键产出 IIFE 分发产物
- **插件生态** - 30+ 个开箱即用插件，覆盖暗色模式、代码高亮、目录、打赏、音乐播放器、Live2D 等常见需求
- **脚手架 CLI** - `create-tona` 交互式创建项目，内置 minimal / preact 模板，自动识别包管理器
- **内置主题** - 仓库自带 geek、simple、view、reacg、shadcn 五套主题，既是成品也是最佳实践参考
- **TypeScript 优先** - 全链路 TypeScript，完整的类型定义贯穿核心、插件与配置

## 快速开始

### 在博客园中使用皮肤

在博客园中使用现成皮肤，请查看此[文档](https://www.yuque.com/r/awescnb/books)。

### 开发自己的皮肤

```sh
pnpm create tona
cd my-tona-theme
pnpm install
pnpm dev        # 本地开发，支持热更新
pnpm build      # 构建分发产物
```

> [!TIP]
> `pnpm create tona` 支持 `--template`（minimal / preact）与 `--package-manager` 选项，也可通过 `npm create tona@latest`、`yarn create tona` 调用。

## 项目结构

Tona 采用 pnpm workspace 管理的 monorepo 结构：

| 包                                          | 说明                                                 |
| ------------------------------------------- | ---------------------------------------------------- |
| `tona`（packages/core）                     | 核心运行时：`createTheme`、`defineOptions`、插件系统 |
| `create-tona`                               | 交互式脚手架 CLI，提供 minimal / preact 模板         |
| `tona-vite`                                 | Vite 插件：动态脚本注入、共享资源服务、IIFE 构建输出 |
| `tona-plugins`                              | 插件库，30+ 个开箱即用的皮肤插件                     |
| `tona-options`                              | 主题配置选项定义                                     |
| `tona-hooks`                                | 常用 React hooks 集合                                |
| `tona-ui`                                   | UI 组件库                                            |
| `tona-sonner`                               | 基于 sonner 的 Preact toast 通知组件                 |
| `tona-loader`                               | 主题脚本加载器                                       |
| `tona-utils`                                | 通用工具函数                                         |
| `tona-themes`（packages/data）              | 主题列表数据                                         |
| `tona-stylelint-one-utility-class-per-line` | 强制一行一个 utility class 的 stylelint 插件         |

内置主题位于 `themes/` 目录：

| 主题                                 | 说明                                                            |
| ------------------------------------ | --------------------------------------------------------------- |
| `shadcn`                             | 现代简洁的 shadcn/ui 风格主题，卡片式布局、响应式设计、优雅排版 |
| `geek` / `simple` / `view` / `reacg` | 各具风格的示例主题，可直接使用，也可作为开发参考                |

## 插件生态

`tona-plugins` 提供了 30+ 个插件，按功能分类如下（完整列表见 [packages/plugins](packages/plugins)）：

- **外观**：背景、暗色模式、颜色模式、页脚、文末图、题图
- **代码**：代码高亮、一键复制、行号、语言标识
- **交互**：目录、弹幕、图片预览、点击特效、工具栏
- **社交与变现**：打赏、二维码、签名、评论头像、公告、文章留言
- **娱乐**：Live2D、音乐播放器、表情、图表

## 开发命令

| 命令               | 说明               |
| ------------------ | ------------------ |
| `pnpm dev`         | 开发主题（热更新） |
| `pnpm build:theme` | 构建主题           |
| `pnpm build:pkg`   | 构建所有包         |
| `pnpm test`        | 运行测试           |
| `pnpm lint`        | 代码检查           |
| `pnpm fmt`         | 代码格式化         |
| `pnpm check`       | 综合检查           |
| `pnpm release`     | 发布版本           |

环境要求：Node.js >= 22.18，pnpm >= 10。

## 特别鸣谢

<table>
  <tbody>
    <tr>
      <td align="center"><a href="https://www.cnblogs.com/gshang"><img src="https://avatars.githubusercontent.com/u/40145789?v=4" width="60" alt=""/><br />GShang</a></td>
    </tr>
  </tbody>
</table>

欢迎通过 [Issue](https://github.com/guangzan/tona/issues) 报告问题、提出建议，或提交 Pull Request。
