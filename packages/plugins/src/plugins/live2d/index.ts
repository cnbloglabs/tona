import { getLive2dOptions } from 'tona-options'
import type { Live2dOptions, Theme } from '../../types'
import { getCurrentPage } from '../../utils/cnblog'
import { loadScript, randomProperty, userAgent } from '../../utils/helpers'
import { live2dModels } from './live2d-models'

const live2dBase = 'https://cdn.jsdelivr.net/gh/guangzan/awesCnb-live2dModels'
const live2djs =
  'https://files.cnblogs.com/files/guangzan/live2d.min.js?t=1688786567&download=true'

let audioPlayPatched = false

/**
 * 静音模型声音：包装 HTMLAudioElement.prototype.play，
 * 仅拦截 src 属于 live2d 模型库的 audio，不影响页面其他音频（如音乐播放器）
 */
function muteLive2dAudio() {
  if (audioPlayPatched) {
    return
  }
  audioPlayPatched = true

  const play = HTMLAudioElement.prototype.play
  HTMLAudioElement.prototype.play = function (this: HTMLAudioElement) {
    if (this.src.includes(live2dBase)) {
      return Promise.resolve()
    }
    return play.apply(this, arguments as unknown as Parameters<typeof play>)
  }
}

/**
 * 构建模型容器
 * @param {string} position
 * @param {string} width
 * @param {string} height
 */
function buildContainer(position: string, width: number, height: number) {
  const ele = `<canvas id="model" style="position:fixed;${position}:0;bottom:0;z-index:30;pointer-events: none;" width="${width}"height="${height}" ></canvas>`
  $('body').append(ele)
}

/**
 * 设置间距
 * @param {string} position
 * @param {string} gap
 */
function setGap(position: string, gap: string) {
  if (gap === 'default') {
    return
  }
  $('#model').css(position, gap)
}

/**
 * 加载模型
 * @param {string} model
 */
function loadModel(model: string) {
  const live2dModel =
    model === 'random'
      ? live2dModels[
          randomProperty(live2dModels)! as keyof typeof live2dModels
        ]
      : live2dModels[model as keyof typeof live2dModels]

  const url = `${live2dBase}@latest/${live2dModel}`
  loadScript(live2djs, () => {
    // eslint-disable-next-line no-undef
    loadlive2d('model', url)
  })
}

export function live2d(_: Theme, devOptions?: Live2dOptions) {
  const { enable, page, agent, model, position, gap, width, height, mute } =
    getLive2dOptions(devOptions)

  if (!enable) {
    return
  }
  if (page !== getCurrentPage() && page !== 'all') {
    return
  }
  if (agent !== userAgent() && agent !== 'all') {
    return
  }

  if (mute) {
    muteLive2dAudio()
  }

  buildContainer(position, width, height)
  setGap(position, gap)
  loadModel(model)
}
