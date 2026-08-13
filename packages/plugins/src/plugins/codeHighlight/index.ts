import { getCodeHighlightOptions } from 'tona-options'
import type { CodeHighlightOptions, Theme } from '../../types'
import { getCurrentPage, isMd } from '../../utils/cnblog'
import { themes } from './themes'

/**
 * 构建 Markdown 代码块高亮
 * @param {*} light
 * @param {*} dark
 */
function buildMarkdownHighlight(light: string, dark: string) {
  let style
  if (!isMd()) {
    style = `<style>
        :root{${themes.github}}
        </style>`
  } else {
    style = `<style>
              :root{${themes[light as keyof typeof themes]}}
              :root[theme="dark"]{${themes[dark as keyof typeof themes]}}
            </style>`
  }
  $('head').append(style)
}

export function codeHighlight(_: Theme, devOptions?: CodeHighlightOptions) {
  if (getCurrentPage() !== 'post') {
    return
  }
  if ($('pre').length === 0) {
    return
  }

  const { light, dark } = getCodeHighlightOptions(devOptions)
  buildMarkdownHighlight(light, dark)
}
