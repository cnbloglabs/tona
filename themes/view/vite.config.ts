import tona from 'tona-vite'
import { defineConfig } from 'vite-plus'

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        // 静默 @import 弃用告警：主题样式仍依赖 @import 全局变量共享，
        // 且部分模块使用 vite 才能解析的绝对路径，无法用 sass-migrator 自动迁移。
        silenceDeprecations: ['import'],
      },
    },
  },
  plugins: [
    tona({
      themeName: 'view',
      inlineCss: true,
      hash: false,
    }),
  ],
})
