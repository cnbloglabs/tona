// 评论输入表情
import { getEmojiOptions } from 'tona-options'
import { isPostDetailsPage } from '../../utils/cnblog'
import { isUrl, poll } from '../../utils/helpers'

const defaultEmojiList = [
  {
    value: '👍',
    label: '',
  },
  {
    value: '👏',
    label: '',
  },
  {
    value: '😄',
    label: '',
  },
  {
    value: '🎉',
    label: '',
  },
  {
    value: '🚀',
    label: '',
  },
  {
    value: '👀',
    label: '',
  },
]

/**
 * 创建按钮
 */
function createEmojiButton(buttonIcon) {
  return `<span class="qaq-btn" title="表情">${buttonIcon.length ? buttonIcon : '🍺'}</span>`
}

/**
 * 创建表情项
 */
function createEmojiItem(itemData) {
  const { value, label } = itemData
  const el = $('<div>').addClass('emoji-item')

  if (isUrl(value)) {
    const emoji = $('<img />').addClass('emoji emoji-img').attr('src', value)
    el.append(emoji)
  } else {
    el.append(`<div class="emoji emoji-text">${value}</div>`)
  }

  if (typeof label === 'string') {
    el.attr('title', label)
  }

  return el
}

/**
 * 创建表情列表
 */
function createEmojiList(emojiList) {
  const emojis = emojiList?.length ? emojiList : defaultEmojiList
  const $emoji = $('<div class="emoji-list"></div>')

  emojis.forEach((item) => {
    const emojiItem = createEmojiItem(item)
    $emoji.append(emojiItem)
  })

  return $emoji
}

/**
 * 创建表情面板容器
 */
function createEmojiContainer() {
  return $('<div>').addClass('qaq-wrap anim-scale-in')
}

/**
 * 创建表情面板蒙层
 */
function createMask() {
  return $('<div>').addClass('qaq-mask')
}

/**
 * 打开或关闭表情面板
 */
function qaqToggle() {
  $('.qaq-wrap').toggle()
}

/**
 * 选择表情
 */
function selectEmoji() {
  $('.emoji-item').click(function () {
    const $emoji = $(this).find('.emoji')
    let emojiValue

    const isImgEmoji = $emoji.hasClass('emoji-img')

    if (isImgEmoji) {
      const url = $emoji.attr('src')
      emojiValue = `![](${url})`
    } else {
      const textEmoji = $emoji.html()
      emojiValue = textEmoji
    }

    document.querySelector('#tbCommentBody').value += emojiValue
    qaqToggle()
  })
}

/**
 * 创建表情插件
 * @param {Array} emojiData
 */
function createEmoji(emojiData, buttonIcon) {
  const button = createEmojiButton(buttonIcon)
  const emojiContainer = createEmojiContainer()
  const mask = createMask()
  const emojiList = createEmojiList(emojiData)

  emojiContainer.append(emojiList).append(mask)

  $('.commentbox_title_right').prepend(button).css('position', 'relative')

  $('.qaq-btn')
    .after(emojiContainer)
    .click(() => qaqToggle())

  $('.qaq-mask').click(() => qaqToggle())

  selectEmoji()
}

export function emoji(_theme, devOptions) {
  const { enable, emojiList, buttonIcon } = getEmojiOptions(devOptions)

  if (!enable) {
    return
  }
  if (!isPostDetailsPage()) {
    return
  }

  const builder = () => {
    if ($('.qaq-btn').length) {
      return
    }
    if (!$('.commentbox_title_right').length) {
      return
    }
    createEmoji(emojiList, buttonIcon)
  }

  builder()
  window.buildEmojis = builder

  // 评论编辑框可能异步渲染（如登录后/懒加载），等待其出现后再挂载按钮
  poll(() => $('.commentbox_title_right').length, builder)
}
