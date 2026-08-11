import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'

/**
 * 深色模式按钮工厂单测（seam A，纯对象断言，无真实 DOM）：
 * - 按钮对象形状：默认字段 / options 覆盖 / callback 与 setup 存在
 * - callback 三态循环：dark → light → system → dark，写 localStorage.modeType，
 *   html theme 属性随之变化
 * - setup 初始化：localStorage.modeType 有值时恢复对应模式；无值时按
 *   darkDefault/followSystem 默认逻辑进入浅色/深色；并初始化按钮图标/tooltip
 *
 * jQuery 与 matchMedia 使用与 darkMode.test.ts 同构的轻量 mock。
 */

/**
 * 轻量 jQuery mock，覆盖按钮 setup/callback 用到的 API：
 * $('html').attr / $('body').addClass/removeClass /
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

async function loadButtons() {
  vi.resetModules()
  const mod = await import('tona-plugins')
  return mod
}

describe('createDarkModeButton 按钮工厂（seam A）', () => {
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

  describe('按钮对象形状', () => {
    it('从 tona-plugins 主入口可 import，返回默认字段，callback/setup 存在', async () => {
      const mod = await loadButtons()

      expect(typeof mod.createDarkModeButton).toBe('function')

      const btn = mod.createDarkModeButton()
      expect(btn).toMatchObject({
        enable: true,
        page: 'all',
        icon: 'fa-moon', // 默认三态图标（DEFAULT_ICONS.dark）
        iconType: 'className',
        tooltip: '深色',
        className: 'mode-change',
      })
      expect(typeof btn.callback).toBe('function')
      expect(typeof btn.setup).toBe('function')
    })

    it('options 覆盖 icon/iconType/tooltip/page/enable；className 固定为 mode-change', async () => {
      const mod = await loadButtons()
      const btn = mod.createDarkModeButton({
        icon: 'fa-adjust',
        iconType: 'className',
        tooltip: '昼夜',
        className: 'dark-btn',
        page: 'post',
        enable: false,
      })

      expect(btn).toMatchObject({
        enable: false,
        page: 'post',
        icon: 'fa-adjust',
        iconType: 'className',
        tooltip: '昼夜',
        className: 'mode-change', // review fix：className 不可覆盖（核心同步逻辑依赖该选择器）
      })
      expect(typeof btn.callback).toBe('function')
      expect(typeof btn.setup).toBe('function')
    })

    it('callback/setup 由闭包绑定，不接受 options 覆盖', async () => {
      const mod = await loadButtons()
      const passedCallback = vi.fn()
      const passedSetup = vi.fn()
      const btn = mod.createDarkModeButton({
        callback: passedCallback,
        setup: passedSetup,
      })

      expect(btn.callback).not.toBe(passedCallback)
      expect(btn.setup).not.toBe(passedSetup)

      btn.setup(null, {})
      btn.callback({})
      expect(passedCallback).not.toHaveBeenCalled()
      expect(passedSetup).not.toHaveBeenCalled()
    })
  })

  describe('callback 三态循环', () => {
    it('点击按 dark → light → system → dark 循环，写 localStorage，html theme 随之变化', async () => {
      const mod = await loadButtons()
      const btn = mod.createDarkModeButton({ darkDefault: true })

      btn.setup(null, {})
      expect(jq.state.htmlTheme).toBe('dark')

      // dark → light
      btn.callback({})
      expect(jq.state.htmlTheme).toBe('light')
      expect(localStorage.getItem('modeType')).toBe('light')

      // light → system（跟随系统，当前系统为浅色）
      btn.callback({})
      expect(jq.state.htmlTheme).toBe('light')
      expect(localStorage.getItem('modeType')).toBe('system')

      // system → dark
      btn.callback({})
      expect(jq.state.htmlTheme).toBe('dark')
      expect(localStorage.getItem('modeType')).toBe('dark')
    })

    it('手动切换到 system 后系统变化实时跟随，localStorage 保持 system', async () => {
      const mod = await loadButtons()
      const btn = mod.createDarkModeButton({ darkDefault: true })

      btn.setup(null, {})
      btn.callback({}) // dark → light
      btn.callback({}) // light → system
      expect(localStorage.getItem('modeType')).toBe('system')

      matchMediaMock.setDark(true)
      expect(jq.state.htmlTheme).toBe('dark')
      expect(localStorage.getItem('modeType')).toBe('system')
    })
  })

  describe('setup 初始化', () => {
    it('localStorage.modeType=dark 时恢复深色模式', async () => {
      localStorage.setItem('modeType', 'dark')
      const mod = await loadButtons()
      const btn = mod.createDarkModeButton()

      btn.setup(null, {})
      expect(jq.state.htmlTheme).toBe('dark')
    })

    it('localStorage.modeType=system 时进入跟随系统模式', async () => {
      localStorage.setItem('modeType', 'system')
      matchMediaMock.setDark(true)
      const mod = await loadButtons()
      const btn = mod.createDarkModeButton()

      btn.setup(null, {})
      expect(jq.state.htmlTheme).toBe('dark')
      expect(localStorage.getItem('modeType')).toBe('system')
    })

    it('无存储时默认进入浅色模式，不写 localStorage', async () => {
      const mod = await loadButtons()
      const btn = mod.createDarkModeButton()

      btn.setup(null, {})
      expect(jq.state.htmlTheme).toBe('light')
      expect(localStorage.getItem('modeType')).toBeNull()
    })

    it('darkDefault=true 无存储时进入深色模式', async () => {
      const mod = await loadButtons()
      const btn = mod.createDarkModeButton({ darkDefault: true })

      btn.setup(null, {})
      expect(jq.state.htmlTheme).toBe('dark')
      expect(localStorage.getItem('modeType')).toBeNull()
    })

    it('followSystem=true 无存储时跟随系统', async () => {
      matchMediaMock.setDark(true)
      const mod = await loadButtons()
      const btn = mod.createDarkModeButton({ followSystem: true })

      btn.setup(null, {})
      expect(jq.state.htmlTheme).toBe('dark')
      expect(localStorage.getItem('modeType')).toBeNull()
    })

    it('初始化按钮图标与 tooltip（html 模式：单 icon 覆盖）', async () => {
      const mod = await loadButtons()
      const btn = mod.createDarkModeButton({
        darkDefault: true,
        icon: '🌜',
        iconType: 'html',
      })

      btn.setup(null, {})
      expect(jq.state.iconHtml).toBe('🌜')
      expect(jq.state.tooltipText).toBe('深色')
    })

    it('options 图标/tooltip 覆盖后 setup 同步到按钮', async () => {
      const mod = await loadButtons()
      const btn = mod.createDarkModeButton({
        darkDefault: true,
        icon: 'fa-adjust',
        iconType: 'className',
        tooltip: '昼夜',
      })

      btn.setup(null, {})
      expect(jq.state.iconClass).toBe('fa-adjust')
      expect(jq.state.tooltipText).toBe('昼夜')
    })

    it('不传 icon 时默认三态图标：深色模式同步为 DEFAULT_ICONS.dark', async () => {
      const mod = await loadButtons()
      const btn = mod.createDarkModeButton({
        darkDefault: true,
        iconType: 'className',
      })

      btn.setup(null, {})
      expect(jq.state.iconClass).toBe('fa-moon')
      expect(jq.state.tooltipText).toBe('深色')
    })

    it('icons/tooltips 三态映射覆盖：各模式同步对应图标与提示', async () => {
      const mod = await loadButtons()
      const btn = mod.createDarkModeButton({
        darkDefault: true,
        iconType: 'className',
        icons: {
          dark: 'icon-dark',
          light: 'icon-light',
          system: 'icon-system',
        },
        tooltips: {
          dark: '暗',
          light: '亮',
          system: '跟随',
        },
      })

      btn.setup(null, {})
      expect(jq.state.iconClass).toBe('icon-dark')
      expect(jq.state.tooltipText).toBe('暗')

      btn.callback({}) // dark → light
      expect(jq.state.iconClass).toBe('icon-light')
      expect(jq.state.tooltipText).toBe('亮')

      btn.callback({}) // light → system
      expect(jq.state.iconClass).toBe('icon-system')
      expect(jq.state.tooltipText).toBe('跟随')
    })
  })

  describe('callback 双触发防御', () => {
    it('收到 event 时调用 stopPropagation（防止 darkMode 插件委托双触发）', async () => {
      const mod = await loadButtons()
      const btn = mod.createDarkModeButton({ darkDefault: true })
      const stopPropagation = vi.fn()

      btn.callback({}, { stopPropagation })

      expect(stopPropagation).toHaveBeenCalledTimes(1)
      expect(jq.state.htmlTheme).toBe('light') // dark → light
    })

    it('无 event 参数时正常循环，不抛错', async () => {
      const mod = await loadButtons()
      const btn = mod.createDarkModeButton({ darkDefault: true })

      expect(() => btn.callback({})).not.toThrow()
      expect(jq.state.htmlTheme).toBe('light')
    })
  })
})
