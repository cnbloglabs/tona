// 弹幕
import { getBarragesOptions } from 'tona-options'
import type { BarrageOptions, Theme } from '../../types'
import {
  getClientRect,
  randomColor,
  randomNum,
  sleep,
} from '../../utils/helpers'

/**
 * @description 发送弹幕
 * @param {Array} textList 弹幕列表
 */
async function shootBarrage(
  textList: string[],
  enable: boolean,
  opacity: number,
  colors: string[],
  fontSize: string,
) {
  if (!enable) {
    return
  }
  if (!document.querySelector('#barrage-wrap')) {
    $('body').append("<div id='barrage-wrap'></div>")
  }

  const $wrap = document.querySelector('#barrage-wrap')!
  const rect = getClientRect($wrap)
  const wrapWidth = rect.right - rect.left
  const wrapHeight = rect.bottom - rect.top

  const defaultColors = [
    '#FE0302',
    '#FF7204',
    '#FFAA02',
    '#FFD302',
    '#FFFF00',
    '#A0EE00',
    '#00CD00',
    '#019899',
    '#4266BE',
    '#89D5FF',
    '#CC0273',
    '#CC0273',
  ]

  for (let i = 0; i < textList.length; i++) {
    const text = textList[i]
    const $barrage = document.createElement('span')
    const barrageStyle = `left: ${wrapWidth}px;top: ${randomNum(
      wrapHeight - 30,
      1,
    )}px;color: ${randomColor(
      colors.length ? colors : defaultColors,
    )};opacity: ${opacity};font-size: ${fontSize};`

    $barrage.style.cssText = barrageStyle
    $barrage.textContent = text
    $wrap.appendChild($barrage)

    interface RollFn {
      (timer: number): void
      last?: number
      timer?: number
    }

    const roll = ((timer: number) => {
      const now = Date.now()
      const rect = getClientRect($barrage)
      let left = $barrage.offsetLeft

      roll.last = roll.last || now
      roll.timer = roll.timer || timer

      if (left < rect.left - rect.right) {
        $($barrage).remove()
      } else {
        if (now - roll.last >= roll.timer) {
          roll.last = now
          left -= 3
          $barrage.style.left = `${left}px`
        }
        window.requestAnimationFrame(roll)
      }
    }) as RollFn

    roll(randomNum(30, 1))

    await sleep(1000)
  }
}

export function barrage(_: Theme, devOptions?: BarrageOptions) {
  const { enable, opacity, colors, fontSize, barrages } =
    getBarragesOptions(devOptions)

  if (barrages.length) {
    setTimeout(
      () => shootBarrage(barrages, enable, opacity, colors, fontSize),
      3000,
    )
  }

  // if (page === 'post' && postPageBarrages.length) {
  //   setTimeout(() => {
  //     shootBarrage(postPageBarrages, enable, opacity, colors, fontSize)
  //   }, 3000)
  // }

  // if (page === 'index' && indexBarrages.length) {
  //   setTimeout(() => {
  //     shootBarrage(indexBarrages, enable, opacity, colors, fontSize)
  //   }, 3000)
  // }
}
