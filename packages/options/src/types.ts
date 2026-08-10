type CodeTheme = 'atomOneDark' | 'atomOneLight' | 'github'
type Page = 'all' | 'post' | 'index'
type Agent = 'desktop' | 'pad' | 'phone'
type Audio = Array<{
  name: string
  artist: string
  url: string
  cover: string
  lrc: string
}>
interface Lrc {
  enable: boolean
  type: 1 | 3
  color: string
}
interface Link {
  name: string
  link: string
}
interface ThemeOptions {
  name: string
  color: string
  avatar: string
  headerBackground: string
}
interface BackgroundOptions {
  enable: boolean
  value: string
  opacity: number
  repeat: boolean
}
interface BarragesOptions {
  enable: boolean
  opacity: number
  fontSize: string
  colors: string[]
  barrages: string[]
  indexBarrages: string[]
  postPageBarrages: string[]
}
interface CatalogOptions {
  enable: boolean
  position: 'left' | 'right'
}
interface ChartsOptions {
  enable: boolean
  labels: string[]
  datasets: Array<object>
}
interface ClickEffectsOptions {
  enable: boolean
  colors: string[]
  size: number
  maxCount: number
}
interface CodeCopyOptions {
  enable: boolean
}
interface CodeHighlightOptions {
  dark: CodeTheme
  light: CodeTheme
}
interface CodeLangOptions {
  enable: boolean
}
interface CodeLinenumbersOptions {
  enable: boolean
}
interface DonationOptions {
  enable: boolean
  qrcodes: string[]
}
interface EmojiOptions {
  enable: boolean
  buttonIcon: string
  emojiList: string[]
}
interface LinksOptions {
  enable: boolean
  value: Array<Link>
}
interface ImagePreviewOptions {
  enable: boolean
}
interface Live2dOptions {
  enable: boolean
}
interface LockScreenOptions {
  enable: boolean
  background: string
  strings: string[]
}
interface DarkModeOptions {
  enable: boolean
  darkDefault: boolean
  followSystem: boolean
}
interface MusicPlayerOptions {
  enable: boolean
  page: Page
  agent: Agent
  autoplay: boolean
  volume: number
  lrc: Lrc
  audio: Audio
}
interface NotationOptions {
  enable: boolean
}
interface NoticeOptions {
  enable: boolean
  contents: string[]
}
interface PostBottomImageOptions {
  enable: boolean
  img: string
  height: string
}
interface LicenseOptions {
  enable: boolean
  license: boolean
  licenseName: string
  licenseLink: string
  contents: string[]
}
interface PostTopImageOptions {
  enable: boolean
  fixed: boolean
  imgs: string[]
}
interface QrcodeOptions {
  enable: boolean
  img: string
  desc: string
}
interface SignatureOptions {
  enable: boolean
  contents: string[]
}
interface ToolsOptions {
  initialOpen: boolean
  mobileAutoClose: boolean
}
interface GithubOptions {
  enable: boolean
  color: string
  url: string
}
interface GiteeOptions {
  enable: boolean
  color: string
  url: string
}
interface PostListImageOptions {
  enable: boolean
  images: string[]
}
interface WebsiteTagOptions {
  enable: boolean
  title: string
  favicon: string
}
interface CodeTrafficLightOptions {
  enable: boolean
}
interface AboutOptions {
  enable: boolean
  bio: string
  tags: string[]
}
interface ItemGroupItem {
  title: string
  href: string
  lightIcon: string
  darkIcon?: string
}
interface ItemGroup {
  group: string
  items: ItemGroupItem[]
}
interface ItemGroupsOptions {
  enable: boolean
  groups: ItemGroup[]
}
type GenericGetFn<T> = (arg?: Partial<T>) => T
/**
 * 皮肤基本配置
 */
export type GetThemeOptions = GenericGetFn<ThemeOptions>
/**
 * 背景配置
 */
export type GetBackgroundOptions = GenericGetFn<BackgroundOptions>
/**
 * 弹幕配置
 */
export type GetBarragesOptions = GenericGetFn<BarragesOptions>
/**
 * 博文目录配置
 */
export type GetCatalogOptions = GenericGetFn<CatalogOptions>
/**
 * 图表配置
 */
export type GetChartsOptions = GenericGetFn<ChartsOptions>
/**
 * 点击特效配置
 */
export type GetClickEffectsOptions = GenericGetFn<ClickEffectsOptions>
/**
 * 代码块复制配置
 */
export type GetCodeCopyOptions = GenericGetFn<CodeCopyOptions>
/**
 * 代码块高亮皮肤配置
 */
export type GetCodeHighlightOptions = GenericGetFn<CodeHighlightOptions>
/**
 * 代码块语言配置
 */
export type GetCodeLangOptions = GenericGetFn<CodeLangOptions>
/**
 * 代码块行号配置
 */
export type GetCodeLinenumbersOptions = GenericGetFn<CodeLinenumbersOptions>
/**
 * 捐赠配置
 */
export type GetDonationOptions = GenericGetFn<DonationOptions>
/**
 * 表情输入配置
 */
export type GetEmojiOptions = GenericGetFn<EmojiOptions>
/**
 * 自定义链接配置
 */
export type GetLinksOptions = GenericGetFn<LinksOptions>
/**
 * 图片查看配置
 */
export type GetImagePreviewOptions = GenericGetFn<ImagePreviewOptions>
/**
 * live2d 配置
 */
export type GetLive2dOptions = GenericGetFn<Live2dOptions>
/**
 * 锁屏配置
 */
export type GetLockScreenOptions = GenericGetFn<LockScreenOptions>
/**
 * 深色模式配置
 */
export type GetDarkModeOptions = GenericGetFn<DarkModeOptions>
/**
 * 音乐播放器配置
 */
export type GetMusicPlayerOptions = GenericGetFn<MusicPlayerOptions>
/**
 * 笔注配置
 */
export type GetNotationOptions = GenericGetFn<NotationOptions>
/**
 * 公告配置
 */
export type GetNoticeOptions = GenericGetFn<NoticeOptions>
/**
 * 博文底部图片配置
 */
export type GetPostBottomImageOptions = GenericGetFn<PostBottomImageOptions>
/**
 * 版权配置
 */
export type GetLicenseOptions = GenericGetFn<LicenseOptions>
/**
 * 博文顶部图片配置
 */
export type GetPostTopImageOptions = GenericGetFn<PostTopImageOptions>
/**
 * 二维码配置
 */
export type GetQrcodeOptions = GenericGetFn<QrcodeOptions>
/**
 * 个性签名配置
 */
export type GetSignatureOptions = GenericGetFn<SignatureOptions>
/**
 * 工具栏配置
 */
export type GetToolsOptions = GenericGetFn<ToolsOptions>
/**
 * Github 配置
 */
export type GetGithubOptions = GenericGetFn<GithubOptions>
/**
 * Gitee 配置
 */
export type GetGiteeOptions = GenericGetFn<GiteeOptions>
/**
 * 博文列表图片配置
 */
export type GetPostListImageOptions = GenericGetFn<PostListImageOptions>
/**
 * 站点标签配置
 */
export type GetWebsiteTagOptions = GenericGetFn<WebsiteTagOptions>
/**
 * 代码块红绿灯
 */
export type GetCodeTrafficLightOptions = GenericGetFn<CodeTrafficLightOptions>
/**
 * 关于我配置
 */
export type GetAboutOptions = GenericGetFn<AboutOptions>
/**
 * 图标分组配置
 */
export type GetItemGroupsOptions = GenericGetFn<ItemGroupsOptions>
