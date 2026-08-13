// 评论输入表情
import { getEmojiOptions } from 'tona-options'
import type { EmojiOptions, Theme } from '../../types'
import { isPostDetailsPage } from '../../utils/cnblog'
import { isUrl, poll } from '../../utils/helpers'

interface EmojiData {
  value: string
  label: string
}

const defaultEmojiList: EmojiData[] = [
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
function createEmojiButton(buttonIcon: string) {
  return `<span class="qaq-btn" title="表情">${buttonIcon.length ? buttonIcon : '🍺'}</span>`
}

/**
 * 创建表情项
 */
function createEmojiItem(itemData: string) {
  // 原 JS 实现：配置的 emojiList 为 string[]，字符串解构出 undefined 字段，
  // 行为保持（仅缺省列表 defaultEmojiList 走 EmojiData 分支）
  const { value, label } = itemData as unknown as EmojiData
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
function createEmojiList(emojiList: string[]) {
  const emojis = emojiList?.length ? emojiList : defaultEmojiList
  const $emoji = $('<div class="emoji-list"></div>')

  emojis.forEach((item) => {
    const emojiItem = createEmojiItem(item as unknown as string)
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
    let emojiValue: string

    const isImgEmoji = $emoji.hasClass('emoji-img')

    if (isImgEmoji) {
      const url = $emoji.attr('src')
      emojiValue = `![](${url})`
    } else {
      const textEmoji = $emoji.html()
      emojiValue = textEmoji
    }

    document.querySelector<HTMLTextAreaElement>('#tbCommentBody')!.value +=
      emojiValue
    qaqToggle()
  })
}

/**
 * 创建表情插件
 * @param {Array} emojiData
 */
function createEmoji(emojiData: string[], buttonIcon: string) {
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

export function emoji(_theme: Theme, devOptions?: EmojiOptions) {
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
