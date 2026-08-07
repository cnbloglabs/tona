import { createTheme } from 'tona'
import {
  catalog,
  codeCopy,
  codeHighlight,
  codeLang,
  codeLinenumbers,
  colorMode,
  commentsAvatars,
  darkMode,
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

Object.values(import.meta.glob('./modules/**/*.js', { eager: true })).forEach(
  (i) => {
    i.install()
  },
)

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
        {
          icon: 'fa-comment-dots',
          iconType: 'className',
        },
        {
          icon: 'fa-star',
          iconType: 'className',
        },
        {
          icon: 'fa-heart',
          iconType: 'className',
        },
        {
          icon: 'fa-thumbs-up',
          iconType: 'className',
        },
        {
          enable: true,
          icon: 'fa-adjust',
          iconType: 'className',
        },
        {
          icon: 'fa-rocket',
          iconType: 'className',
        },
      ],
    },
  )
  .use(darkMode, { enable: true })
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
