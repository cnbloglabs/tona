/**
 * 博客园现在使用了与之相同的库
 * 1. 随笔详情页图片灯箱已移除，博客园已拥有此功能
 * 2. 相册查看图像
 */
import { getImagePreviewOptions } from 'tona-options'
import type { ImagePreviewOptions, Theme } from '../../types'
import { mediaZoomJs } from '../../constants/cdn'
import { isAlbumPage, isMd, isPostDetailsPage } from '../../utils/cnblog'
import { loadScript, mousewheel, poll } from '../../utils/helpers'

const customGalleryClass = 'custom-gallery'

const mediumZoomConfig = {
  opacity: 0.5,
}

/**
 * 去除 TinyMCE 插入的图片的容器链接
 */
function removeImageOuterHref() {
  if (isMd()) {
    return
  }
  $('p img').css('display', 'block').unwrap()
}

/**
 * 构建相册
 */
function buildGallery() {
  if (!isAlbumPage()) {
    return
  }
  const title = $('.thumbTitle, .galleryTitle').text().trim()
  const el = `
    <section class="${customGalleryClass}">
        <h3>${title}</h3>
        <div></div>
    </section>`
  const gallery = $(el)
  $('.gallery img').each(function () {
    const src = $(this).attr('src')!
    const openSrc = src.replace(/t_/, 'o_')
    gallery.find('div').append(`<img src="${openSrc}"/>`)
  })
  $('.forFlow').append(gallery)
  $('.gallery').remove()
}

/**
 * 构建图片灯箱
 */
function build() {
  // 博客园给随笔内容中的图片添加了这个功能，现将它移除
  // #cnblogs_post_body img,
  const imgList = $(` .blog_comment_body img, .${customGalleryClass} img`)
  // 原 JS 笔误（对象与数字比较，恒 false），行为保持
  if ((imgList as unknown) === 0) {
    return
  }
  $.each(imgList, (i) => {
    const item = $(imgList[i])
    item.addClass('custom-zoom')
  })

  const zoom = window.mediumZoom!('.custom-zoom', mediumZoomConfig)

  zoom.on!('open', () => {
    mousewheel(() => {
      zoom.close!()
    })
  })

  removeImageOuterHref()
}

export function imagePreview(_: Theme, devOptions?: ImagePreviewOptions) {
  const { enable } = getImagePreviewOptions(devOptions)

  if (!enable) {
    return
  }
  if (!isMd() && !isAlbumPage() && !isPostDetailsPage()) {
    return
  }
  if ($('.custom-zoom').length) {
    return
  }

  buildGallery()
  loadScript(mediaZoomJs, () => {
    poll(
      () =>
        $('.blog_comment_body').length || $(`.${customGalleryClass}`).length,
      build,
    )
  })
  window.imagebox = build
}
