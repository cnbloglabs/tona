import { Loader2, Star } from 'lucide-preact'
import { Button } from '@/components/ui/button'
import { useFavoriteStatus } from './hooks'
import { triggerFavorite } from './utils'

export function FavoriteButton() {
  const { data, isPending } = useFavoriteStatus()

  return (
    <Button
      onClick={triggerFavorite}
      disabled={data?.isFavorite || isPending}
      variant="outline"
    >
      {isPending ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <Star size={18} />
      )}
      <span>{data?.isFavorite ? '已收藏' : '收藏'}</span>
    </Button>
  )
}
