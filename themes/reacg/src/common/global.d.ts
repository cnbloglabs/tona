/**
 * 博客园页面注入的全局变量（页面脚本注入，运行时行为不变）。
 * 与 plugins 包 global.d.ts 同模式；主题侧仅声明本主题用到的属性。
 */
declare global {
  interface Window {
    /** 当前使用的博客园官方皮肤名称 */
    skinName?: string
    /** 访客 id */
    visitorUserId?: string
    /** blog id */
    currentBlogId?: string
    /** 博客园当前博客标识 */
    currentBlogApp?: string
    /** 是否为博主 */
    isBlogOwner?: boolean
    /** 是否已登录 */
    isLogined?: boolean
    /** 博主 guid */
    cb_blogUserGuid?: string
    /** 博客园关注/取消关注 */
    follow?: (guid?: string) => void
    unfollow?: (guid?: string) => void
  }
}

export {}
