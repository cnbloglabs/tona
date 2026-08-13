import { getGithubOptions, getLinksOptions } from 'tona-options'
import type { Link } from 'tona-plugins'
import {
  admin,
  cnblogHome,
  draftBox,
  index,
  newPost,
  rss,
  send,
} from '../../constants/links'
import { avatar } from '../../constants/cnblog'
import { getBlogName, isOwner } from '../../utils/cnblog'
import './index.scss'

function buildLeftSidebarContainer() {
  const el = $("<div id='left-side'></div>")
  $('#home').append(el)
}

function buildLogo() {
  const el = $("<div class='logo'></div>")
  $('#left-side').append(el)
}

function buildCustomLinks(links: Link[]) {
  if (!links.length) {
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

function bindCustomLinksPopover($entry: JQuery<HTMLElement>) {
  const $trigger = $entry.find('.custom-links-nav')
  const $popover = $entry.find('.custom-links-popover').detach()
  $('body').append($popover)

  let openByClick = false
  let leaveTimer: ReturnType<typeof setTimeout> | null = null

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

function appendCollapsedCustomLinksNav(links: Link[]) {
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

function removeHeaderToLeftSidebar(links: Link[]) {
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
      allowVisit: false,
    },
    {
      icon: 'fa-paper-plane',
      title: '草稿箱',
      url: draftBox,
      allowVisit: false,
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

  if (links.length) {
    appendCollapsedCustomLinksNav(links)
  }
}

function buildLeftsideBottomBtns() {
  const { enable, url } = getGithubOptions()
  if (!enable) {
    return
  }
  const userName = getBlogName()
  const el = `
    <div class="leftside-bottom">
      <a href="${url}" class="follow-me" target="_blank">
        <span class="follow-text"><i class="fas fa-github"></i><span>Fork me on GitHub</span></span>
        <span class="developer">
          <img src="${avatar}">
          <span>${userName}</span>
        </span>
      </a>
    </div>`
  $('#left-side').append(el)
}

export function install() {
  buildLeftSidebarContainer()
  buildLogo()

  const { enable, value } = getLinksOptions()
  const links = enable ? value : []

  buildCustomLinks(links)
  removeHeaderToLeftSidebar(links)
  buildLeftsideBottomBtns()
}
