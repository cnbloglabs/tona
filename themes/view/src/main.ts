import { createTheme } from 'tona'
import {
  catalog,
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
  footer,
  imagePreview,
  license,
  tools,
} from 'tona-plugins'
import './style/index.scss'
import { isPostDetailsPage } from './utils/cnblog'

if (!isPostDetailsPage()) {
  $('#mainContent')[0].style.display = 'block'
}

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
  .use(footer, { enable: true })
  .use(emoji, { enable: true })
  .use(imagePreview, { enable: true })
  .use(codeCopy, { enable: true })
  .use(codeLang, { enable: true })
  .use(codeLinenumbers, { enable: true })
  .use(license, { enable: true })
  .use(commentsAvatars, { enable: true })
  .use(codeHighlight, { enable: true })
  .use(
    tools,
    { enable: true, initialOpen: false },
    {
      toolbarItems: [
        // 数组顺序 = 视觉顺序（第一项顶部、最后一项最靠近 toggle）：
        // 与原 view 配置（comment-dots…rocket）一致，勿翻转
        createCommentButton({ icon: 'fa-comment-dots', iconType: 'className' }),
        createFavoriteButton({ icon: 'fa-star', iconType: 'className' }),
        createFollowButton({ icon: 'fa-heart', iconType: 'className' }),
        createLikeButton({ icon: 'fa-thumbs-up', iconType: 'className' }),
        // darkMode 按钮用默认三态图标（深色 fa-moon / 浅色 fa-sun / 跟随系统 fa-adjust）
        createDarkModeButton({ iconType: 'className' }),
        createBackTopButton({ icon: 'fa-rocket', iconType: 'className' }),
      ],
    },
  )
  .use(colorMode, { enable: true, color: '#323EBE' })
  .use(
    catalog,
    { enable: true },
    {
      mountedNode: '#mainContent',
      fn: 'append',
      updateNavigation: true,
      showTitle: false,
      showScrollbar: false,
    },
  )
