import tona from 'tona-vite'
import { defineConfig } from 'vite-plus'

export default defineConfig({
  plugins: [
    tona({
      themeName: 'geek',
      inlineCss: true,
      hash: false,
    }),
  ],
})
