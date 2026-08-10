import { getDarkModeOptions } from 'tona-options'

/**
 * 三种模式：深色 / 浅色 / 跟随系统
 */
const MODES = ['dark', 'light', 'system']

const DEFAULT_ICONS = {
  dark: 'fa-moon',
  light: 'fa-sun',
  system: 'fa-adjust',
}

const DEFAULT_TOOLTIPS = {
  dark: '深色',
  light: '浅色',
  system: '跟随系统',
}

let currentMode = 'light'
let icons = DEFAULT_ICONS
let tooltips = DEFAULT_TOOLTIPS
let iconType = 'className'
let systemMediaQuery = null
let systemChangeHandler = null
let modeButtonObserver = null

/**
 * 切换代码块深色、浅色主题
 * @param {string} mode 'dark' | 'light'
 */
function setCodeTheme(mode) {
  mode === 'dark'
    ? window.highlighter.setTheme(window.darkModeCodeHighlightTheme)
    : window.highlighter.setTheme(window.codeHighlightTheme)
}

/**
 * 应用深色/浅色皮肤，不写入 localStorage（由 setMode 统一持久化）
 * @param {string} mode 'dark' | 'light'
 * @param {boolean} withTransition
 */
function applyMode(mode, withTransition = true) {
  setCodeTheme(mode)
  $('html').attr('theme', mode)

  const transitionClassName =
    mode === 'dark' ? 'light-to-dark' : 'dark-to-light'

  if (withTransition) {
    $('body').addClass(transitionClassName)
  }

  setTimeout(() => $('body').removeClass(transitionClassName), 1200)
}

/**
 * 当前系统是否为深色模式
 */
function isSystemDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/**
 * 跟随系统：读取当前系统模式并应用到皮肤
 * @param {boolean} withTransition
 */
function applySystemMode(withTransition = false) {
  applyMode(isSystemDark() ? 'dark' : 'light', withTransition)
}

/**
 * 监听系统主题变化，跟随切换
 */
function listenSystemMode() {
  if (systemMediaQuery) {
    return
  }

  const query = window.matchMedia('(prefers-color-scheme: dark)')
  const handleChange = (event) => {
    applyMode(event.matches ? 'dark' : 'light')
  }

  if (query.addEventListener) {
    query.addEventListener('change', handleChange)
  } else if (query.addListener) {
    query.addListener(handleChange)
  }

  systemMediaQuery = query
  systemChangeHandler = handleChange
}

/**
 * 更新工具栏按钮图标与 tooltip
 */
function updateModeButton() {
  const $item = $('.mode-change')
  if (!$item.length) {
    // tools 插件可能晚于本插件渲染按钮，监听按钮出现后再同步
    watchModeButton()
    return
  }

  const $icon = $item.find('i')
  if ($icon.length) {
    if (iconType === 'className') {
      $icon.attr('class', icons[currentMode])
    } else {
      $icon.html(icons[currentMode])
    }
  }

  const $tip = $item.find('.tooltip')
  if ($tip.length) {
    $tip.text(tooltips[currentMode])
  }
}

/**
 * 监听 .mode-change 按钮出现，出现后同步图标与 tooltip
 */
function watchModeButton() {
  if (modeButtonObserver || $('.mode-change').length) {
    return
  }

  const MutationObserverImpl =
    window.MutationObserver || globalThis.MutationObserver
  if (!MutationObserverImpl) {
    // 不支持 MutationObserver 时退化为轮询
    setTimeout(watchModeButton, 200)
    return
  }

  modeButtonObserver = new MutationObserverImpl(() => {
    if ($('.mode-change').length) {
      stopWatchModeButton()
      updateModeButton()
    }
  })
  modeButtonObserver.observe(document.body, {
    childList: true,
    subtree: true,
  })

  // 兜底：即使未捕获到变更也定期检查一次
  setTimeout(() => {
    if ($('.mode-change').length) {
      stopWatchModeButton()
      updateModeButton()
    }
  }, 500)
}

/**
 * 停止监听按钮出现
 */
function stopWatchModeButton() {
  if (modeButtonObserver) {
    modeButtonObserver.disconnect()
    modeButtonObserver = null
  }
}

/**
 * 设置模式（三态）并持久化到 localStorage
 * @param {string} mode 'dark' | 'light' | 'system'
 * @param {boolean} withTransition
 */
function setMode(mode, withTransition = true) {
  currentMode = mode
  localStorage.modeType = mode

  if (mode === 'system') {
    applySystemMode()
    listenSystemMode()
  } else {
    applyMode(mode, withTransition)
  }

  updateModeButton()
}

/**
 * 初始化
 * @param {boolean} darkDefault 无存储且非跟随系统时的默认深色
 * @param {boolean} followSystem 无存储时默认跟随系统
 */
function init(darkDefault, followSystem) {
  const storage = localStorage.modeType

  if (storage === 'dark' || storage === 'light' || storage === 'system') {
    setMode(storage, false)
    return
  }

  // 配置驱动的初始态不写入 localStorage（与旧 darkDefault 行为一致）
  if (followSystem) {
    currentMode = 'system'
    applySystemMode()
    listenSystemMode()
  } else {
    currentMode = darkDefault ? 'dark' : 'light'
    applyMode(currentMode, false)
  }

  updateModeButton()
}

/**
 * 处理皮肤切换按钮点击事件：dark → light → system → dark
 */
function listenToggleButtonClick() {
  $(document).on('click', '.mode-change', () => {
    const nextIndex = (MODES.indexOf(currentMode) + 1) % MODES.length
    setMode(MODES[nextIndex])
  })
}

export function darkMode(_, devOptions) {
  const { enable, darkDefault, followSystem } = getDarkModeOptions(devOptions)

  if (!enable) {
    return
  }

  icons = { ...DEFAULT_ICONS, ...(devOptions?.icons || {}) }
  tooltips = { ...DEFAULT_TOOLTIPS, ...(devOptions?.tooltips || {}) }
  iconType = devOptions?.iconType || 'className'

  init(darkDefault, followSystem)
  listenToggleButtonClick()
  updateModeButton()
}
