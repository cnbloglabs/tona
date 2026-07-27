# tona-vite

<p align="center">
  <img src="../../assets/tona.png" alt="Tona" width="100" />
</p>

<p align="center">
  用于 Tona 主题开发的 Vite 插件。
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/tona-vite"><img src="https://img.shields.io/npm/v/tona-vite?style=flat-square" alt="npm version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/npm/l/tona-vite?style=flat-square" alt="license"></a>
  <a href="https://vitejs.dev"><img src="https://img.shields.io/badge/Vite-^5.0.0-646CFF?style=flat-square&logo=vite" alt="Vite"></a>
</p>

[English](./README.md) | **中文**

## 特性

- **动态脚本注入** - 自动检测并注入主题脚本
- **共享资源服务** - 在开发期间提供共享资源
- **IIFE 构建输出** - 为主题分发配置库格式
- **开发服务器支持** - 完整的开发服务器和热重载
- **多资源路径** - 支持 `/public/`、`/templates/`、`/js/`、`/css/`、`/images/`

## 安装

```bash
npm install -D tona-vite
```

```bash
pnpm add -D tona-vite
```

## 使用

```typescript
import tona from 'tona-vite'
import { defineConfig } from 'vite-plus'

export default defineConfig({
  plugins: [tona()],
})
```

### 使用选项

```typescript
import tona from 'tona-vite'
import { defineConfig } from 'vite-plus'

export default defineConfig({
  plugins: [
    tona({
      themeName: 'my-theme',
    }),
  ],
})
```

## 选项

```typescript
interface TonaPluginOptions {
  /**
   * 构建输出文件名的主题名称
   * @default 'theme'
   */
  themeName?: string
  /**
   * 为 true 时产出 Inline CSS Dist（CSS 注入进 IIFE JS）
   * @default false
   */
  inlineCss?: boolean
  /**
   * 为 true 时在 JS 文件名中写入内容哈希
   * @default true
   */
  hash?: boolean
}
```

## 构建配置

该插件自动配置 Vite 用于主题开发。

### 默认 Theme Dist（`inlineCss: false`）

| 设置       | 值                             | 描述                                    |
| ---------- | ------------------------------ | --------------------------------------- |
| 库格式     | IIFE                           | 立即执行函数表达式                      |
| 入口点     | `src/main.ts` 或 `src/main.js` | 自动检测                                |
| 输出文件名 | `{themeName}.[hash].js`        | `hash: false` 时为 `{themeName}.js`     |
| CSS        | `{themeName}.min.css`          | 独立样式表                              |

### Inline CSS Dist（`inlineCss: true`）

| 设置         | 值                             | 描述                                                 |
| ------------ | ------------------------------ | ---------------------------------------------------- |
| 库格式       | IIFE                           | 立即执行函数表达式                                   |
| 入口点       | `src/main.ts` 或 `src/main.js` | 自动检测                                             |
| 输出文件名   | `{themeName}.[hash].js`        | 单 JS 文件；CSS 运行时注入                           |
| 主题 CSS 文件 | 无                             | 样式经 `document.createElement('style')` 嵌入        |

## 开发服务器

在开发期间，该插件从插件的 public 目录提供静态资源：

- `/public/*` - 通用公共资源
- `/templates/*` - HTML 模板
- `/js/*` - JavaScript 文件
- `/css/*` - CSS 文件
- `/images/*` - 图片文件
- `/` 或 `/index.html` - 导航索引页面

## 示例项目结构

```
my-theme/
├── src/
│   ├── main.ts          # 主题入口
│   └── style.css        # 主题样式
├── vite.config.ts       # Vite + Tona 插件配置
└── package.json
```

## vite.config.ts 示例

```typescript
import tona from 'tona-vite'
import { defineConfig } from 'vite-plus'

export default defineConfig({
  plugins: [tona()],
  // 如有需要，可添加额外的 Vite 配置
})
```

## 相关

- [tona](https://github.com/guangzan/tona/tree/main/packages/core) - 核心框架
- [create-tona](https://github.com/guangzan/tona/tree/main/packages/create-tona) - 项目脚手架
