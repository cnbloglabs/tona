/**
 * tona-plugins 对外类型契约（TS 迁移后由源码生成声明文件）。
 *
 * 命名与 tona-options 保持一致（选项形状同源，仅缺省为可选——devOptions
 * 本就是部分配置）；`Theme` 直接取自核心包 `tona`。
 */
import type { Theme } from 'tona'

export type { Theme }

/** 页面类型（博客园页面判定） */
export type Page = 'all' | 'post' | 'index'

/** 图标渲染方式 */
export type IconType = 'html' | 'className'

/** 深色模式三态 */
export type Mode = 'dark' | 'light' | 'system'

/** 头像链接 */
export interface Link {
  name: string
  link: string
}

/** 音频列表项 */
export interface AudioItem {
  name: string
  artist: string
  url: string
  cover: string
  lrc: string
}

/** 歌词配置 */
export interface Lrc {
  enable: boolean
  type: 1 | 3
  color: string
}

export interface BackgroundOptions {
  enable?: boolean
  value?: string
  opacity?: number
  repeat?: boolean
  /** 背景透明度作用的选择器 */
  opacitySelector?: string
}

export interface BarrageOptions {
  enable?: boolean
  opacity?: number
  fontSize?: string
  colors?: string[]
  barrages?: string[]
  indexBarrages?: string[]
  postPageBarrages?: string[]
}

export interface CatalogOptions {
  enable?: boolean
  position?: 'left' | 'right'
}

export interface CatalogPluginOptions {
  mountedNode?: string
  /** 插入方式：after / append / before / prepend */
  fn?: 'after' | 'append' | 'before' | 'prepend'
  scrollContainer?: string
  updateNavigation?: boolean
  showTitle?: boolean
  showScrollbar?: boolean
}

export interface ChartsOptions {
  enable?: boolean
  labels?: string[]
  datasets?: Array<Record<string, unknown>>
}

export interface ChartsPluginOptions {
  mountedNode?: string
}

export interface ClickEffectsOptions {
  enable?: boolean
  colors?: string[]
  size?: number
  maxCount?: number
}

export interface CodeCopyOptions {
  enable?: boolean
}

export interface CodeHighlightOptions {
  dark?: 'atomOneDark' | 'atomOneLight' | 'github'
  light?: 'atomOneDark' | 'atomOneLight' | 'github'
}

export interface CodeLangOptions {
  enable?: boolean
}

export interface CodeLinenumbersOptions {
  enable?: boolean
}

export interface CodeTrafficLightOptions {
  enable?: boolean
}

export interface ColorModeOptions {
  name?: string
  color?: string
  avatar?: string
  headerBackground?: string
}

export interface DarkModeOptions {
  enable?: boolean
  darkDefault?: boolean
  followSystem?: boolean
  /** 三态图标映射（深色/浅色/跟随系统） */
  icons?: Partial<Record<Mode, string>>
  /** 三态 tooltip 映射 */
  tooltips?: Partial<Record<Mode, string>>
  iconType?: IconType
}

export interface DonationOptions {
  enable?: boolean
  qrcodes?: string[]
}

export interface EmojiOptions {
  enable?: boolean
  buttonIcon?: string
  emojiList?: string[]
}

export interface FooterOptions {
  enable?: boolean
  value?: Link[]
}

export interface ImagePreviewOptions {
  enable?: boolean
}

export interface LicenseOptions {
  enable?: boolean
  license?: boolean
  licenseName?: string
  licenseLink?: string
  contents?: string[]
}

export interface Live2dOptions {
  enable?: boolean
  page?: Page
  agent?: 'pc' | 'phone' | 'all'
  model?: string
  width?: number
  height?: number
  position?: 'left' | 'right'
  gap?: string
  mute?: boolean
}

export interface LockOptions {
  enable?: boolean
  background?: string
  strings?: string[]
}

export interface MusicPlayerOptions {
  enable?: boolean
  page?: Page
  agent?: 'desktop' | 'pad' | 'phone'
  autoplay?: boolean
  volume?: number
  lrc?: Lrc
  audio?: AudioItem[]
}

export interface NotationOptions {
  enable?: boolean
}

export interface NoticeOptions {
  enable?: boolean
  contents?: string[]
}

export interface PostBottomImageOptions {
  enable?: boolean
  img?: string
  height?: string
}

export interface PostTopImageOptions {
  enable?: boolean
  fixed?: boolean
  imgs?: string[]
}

export interface QrcodeOptions {
  enable?: boolean
  img?: string
  desc?: string
}

export interface SignatureOptions {
  enable?: boolean
  contents?: string[]
}

export interface SignaturePluginOptions {
  selector?: string
}

export interface WebTagOptions {
  enable?: boolean
  title?: string
  favicon?: string
}

export interface ToolsOptions {
  enable?: boolean
  initialOpen?: boolean
  mobileAutoClose?: boolean
}

/** tools 插件第三个参数（主题侧配置） */
export interface ToolsPluginOptions {
  /** 滚动容器选择器（按钮滚动行为使用） */
  scrollContainer?: string
  menuIconType?: IconType
  menuIcon?: string
  menuActiveIcon?: string
  toolbarItems?: ToolbarItem[]
}

/** 工具栏按钮基础字段（按钮工厂 options 与产物共有形状） */
export interface ToolbarButtonOptions {
  enable?: boolean
  page?: Page
  icon?: string
  iconType?: IconType
  tooltip?: string
  className?: string
}

/** 深色模式按钮工厂 options（额外支持三态映射与初始模式） */
export interface DarkModeButtonOptions extends ToolbarButtonOptions {
  icons?: Partial<Record<Mode, string>>
  tooltips?: Partial<Record<Mode, string>>
  darkDefault?: boolean
  followSystem?: boolean
}

export type BackTopButtonOptions = ToolbarButtonOptions
export type LikeButtonOptions = ToolbarButtonOptions
export type FollowButtonOptions = ToolbarButtonOptions
export type FavoriteButtonOptions = ToolbarButtonOptions
export type CommentButtonOptions = ToolbarButtonOptions

/** 工具栏按钮产物（createXxxButton 返回值） */
export interface ToolbarItem {
  enable: boolean
  page: Page
  icon: string
  iconType: IconType
  tooltip: string
  className?: string
  /** 按钮渲染后初始化（tools 插件在 append 后调用） */
  setup?: (theme: Theme, pluginOptions: ToolsPluginOptions) => void
  /** 点击行为（tools 插件绑定，透传 jquery 事件） */
  callback: (pluginOptions: ToolsPluginOptions, event?: JQuery.TriggeredEvent) => void
}
