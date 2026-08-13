import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'

/**
 * 通用按钮工厂单测（seam A，纯对象断言，无真实 DOM）：
 * - 5 个工厂从 tona-plugins 主入口可 import（跟随 exports 到 dist bundle）
 * - 每个工厂返回按钮对象：默认字段正确、options 覆盖生效、callback 存在
 * - callback 调用对应行为：likePost/toast 以 vi.fn 桩替，
 *   window.follow/window.AddToWz 以 vi.fn 桩替，滚动行为以 $ 桩替
 *
 * 注（ADR-004 产物化后）：dist/index.js 为单文件 bundle，toast/cnblog 已内联，
 * src 路径级 vi.mock 无法再拦截 bundle 内部模块，故行为断言的工厂改从
 * src 导入（与 vi.mock 共享同一模块 ID）；tona-plugins 主入口仅用于导出契约断言。
 */

// toast 模块依赖 notyf，单测中整体桩替（其余模块仅在插件函数体内使用 toast，不影响加载）
vi.mock('../src/plugins/toast', () => ({
  toast: vi.fn(),
}))

// cnblog 仅桩替 likePost，其余导出保持原样（插件树其它模块仍会 import cnblog）
vi.mock('../src/utils/cnblog', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return { ...actual, likePost: vi.fn() }
})

/**
 * 轻量 jQuery mock：仅覆盖滚动行为用到的 API
 * - $(container).animate(props, duration)：记录调用
 * - $('#mainContent')[0].scrollHeight：返回固定值
 */
function createJQueryMock() {
  const state = {
    animateCalls: [] as Array<{
      selector: string
      props: Record<string, number>
      duration: number
    }>,
  }

  const $ = (selector: string) => {
    if (selector === '#mainContent') {
      return { 0: { scrollHeight: 9999 }, length: 1 }
    }
    return {
      animate: (props: Record<string, number>, duration: number) => {
        state.animateCalls.push({ selector, props, duration })
      },
    }
  }
  return { $, state }
}

async function loadButtons() {
  vi.resetModules()
  const bundle = await import('tona-plugins')
  // 工厂从 src 导入：与 vi.mock 的 toast/cnblog 共享同一模块 ID、同一缓存
  const buttons = await import('../src/plugins/tools/buttons')
  const { toast } = await import('../src/plugins/toast')
  const { likePost } = await import('../src/utils/cnblog')
  return { bundle, buttons, toast, likePost }
}

let scrollState: ReturnType<typeof createJQueryMock>['state']
let followMock: ReturnType<typeof vi.fn>
let addToWzMock: ReturnType<typeof vi.fn>

describe('通用按钮工厂（seam A）', () => {
  beforeEach(() => {
    const jq = createJQueryMock()
    ;(globalThis as Record<string, unknown>).$ = jq.$
    scrollState = jq.state

    followMock = vi.fn()
    addToWzMock = vi.fn()
    vi.stubGlobal('follow', followMock)
    vi.stubGlobal('AddToWz', addToWzMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('5 个工厂均从 tona-plugins 主入口具名导出', async () => {
    const { bundle } = await loadButtons()
    const names: Array<keyof typeof bundle> = [
      'createBackTopButton',
      'createLikeButton',
      'createFollowButton',
      'createFavoriteButton',
      'createCommentButton',
    ]
    for (const name of names) {
      expect(typeof bundle[name]).toBe('function')
    }
  })

  describe('createBackTopButton', () => {
    it('默认字段正确，callback 存在且滚动到顶部', async () => {
      const { buttons } = await loadButtons()
      const btn = buttons.createBackTopButton()

      expect(btn).toMatchObject({
        enable: true,
        page: 'all',
        icon: '🚀',
        iconType: 'html',
        tooltip: '回顶',
      })
      expect(typeof btn.callback).toBe('function')

      btn.callback({ scrollContainer: 'html' })
      expect(scrollState.animateCalls).toEqual([
        { selector: 'html', props: { scrollTop: 0 }, duration: 200 },
      ])
    })

    it('未提供 scrollContainer 时默认滚动 html', async () => {
      const { buttons } = await loadButtons()
      buttons.createBackTopButton().callback({})
      expect(scrollState.animateCalls).toEqual([
        { selector: 'html', props: { scrollTop: 0 }, duration: 200 },
      ])
    })

    it('options 覆盖 icon/iconType/tooltip/className/page/enable', async () => {
      const { buttons } = await loadButtons()
      const btn = buttons.createBackTopButton({
        icon: 'fa-rocket',
        iconType: 'className',
        tooltip: '返回顶部',
        className: 'back-top',
        page: 'post',
        enable: false,
      })

      expect(btn).toMatchObject({
        enable: false,
        page: 'post',
        icon: 'fa-rocket',
        iconType: 'className',
        tooltip: '返回顶部',
        className: 'back-top',
      })
    })

    it('callback 由闭包绑定，不接受 options 覆盖', async () => {
      const { buttons } = await loadButtons()
      const passed = vi.fn()
      // callback 不在按钮 options 契约内（闭包绑定），测试显式断言运行时忽略它
      const btn = buttons.createBackTopButton({
        callback: passed,
      } as unknown as Parameters<typeof buttons.createBackTopButton>[0])

      btn.callback({ scrollContainer: 'html' })
      expect(passed).not.toHaveBeenCalled()
      expect(scrollState.animateCalls).toHaveLength(1)
    })
  })

  describe('createLikeButton', () => {
    it('默认字段正确，callback toast 推荐成功 + likePost', async () => {
      const { buttons, toast, likePost } = await loadButtons()
      const btn = buttons.createLikeButton()

      expect(btn).toMatchObject({
        enable: true,
        page: 'post',
        icon: '👍',
        iconType: 'html',
        tooltip: '推荐',
      })
      expect(typeof btn.callback).toBe('function')

      btn.callback({})
      expect(toast).toHaveBeenCalledWith('推荐成功')
      expect(likePost).toHaveBeenCalledTimes(1)
    })

    it('options 覆盖 icon/tooltip/className/page/enable', async () => {
      const { buttons } = await loadButtons()
      const btn = buttons.createLikeButton({
        icon: 'fa-thumbs-up',
        iconType: 'className',
        tooltip: '点赞',
        className: 'like-btn',
        page: 'all',
        enable: false,
      })

      expect(btn).toMatchObject({
        enable: false,
        page: 'all',
        icon: 'fa-thumbs-up',
        iconType: 'className',
        tooltip: '点赞',
        className: 'like-btn',
      })
    })
  })

  describe('createFollowButton', () => {
    it('默认字段正确，callback toast 关注成功 + window.follow', async () => {
      const { buttons, toast } = await loadButtons()
      const btn = buttons.createFollowButton()

      expect(btn).toMatchObject({
        enable: true,
        page: 'post',
        icon: '💗',
        iconType: 'html',
        tooltip: '关注',
      })
      expect(typeof btn.callback).toBe('function')

      btn.callback({})
      expect(toast).toHaveBeenCalledWith('关注成功')
      expect(followMock).toHaveBeenCalledTimes(1)
    })

    it('options 覆盖 icon/tooltip/className/page/enable', async () => {
      const { buttons } = await loadButtons()
      const btn = buttons.createFollowButton({
        icon: 'fa-heart',
        iconType: 'className',
        tooltip: '关注博主',
        className: 'follow-btn',
        page: 'all',
        enable: false,
      })

      expect(btn).toMatchObject({
        enable: false,
        page: 'all',
        icon: 'fa-heart',
        iconType: 'className',
        tooltip: '关注博主',
        className: 'follow-btn',
      })
    })
  })

  describe('createFavoriteButton', () => {
    it('默认字段正确，callback 调用 window.AddToWz', async () => {
      const { buttons } = await loadButtons()
      const btn = buttons.createFavoriteButton()

      expect(btn).toMatchObject({
        enable: true,
        page: 'post',
        icon: '📌',
        iconType: 'html',
        tooltip: '收藏',
      })
      expect(typeof btn.callback).toBe('function')

      btn.callback({})
      expect(addToWzMock).toHaveBeenCalledTimes(1)
    })

    it('options 覆盖 icon/tooltip/className/page/enable', async () => {
      const { buttons } = await loadButtons()
      const btn = buttons.createFavoriteButton({
        icon: 'fa-bookmark',
        iconType: 'className',
        tooltip: '加入收藏',
        className: 'favorite-btn',
        page: 'all',
        enable: false,
      })

      expect(btn).toMatchObject({
        enable: false,
        page: 'all',
        icon: 'fa-bookmark',
        iconType: 'className',
        tooltip: '加入收藏',
        className: 'favorite-btn',
      })
    })
  })

  describe('createCommentButton', () => {
    it('默认字段正确，callback 滚动到评论输入框', async () => {
      const { buttons } = await loadButtons()
      const btn = buttons.createCommentButton()

      expect(btn).toMatchObject({
        enable: true,
        page: 'post',
        icon: '💬',
        iconType: 'html',
        tooltip: '评论',
      })
      expect(typeof btn.callback).toBe('function')

      btn.callback({ scrollContainer: '#main' })
      expect(scrollState.animateCalls).toEqual([
        { selector: '#main', props: { scrollTop: 9999 }, duration: 300 },
      ])
    })

    it('未提供 scrollContainer 时默认滚动 html', async () => {
      const { buttons } = await loadButtons()
      buttons.createCommentButton().callback({})
      expect(scrollState.animateCalls).toEqual([
        { selector: 'html', props: { scrollTop: 9999 }, duration: 300 },
      ])
    })

    it('options 覆盖 icon/tooltip/className/page/enable', async () => {
      const { buttons } = await loadButtons()
      const btn = buttons.createCommentButton({
        icon: 'fa-comment',
        iconType: 'className',
        tooltip: '评论一下',
        className: 'comment-btn',
        page: 'all',
        enable: false,
      })

      expect(btn).toMatchObject({
        enable: false,
        page: 'all',
        icon: 'fa-comment',
        iconType: 'className',
        tooltip: '评论一下',
        className: 'comment-btn',
      })
    })
  })
})
