// 构建随笔签名
import { getLicenseOptions } from 'tona-options'
import type { LicenseOptions, Theme } from '../../types'
import {
  getBlogname,
  getCurrentPage,
  getCurrentPostUrl,
} from '../../utils/cnblog'

const containerId = 'post-signature'

/**
 * 构建容器
 */
function buildContainer() {
  const author = getBlogname()
  const href = getCurrentPostUrl()
  const el = `<div id='${containerId}'>
                    <p>本文作者：${author}</p>
                    <p>本文链接：${href}</p>
                </div>`
  $('#blog_post_info_block').before(el)
}

/**
 * 构建版权信息
 * @param {boolean} enableLicense
 * @param {string} licenseName
 * @param {string} licenseLink
 */
function buildLicense(
  enableLicense: boolean,
  licenseName: string,
  licenseLink: string,
) {
  if (!enableLicense) return
  const agreement = licenseName.length
    ? licenseName
    : '知识共享署名-非商业性使用-禁止演绎 2.5 中国大陆'
  const el = `<p>版权声明：本作品采用${agreement}<a href='${licenseLink}'>许可协议</a>进行许可。</p>`
  $(`#${containerId}`).append(el)
}

/**
 * 构建自定义内容
 * @param {Array} content
 */
function buildContent(content: string[]) {
  let el = ''
  for (let i = 0; i < content.length; i++) {
    el += `<p>${content[i]}</p>`
  }
  $(`#${containerId}`).append(el)
}

export function license(_: Theme, devOptions?: LicenseOptions) {
  const { enable, license, licenseName, licenseLink, contents } =
    getLicenseOptions(devOptions)

  if (!enable) return
  if (getCurrentPage() !== 'post') return
  if ($('#MySignature').children().length) return

  buildContainer()
  buildLicense(license, licenseName, licenseLink)
  buildContent(contents)
}
