import { useState } from 'preact/hooks'

export function CustomCommentInput() {
  const [comment, setComment] = useState('')

  const handleSubmit = () => {
    if (comment.trim()) {
      setComment('')
    }
  }

  return (
    <div class="flex flex-col space-y-4">
      <div class="flex flex-col space-y-2">
        <textarea
          value={comment}
          onInput={(e) => setComment((e.target as HTMLTextAreaElement).value)}
          placeholder="写评论"
          class="field-sizing-content flex min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40"
        />
      </div>
      <div class="flex justify-end">
        <button
          id="btn_comment_submit"
          type="button"
          onClick={handleSubmit}
          disabled={!comment.trim()}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 whitespace-nowrap bg-primary px-4 py-2 font-medium text-primary-foreground text-sm outline-none transition-all hover:bg-primary/90 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 has-[>svg]:px-3 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0"
        >
          提交评论
        </button>
      </div>
    </div>
  )
}
