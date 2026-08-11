import { Pin, PinOff } from 'lucide-preact'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { BackTopIndicator } from './back-top-indicator'
import type { TocDataItem } from './toc-item'

interface Props {
  className?: string
  pinned: boolean
  toc: TocDataItem[]
  rootDepth: number
  currentScrollRange: [number, number]
  onScrollToButtonClick: (
    i: number,
    $el: HTMLElement | null,
    anchorId: string,
  ) => void
  onMouseLeave: () => void
  onPinToggle: () => void
}

export function HoverCard({
  className,
  pinned,
  toc,
  rootDepth,
  currentScrollRange,
  onScrollToButtonClick,
  onMouseLeave,
  onPinToggle,
}: Props) {
  return (
    <div
      className={cn(
        'fixed top-18 right-2 z-1000 -mt-1 flex w-72 flex-col text-xs',
        'scrollbar-none overflow-hidden',
        'transition-transform duration-200 ease-in-out',
        className,
      )}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex justify-end p-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onPinToggle}
          aria-label={pinned ? '取消钉住' : '钉住'}
        >
          {pinned ? <PinOff /> : <Pin />}
        </Button>
      </div>
      <ul className="scrollbar-none max-h-[calc(100vh-200px)] overflow-auto rounded-2xl border bg-background px-4 py-2">
        {toc.map((heading, index) => (
          <li
            key={heading.anchorId}
            className="flex w-full items-center"
            style={{
              paddingLeft: `${(heading.depth - rootDepth) * 12}px`,
            }}
          >
            <button
              className={cn(
                'group flex w-full justify-between py-1 text-muted-foreground',
                index === currentScrollRange[0] ? 'text-foreground' : '',
              )}
              type="button"
              onClick={() => {
                onScrollToButtonClick(index, heading.$heading, heading.anchorId)
              }}
            >
              <span className="max-w-prose select-none truncate duration-200 group-hover:text-foreground/80">
                {heading.title}
              </span>
              <span className="ml-4 select-none text-[8px] opacity-50">
                H{heading.depth}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <BackTopIndicator />
    </div>
  )
}
