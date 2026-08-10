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
  darkMode,
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
import './style/index.scss'

Object.values(import.meta.glob('./modules/**/*.js', { eager: true }))
  .filter((m) => typeof m.install === 'function')
  .forEach((i) => {
    i.install()
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
  .use(darkMode, { enable: true })
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
        {
          icon: 'fas fa-rocket rocket-rotate',
          iconType: 'className',
        },
        {
          enable: true,
          icon: 'fa-moon',
          iconType: 'className',
        },
        {
          icon: 'fa-thumbs-up',
          iconType: 'className',
        },
        {
          icon: 'fa-heart',
          iconType: 'className',
        },
        {
          icon: 'fa-star',
          iconType: 'className',
        },
        {
          icon: 'fa-comment-dots',
          iconType: 'className',
        },
      ],
    },
  )
