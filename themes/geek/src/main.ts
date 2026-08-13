import { createTheme } from 'tona'
import {
  background,
  catalog,
  clickEffects,
  codeCopy,
  codeHighlight,
  codeLang,
  codeLinenumbers,
  colorMode,
  commentsAvatars,
  createBackTopButton,
  createCommentButton,
  createDarkModeButton,
  createFavoriteButton,
  createFollowButton,
  createLikeButton,
  emoji,
  imagePreview,
  license,
  live2d,
  musicPlayer,
  notice,
  postMessage,
  signature,
  tools,
  webTag,
} from 'tona-plugins'
import { createSidebarToggleToolbarItem } from './modules/sidebar-toggle'
import './style/index.scss'

Object.values(
  import.meta.glob<{ install?: () => void }>('./modules/**/*.ts', {
    eager: true,
  }),
)
  .filter((m) => typeof m.install === 'function')
  .forEach((i) => {
    i.install!()
  })

createTheme()
  .use(clickEffects, { enable: false })
  .use(codeCopy, { enable: true })
  .use(codeHighlight, { enable: true })
  .use(codeLang, { enable: true })
  .use(codeLinenumbers, { enable: true })
  .use(commentsAvatars, { enable: true })
  .use(colorMode, { enable: true, color: '#2F63FF' })
  .use(emoji, { enable: true })
  .use(imagePreview, { enable: true })
  .use(license, { enable: true })
  .use(webTag, { enable: true })
  .use(musicPlayer, { enable: false })
  .use(live2d, { enable: false })
  .use(notice, { enable: false })
  .use(postMessage, { enable: true })
  .use(
    signature,
    {
      enable: true,
      contents: [
        '欢迎使用皮肤 <b style="color:#3742fa">Geek</b>',
        '快去自定义签名吧~',
      ],
    },
    { selector: '.profile-signature' },
  )
  .use(
    background,
    { enable: false },
    {
      opacitySelector:
        '#left-side,#sideBar,#mainContent,#footer,.custom-searchbar',
    },
  )
  .use(
    catalog,
    { enable: true },
    {
      mountedNode: '.account',
      fn: 'after',
      scrollContainer: '#mainContent',
    },
  )
  .use(
    tools,
    { enable: true },
    {
      menuIconType: 'className',
      menuIcon: 'fa-angle-up',
      menuActiveIcon: 'fa-angle-down',
      scrollContainer: '#mainContent',
      toolbarItems: [
        // 数组顺序 = 视觉顺序：第一项在顶部、最后一项最靠近 toggle
        createBackTopButton({
          icon: 'fas fa-rocket rocket-rotate',
          iconType: 'className',
        }),
        // darkMode 按钮用默认三态图标（深色 fa-moon / 浅色 fa-sun / 跟随系统 fa-adjust）
        createDarkModeButton({ iconType: 'className' }),
        createLikeButton({ icon: 'fa-thumbs-up', iconType: 'className' }),
        createFollowButton({ icon: 'fa-heart', iconType: 'className' }),
        createFavoriteButton({ icon: 'fa-star', iconType: 'className' }),
        createCommentButton({ icon: 'fa-comment-dots', iconType: 'className' }),
        createSidebarToggleToolbarItem(),
      ],
    },
  )
