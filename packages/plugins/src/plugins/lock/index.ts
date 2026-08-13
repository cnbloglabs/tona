// 锁屏
import { getLockScreenOptions } from 'tona-options'
import type { LockOptions, Theme } from '../../types'
import { typedJs } from '../../constants/cdn'
import { loadScript } from '../../utils/helpers'

const randomImage = 'https://api.mz-moe.cn/img.php'

let typed: { destroy: () => void } | undefined

/**
 * 创建元素
 */
function build() {
  $('body').append(`
    <div class='lock-screen'>
        <div class="lock-screen-weather"></div>
        <div class="lock-screen-user">
            <div class='lock-screen-text'>
                <span></span>
            </div>
        </div>
        <div class="lock-screen-close">🔑</div>
    </div>`)
}

/**
 * 设置锁屏背景
 * @param {*} background
 */
function setBackground(background: string) {
  const image = background === '' ? randomImage : background
  $('.lock-screen').css('background-image', `url(${image})`)
}

/**
 * 打开锁屏
 * @param {*} strings
 */
function handleOpen(strings: string[]) {
  const typedOpts = {
    strings: strings.length ? strings : ['快去自定义你的个性签名吧~'],
    typeSpeed: 100,
  }
  $('#header').dblclick(() => {
    $('body').addClass('overflow')
    $('.lock-screen').css('top', '0')
    // eslint-disable-next-line no-undef
    typed = new Typed('.lock-screen-text span', typedOpts)
  })
}

/**
 * 关闭锁屏
 */
function handleClose() {
  $(document).on('click', '.lock-screen-close', () => {
    $('.lock-screen').css('top', '-100vh')
    typed!.destroy()
    setTimeout(() => {
      $('body').removeClass('overflow')
    }, 400)
  })
}

export function lock(_: Theme, devOptions?: LockOptions) {
  const { enable, background, strings } = getLockScreenOptions(devOptions)
  if (!enable) {
    return
  }
  build()
  setBackground(background)

  loadScript(typedJs, () => {
    handleOpen(strings)
    handleClose()
  })
}
