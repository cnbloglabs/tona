import { getGithubOptions } from 'tona-options'
import { avatar } from '../../constants/cnblog'
import { getMessageCount } from '../../utils/cnblog'
import { message } from '../../constants/links'

// 构建header昵称
function headerNickname() {
  $('#Header1_HeaderTitle').text($('#profile_block a:first').text())
}

// header头像
function buildAva() {
  $('#blogLogo').attr('src', `${avatar}`)
}

function buildMessageCount() {
  $('#lnkBlogLogo').append(`<a class="message-count" href="${message}"><span>${getMessageCount()}</span>
    </a>`)
}

// header移动端菜单
function headerBtn() {
  const ele = `<div id="navbarBurger" class="navbar-burger burger" data-target="navMenuMore">
      <span></span>
      <span></span>
      <span></span>
    </div>`
  $('#blogTitle').append(ele)
  $('#navbarBurger').click(function() {
    $(this).toggleClass('is-active')
    $('#navigator').toggleClass('is-active')
    $('#custom-searchbar').toggle()
    $('.postTitle svg').toggle()
  })
}

// 构建搜索框
function buildSearchbar() {
  const ele = `<input id="q" class="custom-searchbar" type="search" placeholder="Search by pressing enter" onkeydown="return zzk_go_enter(event);"/>`
  $('#navigator').after(ele)
}

// GitHub 图标
function buildGithub() {
  const { url } = getGithubOptions()
  const ele = `
    <li>
        <a id="custom-gtihub" href="${url}">Github</a>
    </li>`
  $('#navList').append(ele)
}

export function install() {
  headerNickname()
  buildAva()
  headerBtn()
  buildSearchbar()
  buildGithub()
  buildMessageCount()
}
