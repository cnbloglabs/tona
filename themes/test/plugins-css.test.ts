import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vite-plus/test'

/**
 * 主题下游迁移（issue 03）结构断言：
 * - 4 个使用插件的主题（geek/reacg/simple/view）src/style/plugins.scss → plugins.css，
 *   原 plugins.scss 已删除
 * - 每个 plugins.css 顶部为插件 css @import 列表（裸包名模块 id，不用
 *   /node_modules/ 绝对路径）
 * - :root 覆盖块含原 with() 配置的全部 key（值不变，含 var(--xxx) 引用）
 * - 主题 index.scss 引用已改为 @import './plugins.css'
 * - plugins.css 无 sass 语法残留（@use / $var / with ( / 全角分号）
 */

const themes = ['geek', 'reacg', 'simple', 'view']

function styleDir(theme: string) {
  return path.resolve(__dirname, `../${theme}/src/style`)
}

/** 每主题原 with() 配置的预期 CSS 变量（key → 值；tagsBackground list 展开为 1..N） */
const expectedOverrides: Record<string, Record<string, string>> = {
  geek: {
    '--post-message-categories-background': '#f13a3a',
    '--post-message-tags-background-1': '#22a6b3',
    '--post-message-tags-background-2': '#0097e6',
    '--post-message-tags-background-3': '#fbc531',
    '--post-message-tags-background-4': '#10ac84',
    '--post-message-color-tags': 'var(--geek-color-10)',
    '--post-message-color-message': 'var(--geek-color-8)',
    '--post-message-color-categories': '#fff',
    '--signature-padding': '1rem 14px',
    '--signature-font-size': '1em',
    '--emoji-text-emoji-color': 'var(--geek-color-6)',
    '--emoji-bg': 'var(--geek-color-1)',
    '--emoji-border-color': 'var(--geek-color-3)',
    '--emoji-hover-bg': 'var(--geek-color-3)',
    '--emoji-hover-border-color': 'var(--color-primary)',
    '--imagebox-background': 'var(--geek-color-2)',
    '--post-signature-primary': 'var(--color-primary)',
    '--post-signature-background': 'var(--geek-color-2)',
    '--post-signature-border-radius': '2px',
    '--tool-menu-background': 'var(--geek-color-2)',
    '--tool-menu-color': '#fff',
    '--player-body-background': 'var(--geek-color-6)',
  },
  reacg: {
    '--chart-padding': '0 13.884px 16px',
    '--donation-btn-colors': '#10ac84',
    '--donation-qrcode-background': 'var(--themeColor)',
    '--emoji-text-emoji-color': 'var(--color-basic-800)',
    '--emoji-bg': 'var(--emoji-bg)',
    '--emoji-border-color': 'var(--color-basic-300)',
    '--emoji-hover-bg': 'var(--color-basic-100)',
    '--emoji-hover-border-color': 'var(--color-basic-200)',
    '--emoji-font-emoji-size': '16px',
    '--post-signature-primary': 'var(--themeColor)',
    '--post-signature-background': 'var(--color-basic-75)',
    '--post-signature-border-radius': '2px',
    '--player-body-background': 'var(--color-basic-75)',
    '--post-bottomimage-image-height': '200px',
    '--post-message-categories-background': '#f13a3a',
    '--post-message-tags-background-1': '#22a6b3',
    '--post-message-tags-background-2': '#0097e6',
    '--post-message-tags-background-3': '#fbc531',
    '--post-message-tags-background-4': '#10ac84',
    '--post-message-color-tags': 'var(--color-basic-700)',
    '--post-message-color-message': 'var(--color-basic-600)',
    '--post-message-color-categories': '#fff',
    '--signature-padding': '1rem 14px',
    '--signature-font-size': '1em',
    '--tool-menu-background': 'var(--color-basic-50)',
  },
  simple: {
    '--post-signature-primary': 'var(--themeColor)',
    '--post-signature-background': 'var(--background-e)',
    '--post-signature-border-radius': '2px',
    '--imagebox-background': 'rgba(0, 0, 0, 0.5)',
    '--donation-btn-colors': '#10ac84',
    '--donation-qrcode-background': '#fff',
    '--emoji-text-emoji-color': '#666',
    '--emoji-bg': '#fff',
    '--emoji-border-color': '#e1e1e1',
    '--emoji-hover-bg': '#f8f8f8',
    '--emoji-hover-border-color': '#140b0b',
    '--emoji-font-emoji-size': '14px',
    '--player-body-background': '#fff',
    '--post-message-categories-background': '#ff6b6b',
    '--post-message-tags-background-1': '#22a6b3',
    '--post-message-tags-background-2': '#0097e6',
    '--post-message-tags-background-3': '#fbc531',
    '--post-message-tags-background-4': '#10ac84',
    '--post-message-color-categories': '#fff',
    '--post-message-color-tags': '#333',
    '--post-message-color-message': '#999',
    '--signature-padding': '1rem 14px',
    '--signature-font-size': '1em',
    '--tool-menu-background': '#fff',
    '--tool-menu-color': '#fff',
  },
  view: {
    '--footer-background': 'var(--color-basic-700)',
    '--post-signature-primary': 'var(--themeColor)',
    '--post-signature-background': 'var(--color-basic-100)',
    '--post-signature-border-radius': '2px',
    '--tool-menu-background': 'var(--color-basic-50)',
    '--emoji-text-emoji-color': 'var(--color-basic-800)',
    '--emoji-bg': 'var(--emoji-bg)',
    '--emoji-border-color': 'var(--color-basic-300)',
    '--emoji-hover-bg': 'var(--color-basic-100)',
    '--emoji-hover-border-color': 'var(--color-basic-200)',
  },
}

/** 原 plugins.scss 的 @use 插件数（geek 16 / reacg 26 / simple 14 / view 11） */
const expectedImportCounts: Record<string, number> = {
  geek: 16,
  reacg: 26,
  simple: 14,
  view: 11,
}

describe('主题下游迁移：plugins.scss → plugins.css', () => {
  it('4 个主题 plugins.css 存在，plugins.scss 已删除', () => {
    for (const theme of themes) {
      expect(
        fs.existsSync(path.join(styleDir(theme), 'plugins.css')),
        `${theme}: plugins.css 应存在`,
      ).toBe(true)
      expect(
        fs.existsSync(path.join(styleDir(theme), 'plugins.scss')),
        `${theme}: plugins.scss 应已删除`,
      ).toBe(false)
    }
  })

  it('plugins.css 顶部为裸包名模块 id 的插件 @import 列表（顺序同原 @use）', () => {
    for (const theme of themes) {
      const css = fs.readFileSync(path.join(styleDir(theme), 'plugins.css'), 'utf8')
      const lines = css.split('\n').filter((l) => l.trim().startsWith('@import'))
      expect(lines.length, `${theme}: @import 数应等于原 @use 数`).toBe(
        expectedImportCounts[theme],
      )
      for (const line of lines) {
        expect(line, `${theme}: 应使用裸包名模块 id`).toContain(
          "@import 'tona-plugins/",
        )
        expect(line, `${theme}: 不应使用 /node_modules/ 绝对路径`).not.toContain(
          '/node_modules/',
        )
      }
      // @import 列表必须位于文件顶部（:root 覆盖块之前）
      const rootIndex = css.indexOf(':root')
      expect(rootIndex, `${theme}: :root 覆盖块应在 @import 列表之后`).toBeGreaterThan(
        css.indexOf('@import'),
      )
    }
  })

  it(':root 覆盖块含原 with() 配置的全部 key，值不变', () => {
    for (const theme of themes) {
      const css = fs.readFileSync(path.join(styleDir(theme), 'plugins.css'), 'utf8')
      const rootBlock = css.match(/:root\s*{([\s\S]*?)}/)?.[1]
      expect(rootBlock, `${theme}: 应含 :root 覆盖块`).toBeTruthy()
      const declared = new Map<string, string>()
      for (const line of rootBlock!.split('\n')) {
        const m = line.match(/^\s*(--[\w-]+):\s*(.*);\s*$/)
        if (m) declared.set(m[1], m[2].trim())
      }
      for (const [name, value] of Object.entries(expectedOverrides[theme])) {
        expect(declared.get(name), `${theme}: ${name} 应被覆盖`).toBe(value)
      }
    }
  })

  it('主题 index.scss 引用已指向 plugins.css', () => {
    for (const theme of themes) {
      const scss = fs.readFileSync(path.join(styleDir(theme), 'index.scss'), 'utf8')
      // geek/reacg 原为 @use './plugins.scss' as *;——sass 要求 @use 先于其他语句，
      // 中段无法放 @import，故仅改扩展名（@use 一个 css 模块等价于原位引入）；
      // simple/view 原为 @import './plugins.scss';——仅改扩展名。
      if (theme === 'geek' || theme === 'reacg') {
        expect(scss, `${theme}: 应 @use plugins.css`).toContain(
          "@use './plugins.css' as *;",
        )
      } else {
        expect(scss, `${theme}: 应 @import plugins.css`).toContain(
          "@import './plugins.css';",
        )
      }
      expect(scss, `${theme}: 不应再引用 plugins.scss`).not.toContain('plugins.scss')
    }
  })

  it('plugins.css 无 sass 语法残留', () => {
    for (const theme of themes) {
      const css = fs.readFileSync(path.join(styleDir(theme), 'plugins.css'), 'utf8')
      const patterns: Array<{ label: string; re: RegExp }> = [
        { label: '@use', re: /@use\b/ },
        { label: '$ 变量', re: /\$[A-Za-z_][\w-]*/ },
        { label: 'with ( 配置', re: /with\s*\(/ },
        { label: '嵌套 &', re: /^\s*&[.:#]/m },
        { label: '全角分号', re: /；/ },
      ]
      for (const { label, re } of patterns) {
        expect(css.match(re), `${theme}: plugins.css 不应含 ${label}`).toBeNull()
      }
    }
  })
})
