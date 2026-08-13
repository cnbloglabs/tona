import { createTheme } from 'tona'
import {
  colorMode,
  commentsAvatars,
  codeCopy,
  codeHighlight,
  codeLinenumbers,
  createBackTopButton,
  createCommentButton,
  createFavoriteButton,
  createFollowButton,
  createLikeButton,
  donation,
  emoji,
  footer,
  imagePreview,
  license,
  musicPlayer,
  notice,
  postMessage,
  signature,
  tools,
} from 'tona-plugins'
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
  .use(colorMode, { enable: true })
  .use(footer, { enable: true })
  .use(codeHighlight, { enable: true })
  .use(codeCopy, { enable: true })
  .use(codeLinenumbers, { enable: true })
  .use(imagePreview, { enable: true })
  .use(donation, { enable: true })
  .use(emoji, { enable: true })
  .use(musicPlayer, { enable: true })
  .use(postMessage, { enable: true })
  .use(license, { enable: true })
  .use(notice, { enable: true })
  .use(signature, { enable: true })
  .use(commentsAvatars, { enable: true })
  .use(
    tools,
    { enable: true },
    {
      toolbarItems: [
        createBackTopButton(),
        createLikeButton(),
        createFollowButton(),
        createFavoriteButton(),
        createCommentButton(),
      ],
    },
  )
