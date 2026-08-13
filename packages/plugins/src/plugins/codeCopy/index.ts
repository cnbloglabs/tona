/**
 * 构建代码块复制按钮
 */
import { getCodeCopyOptions } from 'tona-options'
import type { CodeCopyOptions, Theme } from '../../types'
import { isMd, isPostDetailsPage } from '../../utils/cnblog'
import { copyToClipboard } from '../../utils/helpers'
import { toast } from '../toast'

/**
 * 创建复制按钮
 */
function createCopyButtons() {
  return '<div class="copy-btns">复制代码</div>'
}

/**
 * 将代码复制到剪切板
 * @param {string} code - 代码字符串
 */
function handleCopyCode(code: string, btn: JQuery<HTMLElement>) {
  copyToClipboard(code)
    .then(() => {
      toast('复制成功')
      btn.text('复制成功')
      setTimeout(() => {
        btn.text('复制代码')
      }, 1500)
    })
    .catch(() => {
      btn.text('复制失败')
    })
}

/**
 * 处理复制按钮点击事件
 */
function handleClickCopyButton() {
  const __MD__ = isMd()
  const position = __MD__ ? 'pre' : '.cnblogs_code'
  const selector = `${position},.cnblogs_Highlighter`

  $(selector).on('click', '.copy-btns', function () {
    let code: string

    if ($(this).parent().hasClass('cnblogs_Highlighter')) {
      code = $(this).siblings().find('code').text()
    } else {
      const codeBlockTagName = __MD__ ? 'code' : 'pre'
      code = $(this).siblings(codeBlockTagName).text()
    }

    handleCopyCode(code, $(this))
  })
}

/**
 * 在代码块挂载复制按钮
 */
function mountButtons() {
  const __MD__ = isMd()
  const copyBtn = createCopyButtons()
  const pres = $('#cnblogs_post_body').find('pre')

  if (pres.length) {
    const fn: 'prepend' | 'before' = __MD__ ? 'prepend' : 'before'
    pres.each((_, item) => {
      $(item)[fn](copyBtn)
    })
  }

  if (!__MD__) {
    const highlighters = $('.cnblogs_Highlighter')
    if (!highlighters.length) {
      return
    }
    highlighters.each((_, item) => {
      $(item).prepend(copyBtn)
    })
  }
}

export function codeCopy(_: Theme, devOptions?: CodeCopyOptions) {
  const { enable } = getCodeCopyOptions(devOptions)

  if (!enable) {
    return
  }
  if (!isPostDetailsPage()) {
    return
  }

  mountButtons()
  handleClickCopyButton()
}
