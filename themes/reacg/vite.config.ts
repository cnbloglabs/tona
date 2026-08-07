import tona from 'tona-vite'
import { defineConfig } from 'vite-plus'

export default defineConfig({
  plugins: [
    tona({
      themeName: 'reacg',
      inlineCss: true,
      hash: false,
    }),
  ],
})
