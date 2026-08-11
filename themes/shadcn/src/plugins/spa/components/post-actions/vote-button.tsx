import { Loader2, ThumbsUp } from 'lucide-preact'
import { useAjaxComplete } from 'tona-hooks'
import { toast } from 'tona-sonner'
import { likePost, unLikePost } from 'tona-utils'
import { Button } from '@/components/ui/button'
import { useVoteStatus } from './hooks'

export function VoteButton() {
  useAjaxComplete({
    urlPattern: '/ajax/vote/blogpost',
    onSuccess: (resp: {
      data: null | string
      id: number
      isSuccess: boolean
      message: string
    }) => {
      if (!resp.isSuccess) {
        toast.error(resp.message)
      }
    },
    onError: () => {
      toast.error('推荐失败')
    },
  })

  const { data, isPending } = useVoteStatus()

  const handleClick = () => {
    const action = data?.isLiked ? unLikePost : likePost
    action()
  }

  return (
    <Button onClick={handleClick} disabled={isPending} variant="outline">
      {isPending ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <ThumbsUp size={18} />
      )}
      <span>{`${data?.diggCount || 0} 推荐`}</span>
    </Button>
  )
}
