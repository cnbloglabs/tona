import fs from 'node:fs'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test'

/**
 * 全链路集成测试：真实 jQuery + 真实 tools 插件 + 真实 darkMode 插件，
 * 复现 geek 主题的注册顺序（darkMode 先于 tools），验证 tooltip 同步。
 */
describe('darkMode 集成：跟随系统 tooltip 同步', () => {
  beforeEach(() => {
    const jquerySrc = fs.readFileSync(
      path.resolve(__dirname, '../../tona-vite/public/js/jquery.min.js'),
      'utf8',
    )
    // happy-dom 的 window 上 eval jQuery
    const win = window as unknown as {
      eval: (src: string) => unknown
      jQuery: unknown
      $: unknown
    }
    win.eval(jquerySrc)
    ;(globalThis as Record<string, unknown>).$ = win.$
    ;(globalThis as Record<string, unknown>).jQuery = win.jQuery

    const w = window as unknown as Record<string, unknown>
    w.opts = {}
    w.highlighter = { setTheme: () => {} }
    w.darkModeCodeHighlightTheme = 'atomOneDark'
    w.codeHighlightTheme = 'github'

    let isDark = false
    const mqListeners: Array<(event: { matches: boolean }) => void> = []
    window.matchMedia = ((q: string) => ({
      matches: isDark,
      media: q,
      addEventListener: (
        t: string,
        fn: (event: { matches: boolean }) => void,
      ) => t === 'change' && mqListeners.push(fn),
      addListener: (fn: (event: { matches: boolean }) => void) =>
        mqListeners.push(fn),
      removeEventListener: () => {},
      removeListener: () => {},
    })) as unknown as typeof window.matchMedia

    w.getCurrentPage = () => 'all'
  })

  afterEach(() => {
    // 清除 document 级事件委托，避免跨测试泄漏
    const g = globalThis as Record<string, unknown>
    if (typeof g.$ === 'function') {
      ;(g.$ as unknown as (el: unknown) => { off: (ev: string) => void })(
        document,
      ).off('click')
    }
    document.body.innerHTML = ''
    localStorage.clear()
  })

  async function useGeekTheme(darkModeOptions: Record<string, unknown>) {
    const { vi } = await import('vite-plus/test')
    vi.resetModules()
    const { createTheme } = await import('tona')
    const plugins = await import('tona-plugins')

    const theme = createTheme()
    // geek main.js 顺序：darkMode 在前，tools 在后
    theme.use(plugins.darkMode, darkModeOptions)
    theme.use(
      plugins.tools,
      { enable: true },
      {
        toolbarItems: [
          { icon: 'fas fa-rocket rocket-rotate', iconType: 'className' },
          {
            enable: true,
            icon: 'fa-moon',
            iconType: 'className',
            className: 'mode-change',
          },
          { icon: 'fa-thumbs-up', iconType: 'className' },
        ],
      },
    )
    // 等 MutationObserver 兜底回调触发
    await new Promise((r) => setTimeout(r, 100))
  }

  it('darkMode 先于 tools 注册时，跟随系统模式 tooltip 正确同步', async () => {
    await useGeekTheme({ enable: true, followSystem: true })

    const item = document.querySelector('.mode-change')
    expect(item).not.toBeNull()

    const icon = item?.querySelector('i')
    const tip = item?.querySelector('.tooltip')

    // 跟随系统模式（系统为浅色）下，图标与 tooltip 应反映 system 态
    expect(icon?.getAttribute('class')).toBe('fa-adjust')
    expect(tip?.textContent).toBe('跟随系统')
  })

  it('localStorage 为 system 时，初始即进入跟随系统并同步 tooltip', async () => {
    localStorage.setItem('modeType', 'system')
    await useGeekTheme({ enable: true })

    const item = document.querySelector('.mode-change')
    const icon = item?.querySelector('i')
    const tip = item?.querySelector('.tooltip')

    expect(icon?.getAttribute('class')).toBe('fa-adjust')
    expect(tip?.textContent).toBe('跟随系统')
  })

  it('localStorage 为 dark 时，初始 tooltip 与图标正确同步', async () => {
    localStorage.setItem('modeType', 'dark')
    await useGeekTheme({ enable: true })

    const item = document.querySelector('.mode-change')
    const icon = item?.querySelector('i')
    const tip = item?.querySelector('.tooltip')

    expect(icon?.getAttribute('class')).toBe('fa-moon')
    expect(tip?.textContent).toBe('深色')

    // 点击后 tooltip 同步更新（点击循环逻辑在单测已覆盖，此处验证事件委托在集成环境下生效）
    ;(
      (globalThis as Record<string, unknown>).$ as unknown as {
        (sel: string): { trigger: (ev: string) => void }
      }
    )(`.mode-change`).trigger('click')
    expect(icon?.getAttribute('class')).toBe('fa-sun')
    expect(tip?.textContent).toBe('浅色')
  })
})
