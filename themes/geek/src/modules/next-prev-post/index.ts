import { isPostDetailsPage } from '../../utils/cnblog'
import { poll } from '../../utils/helpers'
import './index.scss'

function buildNextPrevPost() {
  if (!isPostDetailsPage) {
    return
  }
  const a = $('#post_next_prev>a')

  if (!a.length) {
    return
  }

  const getData = (order: number) => {
    return {
      title: a.eq(order).text(),
      url: a.eq(order).attr('href'),
      desc: a.eq(order).attr('title'),
    }
  }

  const elements = (() => {
    const wrap = $('<div>').addClass('custom-next-prev-post')
    const createElements = (
      data: { title: string; url: string | undefined; desc: string | undefined },
      type: 'prev' | 'next',
    ) => {
      const typeMap = {
        prev: {
          className: 'prev-post',
          extraText: '上一篇',
          icon: 'fa-arrow-left',
        },
        next: {
          className: 'next-post',
          extraText: '下一篇',
          icon: 'fa-arrow-right',
        },
      }

      const item = typeMap[type]
      const link = $('<a>').append(
        $('<span>').text(item.extraText),
        $('<span>').text(data.title),
        $('<li>').addClass(`fas ${item.icon}`),
      )
      // 原 JS 在 url 为 undefined 时调用 attr('href', undefined)（jQuery 视作 getter，
      // 无副作用），此处显式跳过保持相同语义
      if (data.url !== undefined) {
        link.attr('href', data.url)
      }

      return $('<div>').addClass(item.className).append(link)
    }

    wrap.append(createElements(getData(1), 'prev'))
    if (a.length === 4) {
      wrap.append(createElements(getData(3), 'next'))
    }

    return wrap
  })()

  $('#cnblogs_post_body').after(elements)
}

export function install() {
  poll(() => $('#post_next_prev>a').length, buildNextPrevPost)
}
