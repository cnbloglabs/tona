import fs from 'node:fs'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'

/**
 * tools 插件按钮化重构（issue 01）集成测试：真实 jQuery + 真实 tools 插件。
 * 覆盖：零默认空工具栏、数组整体替换、setup 调用时机、顺序即视觉、
 * enable/page 过滤保留、无 callback 过渡配置不抛错、展开/收起回归。
 */
describe('tools 按钮化重构：零默认、按钮对象、顺序即视觉', () => {
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
    // 注意：不 stub window.getCurrentPage —— tools 插件 import 真实
    // utils/cnblog.getCurrentPage（读 DOM 标记），happy-dom 空 body 下返回
    // undefined，pageCondition('all') 分支仍放行 'all'/缺失 page 的按钮
  })

  afterEach(() => {
    // 清除事件绑定，避免跨测试泄漏
    const g = globalThis as Record<string, unknown>
    if (typeof g.$ === 'function') {
      const $ = g.$ as unknown as (el: unknown) => { off: (ev: string) => void }
      $(document).off('click')
      $(window).off('resize')
    }
    document.body.innerHTML = ''
    localStorage.clear()
  })

  async function useTools(pluginOptions: Record<string, unknown>) {
    vi.resetModules()
    const { createTheme } = await import('tona')
    const plugins = await import('tona-plugins')

    const theme = createTheme()
    theme.use(plugins.tools, { enable: true }, pluginOptions)
    await new Promise((r) => setTimeout(r, 0))
  }

  it('未提供 toolbarItems 时渲染空工具栏（仅 toggle）', async () => {
    await useTools({})

    const toggles = document.querySelectorAll(
      '.custom-toolbar .toolbar-item-toggle',
    )
    const items = document.querySelectorAll('.custom-toolbar .toolbar-item')
    expect(toggles.length).toBe(2)
    expect(items.length).toBe(2) // 仅两个 toggle，无普通按钮
  })

  it('提供 toolbarItems 时数组整体替换：传 1 个按钮只渲染 1 个', async () => {
    await useTools({
      toolbarItems: [
        {
          icon: 'fa-rocket',
          iconType: 'className',
          tooltip: '回顶',
          callback: () => {},
        },
      ],
    })

    const items = document.querySelectorAll(
      '.custom-toolbar .toolbar-item:not(.toolbar-item-toggle)',
    )
    expect(items.length).toBe(1)
  })

  it('按钮含 setup 时在渲染后调用，收到 theme 与 pluginOptions', async () => {
    const setup = vi.fn()
    await useTools({
      toolbarItems: [
        { icon: 'fa-moon', iconType: 'className', callback: () => {}, setup },
      ],
    })

    expect(setup).toHaveBeenCalledTimes(1)
    const [theme, pluginOptions] = setup.mock.calls[0] as [
      unknown,
      Record<string, unknown>,
    ]
    expect(theme).toBeDefined()
    expect((pluginOptions.toolbarItems as unknown[]).length).toBe(1)
  })

  it('数组顺序 = 视觉顺序：第一项在顶部、最后一项最靠近 toggle', async () => {
    await useTools({
      toolbarItems: [
        {
          icon: 'fa-compress',
          iconType: 'className',
          className: 'first-btn',
          callback: () => {},
        },
        {
          icon: 'fa-expand',
          iconType: 'className',
          className: 'second-btn',
          callback: () => {},
        },
      ],
    })

    const items = Array.from(
      document.querySelectorAll(
        '.custom-toolbar .toolbar-item:not(.toolbar-item-toggle)',
      ),
    )
    expect(items.length).toBe(2)
    expect(items[0].classList.contains('first-btn')).toBe(true)
    expect(items[1].classList.contains('second-btn')).toBe(true)
  })

  it('enable:false 与 page 不匹配的按钮不渲染（过滤保留）', async () => {
    await useTools({
      toolbarItems: [
        { icon: 'a', iconType: 'className', callback: () => {}, enable: false },
        { icon: 'b', iconType: 'className', callback: () => {}, page: 'post' },
        { icon: 'c', iconType: 'className', callback: () => {} },
      ],
    })

    const items = document.querySelectorAll(
      '.custom-toolbar .toolbar-item:not(.toolbar-item-toggle)',
    )
    expect(items.length).toBe(1)
  })

  it('无 callback 的按钮（过渡配置）渲染且点击不抛异常', async () => {
    await useTools({
      toolbarItems: [
        { icon: 'fa-moon', iconType: 'className', className: 'mode-change' },
      ],
    })

    const item = document.querySelector('.mode-change')
    expect(item).not.toBeNull()

    const $ = (globalThis as Record<string, unknown>).$ as unknown as (
      sel: string | Window,
    ) => { trigger: (ev: string) => void }
    expect(() => $('.mode-change').trigger('click')).not.toThrow()
  })

  it('展开/收起回归：点击 toggle 切换 extend 类', async () => {
    await useTools({
      toolbarItems: [
        { icon: 'fa-rocket', iconType: 'className', callback: () => {} },
      ],
    })

    const $ = (globalThis as Record<string, unknown>).$ as unknown as (
      sel: string | Window,
    ) => { trigger: (ev: string) => void }
    const toolbar = document.querySelector('.custom-toolbar')
    expect(toolbar?.classList.contains('extend')).toBe(false)

    $('.toolbar-item-toggle:not(.active)').trigger('click')
    expect(toolbar?.classList.contains('extend')).toBe(true)

    $('.toolbar-item-toggle.active').trigger('click')
    expect(toolbar?.classList.contains('extend')).toBe(false)
  })

  it('展开态位移方向：数组第一项在顶部、最后一项最靠近 toggle', async () => {
    await useTools({
      toolbarItems: [
        {
          icon: 'fa-compress',
          iconType: 'className',
          className: 'first-btn',
          callback: () => {},
        },
        {
          icon: 'fa-expand',
          iconType: 'className',
          className: 'second-btn',
          callback: () => {},
        },
      ],
    })

    const $ = (globalThis as Record<string, unknown>).$ as unknown as (
      sel: string | Window,
    ) => { trigger: (ev: string) => void }
    $('.toolbar-item-toggle:not(.active)').trigger('click') // 展开

    const items = document.querySelectorAll(
      '.custom-toolbar .toolbar-item:not(.toolbar-item-toggle)',
    )
    // 数组第一项位移最远（顶部）、最后一项紧贴 toggle（-50px）
    expect((items[0] as HTMLElement).style.transform).toBe('translateY(-100px)')
    expect((items[1] as HTMLElement).style.transform).toBe('translateY(-50px)')
  })

  it('展开态 resize 重算不报错且位移正确（回归）', async () => {
    await useTools({
      toolbarItems: [
        { icon: 'fa-rocket', iconType: 'className', callback: () => {} },
      ],
    })

    const $ = (globalThis as Record<string, unknown>).$ as unknown as (
      sel: string | Window,
    ) => { trigger: (ev: string) => void }
    $('.toolbar-item-toggle:not(.active)').trigger('click')

    expect(() => $(window).trigger('resize')).not.toThrow()

    const item = document.querySelector(
      '.custom-toolbar .toolbar-item:not(.toolbar-item-toggle)',
    ) as HTMLElement
    expect(item.style.transform).toBe('translateY(-50px)')
  })

  it('createDarkModeButton 经 tools 渲染：setup 同步按钮图标，点击循环模式（集成）', async () => {
    // 集成 seam：setup 在 tools 渲染时执行（容器已挂载 body），图标/tooltip
    // 直接同步而非走 MutationObserver 兜底；点击经 tools 绑定触发三态循环
    const w = window as unknown as Record<string, unknown>
    w.highlighter = { setTheme: () => {} }
    w.darkModeCodeHighlightTheme = 'atomOneDark'
    w.codeHighlightTheme = 'github'

    localStorage.setItem('modeType', 'dark')
    vi.resetModules()
    const { createTheme } = await import('tona')
    const plugins = await import('tona-plugins')

    const theme = createTheme()
    theme.use(
      plugins.tools,
      { enable: true },
      {
        toolbarItems: [plugins.createDarkModeButton({ iconType: 'className' })],
      },
    )
    await new Promise((r) => setTimeout(r, 0))

    const item = document.querySelector('.mode-change')
    expect(item).not.toBeNull()
    const icon = item?.querySelector('i')
    const tip = item?.querySelector('.tooltip')

    // 存储为 dark → setup 同步深色图标/tooltip + html theme
    expect(icon?.getAttribute('class')).toBe('fa-moon')
    expect(tip?.textContent).toBe('深色')
    expect(document.querySelector('html')?.getAttribute('theme')).toBe('dark')

    // 点击 → light：图标、html theme、localStorage 全部更新
    const $ = (globalThis as Record<string, unknown>).$ as unknown as (
      sel: string | Window,
    ) => { trigger: (ev: string) => void }
    $('.mode-change').trigger('click')
    expect(icon?.getAttribute('class')).toBe('fa-sun')
    expect(document.querySelector('html')?.getAttribute('theme')).toBe('light')
    expect(localStorage.getItem('modeType')).toBe('light')
  })
})
