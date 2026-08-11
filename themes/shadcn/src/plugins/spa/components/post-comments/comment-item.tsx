import { MessageSquare, ThumbsDown, ThumbsUp, User } from 'lucide-preact'
import { Markdown } from '../markdown'
import type { CommentItem } from './types'

interface CommentItemProps {
  comment: CommentItem
}

export function CommentItemComponent({ comment }: CommentItemProps) {
  return (
    <article className="not-last:screen-line-after p-4">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {comment.avatar ? (
            <img
              src={comment.avatar}
              alt={comment.author}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <a
                href={comment.authorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground text-sm hover:text-primary hover:underline"
              >
                {comment.author}
              </a>
              {comment.isOwner && (
                <span className="rounded-full bg-primary px-2 py-0.5 font-medium text-primary-foreground text-xs">
                  博主
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <span>{comment.date}</span>
              <span>•</span>
              <span>{comment.floor}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-4">
        {comment.replyTo && (
          <div className="mb-2 rounded-md bg-muted/50 px-3 py-2">
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <MessageSquare className="h-3 w-3" />
              <span>回复</span>
              <a
                href={`#${comment.replyTo.id}`}
                className="font-medium text-primary hover:underline"
              >
                @{comment.replyTo.author}
              </a>
            </div>
          </div>
        )}
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <Markdown html={comment.content} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="px-2 py-1 text-muted-foreground text-xs transition-colors hover:bg-muted hover:text-foreground"
          onClick={() => {
            window.GetCommentBody(comment.id)
          }}
        >
          修改
        </button>
        <button
          type="button"
          className="px-2 py-1 text-muted-foreground text-xs transition-colors hover:bg-muted hover:text-foreground"
          onClick={() => {
            window.ReplyComment(comment.id, comment.replyToId)
          }}
        >
          回复
        </button>
        <button
          type="button"
          className="px-2 py-1 text-muted-foreground text-xs transition-colors hover:bg-muted hover:text-foreground"
          onClick={() => {
            window.DelComment(comment.id, $(), window.currentPostId)
          }}
        >
          删除
        </button>
        <button
          type="button"
          className="px-2 py-1 text-muted-foreground text-xs transition-colors hover:bg-muted hover:text-foreground"
          onClick={() => {
            window.QuoteComment(comment.id, comment.replyToId)
          }}
        >
          引用
        </button>
        <button
          type="button"
          className="ml-auto flex items-center gap-1 px-2 py-1 text-muted-foreground text-xs transition-colors hover:bg-muted hover:text-foreground"
          onClick={() => {
            const mockVoteDom = document.createElement('div')
            mockVoteDom.innerHTML = `
              <span class="comment_digg">支持(${comment.supportCount})</span>
              <span class="comment_bury">反对(${comment.opposeCount})</span>
              <span class="comment_error"></span>
            `
            window.voteComment(comment.id, 'Bury', mockVoteDom, false)
          }}
        >
          <ThumbsDown className="h-3 w-3" />
          <span>{comment.opposeCount}</span>
        </button>
        <button
          type="button"
          className="flex items-center gap-1 px-2 py-1 text-muted-foreground text-xs transition-colors hover:bg-muted hover:text-foreground"
          onClick={() => {
            const mockVoteDom = document.createElement('div')
            mockVoteDom.innerHTML = `
              <span class="comment_digg">支持(${comment.supportCount})</span>
              <span class="comment_bury">反对(${comment.opposeCount})</span>
              <span class="comment_error"></span>
            `
            window.voteComment(comment.id, 'Digg', mockVoteDom, false)
          }}
        >
          <ThumbsUp className="h-3 w-3" />
          <span>{comment.supportCount}</span>
        </button>
      </div>
    </article>
  )
}
