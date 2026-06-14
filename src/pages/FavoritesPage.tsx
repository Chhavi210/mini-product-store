import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useFavoritesStore } from '@/store/favoritesStore'
import { getProductsByIds } from '@/api/products'
import type { Product } from '@/types'
import { ProductCard } from '@/components/products/ProductCard'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'

export function FavoritesPage() {
  const { user } = useAuthStore()
  const { getFavorites } = useFavoritesStore()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const favoriteIds = user ? getFavorites(user.id) : []

  useEffect(() => {
    if (!user) return
    if (favoriteIds.length === 0) {
      setProducts([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    getProductsByIds(favoriteIds)
      .then(setProducts)
      .catch(() => setError('Failed to load favorites. Please try again.'))
      .finally(() => setIsLoading(false))
  }, [JSON.stringify(favoriteIds)]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">My Favorites</h1>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-slate-600 dark:text-slate-300">{error}</p>
          <Button onClick={() => window.location.reload()} variant="secondary">Try again</Button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && products.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="text-5xl">💔</div>
          <p className="font-medium text-slate-700 dark:text-slate-200">No favorites yet</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Browse products and tap the ♡ to save your favorites here.
          </p>
          <Link to="/"><Button variant="secondary">Browse products</Button></Link>
        </div>
      )}

      {/* Grid */}
      {!isLoading && !error && products.length > 0 && (
        <>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            {products.length} saved product{products.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 animate-fade-in">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </>
      )}
    </main>
  )
}
