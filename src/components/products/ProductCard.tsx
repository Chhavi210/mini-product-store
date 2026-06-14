import { Link } from 'react-router-dom'
import type { Product } from '@/types'
import { FavoriteButton } from '@/components/ui/FavoriteButton'
import { StarRating } from '@/components/ui/StarRating'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuthStore()
  const { addToCart } = useCartStore()

  const discountedPrice =
    product.price * (1 - product.discountPercentage / 100)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('Please log in to add to cart')
      return
    }
    addToCart(user.id, product)
    toast.success(`${product.title} added to cart`)
  }

  return (
    <Link
      to={`/product/${product.id}`}
      className="group relative flex flex-col rounded-xl border border-slate-200 bg-white
        shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5
        dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
      aria-label={product.title}
    >
      {/* Discount badge */}
      {product.discountPercentage > 0 && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
          -{Math.round(product.discountPercentage)}%
        </span>
      )}

      {/* Favorite button */}
      <div className="absolute right-3 top-3 z-10">
        <FavoriteButton productId={product.id} />
      </div>

      {/* Thumbnail */}
      <div className="overflow-hidden rounded-t-xl bg-slate-50 dark:bg-slate-900">
        <img
          src={product.thumbnail}
          alt={product.title}
          loading="lazy"
          className="h-48 w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-primary-600 dark:text-primary-400">
          {product.brand}
        </p>
        <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
          {product.title}
        </h3>

        <div className="mb-3">
          <StarRating rating={product.rating} />
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              ${discountedPrice.toFixed(2)}
            </span>
            {product.discountPercentage > 0 && (
              <span className="ml-1.5 text-xs text-slate-400 line-through">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleAddToCart}
            aria-label={`Add ${product.title} to cart`}
            className="opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
          >
            Add
          </Button>
        </div>
      </div>
    </Link>
  )
}
