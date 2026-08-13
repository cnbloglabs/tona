import { getNotationOptions } from 'tona-options'
import type { NotationOptions, Theme } from '../../types'
import { notationJs } from '../../constants/cdn'
import { getCurrentPage } from '../../utils/cnblog'
import { loadScript } from '../../utils/helpers'

/** 手绘标注项（notation 插件第三个参数） */
export interface NotationItem {
  page: string
  selector: string
  config: Record<string, unknown>
}

const annotateList: NotationItem[] = [
  {
    page: 'all',
    selector: '#Header1_HeaderTitle',
    config: {
      type: 'underline',
      color: '#2196F3',
    },
  },
]

/**
 * 构建 annotate group
 * @param {*} annotate
 * @param {*} customList
 */
function buildGroup(
  annotate: NonNullable<NonNullable<Window['RoughNotation']>['annotate']>,
  customList: NotationItem[],
) {
  const group: Array<{ remove?: () => void }> = []
  for (const { selector, page, config } of customList) {
    if (page === 'all' || getCurrentPage() === page) {
      const element = document.querySelectorAll(selector)
      if (!element.length) {
        continue
      }
      if (element.length === 1) {
        group.push(annotate(document.querySelector(selector), config))
      }
      if (element.length > 1) {
        element.forEach((item) => {
          group.push(annotate(item, config))
        })
      }
    }
  }
  return group
}

/**
 * 构建 notation
 * @param {*} annotate
 * @param {*} annotationGroup
 * @param {*} customList
 */
function buildNotation(
  annotate: NonNullable<NonNullable<Window['RoughNotation']>['annotate']>,
  annotationGroup: (group: unknown[]) => { show: () => void },
  customList: NotationItem[],
) {
  setTimeout(() => {
    const group = buildGroup(annotate, customList)
    const ag = annotationGroup(group)
    ag.show()
  }, 2000)
}

export function notation(
  _: Theme,
  devOptions?: NotationOptions,
  customList: NotationItem[] = annotateList,
) {
  if (getCurrentPage() !== 'post') {
    return
  }
  const { enable } = getNotationOptions(devOptions)
  if (!enable) {
    return
  }
  if (!customList.length) {
    return
  }

  loadScript(notationJs, () => {
    const { annotate, annotationGroup } = window.RoughNotation!
    buildNotation(annotate!, annotationGroup!, customList)
  })
}
