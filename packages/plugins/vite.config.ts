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
    // ADR-004：产物分发。不启用 dts——JS 源码无 JSDoc，类型契约保持手写 index.d.ts。
    // platform: 'browser'——纯 DOM 包；node 平台默认会把 esm 产物命名为 .mjs
    platform: 'browser',
    entry: ['./src/index.js'],
    format: ['esm'],
    clean: true,
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
