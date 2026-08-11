import { createTheme } from 'tona'
import {
  clickEffects,
  codeHighlight,
  codeLinenumbers,
  codeTrafficLight,
  createBackTopButton,
  createCommentButton,
  createDarkModeButton,
  createFavoriteButton,
  createFollowButton,
  createLikeButton,
  donation,
  emoji,
  license,
  tools,
} from '../src/index'
import './index.css'

const theme = createTheme()

theme
  .use(clickEffects, { enable: true })
  .use(emoji, { enable: true })
  .use(license, { enable: true })
  .use(codeTrafficLight, { enable: true })
  .use(codeHighlight, { enable: true })
  .use(codeLinenumbers, { enable: true })
  .use(donation, {
    enable: true,
    qrcodes: [
      'https://www.cnblogs.com/images/logo.svg?v=R9M0WmLAIPVydmdzE2keuvnjl-bPR7_35oHqtiBzGsM',
    ],
  })
  .use(
    tools,
    { enable: true },
    {
      menuIconType: 'className',
      menuIcon: 'fa-angle-up',
      menuActiveIcon: 'fa-angle-down',
      scrollContainer: 'html',
      toolbarItems: [
        // 数组顺序 = 视觉顺序：第一项在顶部、最后一项最靠近 toggle
        createBackTopButton({
          icon: 'fa-rocket rocket-rotate',
          iconType: 'className',
        }),
        // darkMode 按钮自包含（默认三态图标：深色 fa-moon / 浅色 fa-sun / 跟随系统 fa-adjust）
        createDarkModeButton({ iconType: 'className' }),
        createLikeButton({ icon: 'fa-thumbs-up', iconType: 'className' }),
        createFollowButton({ icon: 'fa-heart', iconType: 'className' }),
        createFavoriteButton({ icon: 'fa-star', iconType: 'className' }),
        createCommentButton({
          icon: 'fa-comment-dots',
          iconType: 'className',
        }),
      ],
    },
  )
