/**
 * 将字符串复制到剪贴板
 */
export function copyToClipboard(str: string) {
  return navigator.clipboard.writeText(str)
}

/**
 * 监听 DOM 变化
 */
export function createMutationObserve(selector: Node, callback: () => Promise<unknown>) {
  const observer = new MutationObserver(() => {
    callback().then(() => {
      observer.disconnect()
    })
  })
  observer.observe(selector, {
    attributes: true,
    childList: true,
    subtree: true,
  })
}

/**
 * HTML 反转义
 */
export function HTMLDecode(str: string) {
  return $('<textarea/>').html(str).text()
}

/**
 * 插入 css
 */
export function insertStyle(style: string) {
  const styleElement = document.createElement('style')
  styleElement.innerHTML = style
  document.getElementsByTagName('head')[0]!.appendChild(styleElement)
}

/**
 * 监听鼠标滚轮
 * @param {Function} upCallback 向上滚动回调
 * @param {Function} downCallback 向下滚动回调
 */
export function mousewheel(upCallback: () => void, downCallback?: () => void) {
  if (!downCallback) {
    downCallback = upCallback
  }
  const removeListener = () => {
    $(document).unbind('mousewheel DOMMouseScroll')
  }
  const up = () => {
    upCallback()
    removeListener()
  }
  const down = () => {
    upCallback()
    removeListener()
  }
  $(document).on('mousewheel DOMMouseScroll', (e) => {
    // e.preventDefault()
    const originalEvent = e.originalEvent as
      | (Event & { wheelDelta?: number; detail?: number })
      | undefined
    const wheel = originalEvent!.wheelDelta || -Number(originalEvent!.detail)
    const delta = Math.max(-1, Math.min(1, wheel))
    delta < 0 ? up() : down()
  })
}

/**
 * 获取季节
 */
export function getQuarter() {
  const month = new Date().getMonth()
  if (month < 3) {
    return 'Spring'
  } else if (month < 6) {
    return 'Summer'
  } else if (month < 9) {
    return 'Autumn'
  } else if (month < 12) {
    return 'Winter'
  }
}

/**
 * 获取英文月份
 * @returns {string} 英文月份单词
 */
export function getMonth() {
  const monthsInEng = [
    'Jan',
    'Feb',
    'March',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sept',
    'Oct',
    'Nov',
    'Dec',
  ]
  const month = new Date().getMonth()
  return monthsInEng[month]
}

/**
 * 判断元素是否在视口范围内
 * @param {object} el - DOM selector
 * @returns {boolean} 元素是否在视口范围内
 */
export function isElementInViewport(el: Element) {
  const rect = el.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

/**
 * 创建 link 标签
 * @param {string} href - css 链接
 */
export function loadLink(href: string) {
  $('head').append('<link>')
  const link = $('head').children(':last')
  link.attr({
    rel: 'stylesheet',
    type: 'text/css',
    href,
  })
}

/**
 * 判断当前是否为夜间
 * @returns {boolean} 是否为夜间
 */
export function isNight() {
  const nowHour = new Date().getHours()
  const isNight = nowHour > 19 || nowHour <= 5
  return isNight
}

/**
 * 支持颜色的控制台打印函数
 * @param {string} str - 要打印的字符串
 * @param {string} color - 打印颜色
 */
export function prettyLog(str: string, color = '#ffb3cc') {
  // eslint-disable-next-line no-console
  console.log(`%c  ${str}`, `color: ${color}; font-weight: bold;`)
}

/**
 * 获取今天的日期，格式： yyyy-MM-dd
 * @returns {string} 今天的日期
 */
export function getDate() {
  const time = new Date()
  const year = time.getFullYear()
  const month = `0${time.getMonth() + 1}`.slice(-2)
  const day = `0${time.getDate()}`.slice(-2)
  // const hour = ('0' + time.getHours()).slice(-2)
  // const minute = ('0' + time.getMinutes()).slice(-2)
  // const second = ('0' + time.getSeconds()).slice(-2)
  const today = `${year}-${month}-${day}`
  return today
}

/**
 * 获取数组中随机元素
 * @param {Array} arr - 任意数组
 * @param {number} count - 要获取的随机元素的数量
 * @returns {any} 可能是数组中的任意指定数量的元素
 */
export function randomArrayElements<T>(arr: T[], count = 1) {
  const shuffled = arr.slice(0)
  let i = arr.length
  const min = i - count
  let temp: T
  let index: number
  while (i-- > min) {
    index = Math.floor((i + 1) * Math.random())
    temp = shuffled[index]
    shuffled[index] = shuffled[i]
    shuffled[i] = temp
  }
  return shuffled.slice(min)
}

/**
 * sleep
 */
export async function sleep(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time))
}

/**
 * 获取一个随机图片 url
 * @returns {string} 随机图片 url
 */
export function randomImgurl() {
  const animeImages = 'https://api.mz-moe.cn/img'
  const random = Math.floor(Math.random() * 950)
  const url = `${animeImages}/img${random}.jpg`
  return url
}

/**
 * 滚动穿透处理
 * @param {boolean} show - 蒙层是否已经显示
 */
export function unpass(show: boolean) {
  if (show) {
    const body = document.body
    body.style.position = ''
    const top = body.style.top

    document.body.scrollTop = document.documentElement.scrollTop =
      -Number.parseInt(top, 10)
    body.style.top = ''
  } else {
    const scrollTop =
      document.body.scrollTop || document.documentElement.scrollTop
    document.body.style.cssText += `position:fixed;width:100%;top:-${scrollTop}px;`
  }
}

/**
 * 轮询
 */
export function poll(conditionFn: () => unknown, callback: () => unknown) {
  if (conditionFn()) {
    const res = callback()
    if (typeof res === 'boolean' || typeof res === 'string') {
      return res
    }
    return true
  }
  let count = 1
  const intervalId = setInterval(() => {
    if (conditionFn()) {
      const res = callback()
      if (typeof res === 'boolean' || typeof res === 'string') {
        return res
      }
      clearInterval(intervalId)
      return true
    }
    if (count === 180) {
      clearInterval(intervalId)
      return false
    }
    count++
  }, 1000)
}

/**
 * 加载 script
 * @param {string} url - script 链接
 * @param {Function} callback - 加载成功后要执行的回调函数
 */
export function loadScript(url: string, callback: () => void = () => {}) {
  $.ajax({
    type: 'GET',
    dataType: 'script',
    cache: true,
    url,
    success() {
      callback()
    },
  })
}

export function debounce(
  func: (...args: any[]) => void,
  wait: number,
  immediate?: unknown,
): (...args: any[]) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return function (this: unknown, ...args: any[]) {
    const later = () => {
      timeout = null
      if (!immediate) {
        func.apply(this, args)
      }
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout ?? undefined)
    timeout = setTimeout(later, wait)
    if (callNow) {
      func.apply(this, args)
    }
  }
}

export function throttle(
  func: (...args: any[]) => void,
  wait: number,
  mustRun: number,
): (...args: any[]) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  let startTime = new Date()

  return function (this: unknown, ...args: any[]) {
    const curTime = new Date()

    clearTimeout(timeout ?? undefined)

    if (curTime.getTime() - startTime.getTime() >= mustRun) {
      func.apply(this, args)
      startTime = curTime
    } else {
      timeout = setTimeout(() => func.apply(this, args), wait)
    }
  }
}

/**
 * 获取对象的随机属性
 * @param {object} obj - JS 对象
 * @returns 对象的随机属性
 */
export function randomProperty(obj: Record<string, unknown>) {
  let result: string | undefined
  let count = 0
  for (const prop in obj) {
    if (Math.random() < 1 / ++count) {
      result = prop
    }
  }
  return result
}

/**
 * 获取随机颜色
 * @param {string} type - 返回的颜色值类型 "rgba" | "16"（也可直接传颜色数组，见弹幕插件）
 * @returns 随机颜色值
 */
export function randomColor(type: string | string[]) {
  let res = ''
  if (type === 'rgba') {
    const r = Math.floor(Math.random() * 256)
    const g = Math.floor(Math.random() * 256)
    const b = Math.floor(Math.random() * 256)
    const a = 0.6
    res = `rgba(${r},${g},${b},${a})`
  } else if (type === '16') {
    res = `#${Math.floor(Math.random() * 0xffffff).toString(16)}`
  } else {
    const colors = type || [
      '#FE0302',
      '#FF7204',
      '#FFAA02',
      '#FFD302',
      '#FFFF00',
      '#A0EE00',
      '#00CD00',
      '#019899',
      '#4266BE',
      '#89D5FF',
      '#CC0273',
      '#CC0273',
    ]
    const random = Math.floor(Math.random() * colors.length)
    res = colors[random]
  }
  return res
}

/**
 * 获取元素相对与浏览器视口的位置
 * @param {object} el - DOM 对象
 * @returns {object} "top", "bottom", "left", "right", "height", "width"
 */
export function getClientRect(el: Element) {
  const { top, bottom, left, right, height, width } = el.getBoundingClientRect()
  return {
    top,
    bottom,
    left,
    right,
    height: height || bottom - top,
    width: width || right - left,
  }
}

/**
 * 生成随机数
 * @param {number} max - 最大值
 * @param {number} min - 最小值
 * @returns 介于最大值与最小值闭区间的随机数
 */
export function randomNum(max: number, min: number) {
  Number.parseInt(String(Math.random() * (max - min + 1) + min), 10)
  return Math.floor(Math.random() * (max - min + 1) + min)
}

/**
 * 返回用户设备类型
 * @returns {string} 'pc' | 'phone'
 */
export function userAgent() {
  const width = $(window).width()!
  return width > 768 ? 'pc' : 'phone'
}

/**
 * 判断当前设备是否为手机
 * @returns {boolean} 当前设备是否为手机
 */
export function isPhone() {
  const width = $(window).width()!
  return width <= 768
}

/**
 * 判断字符串是否为 http 网址
 * @returns {boolean} 是否为 http 网址
 */
export function isUrl(string: string) {
  return /http/.test(string)
}
