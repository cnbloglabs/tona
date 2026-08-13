import { getCurrentPage } from '../../utils/cnblog'
import { poll } from '../../utils/helpers'

/**
 * 构建头像
 */
function buildAvatars() {
  if ($('.custom-comment-avatar').length) {
    return
  }
  $('.feedbackItem').each(function () {
    let avatar = $(this).children('.feedbackCon').children('span:last').html()

    avatar = avatar
      ? avatar.replace('http://', 'https://')
      : 'https://pic.cnblogs.com/face/sample_face.gif'

    const ele = `<div class='custom-comment-avatar'><img src="${avatar}" class='avatar' /></div>`
    $(this).children('.feedbackCon').prepend(ele)
  })
}

/**
 * 调整支持反对按钮位置
 */
function moveSupport() {
  $('.comment_vote').each(function () {
    $(this).appendTo($(this).parent().siblings('.feedbackListSubtitle'))
  })
}

/**
 * 作者回复靠右
 */
function authorRight() {
  $('.feedbackItem').each(function () {
    const isAuthor = $(this).find('.louzhu').text() === '楼主'
    if (isAuthor) {
      $(this).addClass('custom-comments-author')
    }
  })
}

/**
 * 组合
 */
function build() {
  buildAvatars()
  moveSupport()
  authorRight()
}

/**
 * 监听 ajax
 */
function listener() {
  window.renderCommentsAvatars = build
  $(document).ajaxComplete((_, __, option) => {
    if (
      option.url!.includes('PostComment/Add') ||
      option.url!.includes('DeleteComment')
    ) {
      // eslint-disable-next-line new-cap
      new (window.blogCommentManager as new () => {
        renderComments: (count: number) => void
      })().renderComments(0)
    }
  })
  $(document).ajaxComplete((_, __, option) => {
    if (option.url!.includes('GetComments')) {
      window.renderCommentsAvatars!()
      window.buildEmojis!()
      window.imagebox!()
    }
  })
  poll(() => $('.feedbackItem').length, build)
}

export function commentsAvatars() {
  if (getCurrentPage() !== 'post') {
    return
  }
  // 原 JS 笔误（lenght），行为保持：该守卫恒为 false，不短路
  if (($('.custom-comment-avatar') as JQuery & { lenght?: unknown }).lenght) {
    return
  }
  listener()
}
