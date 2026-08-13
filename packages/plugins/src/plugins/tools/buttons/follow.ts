import type { FollowButtonOptions, ToolbarItem } from '../../../types'
import { toast } from '../../../plugins/toast'

/**
 * 关注按钮工厂
 * 默认行为：toast「关注成功」+ window.follow()
 * @param {object} [options] 覆盖默认字段（icon/iconType/tooltip/className/page/enable 等）；callback 由闭包绑定，不接受覆盖
 * @returns {object} 按钮对象
 */
export function createFollowButton(options: FollowButtonOptions = {}): ToolbarItem {
  return {
    enable: true,
    page: 'post',
    icon: '💗',
    iconType: 'html',
    tooltip: '关注',
    ...options,
    callback() {
      toast('关注成功')
      window.follow!()
    },
  }
}
