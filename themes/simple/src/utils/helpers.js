export function copyToClipboard(str) {
  return navigator.clipboard.writeText(str)
}

export function createMutationObserve(selector, callback) {
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

export function HTMLDecode(str) {
  return $('<textarea/>').html(str).text()
}

export function insertStyle(style) {
  const styleElement = document.createElement('style')
  styleElement.innerHTML = style
  document.getElementsByTagName('head')[0].appendChild(styleElement)
}

export function mousewheel(upCallback, downCallback) {
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
    const wheel = e.originalEvent.wheelDelta || -e.originalEvent.detail
    const delta = Math.max(-1, Math.min(1, wheel))
    delta < 0 ? up() : down()
  })
}

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

export function isElementInViewport(el) {
  const rect = el.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

export function loadLink(href) {
  $('head').append('<link>')
  const link = $('head').children(':last')
  link.attr({
    rel: 'stylesheet',
    type: 'text/css',
    href,
  })
}

export function isNight() {
  const nowHour = new Date().getHours()
  const isNight = nowHour > 19 || nowHour <= 5
  return isNight
}

export function prettyLog(str, color = '#ffb3cc') {
  // eslint-disable-next-line no-console
  console.log(`%c  ${str}`, `color: ${color}; font-weight: bold;`)
}

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

export function randomArrayElements(arr, count = 1) {
  const shuffled = arr.slice(0)
  let i = arr.length
  const min = i - count
  let temp
  let index
  while (i-- > min) {
    index = Math.floor((i + 1) * Math.random())
    temp = shuffled[index]
    shuffled[index] = shuffled[i]
    shuffled[i] = temp
  }
  return shuffled.slice(min)
}

export async function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time))
}

export function randomImgurl() {
  const animeImages = 'https://api.mz-moe.cn/img'
  const random = Math.floor(Math.random() * 950)
  const url = `${animeImages}/img${random}.jpg`
  return url
}

export function unpass(show) {
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

export function poll(conditionFn, callback) {
  if (conditionFn()) {
    const res = callback()
    if (typeof res === 'boolean' || typeof res === 'string') {
      return res
    }
    return true
  } else {
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
}

export function loadScript(url, callback = () => {}) {
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

export function debounce(func, wait, immediate) {
  let timeout
  return function (...args) {
    const later = () => {
      timeout = null
      if (!immediate) {
        func.apply(this, args)
      }
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) {
      func.apply(this, args)
    }
  }
}

export function throttle(func, wait, mustRun) {
  let timeout
  let startTime = new Date()

  return function (...args) {
    const curTime = new Date()

    clearTimeout(timeout)

    if (curTime - startTime >= mustRun) {
      func.apply(this, args)
      startTime = curTime
    } else {
      timeout = setTimeout(() => func.apply(this, args), wait)
    }
  }
}

export function randomProperty(obj) {
  let result
  let count = 0
  for (const prop in obj) {
    if (Math.random() < 1 / ++count) {
      result = prop
    }
  }
  return result
}

export function randomColor(type) {
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

export function getClientRect(el) {
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

export function randomNum(max, min) {
  Number.parseInt(Math.random() * (max - min + 1) + min, 10)
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function userAgent() {
  const width = $(window).width()
  return width > 768 ? 'pc' : 'phone'
}

export function isPhone() {
  const width = $(window).width()
  return width <= 768
}

export function isUrl(string) {
  return /http/.test(string)
}
