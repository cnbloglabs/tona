/**
 * 构建代码块语言
 * 仅在 Markdown 博文中生效
 */
import { getCodeLangOptions } from 'tona-options'
import type { CodeLangOptions, Theme } from '../../types'
import { isMd, isPostDetailsPage } from '../../utils/cnblog'

/**
 * 创建代码语言容器
 */
function createCodeLangContainer(lang: string) {
  return $('<div>').addClass('awes-lang').text(lang)
}

/**
 * 构建代码块语言
 */
function buildCodeWrapLanguage() {
  $('pre code').each(function () {
    let lang = $(this)[0].classList[0]
    if (lang !== undefined) {
      lang = lang.substring(9)

      if (lang === '') {
        lang = $(this)[0].classList[1]
        if (lang === undefined || lang === '') {
          return
        }
      }

      const container = createCodeLangContainer(lang)
      $(this).before(container)
    }
  })
}

export function codeLang(_: Theme, devOptions?: CodeLangOptions) {
  const { enable } = getCodeLangOptions(devOptions)

  if (!enable) {
    return
  }
  if (!isPostDetailsPage()) {
    return
  }
  if (!isMd()) {
    return
  }

  buildCodeWrapLanguage()
}
