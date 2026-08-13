import { copyCssPlugin } from './scripts/copy-css'
import tona from 'tona-vite'
import { defineConfig } from 'vite-plus'

export default defineConfig({
  server: {
    open: true,
    port: 3000,
  },
  plugins: [tona()],
  pack: {
    // ADR-004：产物分发。启用 dts——TS 源码产出真实声明（dist/index.d.ts），
    // 取代原手写 index.d.ts（全 any 契约）。
    // platform: 'browser'——纯 DOM 包；node 平台默认会把 esm 产物命名为 .mjs
    platform: 'browser',
    entry: ['./src/index.ts'],
    format: ['esm'],
    clean: true,
    dts: true,
    plugins: [copyCssPlugin()],
  },
  build: {
    // cssCodeSplit: true,
    // emptyOutDir: true,
    // lib: {
    //   formats: ['es'],
    //   entry: './example/index.js',
    //   name: 'geek',
    //   fileName: 'geek',
    // },
    // rollupOptions: {
    //   input: {
    //     main: resolve(__dirname, 'index.html'),
    //     nested: resolve(__dirname, 'project.html'),
    //   },
    // },
  },
})
