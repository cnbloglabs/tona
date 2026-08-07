import tona from 'tona-vite'
import { defineConfig } from 'vite-plus'

export default defineConfig({
  plugins: [
    tona({
      themeName: 'simple',
      inlineCss: true,
      hash: false,
    }),
  ],
})
