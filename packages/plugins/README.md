# tona-plugins

<p align="center">
  <img src="../../assets/tona.png" alt="Tona" width="100" />
</p>

<p align="center">
  Official plugin collection for Tona themes.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/tona-plugins"><img src="https://img.shields.io/npm/v/tona-plugins?style=flat-square" alt="npm version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/npm/l/tona-plugins?style=flat-square" alt="license"></a>
</p>

**English** | [中文](./README.zh-CN.md)

## Features

- **30+ Plugins** - Comprehensive plugin collection
- **Easy Integration** - Simple `theme.use()` API
- **Configurable** - Each plugin has customizable options
- **Official Support** - Maintained by the Tona team

## Installation

```bash
npm install tona-plugins
```

```bash
pnpm add tona-plugins
```

```bash
yarn add tona-plugins
```

## Usage

```typescript
import { createTheme } from 'tona'
import { background, darkMode, codeHighlight } from 'tona-plugins'

const theme = createTheme()

theme.use(background)
theme.use(darkMode)
theme.use(codeHighlight)
```

## Available Plugins

### UI Enhancements

| Plugin         | Description                   |
| -------------- | ----------------------------- |
| `background`   | Custom background image/color |
| `darkMode`     | Dark mode toggle              |
| `colorMode`    | Color theme switching         |
| `clickEffects` | Click animation effects       |
| `live2d`       | Live2D model widget           |

### Content

| Plugin             | Description              |
| ------------------ | ------------------------ |
| `codeHighlight`    | Syntax highlighting      |
| `codeCopy`         | Copy code button         |
| `codeLang`         | Show code language       |
| `codeLinenumbers`  | Line numbers for code    |
| `codeTrafficLight` | Mac-style window buttons |
| `imagePreview`     | Image lightbox           |
| `notation`         | Text annotations         |

### Navigation

| Plugin    | Description            |
| --------- | ---------------------- |
| `catalog` | Table of contents      |
| `tools`   | Quick navigation tools |
| `footer`  | Custom footer          |
| `qrcode`  | QR code generator      |

### Social

| Plugin            | Description          |
| ----------------- | -------------------- |
| `commentsAvatars` | Comment user avatars |
| `emoji`           | Emoji support        |
| `signature`       | Post signature       |

### Media

| Plugin        | Description               |
| ------------- | ------------------------- |
| `musicPlayer` | Background music player   |
| `barrage`     | Danmu/barrage comments    |
| `charts`      | Data visualization charts |

### Utilities

| Plugin     | Description          |
| ---------- | -------------------- |
| `notice`   | Announcement notices |
| `toast`    | Toast notifications  |
| `lock`     | Content protection   |
| `donation` | Donation button      |
| `license`  | License display      |
| `webTag`   | Website tags         |

## darkMode Plugin

Dark mode toggle with three modes: **dark / light / follow system**:

```typescript
import { darkMode } from 'tona-plugins'

theme.use(darkMode, {
  enable: true,
  darkDefault: false, // default dark when no local preference
  followSystem: false, // default to system light/dark when no local preference
})
```

The `.mode-change` button in the toolbar cycles through the three modes (dark → light → follow system), and the selection is persisted to `localStorage.modeType`. In follow-system mode, the page listens to the OS `prefers-color-scheme` changes and switches in real time.

Button icons and tooltips are customizable:

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
    dark: 'Dark',
    light: 'Light',
    system: 'Follow system',
  },
})
```

## Plugin Configuration

Each plugin accepts configuration options:

```typescript
import { createTheme } from 'tona'
import { background } from 'tona-plugins'

const theme = createTheme()

theme.use(
  background,
  {
    // Theme-level defaults
    enable: true,
    value: '#f5f5f5',
  },
  {
    // Plugin-specific options
    opacitySelector: '#main',
  },
)
```

## Creating Custom Plugins

```typescript
import { defineOptions } from 'tona'

export function myPlugin(theme, devOptions, pluginOptions) {
  const getOptions = defineOptions('myPlugin', {
    enable: false,
    color: '#000',
  })

  const options = getOptions(devOptions)

  if (!options.enable) return

  // Plugin logic here
  document.body.style.color = options.color
}
```

## Related

- [tona](https://github.com/guangzan/tona/tree/main/packages/core) - Core framework
- [tona-options](https://github.com/guangzan/tona/tree/main/packages/options) - Pre-defined options
- [create-tona](https://github.com/guangzan/tona/tree/main/packages/create-tona) - Create themes
