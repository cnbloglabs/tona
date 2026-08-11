/**
 * 收藏按钮工厂
 * 默认行为：window.AddToWz()
 * @param {object} [options] 覆盖默认字段（icon/iconType/tooltip/className/page/enable 等）；callback 由闭包绑定，不接受覆盖
 * @returns {object} 按钮对象
 */
export function createFavoriteButton(options = {}) {
  return {
    enable: true,
    page: 'post',
    icon: '📌',
    iconType: 'html',
    tooltip: '收藏',
    ...options,
    callback() {
      window.AddToWz()
    },
  }
}
