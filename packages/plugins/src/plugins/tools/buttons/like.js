import { likePost } from '../../../utils/cnblog'
import { toast } from '../../../plugins/toast'

/**
 * 推荐按钮工厂
 * 默认行为：toast「推荐成功」+ likePost()
 * @param {object} [options] 覆盖默认字段（icon/iconType/tooltip/className/page/enable 等）；callback 由闭包绑定，不接受覆盖
 * @returns {object} 按钮对象
 */
export function createLikeButton(options = {}) {
  return {
    enable: true,
    page: 'post',
    icon: '👍',
    iconType: 'html',
    tooltip: '推荐',
    ...options,
    callback() {
      toast('推荐成功')
      likePost()
    },
  }
}
