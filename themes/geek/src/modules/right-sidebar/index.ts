import { getGithubOptions } from 'tona-options'
import { contact, message } from '../../constants/links'
import {
  getArticleCount,
  getCommentCount,
  getPostCount,
  getViewCount,
} from '../../utils/cnblog'
import { getMonth, getQuarter, poll } from '../../utils/helpers'
import './index.scss'

function flat() {
  $('#sideBar').appendTo($('#home'))
}

function buildTopBtns() {
  const noticeCount = $('#msg_count').text()
  const el = `
    <div class="account">
        <div class="account-button email">
            <a href="${contact}" target="_bank">
                <li class="fas fa-envelope"></li>
            </a>
        </div>
        <div class="account-button message">
            <a href="${message}" class='account-button-notice'>
                <li class="fas fa-bell"></li>
                <span class="notice-count" ${
                  !noticeCount && 'style=display:none'
                }>${noticeCount}</span>
            </a>
        </div>
        <div class="account-button stats">
            <div class="account-button-stats">
                <li class="fas fa-chart-bar"></li>
            </div>
        </div>
    </div>`
  $('#sideBarMain').prepend(el)
}

function buildGithubIcon() {
  const { enable, url } = getGithubOptions({ enable: true })
  if (!enable) {
    return
  }
  const el = `<div class="account-avatar">
                <a href="${url}"><i class="fab fa-github"></i></a>
              </div>`
  $('.account').append(el)
}

function buildStatistics() {
  poll(
    () => {
      return !Number.isNaN(
        Number.parseInt(
          $('#stats_post_count').text().trim().replace(/\D/g, ''),
          10,
        ),
      )
    },
    () => {
      const el = `<ul class="stat-list">
                      <li>随笔：<span>${getPostCount()}</span></li>
                      <li>文章：<span>${getArticleCount()}</span></li>
                      <li>评论：<span>${getCommentCount()}</span></li>
                      <li>阅读：<span>${getViewCount()}</span></li>
                    </ul>`
      $('.account-button-stats').after(el)
    },
  )
}

function buildCalendar() {
  const quarter = getQuarter()
  const imageUrlPrefix = 'https://images.cnblogs.com/cnblogs_com/guangzan'
  const quarterMap: Record<string, string> = {
    Spring: `${imageUrlPrefix}/1894231/o_230626114104_spring.png`,
    Summer: `${imageUrlPrefix}/1894231/o_230626114104_summer.png`,
    Autumn: `${imageUrlPrefix}/1894231/o_230626114105_autumn.png`,
    Winter: `${imageUrlPrefix}/1894231/o_230626114104_winter.png`,
  }
  const quarterImg = quarterMap[quarter!]
  const month = getMonth()
  const instance = new Date()
  const year = instance.getFullYear()
  const date =
    instance.getDate() < 10 ? `0${instance.getDate()}` : instance.getDate()
  const el = `
    <div id="custom-calendar" class="sidebar-block">
        <div class="event-wrapper">
            <img src="${quarterImg}" class="event-img">
            <div class="event-title">${quarter} Wonderland</div>
            <div class="event-subtitle">${date} ${month}, ${year}</div>
        </div>
    </div>
    `
  $('#sidebar_news').after($(el))
}

export function install() {
  flat()
  buildTopBtns()
  buildStatistics()
  buildGithubIcon()
  buildCalendar()
}
