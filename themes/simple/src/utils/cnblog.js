const { currentBlogApp } = window

/**
 * 判断访问者是否为博主
 * @returns {boolean} boolean - 是否为博主
 */
export function isOwner() {
  return window.isBlogOwner
}

/**
 * 判断用户登录是否登录
 * @returns {boolean} 是否登录
 */
export function getLoginState() {
  return window.isLogined
}

/**
 * 判断是否开启公告
 * @returns {boolean} 是否开启公告
 */
export function openNews() {
  return !!$('#profile_block').length
}

/**
 * 获取博客园昵称
 * @returns {string} 博客园昵称
 */
export function getBlogName() {
  if (openNews()) {
    return $('#profile_block>a:nth-of-type(1)').html().trim()
  }
  const headerTitle = $('#Header1_HeaderTitle').text().trim()
  if (headerTitle.length) {
    return headerTitle
  }
  return currentBlogApp
}

/**
 * 获取粉丝数
 * @returns {number} 粉丝数
 */
export function getFollowers() {
  if (!openNews()) return '0'
  const text = $('#profile_block').text()
  const match = text.match(/粉丝：\s*([0-9]+)/)
  return match ? match[1].trim() : '0'
}

/**
 * 获取关注的人数
 * @returns {number} 关注的人数
 */
export function getFollowing() {
  if (!openNews()) return '0'
  const text = $('#profile_block').text()
  const match = text.match(/关注：\s*([0-9]+)/)
  return match ? match[1].trim() : '0'
}

/**
 * 判断是否已经关注
 * @returns {boolean} 是否已经关注
 */
export function getFollowState() {
  return $('#p_b_follow>a').text().trim() === '-取消关注'
}

/**
 * 获取园龄
 * @returns {string} 园龄
 */
export function getBlogAge() {
  if (!openNews()) return '未知'
  const text = $('#profile_block').text()
  const match = text.match(/园龄：\s*([^ \n]+)/)
  return match ? match[1].trim() : '未知'
}

/**
 * 获取当前博文链接
 * @returns {string} 当前博文链接
 */
export function getCurrentPostUrl() {
  return !location.href.includes('#')
    ? location.href
    : location.href.substring(0, location.href.lastIndexOf('#'))
}

/**
 * 获取博客园 user guid
 */
export function getBlogUserGuid() {
  const strValue = $('body>script:last').text()
  const regex = /'([^"]*)'/
  return regex.exec(strValue)[1]
}

/**
 * 关注
 */
export function follow() {
  const guid = window.cb_blogUserGuid
  if (guid) {
    window.follow(guid)
  } else {
    $('#p_b_follow>a').trigger('click')
  }
}

/**
 * 取消关注
 */
export function unfollow() {
  window.unfollow(window.cb_blogUserGuid)
}

/**
 * 判断文章是否打开了评论
 * @returns {boolean} 文章是否打开了评论
 */
export function IsCommentTurnedOn() {
  return !!$('#tbCommentBody').length
}

/**
 * 判断是否为博文详情页
 * @returns {boolean} 是否为博文详情页
 */
export function isPostDetailsPage() {
  return !!$('#post_detail').length
}

/**
 * 是否为首页
 * @returns {boolean} 是否为首页
 */
export function isHomePage() {
  return !!$('.day').length
}

/**
 * 是否为标签列表页
 * @returns {boolean} 是否为标签列表页
 */
export function isTagListPage() {
  return !!$('#taglist_main').length
}

/**
 * 是否为博文详情页
 * @returns {boolean} 是否为博文详情页
 */
export function isEntrylistPage() {
  return !!$('.entrylistPosttitle').length
}

/**
 * 判断是否为相册页
 * @returns {boolean} 是否为相册页
 */
export function isAlbumPage() {
  return !!$('.gallery').length
}

/**
 * 判断是否为博文分类页
 * @returns {boolean} 是否为博文分类页
 */
export function isCategoryPage() {
  return !!$('.entrylistItem').length
}

/**
 * 获取当前页面名称
 * @returns {string} 'post' | 'index' | 'tag' | 'list' | 'tag' | 'taglist'
 */
export function getCurrentPage() {
  return $('#post_detail').length
    ? 'post'
    : $('.day').length
      ? 'index'
      : $('#taglist_main').length
        ? 'tag'
        : $('.entrylistPosttitle').length
          ? 'list'
          : $('#myposts').length
            ? 'tag'
            : undefined
}

/**
 * 判断编辑器类型是否为 md
 * @returns {boolean} 编辑器类型是否为 md
 */
export function isMd() {
  return $('#cnblogs_post_body').hasClass('cnblogs-markdown')
}

// TODO
/**
 * 判断编辑器类型是否为 tinymce 5
 */
export function isTinymce5() {}

/**
 * 判断文章内容是否存在标题
 * @returns {boolean} 文章内容是否存在标题
 */
export function hasPostTitle() {
  return !!$(
    '#cnblogs_post_body>h1,#cnblogs_post_body>h2,#cnblogs_post_body>h3,#cnblogs_post_body>h4',
  ).length
}

/**
 * 推荐博文
 * 博客园过滤机制禁止调用 `windown.votePost`
 * https://group.cnblogs.com/topic/115024.html
 */
export function likePost() {
  // const id = window.location.href.match(/p\/(\S*).html/)[1]
  // window.votePost(parseInt(id), 'Digg')
  $('.diggit').trigger('click')
}

/**
 * 获取用户信息
 * 仅当用户代码放到页脚 HTML 中才有效
 * @returns {Promise} 表示用户信息的 Promise 对象
 */
export function getUserInfo() {
  return new Promise((resolve) => {
    $(document).ajaxComplete((_, xhr, settings) => {
      if (settings.url === 'https://account.cnblogs.com/user/userinfo') {
        resolve($.parseJSON(xhr.responseText))
      }
    })
  })
}

/**
 * 获取消息数
 * @returns {(string|undefined)} 消息数
 */
export function getMessageCount() {
  return $('#msg_count').text()
}

/**
 * 获取随笔数量
 * @returns {string} 随笔数量
 */
export function getPostCount() {
  return $('#stats_post_count').text().trim().replace(/\D/g, '')
}

/**
 * 获取文章数量
 * @returns {string} 文章数量
 */
export function getArticleCount() {
  return $('#stats_article_count').text().trim().replace(/\D/g, '')
}

/**
 * 获取评论数量
 * @returns {string} 评论数量
 */
export function getCommentCount() {
  return $('#stats-comment_count').text().trim().replace(/\D/g, '')
}

/**
 * 获取博客访问总量
 * @returns {string} 博客访问总量
 */
export function getViewCount() {
  return $('#stats-total-view-count>span').text().trim()
}
