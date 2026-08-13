// 在随笔详情页顶部随笔生成一个文章头图
import { getPostTopImageOptions } from 'tona-options'
import type { PostTopImageOptions, Theme } from '../../types'
import { isPostDetailsPage } from '../../utils/cnblog'
import { randomArrayElements, randomImgUrl } from '../../utils/helpers'

export function postTopImage(_: Theme, devOptions?: PostTopImageOptions) {
  const { enable, imgs, fixed } = getPostTopImageOptions(devOptions)

  if (!enable) {
    return
  }
  if (!isPostDetailsPage()) {
    return
  }

  const url =
    imgs.length === 0 ? randomImgUrl() : randomArrayElements(imgs, 1)[0]
  const ele = `<a  href="${url}" target="blank"><div id="custom-post-topimage"></div></a>`
  const style: Record<string, string> = {
    'background-image': `url(${url})`,
  }

  if (fixed) {
    style['background-attachment'] = 'fixed'
  }
  $('.post>.postTitle').before(ele)
  $('#custom-post-topimage').css(style)
}
