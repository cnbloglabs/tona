import type { BackTopButtonOptions, ToolbarItem } from '../../../types'
import { scrollToTop } from './scroll'

/**
 * 回顶按钮工厂
 * 默认行为：滚动到顶部（滚动容器取 pluginOptions.scrollContainer，默认 'html'）
 * @param {object} [options] 覆盖默认字段（icon/iconType/tooltip/className/page/enable 等）；callback 由闭包绑定，不接受覆盖
 * @returns {object} 按钮对象
 */
export function createBackTopButton(options: BackTopButtonOptions = {}): ToolbarItem {
  return {
    enable: true,
    page: 'all',
    icon: '🚀',
    iconType: 'html',
    tooltip: '回顶',
    ...options,
    callback(pluginOptions) {
      scrollToTop(pluginOptions.scrollContainer || 'html')
    },
  }
}
