import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'

/**
 * 轻量 jQuery mock，覆盖 darkMode 插件用到的 API：
 * $('html').attr / $('body').addClass/removeClass / $(document).on /
 * $('.mode-change').find('i'|'.tooltip') / $(fn) ready 回调
 */
function createJQueryMock() {
  const state = {
    htmlTheme: '',
    bodyClasses: [] as string[],
    modeChangeHandlers: [] as Array<() => void>,
    readyCallbacks: [] as Array<() => void>,
    iconClass: 'fa-moon',
    iconHtml: '',
    tooltipText: '深色',
    iconType: 'className',
  }

  const el = {
    attr: (name: string, value?: string) => {
      if (value === undefined) {
        return state.htmlTheme
      }
      if (name === 'theme') {
        state.htmlTheme = value
      }
      return el
    },
    addClass: (cls: string) => {
      state.bodyClasses.push(cls)
      return el
    },
    removeClass: (cls: string) => {
      state.bodyClasses = state.bodyClasses.filter((c) => c !== cls)
      return el
    },
  }

  const icon = {
    attr: (name: string, value?: string) => {
      if (value === undefined) {
        return state.iconClass
      }
      if (name === 'class') {
        state.iconClass = value
      }
      return icon
    },
    html: (value?: string) => {
      if (value === undefined) {
        return state.iconHtml
      }
      state.iconHtml = value
      return icon
    },
    length: 1,
  }

  const tooltip = {
    text: (value?: string) => {
      if (value === undefined) {
        return state.tooltipText
      }
      state.tooltipText = value
      return tooltip
    },
    length: 1,
  }

  const modeChangeItem = {
    find: (selector: string) => {
      if (selector === 'i') {
        return state.iconType === 'className' ? icon : { ...icon, length: 1 }
      }
      if (selector === '.tooltip') {
        return tooltip
      }
      return { length: 0 }
    },
    length: 1,
  }

  const empty = { length: 0 }

  const $ = (selector: unknown) => {
    if (typeof selector === 'function') {
      state.readyCallbacks.push(selector as () => void)
      return empty
    }
    if (selector === 'html') {
      return el
    }
    if (selector === 'body') {
      return el
    }
    if (selector === document) {
      return {
        on: (event: string, _sel: string, handler: () => void) => {
          if (event === 'click' && _sel === '.mode-change') {
            state.modeChangeHandlers.push(handler)
          }
          return { on: () => {} }
        },
      }
    }
    if (selector === '.mode-change') {
      return modeChangeItem
    }
    return empty
  }

  return { $, state }
}

function mockMatchMedia(initialDark = false) {
  let dark = initialDark
  const changeListeners: Array<(event: { matches: boolean }) => void> = []

  window.matchMedia = vi.fn(
    () =>
      ({
        matches: dark,
        media: '(prefers-color-scheme: dark)',
        addEventListener: (
          type: string,
          fn: (event: { matches: boolean }) => void,
        ) => {
          if (type === 'change') {
            changeListeners.push(fn)
          }
        },
        addListener: (fn: (event: { matches: boolean }) => void) => {
          changeListeners.push(fn)
        },
        removeEventListener: () => {},
        removeListener: () => {},
      }) as unknown as MediaQueryList,
  )

  return {
    setDark: (value: boolean) => {
      dark = value
      changeListeners.forEach((fn) => fn({ matches: value }))
    },
    getDark: () => dark,
  }
}

function installHighlighterMock() {
  const setTheme = vi.fn()
  window.highlighter = { setTheme }
  window.darkModeCodeHighlightTheme = 'atomOneDark'
  window.codeHighlightTheme = 'github'
  return setTheme
}

let jq: ReturnType<typeof createJQueryMock>
let matchMediaMock: ReturnType<typeof mockMatchMedia>

async function loadPlugin() {
  vi.resetModules()
  const mod = await import('tona-plugins')
  return mod.darkMode as (
    theme: unknown,
    devOptions?: Record<string, unknown>,
  ) => void
}

describe('darkMode 插件三态切换', () => {
  beforeEach(() => {
    jq = createJQueryMock()
    ;(globalThis as Record<string, unknown>).$ = jq.$
    matchMediaMock = mockMatchMedia(false)
    installHighlighterMock()
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('默认配置（darkDefault=false, followSystem=false）进入浅色模式，且不写 localStorage', async () => {
    const darkMode = await loadPlugin()
    darkMode(null, { enable: true })

    expect(jq.state.htmlTheme).toBe('light')
    expect(localStorage.getItem('modeType')).toBeNull()
  })

  it('darkDefault=true 进入深色模式', async () => {
    const darkMode = await loadPlugin()
    darkMode(null, { enable: true, darkDefault: true })

    expect(jq.state.htmlTheme).toBe('dark')
    expect(localStorage.getItem('modeType')).toBeNull()
  })

  it('followSystem=true 且系统为深色时进入深色模式，不写 localStorage', async () => {
    matchMediaMock.setDark(true)
    const darkMode = await loadPlugin()
    darkMode(null, { enable: true, followSystem: true })

    expect(jq.state.htmlTheme).toBe('dark')
    expect(localStorage.getItem('modeType')).toBeNull()
  })

  it('followSystem=true 且系统为浅色时进入浅色模式', async () => {
    const darkMode = await loadPlugin()
    darkMode(null, { enable: true, followSystem: true })

    expect(jq.state.htmlTheme).toBe('light')
    expect(localStorage.getItem('modeType')).toBeNull()
  })

  it('localStorage.modeType=dark 时优先使用存储值', async () => {
    localStorage.setItem('modeType', 'dark')
    const darkMode = await loadPlugin()
    darkMode(null, { enable: true })

    expect(jq.state.htmlTheme).toBe('dark')
  })

  it('localStorage.modeType=system 时进入跟随系统模式', async () => {
    localStorage.setItem('modeType', 'system')
    matchMediaMock.setDark(true)
    const darkMode = await loadPlugin()
    darkMode(null, { enable: true })

    expect(jq.state.htmlTheme).toBe('dark')
    expect(localStorage.getItem('modeType')).toBe('system')
  })

  it('按钮点击按 dark → light → system → dark 循环，并写入 localStorage', async () => {
    const darkMode = await loadPlugin()
    darkMode(null, { enable: true, darkDefault: true })

    expect(jq.state.htmlTheme).toBe('dark')

    // dark → light
    jq.state.modeChangeHandlers[0]()
    expect(jq.state.htmlTheme).toBe('light')
    expect(localStorage.getItem('modeType')).toBe('light')

    // light → system（跟随系统，当前系统为浅色）
    jq.state.modeChangeHandlers[0]()
    expect(jq.state.htmlTheme).toBe('light')
    expect(localStorage.getItem('modeType')).toBe('system')

    // system → dark
    jq.state.modeChangeHandlers[0]()
    expect(jq.state.htmlTheme).toBe('dark')
    expect(localStorage.getItem('modeType')).toBe('dark')
  })

  it('跟随系统模式下系统变化实时切换，localStorage 保持 system', async () => {
    const darkMode = await loadPlugin()
    darkMode(null, { enable: true, followSystem: true })

    expect(jq.state.htmlTheme).toBe('light')

    matchMediaMock.setDark(true)
    expect(jq.state.htmlTheme).toBe('dark')

    matchMediaMock.setDark(false)
    expect(jq.state.htmlTheme).toBe('light')

    expect(localStorage.getItem('modeType')).toBeNull()
  })

  it('手动切换到 system 后系统变化仍实时跟随', async () => {
    const darkMode = await loadPlugin()
    darkMode(null, { enable: true, darkDefault: true })

    // dark → light → system
    jq.state.modeChangeHandlers[0]()
    jq.state.modeChangeHandlers[0]()
    expect(localStorage.getItem('modeType')).toBe('system')

    matchMediaMock.setDark(true)
    expect(jq.state.htmlTheme).toBe('dark')
    expect(localStorage.getItem('modeType')).toBe('system')
  })

  it('按钮图标与 tooltip 随模式更新（className 模式）', async () => {
    const darkMode = await loadPlugin()
    darkMode(null, { enable: true, darkDefault: true })

    // ready 回调同步一次图标
    jq.state.readyCallbacks.forEach((fn) => fn())
    expect(jq.state.iconClass).toBe('fa-moon')
    expect(jq.state.tooltipText).toBe('深色')

    // dark → light
    jq.state.modeChangeHandlers[0]()
    expect(jq.state.iconClass).toBe('fa-sun')
    expect(jq.state.tooltipText).toBe('浅色')

    // light → system
    jq.state.modeChangeHandlers[0]()
    expect(jq.state.iconClass).toBe('fa-adjust')
    expect(jq.state.tooltipText).toBe('跟随系统')
  })

  it('支持 devOptions 自定义图标（html 模式）', async () => {
    jq.state.iconType = 'html'
    const darkMode = await loadPlugin()
    darkMode(null, {
      enable: true,
      darkDefault: true,
      iconType: 'html',
      icons: { dark: '🌙', light: '☀️', system: '🔄' },
      tooltips: { dark: '暗色', light: '亮色', system: '自动' },
    })

    jq.state.readyCallbacks.forEach((fn) => fn())
    expect(jq.state.iconHtml).toBe('🌙')
    expect(jq.state.tooltipText).toBe('暗色')
  })

  it('enable=false 时不生效', async () => {
    const darkMode = await loadPlugin()
    darkMode(null, { enable: false, darkDefault: true })

    expect(jq.state.htmlTheme).toBe('')
    expect(jq.state.modeChangeHandlers).toHaveLength(0)
  })
})
