# tona-vite

<p align="center">
  <img src="../../assets/tona.png" alt="Tona" width="100" />
</p>

<p align="center">
  Vite plugin for Tona theme development.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/tona-vite"><img src="https://img.shields.io/npm/v/tona-vite?style=flat-square" alt="npm version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/npm/l/tona-vite?style=flat-square" alt="license"></a>
  <a href="https://vitejs.dev"><img src="https://img.shields.io/badge/Vite-^5.0.0-646CFF?style=flat-square&logo=vite" alt="Vite"></a>
</p>

**English** | [中文](./README.zh-CN.md)

## Features

- **Dynamic Script Injection** - Automatically detects and injects theme scripts
- **Shared Assets Serving** - Serves shared assets during development
- **IIFE Build Output** - Configures library format for theme distribution
- **Dev Server Support** - Full development server with hot reload
- **Multiple Asset Paths** - Supports `/public/`, `/templates/`, `/js/`, `/css/`, `/images/`

## Installation

```bash
npm install -D tona-vite
```

```bash
pnpm add -D tona-vite
```

## Usage

```typescript
import tona from 'tona-vite'
import { defineConfig } from 'vite-plus'

export default defineConfig({
  plugins: [tona()],
})
```

### With Options

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

## Options

```typescript
interface TonaPluginOptions {
  /**
   * Theme name for build output filename
   * @default 'theme'
   */
  themeName?: string
  /**
   * When true, emit Inline CSS Dist (CSS injected into the IIFE JS).
   * @default false
   */
  inlineCss?: boolean
  /**
   * When true, include a content hash in the JS filename.
   * @default true
   */
  hash?: boolean
}
```

## Build Configuration

The plugin automatically configures Vite for theme development.

### Default Theme Dist (`inlineCss: false`)

| Setting            | Value                          | Description                             |
| ------------------ | ------------------------------ | --------------------------------------- |
| Library Format     | IIFE                           | Immediately Invoked Function Expression |
| Entry Point        | `src/main.ts` or `src/main.js` | Auto-detected                           |
| Output Filename    | `{themeName}.[hash].js`        | Set `hash: false` for `{themeName}.js`  |
| CSS                | `{themeName}.min.css`          | Independent stylesheet                  |

### Inline CSS Dist (`inlineCss: true`)

| Setting            | Value                          | Description                                      |
| ------------------ | ------------------------------ | ------------------------------------------------ |
| Library Format     | IIFE                           | Immediately Invoked Function Expression          |
| Entry Point        | `src/main.ts` or `src/main.js` | Auto-detected                                    |
| Output Filename    | `{themeName}.[hash].js`        | Single JS file; CSS injected at runtime          |
| Theme CSS file     | None                           | Styles embedded via `document.createElement('style')` |

## Development Server

During development, the plugin serves static assets from the plugin's public directory:

- `/public/*` - General public assets
- `/templates/*` - HTML templates
- `/js/*` - JavaScript files
- `/css/*` - CSS files
- `/images/*` - Image files
- `/` or `/index.html` - Navigation index page

## Example Project Structure

```
my-theme/
├── src/
│   ├── main.ts          # Theme entry
│   └── style.css        # Theme styles
├── vite.config.ts       # Vite + Tona plugin config
└── package.json
```

## vite.config.ts Example

```typescript
import tona from 'tona-vite'
import { defineConfig } from 'vite-plus'

export default defineConfig({
  plugins: [tona()],
  // Additional Vite config if needed
})
```

## Related

- [tona](https://github.com/guangzan/tona/tree/main/packages/core) - Core framework
- [create-tona](https://github.com/guangzan/tona/tree/main/packages/create-tona) - Project scaffolding
