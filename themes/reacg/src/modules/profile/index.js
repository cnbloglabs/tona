import './index.scss'
import { avatar } from '../../common/constants/cnblog'
import {
  followersDetailsUrl,
  followingDetailsUrl,
  index,
  userDetails,
} from '../../common/constants/links'
import {
  getBlogAge,
  getBlogName,
  getFollowers,
  getFollowing,
  isOwner,
} from '../../common/utils/cnblog'
import { poll } from '../../common/utils/helpers'

function buildAvatar() {
  function buildAvatar() {
    $('#blog-news').prepend(`<img class='custom-avatar' src='${avatar}' />`)
  }
  poll(() => $('#profile_block>a').length, buildAvatar)
}

function hideFollowButton() {
  if (!isOwner()) return
  $('#p_b_follow').hide()
}

function buildInfo() {
  const name = getBlogName()
  const date = getBlogAge()
  const followers = getFollowers()
  const following = getFollowing()
  const el = `<div class="custom-info">
        <a class='custom-name' href="${index}">昵称：${name}</a>
        <a href="${userDetails}">园龄：${date}</a>
        <a href="${followersDetailsUrl}">粉丝：${followers}</a>
        <a href="${followingDetailsUrl}">关注：${following}</a>
    </div>`
  $('#profile_block').before(el)
}

export function install() {
  buildAvatar()
  hideFollowButton()
  poll(() => $('#profile_block>a').length, buildInfo)
}
