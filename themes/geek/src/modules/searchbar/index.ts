import { userAgent } from '../../utils/helpers'
import './index.scss'

/**
 * 构建移动端菜单
 */
function buildMobileMenu() {
  const el = $('<div>').addClass('mobile-menu')

  $('#left-side').clone().appendTo(el)

  $('#sideBar').clone().appendTo(el)

  $('body').append(el)
  $('.mobile-menu #catalog').remove()
}

/**
 * 构建头部菜单按钮
 */
function buildHeaderTrigger() {
  $('.custom-searchbar')
    .append(
      '<div id="navbarBurger" class="navbar-burger burger" data-target="navMenuMore"><span></span> <span></span><span></span></div>',
    )
    .click(function () {
      $(this).toggleClass('is-active')
      $('.mobile-menu').toggleClass('is-active')
    })
}

export function install() {
  const el =
    '<div class="custom-searchbar"><input id="q" type="text" placeholder="search..." onkeydown="return zzk_go_enter(event);"/></div>'
  $('#main').prepend(el)
  $('#sidebar_search').remove()

  if (userAgent() === 'pc') {
    return
  }
  buildMobileMenu()
  buildHeaderTrigger()
}
