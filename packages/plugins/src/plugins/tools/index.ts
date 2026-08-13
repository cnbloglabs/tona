import { getToolsOptions } from 'tona-options'
import type { IconType, Theme, ToolsOptions, ToolsPluginOptions, ToolbarItem } from '../../types'
import { getCurrentPage } from '../../utils/cnblog'
import { isPhone } from '../../utils/helpers'

/**
 * 创建 toolbar 容器
 */
function createToolbarContainer() {
  return $('<div class="custom-toolbar">')
}

/**
 * 创建按钮项中的图标
 */
function createIcon(icon: string, iconType: IconType) {
  const $icon = $('<i>')
  iconType === 'className' ? $icon.addClass(icon) : $icon.html(icon)
  return $icon
}

/**
 * 创建按钮项中的工具提示
 */
function createTooltip(text: string, className?: string) {
  const ele = $(`<div class="tooltip">${text}</div>`)
  if (className) {
    ele.addClass(className)
  }
  return ele
}

/**
 * 创建 toggle 按钮
 * @param {string} icon
 */
function createToggleItem(icon: string, iconType: IconType, isActiveIcon: boolean) {
  const $ele = $('<div class="toolbar-item toolbar-item-toggle"></div>')
  const $icon = createIcon(icon, iconType)
  const $tooltip = createTooltip(
    isActiveIcon ? '收起' : '展开',
    ' tooltip-toggle',
  )

  isActiveIcon && $ele.addClass('active').hide()

  $ele.append($icon)
  $ele.append($tooltip)

  return $ele
}

/**
 * 创建 toolbar 按钮项
 */
function createToolbarItem(item: ToolbarItem, finalPluginOptions: ToolsPluginOptions) {
  const { className, callback, icon, iconType, tooltip } = item

  // items 绝对定位（相对 fixed 的 .custom-toolbar）：彼此脱离文档流，
  // 任一 item 被主题 CSS 隐藏（display: none）都不会导致其余 item 错位；
  // 初始全部叠在容器顶部，展开/收起由 handleToggle 统一位移
  const $item = $(
    '<div class="toolbar-item" style="position: absolute; top: 0; left: 0; transform: translateY(0)">',
  )

  if (className) {
    $item.addClass(className)
  }

  // 仅当按钮提供 callback 时绑定点击（过渡兼容：零默认后旧配置可能只列 icon/tooltip）。
  // 透传 event：按钮 callback 可用 event.stopPropagation() 阻止冒泡
  // （如 darkMode 按钮防与 darkMode 插件委托点击双触发）
  if (typeof callback === 'function') {
    $item.on('click', (event) => callback(finalPluginOptions, event))
  }

  const $icon = createIcon(icon, iconType)
  const $tip = createTooltip(tooltip)

  $item.append($icon)
  $item.append($tip)

  return $item
}

/**
 * 创建按钮插件
 * @param {object} finalPluginOptions 合并后的插件配置
 * @param {object} theme 主题实例（透传给按钮 setup）
 */
function createToolbar(finalPluginOptions: ToolsPluginOptions, theme: Theme) {
  const {
    toolbarItems = [],
    menuIcon,
    menuActiveIcon,
    menuIconType,
  } = finalPluginOptions

  const $toolbar = createToolbarContainer()
  const $toggleItem = createToggleItem(menuIcon || '➕', menuIconType || 'html', false)
  const $toggleActiveItem = createToggleItem(menuActiveIcon || '➖', menuIconType || 'html', true)

  const pageCondition = (page: string) => {
    return page === getCurrentPage() || page === 'all'
  }

  // 容器先挂载到文档：setup 执行时按钮已在 DOM 中（可同步图标/测量布局），
  // 而非挂在 detached 容器上（review fix）
  $('body').append($toolbar)

  // 顺序即视觉：数组第一项渲染在顶部、最后一项最靠近 toggle（不 reverse）
  // 缺失字段按默认处理：enable 视为 true、page 视为 'all'（按钮渲染，行为需显式 callback）
  toolbarItems.forEach((item) => {
    if (item.enable === false) {
      return
    }
    if (pageCondition(item.page || 'all')) {
      const $item = createToolbarItem(item, finalPluginOptions)
      $toolbar.append($item)
      // setup 在按钮创建并 append 后调用（初始化/状态恢复）
      if (typeof item.setup === 'function') {
        item.setup(theme, finalPluginOptions)
      }
    }
  })

  $toolbar.append($toggleItem).append($toggleActiveItem)
  $('.toolbar-item-toggle').click(handleToggle)

  // 视口跨断点时主题 CSS 会切换部分 item 的显示（如 >1366px 隐藏 sidebar-toggle），
  // 展开态下重算位移，避免隐藏项空出的槽位造成间距异常
  $(window).on('resize', () => {
    if ($('.custom-toolbar').hasClass('extend')) {
      transformed(-50)
    }
  })
}

/**
 * 应用工具栏 items 的位移
 * @param {number} translateY 展开 -50 / 收起 90
 *
 * 视觉顺序 = 数组顺序：数组第一项渲染在顶部（位移最远）、
 * 最后一项最靠近 toggle（位移 -50/90）。
 * 仅遍历可见项：被主题 CSS 隐藏（display: none）的 item 不参与槽位分配，
 * 其余按钮保持从 toggle 上方等距排列（配合 absolute 定位，隐藏项不占文档流）。
 */
function transformed(translateY: number) {
  const items = $('.toolbar-item:not(.toolbar-item-toggle)').filter(':visible')
  const count = items.length
  items.each((index, item) => {
    // 从最后一个可见项（最靠近 toggle）起分配：第 k 项位移比末项多 (count-1-k) 个步长
    $(item).css({
      transform: `translateY(${translateY + (count - index - 1) * translateY}px)`,
    })
  })
}

/**
 * 处理展开和收起
 */
function handleToggle() {
  const toggleExtend = (isExtend: boolean) => {
    const translateY = isExtend ? 90 : -50
    const $menuButton = $('.toolbar-item-toggle:not(.active)')
    const $activeMenuButton = $('.toolbar-item-toggle.active')

    transformed(translateY)

    if (isExtend) {
      $menuButton.show()
      $activeMenuButton.hide()
    } else {
      $menuButton.hide()
      $activeMenuButton.show()
    }
  }

  $('.custom-toolbar').toggleClass('extend')
  $('.custom-toolbar').hasClass('extend')
    ? toggleExtend(false)
    : toggleExtend(true)
}

export function tools(
  theme: Theme,
  devOptions?: ToolsOptions,
  pluginOptions?: ToolsPluginOptions,
) {
  // tona-options 的 ToolsOptions 不含 enable（enable 经 getter 透传合并），
  // 此处按实际运行时形状断言后解构
  const { enable, initialOpen } = getToolsOptions(
    devOptions,
  ) as unknown as ToolsOptions
  if (!enable) {
    return
  }

  // 零默认：不内置任何按钮；toolbarItems 由主题显式提供（未提供 = 空工具栏）
  const pluginDefaultOptions: ToolsPluginOptions = {
    scrollContainer: 'html',
    menuIconType: 'html', // 'className' | 'html'
    menuIcon: '➕',
    menuActiveIcon: '➖',
  }

  // 数组整体替换：默认对象不含 toolbarItems，故 pluginOptions.toolbarItems
  // 原样进入结果（不按数组 index 深合并）；其余字段合并行为不变
  const finalPluginOptions: ToolsPluginOptions = $.extend(
    true,
    pluginDefaultOptions,
    pluginOptions || {},
  )

  createToolbar(finalPluginOptions, theme)
  if (!isPhone() && initialOpen) {
    handleToggle()
  }
}
