// 设置网站图标和标题
import { getWebsiteTagOptions } from 'tona-options'
import type { Theme, WebTagOptions } from '../../types'

/**
 * 构建网页标题
 * @param {*} title
 */
function setTitle(title: string) {
  if (title === '') {
    return
  }
  document.title = title
}

/**
 * 构建网页 favicon
 * @param {*} favicon
 */
function setFavicon(favicon: string) {
  if (favicon === '') {
    return
  }
  const el = document.getElementById('favicon')
  if (el === null) {
    $('title').after(
      `<link id="favicon" rel="shortcut icon" href="${favicon}" type="image/svg+xml">`,
    )
  } else {
    ;(el as HTMLLinkElement).href = favicon
  }
}

export function webTag(_: Theme, devOptions?: WebTagOptions) {
  const { enable, title, favicon } = getWebsiteTagOptions(devOptions)
  if (!enable) {
    return
  }
  setTitle(title)
  setFavicon(favicon)
}
