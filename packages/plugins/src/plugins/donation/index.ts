import { getDonationOptions } from 'tona-options'
import type { DonationOptions, Theme } from '../../types'
import { getCurrentPage } from '../../utils/cnblog'
import { poll } from '../../utils/helpers'

/**
 * 二维码展开收起操作
 */
function qrcodeToggle() {
  $('#custom-donation-btn').click(() => {
    // 原 JS 传 'swing' 作为时长（jQuery.speed 解析为默认 400ms，easing 保持默认 swing）
    $('#custom-donation-qrcode').toggle(400, 'swing')
  })
  $('#custom-donation-qrcode div').click(function () {
    $(this).parent().toggle(400, 'linear')
  })
}

export function donation(_: Theme, devOptions?: DonationOptions) {
  const { enable, qrcodes } = getDonationOptions(devOptions)

  if (!enable) {
    return
  }
  if (getCurrentPage() !== 'post') {
    return
  }
  if (!qrcodes.length) {
    return
  }

  poll(
    () => $('#green_channel_favorite').length && $('#blog_post_info').length,
    () => {
      const btn = '<a id="custom-donation-btn">打赏</a>'
      const qrcode = $('<div id="custom-donation-qrcode"></div>')

      qrcodes.forEach((item) => {
        qrcode.append(`<div style="background-image: url(${item})"></div>`)
      })
      $('#green_channel_favorite').after(btn)
      $('#blog_post_info').before(qrcode)

      qrcodeToggle()
    },
  )
}
