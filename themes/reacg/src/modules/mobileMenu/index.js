// 设置移动端菜单按钮
import { unpass } from '../../common/utils/helpers'

function build() {
    $('body').append(
        `<div id='side-btn-wrap'>
                    <div id='side-btn'>
                        <div id='side-btn-burger'></div>
                    </div>
                </div>`,
    )
}

function toggle() {
    $('#side-btn').click(function(event) {
        event.preventDefault()
        if ($(this).hasClass('side-btn-active')) {
            $(this).removeClass('side-btn-active')
            $('#sideBar').hide()
            // .css({
            //     'clip-path':
            //         'circle(30px at calc(100%) 100%)',
            //     transition: 'all .5s ease-in-out',
            // })

            setTimeout(() => {}, 500)
            unpass(true)
            $('html').css('scroll-behavior', 'smooth')
        } else {
            $(this).addClass('side-btn-active')
            $('#sideBar').show()
            // .css({
            //     'clip-path': 'circle(100% at 50% 50%)',
            //     transition: 'all .3s ease-in-out',
            // })

            unpass(false)
            $('html').css('scroll-behavior', 'unset')
        }
    })
}

export function install() {
    // if (userAgent() !== 'phone') return
    build()
    toggle()
}
