import { getNoticeOptions } from 'tona-options'
import type { NoticeOptions, Theme } from '../../types'
import { toast } from '../toast'

function shoot(contents: string[]) {
  const length = contents.length
  for (let i = 0; i < length; i++) {
    toast(contents[i], 'info')
  }
}

export function notice(_: Theme, devOptions?: NoticeOptions) {
  const { enable, contents } = getNoticeOptions(devOptions)
  if (!enable && contents.length) {
    return
  }
  shoot(contents)
}
