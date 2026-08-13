import type { DarkModeButtonOptions, Mode, ToolbarItem } from '../../../types'
import {
  DEFAULT_ICONS,
  DEFAULT_TOOLTIPS,
  cycleMode,
  init,
  setModeButtonStyle,
  updateModeButton,
} from '../../darkMode'

/**
 * 深色模式按钮工厂
 *
 * 自包含：不依赖 `.use(darkMode)` 插件或 `$(document).on('click', '.mode-change')`
 * 委托事件即可工作。setup 初始化模式状态，callback 三态循环切换，核心逻辑复用
 * darkMode 插件（同一模块实例，状态共用）。
 *
 * 图标语义（review fix）：默认按模式切换图标/tooltip（深色 fa-moon/浅色 fa-sun/
 * 跟随系统 fa-adjust，对应 DEFAULT_ICONS/DEFAULT_TOOLTIPS）；传入单个 `icon`/
 * `tooltip` 则三种模式共用该值；也可传 `icons`/`tooltips` 三态映射精确覆盖。
 *
 * 与 darkMode 插件互斥：按钮自带 callback（点击经 tools 绑定，并 stopPropagation），
 * 若同时 `.use(darkMode)` 注册了 `.mode-change` 委托点击，一次物理点击会推进两态；
 * 使用本按钮的主题请勿同时注册 darkMode 插件。
 *
 * @param {object} [options] 覆盖默认字段（icon/iconType/tooltip/page/enable 等）；
 *   icons/tooltips 为三态映射（{dark, light, system}）；className 固定为
 *   'mode-change'（darkMode 核心同步逻辑依赖该选择器，不可覆盖）；
 *   darkDefault/followSystem 控制无 localStorage 存储时的初始模式（默认 false）；
 *   callback/setup 由闭包绑定，不接受覆盖
 * @returns {object} 按钮对象
 */
export function createDarkModeButton(
  options: DarkModeButtonOptions = {},
): ToolbarItem {
  const {
    darkDefault = false,
    followSystem = false,
    icons,
    tooltips,
    ...buttonOptions
  } = options

  const {
    icon,
    // 默认 className 图标（fa-moon/fa-sun/fa-adjust，与 darkMode 插件 DEFAULT_ICONS 一致）；
    // html 模式需配合单 icon 或 icons 映射显式传入 emoji 类图标
    iconType = 'className',
    tooltip,
  } = buttonOptions

  // 三态图标/提示：优先 icons/tooltips 映射 → 单个 icon/tooltip 全覆盖 → 默认三态
  const modeIcons: Partial<Record<Mode, string>> = icons || {
    dark: icon || DEFAULT_ICONS.dark,
    light: icon || DEFAULT_ICONS.light,
    system: icon || DEFAULT_ICONS.system,
  }
  const modeTooltips: Partial<Record<Mode, string>> = tooltips || {
    dark: tooltip || DEFAULT_TOOLTIPS.dark,
    light: tooltip || DEFAULT_TOOLTIPS.light,
    system: tooltip || DEFAULT_TOOLTIPS.system,
  }

  return {
    enable: true,
    page: 'all',
    icon: icon || DEFAULT_ICONS.dark,
    iconType,
    tooltip: tooltip || DEFAULT_TOOLTIPS.dark,
    // className 固定：darkMode 核心的 updateModeButton/watchModeButton 硬编码
    // '.mode-change' 选择器，覆盖会静默破坏图标同步并泄漏 MutationObserver
    ...buttonOptions,
    className: 'mode-change',
    /**
     * 初始化模式状态：localStorage.modeType 有值时恢复对应模式；无值时按
     * darkDefault/followSystem 默认逻辑进入浅色/深色；并初始化按钮图标/tooltip
     * （按钮尚未渲染时由核心逻辑的 MutationObserver 兜底同步）
     * @param {object} theme 主题实例
     * @param {object} pluginOptions 工具插件配置
     */
    setup(theme, pluginOptions) {
      setModeButtonStyle({
        icons: modeIcons,
        tooltips: modeTooltips,
        iconType,
      })
      init(darkDefault, followSystem)
      updateModeButton()
    },
    /**
     * 点击行为：dark → light → system → dark 三态循环，并持久化到 localStorage.modeType。
     * stopPropagation 阻止冒泡到 document，避免与 darkMode 插件的 `.mode-change`
     * 委托点击（若同时注册）双触发。
     * @param {object} pluginOptions 工具插件配置
     * @param {Event} [event] 点击事件（tools 传入）
     */
    callback(pluginOptions, event) {
      event?.stopPropagation?.()
      cycleMode()
    },
  }
}
