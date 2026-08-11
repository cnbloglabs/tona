import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'

/**
 * 通用按钮工厂单测（seam A，纯对象断言，无真实 DOM）：
 * - 5 个工厂从 tona-plugins 主入口可 import
 * - 每个工厂返回按钮对象：默认字段正确、options 覆盖生效、callback 存在
 * - callback 调用对应行为：likePost/toast 以 vi.fn 桩替，
 *   window.follow/window.AddToWz 以 vi.fn 桩替，滚动行为以 $ 桩替
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
  const mod = await import('tona-plugins')
  // 与按钮模块共享同一 mock 实例（同一模块 ID、同一缓存）
  const { toast } = await import('../src/plugins/toast')
  const { likePost } = await import('../src/utils/cnblog')
  return { mod, toast, likePost }
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
    const { mod } = await loadButtons()
    for (const name of [
      'createBackTopButton',
      'createLikeButton',
      'createFollowButton',
      'createFavoriteButton',
      'createCommentButton',
    ]) {
      expect(typeof mod[name]).toBe('function')
    }
  })

  describe('createBackTopButton', () => {
    it('默认字段正确，callback 存在且滚动到顶部', async () => {
      const { mod } = await loadButtons()
      const btn = mod.createBackTopButton()

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
      const { mod } = await loadButtons()
      mod.createBackTopButton().callback({})
      expect(scrollState.animateCalls).toEqual([
        { selector: 'html', props: { scrollTop: 0 }, duration: 200 },
      ])
    })

    it('options 覆盖 icon/iconType/tooltip/className/page/enable', async () => {
      const { mod } = await loadButtons()
      const btn = mod.createBackTopButton({
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
      const { mod } = await loadButtons()
      const passed = vi.fn()
      const btn = mod.createBackTopButton({ callback: passed })

      btn.callback({ scrollContainer: 'html' })
      expect(passed).not.toHaveBeenCalled()
      expect(scrollState.animateCalls).toHaveLength(1)
    })
  })

  describe('createLikeButton', () => {
    it('默认字段正确，callback toast 推荐成功 + likePost', async () => {
      const { mod, toast, likePost } = await loadButtons()
      const btn = mod.createLikeButton()

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
      const { mod } = await loadButtons()
      const btn = mod.createLikeButton({
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
      const { mod, toast } = await loadButtons()
      const btn = mod.createFollowButton()

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
      const { mod } = await loadButtons()
      const btn = mod.createFollowButton({
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
      const { mod } = await loadButtons()
      const btn = mod.createFavoriteButton()

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
      const { mod } = await loadButtons()
      const btn = mod.createFavoriteButton({
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
      const { mod } = await loadButtons()
      const btn = mod.createCommentButton()

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
      const { mod } = await loadButtons()
      mod.createCommentButton().callback({})
      expect(scrollState.animateCalls).toEqual([
        { selector: 'html', props: { scrollTop: 9999 }, duration: 300 },
      ])
    })

    it('options 覆盖 icon/tooltip/className/page/enable', async () => {
      const { mod } = await loadButtons()
      const btn = mod.createCommentButton({
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
