import { defineOptions } from 'tona'
import type {
  GetAboutOptions,
  GetBackgroundOptions,
  GetBarragesOptions,
  GetCatalogOptions,
  GetChartsOptions,
  GetClickEffectsOptions,
  GetCodeCopyOptions,
  GetCodeHighlightOptions,
  GetCodeLangOptions,
  GetCodeLinenumbersOptions,
  GetCodeTrafficLightOptions,
  GetDarkModeOptions,
  GetDonationOptions,
  GetEmojiOptions,
  GetGiteeOptions,
  GetGithubOptions,
  GetImagePreviewOptions,
  GetItemGroupsOptions,
  GetLicenseOptions,
  GetLinksOptions,
  GetLive2dOptions,
  GetLockScreenOptions,
  GetMusicPlayerOptions,
  GetNotationOptions,
  GetNoticeOptions,
  GetPostBottomImageOptions,
  GetPostListImageOptions,
  GetPostTopImageOptions,
  GetQrcodeOptions,
  GetSignatureOptions,
  GetThemeOptions,
  GetToolsOptions,
  GetWebsiteTagOptions,
} from './types'

export const getThemeOptions: GetThemeOptions = defineOptions('theme', {
  name: 'reacg',
  color: '#FFB3CC',
  avatar: '',
  headerBackground: '',
})
export const getBackgroundOptions: GetBackgroundOptions = defineOptions(
  'bodyBackground',
  {
    enable: false,
    value: '',
    opacity: 0.85,
    repeat: false,
  },
)
export const getBarragesOptions: GetBarragesOptions = defineOptions(
  'barrages',
  {
    enable: false,
    opacity: 0.6,
    fontSize: '20px',
    colors: [],
    barrages: [],
    indexBarrages: [],
    postPageBarrages: [],
  },
)
export const getCatalogOptions: GetCatalogOptions = defineOptions('catalog', {
  enable: false,
  position: 'left',
})
export const getChartsOptions: GetChartsOptions = defineOptions(
  ['chart', 'charts'],
  {
    enable: false,
    labels: ['Vue', 'React', 'Flutter', 'Java', 'NodeJs', 'TypeScript', 'CSS'],
    datasets: [
      {
        label: 'My First Chart',
        data: [65, 59, 90, 81, 56, 55, 40],
        fill: true,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgb(255, 99, 132)',
        pointBackgroundColor: 'rgb(255, 99, 132)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(255, 99, 132)',
      },
      {
        label: 'My Second Dataset',
        data: [28, 48, 40, 19, 96, 27, 100],
        fill: true,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        pointBackgroundColor: 'rgb(54, 162, 235)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(54, 162, 235)',
      },
    ],
  },
)
export const getClickEffectsOptions: GetClickEffectsOptions = defineOptions(
  ['clickEffects', 'click'],
  {
    enable: false,
    colors: [],
    size: 30,
    maxCount: 10,
  },
)
export const getCodeCopyOptions: GetCodeCopyOptions = defineOptions(
  'codeCopy',
  {
    enable: false,
  },
)
export const getCodeHighlightOptions: GetCodeHighlightOptions = defineOptions(
  ['codeHighlight', 'highLight'],
  {
    dark: 'atomOneDark',
    light: 'atomOneLight',
  },
)
export const getCodeLangOptions: GetCodeLangOptions = defineOptions(
  'codeLang',
  {
    enable: false,
  },
)
export const getCodeLinenumbersOptions: GetCodeLinenumbersOptions =
  defineOptions(['codeLinenumbers', 'lineNumbers', 'codeLineNumbers'], {
    enable: false,
  })
export const getCodeTrafficLightOptions: GetCodeTrafficLightOptions =
  defineOptions('codeTrafficLight', {
    enable: false,
  })
export const getDonationOptions: GetDonationOptions = defineOptions(
  'donation',
  {
    enable: false,
    qrcodes: [],
  },
)
export const getEmojiOptions: GetEmojiOptions = defineOptions('emoji', {
  enable: false,
  buttonIcon: '',
  emojiList: [],
})
export const getLinksOptions: GetLinksOptions = defineOptions('links', {
  enable: false,
  value: [],
})
export const getImagePreviewOptions: GetImagePreviewOptions = defineOptions(
  ['imagePreview', 'imagebox'],
  {
    enable: false,
  },
)
export const getLive2dOptions: GetLive2dOptions = defineOptions('live2d', {
  enable: false,
  page: 'all',
  agent: 'pc',
  model: 'haru-01',
  width: 150,
  height: 200,
  position: 'left',
  gap: 'default',
  mute: false,
})
export const getLockScreenOptions: GetLockScreenOptions = defineOptions(
  'lock',
  {
    enable: false,
    background: '',
    strings: [],
  },
)
export const getDarkModeOptions: GetDarkModeOptions = defineOptions(
  ['mode', 'darkMode'],
  {
    enable: false,
    darkDefault: false,
    autoDark: false,
    autoLight: false,
  },
)
export const getMusicPlayerOptions: GetMusicPlayerOptions = defineOptions(
  'musicPlayer',
  {
    enable: false,
    page: 'all',
    agent: 'pc',
    autoplay: false,
    volume: 0.4,
    lrc: {
      enable: false, // 启用歌词
      type: 1, // 1 -> 字符串歌词 3 -> url 歌词
      color: '', // 颜色
    },
    audio: [
      {
        name: '',
        artist: '',
        url: '',
        cover: '',
        lrc: '',
      },
    ],
  },
)
export const getNotationOptions: GetNotationOptions = defineOptions(
  'notation',
  {
    enable: false,
  },
)
export const getNoticeOptions: GetNoticeOptions = defineOptions('notice', {
  enable: false,
  contents: [],
})
export const getPostBottomImageOptions: GetPostBottomImageOptions =
  defineOptions('postBottomImage', {
    enable: false,
    img: '',
    height: '',
  })
export const getLicenseOptions: GetLicenseOptions = defineOptions(
  ['license', 'postSignature'],
  {
    enable: false,
    license: true,
    licenseName: '',
    licenseLink: '',
    contents: [],
  },
)
export const getPostTopImageOptions: GetPostTopImageOptions = defineOptions(
  'postTopImage',
  {
    enable: false,
    fixed: false,
    imgs: [],
  },
)
export const getQrcodeOptions: GetQrcodeOptions = defineOptions('qrcode', {
  enable: false,
  img: '',
  desc: '',
})
export const getSignatureOptions: GetSignatureOptions = defineOptions(
  'signature',
  {
    enable: false,
    contents: [],
  },
)
export const getToolsOptions: GetToolsOptions = defineOptions('tools', {
  initialOpen: true,
  mobileAutoClose: true,
})
export const getGithubOptions: GetGithubOptions = defineOptions('github', {
  enable: false,
  color: '#ffb3cc',
  url: '',
})
export const getGiteeOptions: GetGiteeOptions = defineOptions('gitee', {
  enable: false,
  color: '#ffb3cc',
  url: '',
})
export const getPostListImageOptions: GetPostListImageOptions = defineOptions(
  'postListImage',
  {
    enable: false,
    images: [],
  },
)
export const getWebsiteTagOptions: GetWebsiteTagOptions = defineOptions(
  ['webTag', 'tab'],
  {
    enable: false,
    title: '',
    favicon: '',
  },
)
export const getAboutOptions: GetAboutOptions = defineOptions('about', {
  enable: false,
  bio: '',
  tags: [],
})
export const getItemGroupsOptions: GetItemGroupsOptions = defineOptions(
  'itemGroups',
  {
    enable: false,
    groups: [],
  },
)
