import './index.scss'

const STORAGE_KEY = 'sidebarsCollapsed'
const COLLAPSED_CLASS = 'is-sidebars-collapsed'

const ICONS = {
  collapsed: 'fas fa-expand',
  expanded: 'fas fa-compress',
}

// tooltip 表示当前状态（非下一种状态）：收起态「侧栏收起」、展开态「侧栏展开」
const TOOLTIPS = {
  collapsed: '侧栏收起',
  expanded: '侧栏展开',
}

let sidebarToggleObserver = null

/**
 * 当前是否为收起态
 * @returns {boolean}
 */
function isCollapsed() {
  return $('#home').hasClass(COLLAPSED_CLASS)
}

/**
 * 同步按钮图标与 tooltip（收起 = fa-expand / 展开 = fa-compress）
 */
function updateToggleButton() {
  const $item = $('.toolbar-item.sidebar-toggle')
  if (!$item.length) {
    // tools 插件可能晚于本模块渲染按钮，监听按钮出现后再同步
    watchToggleButton()
    return
  }

  const collapsed = isCollapsed()

  const $icon = $item.find('i')
  if ($icon.length) {
    $icon.attr('class', collapsed ? ICONS.collapsed : ICONS.expanded)
  }

  const $tip = $item.find('.tooltip')
  if ($tip.length) {
    $tip.text(collapsed ? TOOLTIPS.collapsed : TOOLTIPS.expanded)
  }
}

/**
 * 监听 .toolbar-item.sidebar-toggle 出现，出现后同步图标与 tooltip
 */
function watchToggleButton() {
  if (sidebarToggleObserver || $('.toolbar-item.sidebar-toggle').length) {
    return
  }

  const MutationObserverImpl =
    window.MutationObserver || globalThis.MutationObserver
  if (!MutationObserverImpl) {
    // 不支持 MutationObserver 时退化为轮询
    setTimeout(watchToggleButton, 200)
    return
  }

  sidebarToggleObserver = new MutationObserverImpl(() => {
    if ($('.toolbar-item.sidebar-toggle').length) {
      stopWatchToggleButton()
      updateToggleButton()
    }
  })
  sidebarToggleObserver.observe(document.body, {
    childList: true,
    subtree: true,
  })

  // 兜底：即使未捕获到变更也定期检查一次
  setTimeout(() => {
    if ($('.toolbar-item.sidebar-toggle').length) {
      stopWatchToggleButton()
      updateToggleButton()
    }
  }, 500)
}

/**
 * 停止监听按钮出现
 */
function stopWatchToggleButton() {
  if (sidebarToggleObserver) {
    sidebarToggleObserver.disconnect()
    sidebarToggleObserver = null
  }
}

/**
 * 翻转收起/展开状态并持久化到 localStorage
 */
function toggle() {
  const willCollapse = !isCollapsed()

  $('#home').toggleClass(COLLAPSED_CLASS, willCollapse)
  localStorage[STORAGE_KEY] = willCollapse ? '1' : '0'

  updateToggleButton()
}

/**
 * 按 localStorage 恢复收起态（类由 CSS 媒体查询门控，区间外自愈）
 */
function restore() {
  if (localStorage[STORAGE_KEY] === '1') {
    $('#home').addClass(COLLAPSED_CLASS)
  }
}

export function install() {
  restore()
  // 点击由 tools 插件经 item.callback 绑定触发（见 createSidebarToggleToolbarItem），
  // 无需委托事件
  updateToggleButton()
}

/**
 * 生成 sidebar-toggle 的 toolbar item 配置，供 main.js 的 `.use(tools)` 引入。
 * 点击回调即本模块的 toggle（tools 插件在创建按钮时绑定 callback）。
 *
 * icon/className 不可覆盖（review fix）：updateToggleButton 依赖
 * `.toolbar-item.sidebar-toggle` 选择器并在状态切换时重设 icon 为
 * `fas fa-expand`/`fas fa-compress`——覆盖会静默失效。
 * tooltip 表示当前状态（初始展开态 = 「侧栏展开」，收起后为「侧栏收起」）。
 *
 * @param {object} [options] 可选覆盖 iconType/tooltip/page/enable 等非关键字段
 * @returns {{enable: boolean, page: string, icon: string, iconType: string, tooltip: string, className: string, callback: Function}}
 */
export function createSidebarToggleToolbarItem(options = {}) {
  const {
    enable = true,
    page = 'all',
    iconType = 'className',
    tooltip = TOOLTIPS.expanded,
  } = options
  return {
    enable,
    page,
    icon: 'fas fa-compress',
    iconType,
    tooltip,
    className: 'sidebar-toggle',
    callback: () => toggle(),
  }
}
