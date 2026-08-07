import './index.scss'
import { fontUrl, icons, foodIcons } from './icons'
import { randomProperty, loadScript, poll } from '../../common/utils/helpers'
import { getCurrentPage } from '../../common/utils/cnblog'
import { getGiteeOptions, getGithubOptions } from 'tona-options'

/**
 * @description 指定icon插入svg
 * @param {String} icon xlink:href 的值
 * @returns svg标签
 */
function iconInSvg(icon) {
  return `<svg class="icon" aria-hidden="true"><use xlink:href="${icon}"></use></svg>`
}

/**
 * 设置切换暗色模式 icon
 */
function setModeIcon() {
  const isDark = $('html').attr('theme') === 'dark'
  const darkIcon = iconInSvg(icons.dark)
  const lightIcon = iconInSvg(icons.light)
  const icon = isDark ? darkIcon : lightIcon
  $('#navList').prepend(
    `<li class='mode-change ${isDark ? 'dark' : ''}'>${icon}</li>`,
  )
  $(document).on('click', '.mode-change', function () {
    $(this).toggleClass('dark')
    $(this).hasClass('dark')
      ? $(darkIcon).replaceAll('.mode-change .icon')
      : $(lightIcon).replaceAll('.mode-change .icon')
  })
}

/**
 * 设置github icon
 */
function setGithub() {
  const { enable, color, url } = getGithubOptions()
  if (!enable) return
  const $githubIcon = `
    <li class="custom-github" style="color:${color}">
        <a href="${url}" target="_blank">
            ${iconInSvg(icons.github)}
        </a>
    </li>`
  $('.mode-change').length
    ? $('.mode-change').after($githubIcon)
    : $('.custom-gitee').length
      ? $('.custom-gitee').before($githubIcon)
      : $('#navigator').prepend($githubIcon)
}

/**
 * gitee icon
 */
function setGitee() {
  const { enable, color, url } = getGiteeOptions()
  if (!enable) return
  const icon = `
    <li>
        <a class="custom-gitee" style="color:${color};" href=${url}>
            ${iconInSvg(icons.gitee)}
            <span>码云</span>
        </a>
    </li>`

  $('.github-icon').length
    ? $('.github-icon').after(icon)
    : $('.mode-change').length
      ? $('.mode-change').after(icon)
      : $('#navList').prepend(icon)
}

/**
 * navlist 图标（博客园  首页 ...）
 */
function nav() {
  const { cnblog, home, pens, contact, rss, admin } = icons

  const items = [
    { selector: '#blog_nav_sitehome', icon: cnblog },
    { selector: '#blog_nav_myhome', icon: home },
    { selector: '#blog_nav_newpost', icon: pens },
    { selector: '#blog_nav_contact', icon: contact },
    { selector: '#blog_nav_rss', icon: rss },
    { selector: '#blog_nav_admin', icon: admin },
  ]

  for (let { selector, icon } of items) {
    if ($(selector).length) {
      $(selector).prepend(iconInSvg(icon))
    }
  }
}

/**
 * 设置sidebar icon
 */
function setSidebarIcon() {
  const sidebarWraps = {
    news: '#sidebar_news', //公告
    search: '#sidebar_search', //搜索
    links: '#sidebar_shortcut', // 常用链接
    recent: '#sidebar_recentposts', //最新随笔
    tags: '#sidebar_toptags', //我的标签
    score: '#sidebar_scorerank', //积分与排名
    category: '#sidebar_postcategory', //随笔分类
    record: '#sidebar_postarchive', //随笔档案
    recentComments: '#sidebar_recentcomments', //最近评论
    topview: '#sidebar_topviewedposts', //阅读排行
    topComents: '#sidebar_topcommentedposts', //评论排行
    topDig: '#topdigg_posts_wrap', //推荐排行
    album: '#sidebar_imagecategory',
    catalog: '#catalog', //文章目录
    friends: '#sidebar_links', //友情链接
  }

  const iconActions = [
    {
      title: sidebarWraps.news,
      icon: icons.news,
    },
    {
      title: sidebarWraps.search,
      icon: icons.search,
    },
    {
      title: sidebarWraps.catalog,
      icon: icons.catalog,
    },
    {
      title: sidebarWraps.score,
      icon: icons.trending,
    },
    {
      title: sidebarWraps.links,
      icon: icons.links,
      sonIcon: icons.link,
    },
    {
      title: sidebarWraps.friends,
      icon: icons.friends,
      sonIcon: icons.link,
    },
    {
      title: sidebarWraps.album,
      icon: icons.album,
      sonIcon: icons.photo,
    },
    {
      title: sidebarWraps.recent,
      icon: icons.pens,
      sonIcon: icons.pen,
    },
    {
      title: sidebarWraps.tags,
      icon: icons.tags,
      sonIcon: icons.tag,
    },
    {
      title: sidebarWraps.record,
      icon: icons.records,
      sonIcon: icons.record,
    },
    {
      title: sidebarWraps.topview,
      icon: icons.trending,
      sonIcon: icons.view,
    },
    {
      title: sidebarWraps.topDig,
      icon: icons.trending,
      sonIcon: icons.dig,
    },
    {
      title: sidebarWraps.recentComments,
      icon: icons.comments,
      sonIcon: icons.comment,
    },
    {
      title: sidebarWraps.category,
      icon: icons.categories,
      sonIcon: icons.category,
    },
    {
      title: sidebarWraps.topComents,
      icon: icons.trending,
      sonIcon: icons.comment,
    },
  ]

  const insert = () => {
    for (const { title, icon, sonIcon } of iconActions) {
      if ($(title).length) {
        $(`${title} h3`).prepend(iconInSvg(icon))
        if (sonIcon) {
          $(`${title} ul li a`).prepend(iconInSvg(sonIcon))
        }
      }
    }
  }

  poll(() => $('#blog-sidecolumn').length, insert)
}

/**
 * 首页文章题目 icon
 */
function setIndexPosttitleIcon() {
  if (getCurrentPage() !== 'index') return
  $('.postTitle').each(function () {
    $(this).prepend(iconInSvg(icons.pen))
  })
}

/**
 * 设置首页列表查看更多按钮
 */
function setIndexPostLookIcon() {
  if (getCurrentPage() !== 'index') return
  if ($('.day').length < 1) return
  $('.c_b_p_desc_readmore').each(function () {
    $(this).append(iconInSvg(icons.look))
  })
}

/**
 * 随笔分类页、随笔档案页题目icon
 */
function setEntrylistPosttitleIcon() {
  if (getCurrentPage() !== 'list') return
  $('.entrylistPosttitle').each(function () {
    $(this).prepend(iconInSvg(icons.pen))
  })
}

/**
 * 文章小标题icon
 */
function setPostTitleIcon() {
  if (getCurrentPage() !== 'post') return
  const $h1 = $('#cnblogs_post_body:first>h1')
  const $h2 = $('#cnblogs_post_body:first>h2')
  const $title = $h1.length === 0 ? $h2 : $h1
  $($title).each(function () {
    const randomIconName = randomProperty(foodIcons)
    const icon = foodIcons[randomIconName]
    $(this).prepend(iconInSvg(icon))
  })
}

// 调用
function build() {
  setModeIcon()
  setSidebarIcon()
  setGitee()
  setGithub()
  setIndexPosttitleIcon()
  setIndexPostLookIcon()
  setEntrylistPosttitleIcon()
  setPostTitleIcon()
  nav()
}

// 加载 iconfont js，失败静默降级
export function install() {
  loadScript(fontUrl, build)
}
