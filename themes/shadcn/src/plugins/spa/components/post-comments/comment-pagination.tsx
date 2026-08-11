import { cva } from 'class-variance-authority'
import { ChevronLeft, ChevronRight } from 'lucide-preact'
import { useCommentPaginationItems } from './hooks'
import type { CommentPaginationItem } from './types'

const commentPaginationItemVariants = cva(
  'no-underline! inline-flex items-center justify-center gap-1 px-2 py-2 font-medium text-xs sm:px-4 sm:text-sm',
  {
    variants: {
      variant: {
        link: 'border-transparent border-none text-foreground hover:border-primary/30 hover:bg-muted',
        current:
          'size-7 shrink-0 select-none whitespace-nowrap border bg-background text-foreground shadow-xs outline-none hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 sm:size-9 dark:border-input dark:bg-input/30 dark:aria-invalid:ring-destructive/40 dark:hover:bg-input/50',
        text: '',
      },
      isArrow: {
        true: 'gap-1 sm:gap-2',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'text',
      isArrow: false,
    },
  },
)

export function CommentPagination() {
  const { data: items } = useCommentPaginationItems()

  const getItemContent = (item: CommentPaginationItem) => {
    if (item.text === '&lt; Prev' || item.text === '上一页') {
      return (
        <>
          <ChevronLeft className="size-4" />
          <span>上一页</span>
        </>
      )
    }

    if (item.text === 'Next &gt;' || item.text === '下一页') {
      return (
        <>
          <span>下一页</span>
          <ChevronRight className="size-4" />
        </>
      )
    }

    return <span>{item.text}</span>
  }

  const handlePageClick = (item: CommentPaginationItem) => {
    if (item.type === 'link' && item.pageNumber && item.pageSize) {
      window.commentManager.renderComments(item.pageNumber, item.pageSize)
    }
  }

  if (!items || items.length === 0) {
    return null
  }

  return (
    <nav
      aria-label="评论分页"
      className="screen-line-after mx-auto flex w-full justify-center border-x"
    >
      <ul className="mt-4 mb-4 flex items-center justify-center space-x-2">
        {items.map((item) => (
          <li key={item.text}>
            {item.type === 'link' ? (
              <button
                type="button"
                onClick={() => handlePageClick(item)}
                className={commentPaginationItemVariants({
                  variant: item.type,
                  isArrow:
                    item.text === '&lt; Prev' ||
                    item.text === '上一页' ||
                    item.text === 'Next &gt;' ||
                    item.text === '下一页',
                })}
              >
                {getItemContent(item)}
              </button>
            ) : (
              <span
                className={commentPaginationItemVariants({
                  variant: item.type,
                  isArrow:
                    item.text === '&lt; Prev' ||
                    item.text === '上一页' ||
                    item.text === 'Next &gt;' ||
                    item.text === '下一页',
                })}
              >
                {getItemContent(item)}
              </span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}
