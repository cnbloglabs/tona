# Tona Preact Starter Template

A modern starter template for building Tona themes with Preact and TypeScript.

## Features

- ⚡ **Preact** - Lightweight React alternative
- 🎨 **Tailwind CSS v4** - Utility-first CSS framework
- 🎯 **TypeScript** - Full type safety
- 🚀 **Vite** - Lightning-fast development and builds
- 📦 **Tona Integration** - Built-in support for Tona plugin system
- 🎭 **class-variance-authority** - Manage component variants
- 🔗 **clsx + tailwind-merge** - Smart class name merging
- 🧱 **@base-ui/react** - Unstyled UI components

## Getting Started

### Install Dependencies

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

This starts the Vite dev server.

### Build

```bash
pnpm build
```

## Project Structure

```
src/
├── lib/
│   └── utils.ts            # Utility functions (cn)
├── main.ts                 # Entry point
├── plugins/
│   └── app/                # App plugin
│       ├── index.tsx       # Plugin export
│       └── app.tsx         # App component
└── styles/
    └── globals.css         # Global styles with Tailwind
```

## Styling

This template uses Tailwind CSS v4 with a shadcn-style design system. The CSS variables for theming are defined in `globals.css`:

- Light and dark mode support
- Semantic color tokens (primary, secondary, muted, accent, etc.)
- Custom CSS utilities via `@utility`

### Using the `cn` utility

```typescript
import { cn } from '@/lib/utils'

// Merge class names with conflict resolution
<div class={cn('base-class', condition && 'conditional-class', props.className)}>
```

### Component Variants with CVA

```typescript
import { cva } from 'class-variance-authority'

const buttonVariants = cva('base-styles', {
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground',
      outline: 'border border-input bg-background',
    },
    size: {
      default: 'h-10 px-4',
      sm: 'h-9 px-3',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})
```

## Using Tona Plugins

Tona plugins are functions that extend your theme with new features. Create a plugin by exporting a function:

```typescript
// src/plugins/my-plugin/index.ts
export function myPlugin() {
  const el = document.querySelector('#target')
  if (el) {
    el.textContent = 'Plugin works!'
  }
}
```

Then import and use it in `main.ts`:

```typescript
import { createTheme } from 'tona'
import { myPlugin } from './plugins/my-plugin'

createTheme().use(app).use(myPlugin)
```

## Resources

- [Tona Documentation](https://github.com/guangzan/tona)
- [Preact Documentation](https://preactjs.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Vite Documentation](https://vitejs.dev)
- [class-variance-authority](https://cva.style/docs)

## License

MIT
