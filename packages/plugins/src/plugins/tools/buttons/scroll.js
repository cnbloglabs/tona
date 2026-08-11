/**
 * 滚动行为（由 tools 插件迁移而来，本模块为唯一来源）
 */

/**
 * 滚动到顶部
 * @param {string} container 滚动容器选择器（默认 'html'，由 tools 插件合并）
 */
export function scrollToTop(container) {
  $(container).animate(
    {
      scrollTop: 0,
    },
    200,
  )
}

/**
 * 滚动到评论输入框
 * @param {string} container 滚动容器选择器（默认 'html'，由 tools 插件合并）
 */
export function scrollToComment(container) {
  $(container).animate(
    {
      scrollTop: $('#mainContent')[0].scrollHeight,
    },
    300,
  )
}
