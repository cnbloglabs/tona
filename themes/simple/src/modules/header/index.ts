import './index.scss'
import { userAgent } from '../../utils/helpers'
import { isPostDetailsPage, isHomePage } from '../../utils/cnblog'
import { getGithubOptions, getGiteeOptions } from 'tona-options'
import { avatar } from '../../constants/cnblog'

// header右侧按钮容器
const buildHeader = () => {
    const github = getGithubOptions()
    $('#navList').after(`<div class="navbar-end"></div>`)
    $('#blog_nav_newpost').appendTo('.navbar-end')

    // const customEle = `<a href="https://guangzan.gitee.io/awescnb-docs/docs/dev" id="header-awescnb">构建新皮肤</a>`
    const giteeEle = `<a href="${github.url}" id="header-gitee">开源主页</a>`
    // $(customEle).appendTo('.navbar-end')
    $(giteeEle).appendTo('.navbar-end')
}

// 构建header昵称
const headerNickname = () => {
    $('#Header1_HeaderTitle').text($('#profile_block a:first').text())
}

// header头像
const buildAva = () => {
    $('#blogLogo').attr('src', `${avatar}`)
}

// 随笔页构建文章题目
const headerInnerPostTitle = () => {
    if (!isPostDetailsPage()) return
    if (userAgent() !== 'pc') return
    let title = $('.post .postTitle')
        .text()
        .replace(/\s*/g, '')
    const titleLength = title.length

    let offset = ''
    if (0 <= titleLength && titleLength < 10) offset = '-180%'
    if (10 <= titleLength && titleLength < 15) offset = '-140%'
    if (15 <= titleLength && titleLength < 20) offset = '-100%'
    if (20 <= titleLength && titleLength < 25) offset = '-65%'
    if (25 <= titleLength && titleLength < 28) offset = '-60%'
    if (titleLength >= 28) {
        title = title.substring(0, 28) + '...'
        offset = '-60%'
    }
    $('#navList').append(`<span class='header-posttitle'>${title}</span>`)
    $('head').append(
        `<style>
               .header-posttitle {transform: translate3d(${offset}, 300%, 0);}
                #header.is-active .header-posttitle {transform: translate3d(${offset}, 0, 0);}
        </style>`,
    )
}

// header移动端菜单
const headerBtn = () => {
    const ele = `<div id="navbarBurger" class="navbar-burger burger" data-target="navMenuMore">
      <span></span>
      <span></span>
      <span></span>
    </div>`
    $('#blogTitle').append(ele)
    $('#navbarBurger').click(function() {
        $(this).toggleClass('is-active')
        $('#navigator').toggleClass('is-active')
    })
}

// 创建自定义图标容器及其图标
const customLinks = () => {
    const github = getGithubOptions()
    const gitee = getGiteeOptions()
    // wrap
    $('.navbar-end').prepend(`<div class="custom-links"></div>`)
    $('#blogTitle h2').after(`<div class="custom-links"></div>`)
    // 码云
    if (gitee.enable) {
        $('.custom-links').append(`<a class="gitee" href="${gitee.url}"></a>`)
    }
    // github icon
    if (github.enable) {
        $('.custom-links').append(`<a class="github" href="${github.url}"></a>`)
    }
    // 知乎
    // $('.custom-links').append(`<a class="zhihu"></a>`)
}

// 首页 header 不要上下翻滚
const preventHeaderChange = () => {
    if (!isHomePage()) return
    $('#header').addClass('navlist-fix')
}

export function install() {
    headerNickname()
    buildHeader()
    buildAva()
    headerBtn()
    customLinks()
    headerInnerPostTitle()
    preventHeaderChange()
}
