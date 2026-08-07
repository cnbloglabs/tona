import { getLinksOptions } from 'tona-options'

/**
 * 构建 copyright
 */
function buildCopyright() {
  const nickName = $('#profile_block a:first').text().trim()

  const el = `<div id='copyright'>
                    <span>Copyright © ${new Date().getFullYear()} ${nickName}</span>
                    <span> Powered by you 🌊 Theme in ${'tona'.link('#')}</span>
                </div>`

  $('#footer').empty().append(el)
}

/**
 * 构建自定义链接
 */
function buildCustomLinks(devOptions) {
  const { enable, value } = getLinksOptions(devOptions)

  if (!enable || !value.length) {
    return
  }

  const $links = $('<ul id="links"></ul>')
  for (const { name, link } of value) {
    $links.append(`<li><a href='${link}'>${name}</a></li>`)
  }
  $('#footer').prepend($links.prop('outerHTML'))
}

export function footer(_, devOptions) {
  buildCopyright()
  buildCustomLinks(devOptions)
}
