import { Heart, Loader2 } from 'lucide-preact'
import { Button } from '@/components/ui/button'
import { useFollow } from '@/plugins/spa/hooks/use-follow'

export function FollowButton() {
  const { onToggleFollow, isPending, isFollowed } = useFollow()

  const buttonText = (() => {
    if (isPending) return '加载中'
    if (isFollowed) return '取消关注'
    return '关注'
  })()

  const icon = (() => {
    if (isPending) return <Loader2 size={18} className="animate-spin" />
    return <Heart size={18} />
  })()

  return (
    <Button onClick={onToggleFollow} disabled={isPending} variant="outline">
      {icon}
      <span>{buttonText}</span>
    </Button>
  )
}
