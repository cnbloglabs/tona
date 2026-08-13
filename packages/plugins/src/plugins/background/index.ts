import { getBackgroundOptions } from 'tona-options'
import type { BackgroundOptions, Theme } from '../../types'
import { isUrl, userAgent } from '../../utils/helpers'

/**
 * 设置透明度
 * @param {number} opacity 透明度
 */
function setOpacity(opacity: number, opacitySelector: string) {
  $(opacitySelector).css('opacity', `${opacity}`)
}

/**
 * 设置背景
 * @param {string} value
 * @param {boolean} repeat 是否重复图片
 */
function setBackground(value: string, repeat: boolean) {
  const type = isUrl(value) ? 'img' : 'color'
  // const type =   new RegExp('http').test(value) ? 'img' : 'color'
  if (type === 'color') {
    $('body').css('background-color', `${value}`)
  }
  if (type === 'img') {
    $('body').css('background-image', `url(${value})`)
    if (!repeat) {
      $('body').css({
        'background-repeat': 'no-repeat',
        'background-size': '100% 100%',
        'background-attachment': 'fixed',
      })
      if (userAgent() === 'phone') {
        $('body').css('background-size', 'cover')
      }
    }
  }
}

export function background(
  _: Theme,
  devOptions?: BackgroundOptions,
  pluginOptions?: BackgroundOptions,
) {
  const { enable, opacity, value, repeat } = getBackgroundOptions(devOptions)

  if (!enable) return

  const { opacitySelector } = {
    opacitySelector: '#main,#navigator',
    ...pluginOptions,
  }

  setBackground(value, repeat)
  setOpacity(opacity, opacitySelector)
}
