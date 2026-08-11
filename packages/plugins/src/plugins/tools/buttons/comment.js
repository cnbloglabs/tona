import { scrollToComment } from './scroll'

/**
 * 评论按钮工厂
 * 默认行为：滚动到评论输入框（滚动容器取 pluginOptions.scrollContainer，默认 'html'）
 * @param {object} [options] 覆盖默认字段（icon/iconType/tooltip/className/page/enable 等）；callback 由闭包绑定，不接受覆盖
 * @returns {object} 按钮对象
 */
export function createCommentButton(options = {}) {
  return {
    enable: true,
    page: 'post',
    icon: '💬',
    iconType: 'html',
    tooltip: '评论',
    ...options,
    callback(pluginOptions) {
      scrollToComment(pluginOptions.scrollContainer || 'html')
    },
  }
}
