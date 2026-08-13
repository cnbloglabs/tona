/**
 * 博客园页面注入的全局变量与 DOM 扩展。
 * 与仓库既有 TS 主题（themes/shadcn）的 global.d.ts 同一模式：
 * window 上由博客园/第三方脚本注入的属性在此声明，运行时行为不变。
 */
declare global {
  interface Window {
    /** 博客园当前博客标识（页面脚本注入） */
    currentBlogApp?: string
    /** 是否为博主 */
    isBlogOwner?: boolean
    /** 是否已登录 */
    isLogined?: boolean
    /** 博客园关注/取消关注 */
    follow?: (guid?: string) => void
    unfollow?: (guid?: string) => void
    /** 博客园收藏 */
    AddToWz?: () => void
    /** 博主 guid */
    cb_blogUserGuid?: string
    /** 高亮器（代码高亮插件注入） */
    highlighter?: {
      setTheme?: (theme: string) => void
    }
    /** 深色/浅色代码主题（codeHighlight 插件注入） */
    darkModeCodeHighlightTheme?: string
    codeHighlightTheme?: string
    /** 评论管理员（postMessage 插件注入） */
    blogCommentManager?: new () => {
      loadComments?: () => void
      renderComments?: (count: number) => void
    }
    /** 表情构建（emoji 插件注入） */
    buildEmojis?: (page?: string) => void
    /** 评论区头像渲染（commentsAvatars 插件注入） */
    renderCommentsAvatars?: () => void
    /** 图片预览（imagePreview 插件注入） */
    imagebox?: (images?: string[]) => void
    mediumZoom?: (selector: string, options?: Record<string, unknown>) => {
      on?: (event: string, handler: () => void) => void
      close?: () => void
      open?: () => void
    }
    /** 图表（Chart.js 注入） */
    Chart?: {
      defaults: Record<string, unknown>
    } & (new (
      ctx: HTMLElement | null,
      config: Record<string, unknown>,
    ) => unknown)
    /** 手绘标注（rough-notation 注入） */
    RoughNotation?: {
      annotate?: (
        el: Element | null,
        options?: Record<string, unknown>,
      ) => { remove?: () => void }
      annotationGroup?: (group: unknown[]) => { show: () => void }
    }
    /** 打字机（typed.js 注入） */
    Typed?: new (
      selector: string,
      options?: Record<string, unknown>,
    ) => { destroy: () => void }
    /** 音乐播放器（APlayer 注入） */
    APlayer?: new (options: Record<string, unknown>) => {
      audio: { currentTime: number }
      seek: (time: number) => void
      play: () => void
      on: (event: string, handler: () => void) => void
    }
  }

  /** 打字机（typed.js 注入，页面级全局变量） */
  var Typed: new (
    selector: string,
    options?: Record<string, unknown>,
  ) => { destroy: () => void }

  /** 音乐播放器（APlayer 注入，页面级全局变量） */
  var APlayer: new (options: Record<string, unknown>) => {
    audio: { currentTime: number }
    seek: (time: number) => void
    play: () => void
    on: (event: string, handler: () => void) => void
  }

  /** live2d 加载器（live2d.min.js 注入，页面级全局变量） */
  var loadlive2d: (id: string, url: string) => void

  interface Storage {
    /** 深色模式（darkMode 插件持久化） */
    modeType?: string
    /** 音乐播放进度/状态（musicPlayer 插件持久化） */
    audioTime?: string
    playerState?: string
  }
}

export {}
