# tona-plugins

<p align="center">
  <img src="../../assets/tona.png" alt="Tona" width="100" />
</p>

<p align="center">
  Tona 主题的官方插件集合。
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/tona-plugins"><img src="https://img.shields.io/npm/v/tona-plugins?style=flat-square" alt="npm version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/npm/l/tona-plugins?style=flat-square" alt="license"></a>
</p>

[English](./README.md) | **中文**

## 特性

- **30+ 插件** - 全面的插件集合
- **易于集成** - 简单的 `theme.use()` API
- **可配置** - 每个插件都有可自定义的选项
- **官方支持** - 由 Tona 团队维护

## 安装

```bash
npm install tona-plugins
```

```bash
pnpm add tona-plugins
```

```bash
yarn add tona-plugins
```

## 使用

```typescript
import { createTheme } from 'tona'
import { background, darkMode, codeHighlight } from 'tona-plugins'

const theme = createTheme()

theme.use(background)
theme.use(darkMode)
theme.use(codeHighlight)
```

## 可用插件

### UI 增强

| 插件           | 描述                |
| -------------- | ------------------- |
| `background`   | 自定义背景图片/颜色 |
| `darkMode`     | 暗黑模式切换        |
| `colorMode`    | 颜色主题切换        |
| `clickEffects` | 点击动画效果        |
| `live2d`       | Live2D 模型挂件     |

### 内容

| 插件               | 描述             |
| ------------------ | ---------------- |
| `codeHighlight`    | 语法高亮         |
| `codeCopy`         | 复制代码按钮     |
| `codeLang`         | 显示代码语言     |
| `codeLinenumbers`  | 代码行号         |
| `codeTrafficLight` | Mac 风格窗口按钮 |
| `imagePreview`     | 图片灯箱         |
| `notation`         | 文本注释         |

### 导航

| 插件      | 描述         |
| --------- | ------------ |
| `catalog` | 目录         |
| `tools`   | 快速导航工具 |
| `footer`  | 自定义页脚   |
| `qrcode`  | 二维码生成器 |

### 社交

| 插件              | 描述         |
| ----------------- | ------------ |
| `commentsAvatars` | 评论用户头像 |
| `emoji`           | Emoji 支持   |
| `signature`       | 文章签名     |

### 媒体

| 插件          | 描述           |
| ------------- | -------------- |
| `musicPlayer` | 背景音乐播放器 |
| `barrage`     | 弹幕           |
| `charts`      | 数据可视化图表 |

### 工具

| 插件       | 描述       |
| ---------- | ---------- |
| `notice`   | 公告通知   |
| `toast`    | Toast 通知 |
| `lock`     | 内容保护   |
| `donation` | 捐赠按钮   |
| `license`  | 许可证显示 |
| `webTag`   | 网站标签   |

## darkMode 插件

暗黑模式切换，支持**深色 / 浅色 / 跟随系统**三种模式：

```typescript
import { darkMode } from 'tona-plugins'

theme.use(darkMode, {
  enable: true,
  darkDefault: false, // 无本地记录时默认深色
  followSystem: false, // 无本地记录时默认跟随系统深色/浅色
})
```

工具栏的 `.mode-change` 按钮会在三种模式间循环切换（深色 → 浅色 → 跟随系统），选择会持久化到 `localStorage.modeType`。跟随系统模式下，页面会监听操作系统 `prefers-color-scheme` 的变化并实时切换。

按钮图标与提示文字支持自定义：

```typescript
theme.use(darkMode, {
  enable: true,
  followSystem: true,
  iconType: 'className', // 'className' | 'html'
  icons: {
    dark: 'fa-moon',
    light: 'fa-sun',
    system: 'fa-adjust',
  },
  tooltips: {
    dark: '深色',
    light: '浅色',
    system: '跟随系统',
  },
})
```

## 插件配置

每个插件都接受配置选项：

```typescript
import { createTheme } from 'tona'
import { background } from 'tona-plugins'

const theme = createTheme()

theme.use(
  background,
  {
    // 主题级默认值
    enable: true,
    value: '#f5f5f5',
  },
  {
    // 插件特定选项
    opacitySelector: '#main',
  },
)
```

## 创建自定义插件

```typescript
import { defineOptions } from 'tona'

export function myPlugin(theme, devOptions, pluginOptions) {
  const getOptions = defineOptions('myPlugin', {
    enable: false,
    color: '#000',
  })

  const options = getOptions(devOptions)

  if (!options.enable) return

  // 插件逻辑
  document.body.style.color = options.color
}
```

## 相关

- [tona](https://github.com/guangzan/tona/tree/main/packages/core) - 核心框架
- [tona-options](https://github.com/guangzan/tona/tree/main/packages/options) - 预定义选项
- [create-tona](https://github.com/guangzan/tona/tree/main/packages/create-tona) - 创建主题
