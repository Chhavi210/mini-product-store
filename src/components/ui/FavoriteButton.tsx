import { useCallback, useState } from 'react'
import clsx from 'clsx'
import { useAuthStore } from '@/store/authStore'
import { useFavoritesStore } from '@/store/favoritesStore'
import toast from 'react-hot-toast'

interface FavoriteButtonProps {
  productId: number
  className?: string
}

export function FavoriteButton({ productId, className }: FavoriteButtonProps) {
  const { user } = useAuthStore()
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore()
  const [isAnimating, setIsAnimating] = useState(false)

  const favorited = user ? isFavorite(user.id, productId) : false

  const handleToggle = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (!user) {
        toast.error('Please log in to save favorites')
        return
      }

      // Optimistic update
      setIsAnimating(true)
      const wasAdded = !favorited

      try {
        if (favorited) {
          removeFavorite(user.id, productId)
          toast.success('Removed from favorites')
        } else {
          addFavorite(user.id, productId)
          toast.success('Added to favorites')
        }
      } catch {
        // Rollback on failure
        if (wasAdded) {
          removeFavorite(user.id, productId)
        } else {
          addFavorite(user.id, productId)
        }
        toast.error('Something went wrong')
      } finally {
        setTimeout(() => setIsAnimating(false), 300)
      }
    },
    [user, favorited, productId, addFavorite, removeFavorite],
  )

  return (
    <button
      onClick={handleToggle}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={favorited}
      className={clsx(
        'flex h-9 w-9 items-center justify-center rounded-full transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        favorited
          ? 'bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30'
          : 'bg-slate-100 text-slate-400 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600',
        isAnimating && 'scale-125',
        className,
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="h-5 w-5 transition-all"
        fill={favorited ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  )
}
