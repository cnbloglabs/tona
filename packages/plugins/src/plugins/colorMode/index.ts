/**
 * 设置皮肤色
 * 需要皮肤使用相关 css 自定义属性
 */
import { getThemeOptions } from 'tona-options'
import type { ColorModeOptions, Theme } from '../../types'
import { randomColor } from '../../utils/helpers'

/**
 * 将 16 进制颜色转成 rgb 或 rgba
 * @param {string} hex
 * @param {number} opacity
 */
function hexToRgba(hex: string, opacity?: number | null) {
  if (!hex) {
    return
  }

  // Check if already an RGB value
  if (/^rgb\(/i.test(hex)) {
    return hex
  }

  // Use explicit character ranges for better clarity
  const hexReg = /^#(?:[0-9A-F]{3}|[0-9A-F]{6})$/i
  if (!hexReg.test(hex)) {
    return hex
  }

  // Remove the # and handle 3-digit hex shorthand
  let hexValue = hex.slice(1)
  if (hexValue.length === 3) {
    hexValue = hexValue
      .split('')
      .map((char) => char + char)
      .join('')
  }

  const red = Number.parseInt(hexValue.slice(0, 2), 16)
  const green = Number.parseInt(hexValue.slice(2, 4), 16)
  const blue = Number.parseInt(hexValue.slice(4, 6), 16)

  if (opacity === undefined || opacity === null) {
    return `rgb(${red},${green},${blue})`
  }

  return `rgba(${red},${green},${blue},${opacity})`
}

/**
 * 获取皮肤色
 * @param {*} color
 */
function buildMainColor(color: string) {
  const mainColor = color === 'random' ? randomColor('rgba') : color
  return mainColor
}

/**
 * 插入 css 变量
 * @param {*} color
 */
function insertStyle(color: string) {
  const primary = buildMainColor(color)
  const primary8 = hexToRgba(primary, 0.85)
  const primary4 = hexToRgba(primary, 0.4)
  const primary2 = hexToRgba(primary, 0.2)

  $('head').append(
    `<style class="themeColor">:root{
            --themeColor: ${primary};
            --theme-primary-8: ${primary8};
            --theme-primary-4: ${primary4};
            --theme-primary-2: ${primary2};
        </style>`,
  )
}

export function colorMode(_: Theme, devOptions?: ColorModeOptions) {
  const { color } = getThemeOptions(devOptions)
  insertStyle(color)
}
