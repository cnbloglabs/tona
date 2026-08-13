/**
 * 博客园相关链接
 */
import { getBlogName } from '../utils/cnblog'

const { currentBlogApp } = window
const blogName = getBlogName()
const home = 'https://home.cnblogs.com'
const cnblog = 'https://www.cnblogs.com'
const iCnblog = 'https://i.cnblogs.com'
const msg = 'https://msg.cnblogs.com'

/* 用户详情页 */
export const userDetails = `${home}/u/${currentBlogApp}`
/* 粉丝 */
export const followersDetailsUrl = `${home}/u/${currentBlogApp}/followers`
/* 我的关注 */
export const followingDetailsUrl = `${home}/u/${currentBlogApp}/followees`
/* 博客园首页 */
export const cnblogHome = cnblog
/* 订阅 */
export const rss = `${cnblog}/${currentBlogApp}/rss`
/* 用户博客首页 */
export const index = `${cnblog}/${currentBlogApp}`
/* 我赞 */
export const mydigged = `${cnblog}/aggsite/mydigged`
/* 我评 */
export const commented = `${cnblog}/aggsite/mycommented`
/* 关注园友最新博文 */
export const following = `${cnblog}/following`
/* 新随笔 */
export const newPost = `${iCnblog}/posts/edit`
/* 联系 */
export const send = $('#blog_nav_contact').attr('href')
/* 管理 */
export const admin = iCnblog
/* 消息 */
export const message = `${msg}`
/* 联系博主 */
export const contact = `${msg}/send/${blogName}`
/* 收藏 */
export const appWz = 'https://wz.cnblogs.com'
/* 博问 */
export const appQ = 'https://q.cnblogs.com'
/* 闪存 */
export const appIng = 'https://ing.cnblogs.com'
/* 小组 */
export const appGroup = 'https://group.cnblogs.com'
/* 草稿箱 */
export const draftBox = 'https://i.cnblogs.com/posts'
