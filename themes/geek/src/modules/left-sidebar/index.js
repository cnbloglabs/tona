import { getLinksOptions } from 'tona-options'
import {
  admin,
  cnblogHome,
  draftBox,
  index,
  newPost,
  rss,
  send,
} from '../../constants/links'
import { isOwner } from '../../utils/cnblog'
import './index.scss'

function buildLeftSidebarContainer() {
  const el = $("<div id='left-side'></div>")
  $('#home').append(el)
}

function buildLogo() {
  const el = $("<div class='logo'></div>")
  $('#left-side').append(el)
}

/**
 * 兼容旧的配置 Array<Link>
 * 当前推荐的配置类型为
 *    {
 *      enable: boolean;
 *      value: Array<Link>;
 *    }
 */
function isOldConfig(userConfig) {
  for (const [key] of Object.entries(userConfig)) {
    if (!Number.isNaN(Number.parseInt(key, 10))) {
      return true
    }
  }
  return false
}

function resolveCustomLinks() {
  const userConfig = getLinksOptions()
  if (isOldConfig(userConfig)) {
    const links = []
    for (const [key, value] of Object.entries(userConfig)) {
      if (!Number.isNaN(Number.parseInt(key, 10))) {
        links.push(value)
      }
    }
    return { enabled: true, links }
  }
  const { enable, value } = userConfig
  return { enabled: !!enable, links: value || [] }
}

function buildCustomLinks({ enabled, links }) {
  if (!enabled) {
    return
  }
  const el = $('<div class="links left-side-wrapper"><ul></ul></div>')
  for (const { name, link } of links) {
    el.find('ul').append(
      `<li><a href="${link}" target="_blank">${name}</a></li>`,
    )
  }
  $('#left-side').append(el)
}

function bindCustomLinksPopover($entry) {
  const $trigger = $entry.find('.custom-links-nav')
  const $popover = $entry.find('.custom-links-popover').detach()
  $('body').append($popover)

  let openByClick = false
  let leaveTimer = null

  function clearLeaveTimer() {
    if (leaveTimer !== null) {
      clearTimeout(leaveTimer)
      leaveTimer = null
    }
  }

  function placePopover() {
    const rect = $trigger[0].getBoundingClientRect()
    $popover.css({
      top: `${rect.top}px`,
      left: `${rect.right + 8}px`,
    })
  }

  function open() {
    clearLeaveTimer()
    placePopover()
    $popover.addClass('is-open')
  }

  function close() {
    clearLeaveTimer()
    openByClick = false
    $popover.removeClass('is-open')
  }

  function scheduleClose() {
    clearLeaveTimer()
    leaveTimer = setTimeout(() => {
      leaveTimer = null
      if (!openByClick) {
        close()
      }
    }, 120)
  }

  $entry.on('mouseenter', () => {
    open()
  })

  $entry.on('mouseleave', () => {
    scheduleClose()
  })

  $popover.on('mouseenter', () => {
    clearLeaveTimer()
    open()
  })

  $popover.on('mouseleave', () => {
    scheduleClose()
  })

  $trigger.on('click', (event) => {
    event.preventDefault()
    event.stopPropagation()
    openByClick = true
    open()
  })

  $(document).on('click.customLinksPopover', (event) => {
    if (!openByClick) {
      return
    }
    if (
      $(event.target).closest($entry).length ||
      $(event.target).closest($popover).length
    ) {
      return
    }
    close()
  })
}

function appendCollapsedCustomLinksNav(links) {
  if (!links.length) {
    return
  }

  const $entry = $(
    `<div class="custom-links-entry">
      <a href="javascript:void(0)" class="custom-links-nav">
        <li>
          <span class="fas fa-fw fa-link"></span>
          <span class="nav-item-text">链接</span>
        </li>
      </a>
      <div class="custom-links-popover"><ul></ul></div>
    </div>`,
  )

  const $list = $entry.find('.custom-links-popover ul')
  for (const { name, link } of links) {
    $list.append(`<li><a href="${link}" target="_blank">${name}</a></li>`)
  }

  $('#cnblog-nav > ul').append($entry)
  bindCustomLinksPopover($entry)
}

function removeHeaderToLeftSidebar(resolvedLinks) {
  const navList = [
    {
      icon: 'fa-blog',
      title: '博客园',
      url: cnblogHome,
      allowVisit: true,
    },
    {
      icon: 'fa-home',
      title: '首页',
      url: index,
      allowVisit: true,
    },
    {
      icon: 'fa-pen-square',
      title: '新随笔',
      url: newPost,
      allowVisit: true,
    },
    {
      icon: 'fa-paper-plane',
      title: '草稿箱',
      url: draftBox,
      allowVisit: true,
    },
    {
      icon: 'fa-envelope',
      title: '联系',
      url: send,
      allowVisit: true,
    },
    {
      icon: 'fa-rss',
      title: '订阅',
      url: rss,
      allowVisit: true,
    },
    {
      icon: 'fa-cog',
      title: '管理',
      url: admin,
      allowVisit: false,
    },
  ]

  const el = $('<div id="cnblog-nav" class="left-side-wrapper"><ul></ul></div>')

  for (const { icon, title, url, allowVisit } of navList) {
    const target = title === '首页' ? '_self' : '_blank'
    const item = $(`<a href="${url}" target="${target}">
            <li>
                <span class="fas fa-fw ${icon}"></span>
                <span class="nav-item-text">${title}</span>
            </li>
        </a>`)

    if (!isOwner && !allowVisit) {
      continue
    }
    if (title === '订阅') {
      item.removeAttr('target').attr({
        'data-rss': url,
        href: 'javascript:void(0)',
        onclick: '$("#blog_nav_rss").trigger("click");',
      })
    }

    el.find('ul').append(item)
  }

  $('#left-side .logo').after(el)

  if (resolvedLinks.enabled) {
    appendCollapsedCustomLinksNav(resolvedLinks.links)
  }
}

export function install() {
  buildLeftSidebarContainer()
  buildLogo()
  const resolvedLinks = resolveCustomLinks()
  buildCustomLinks(resolvedLinks)
  removeHeaderToLeftSidebar(resolvedLinks)
}
