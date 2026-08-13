// 个性签名
import { getSignatureOptions } from 'tona-options'
import type { SignatureOptions, SignaturePluginOptions, Theme } from '../../types'
import { typedJs } from '../../constants/cdn'
import { loadScript } from '../../utils/helpers'

/**
 * 构建容器
 * @param {*} selector
 */
function build(selector: string) {
  const el = "<div class='custom-signature'><span></span></div>"
  $(selector).append(el)
}

/**
 * 构建打字机效果
 * @param {*} contents
 */
function typed(contents: string[]) {
  loadScript(typedJs, () => {
    // eslint-disable-next-line no-new
    new Typed('.custom-signature span', {
      strings: contents,
      typeSpeed: 70,
    })
  })
}

export function signature(
  _: Theme,
  devOptions?: SignatureOptions,
  pluginOptions?: SignaturePluginOptions,
) {
  const { enable, contents } = getSignatureOptions(devOptions)
  if (!enable) {
    return
  }

  let pluginConfig: SignaturePluginOptions = {
    selector: '#sidebar_news',
  }

  if (pluginOptions) {
    pluginConfig = { ...pluginConfig, ...pluginOptions }
  }

  const { selector } = pluginConfig

  build(selector!)
  typed(contents)
}
