import './index.scss'
import { getCatalogOptions } from 'tona-options'
import { userAgent, getClientRect, throttle } from '../../utils/helpers'
import { isPostDetailsPage, hasPostTitle } from '../../utils/cnblog'

// 构建目录
function build() {
    let $catalogContainer = $(
        `<div id="catalog">
            <div class='catalog-title'><h3>目录</h3></div>
        </div>`,
    )
    const $ulContainer = $('<ul></ul>')
    const titleRegExp = /^h[1-3]$/

    $('#cnblogs_post_body')
        .children()
        .each(function() {
            if (titleRegExp.test(this.tagName.toLowerCase())) {
                if ($(this).text().length === 0) return // 如果标题为空 只有 #
                let id
                let text

                if (this.id !== '') {
                    id = this.id
                    // text =
                    //     this.childNodes.length === 2
                    //         ? this.childNodes[1].nodeValue
                    //         : this.childNodes[0].nodeValue
                    text = $(this).text()
                } else {
                    if (this.childNodes.length === 2) {
                        const value = this.childNodes[1].nodeValue
                        text = value ? value : $(this.childNodes[1]).text()
                    } else {
                        const value = this.childNodes[0].nodeValue
                        text = value ? value : $(this.childNodes[0]).text() // 处理标题被 span 包裹的情况
                    }
                    id = text.trim()
                    $(this).attr('id', id)
                }

                const title = `
                            <li class='${this.nodeName.toLowerCase()}-list'>
                                <a href='#${id}'>${text}</a>
                            </li>
                        `

                $ulContainer.append(title)
            }
        })

    const $catalog = $($catalogContainer.append($ulContainer))
    $('#sidebar_news').after($catalog)
}

function noCatalog() {
    // 如果没生成catalog，内容的宽度一律为54vw，写在style/index.scss中
    // 所以给 header padding left 一个固定的值
    if (!isPostDetailsPage()) return
    // $('#header').css('padding-left', '14.2vw')
}

// 设置目录活跃标题样式
function setActiveCatalogTitle() {
    $(window).scroll(
        throttle(
            function() {
                for (let i = $('#catalog ul li').length - 1; i >= 0; i--) {
                    const titleId = $($('#catalog ul li')[i])
                        .find('a')
                        .attr('href')!
                        .replace(/[#]/g, '')
                    const postTitle = document.querySelector(
                        `#cnblogs_post_body [id='${titleId}']`,
                    )
                    if (getClientRect(postTitle!).top <= 10) {
                        if (
                            $($('#catalog ul li')[i]).hasClass('catalog-active')
                        )
                            return
                        $($('#catalog ul li')[i]).addClass('catalog-active')
                        $($('#catalog ul li')[i])
                            .siblings()
                            .removeClass('catalog-active')
                        return
                    }
                }
            },
            50,
            1000 / 60,
        ),
    )
}

function setCatalogToggle() {
    // var p = 0,
    //     t = 0
    $(window).scroll(
        throttle(
            function() {
                if ($('#catalog ul').css('display') === 'none') return
                const bottom = getClientRect(
                    document.querySelector('#sideBarMain')!,
                ).bottom
                if (bottom <= 0) {
                    $('#catalog').addClass('catalog-sticky')
                    // p = $(this).scrollTop()
                    // t <= p
                    //     ? $('#catalog').addClass('catalog-scroll-up')
                    //     : $('#catalog').removeClass('catalog-scroll-up')
                    // setTimeout(function() {
                    //     t = p
                    // }, 0)
                } else {
                    $('#catalog').removeClass('catalog-sticky')
                }
            },
            50,
            1000 / 60,
        ),
    )
}

function toggle() {
    $('.catalog-title').click(function() {
        // 原 JS 传 'fast' 时长（jQuery.speed 解析为 200ms）
        $('#catalog ul').toggle(200, 'linear', function() {
            $(this).css('display') === 'none'
                ? $('.catalog-title').removeClass('is-active')
                : $('.catalog-title').addClass('is-active')
        })
    })
}

export function install() {
    const { enable } = getCatalogOptions()

    if (
        enable &&
        hasPostTitle() &&
        isPostDetailsPage() &&
        userAgent() === 'pc'
    ) {
        build()
        setActiveCatalogTitle()
        setCatalogToggle()
        toggle()
    } else {
        noCatalog()
    }
}
