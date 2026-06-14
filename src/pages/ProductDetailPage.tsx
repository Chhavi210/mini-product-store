import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProduct } from '@/api/products'
import type { Product } from '@/types'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { FavoriteButton } from '@/components/ui/FavoriteButton'
import { StarRating } from '@/components/ui/StarRating'
import { Button } from '@/components/ui/Button'
import { ProductDetailSkeleton } from '@/components/ui/Skeleton'
import toast from 'react-hot-toast'

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)

  const { user } = useAuthStore()
  const { addToCart } = useCartStore()

  useEffect(() => {
    if (!id) return
    const controller = new AbortController()
    setIsLoading(true)
    setError(null)

    getProduct(Number(id), controller.signal)
      .then((p) => {
        setProduct(p)
        setSelectedImage(0)
      })
      .catch((err: unknown) => {
        if ((err as { name?: string }).name !== 'CanceledError') {
          setError('Product not found or failed to load.')
        }
      })
      .finally(() => setIsLoading(false))

    return () => controller.abort()
  }, [id])

  const handleAddToCart = () => {
    if (!user) { toast.error('Please log in to add to cart'); return }
    if (!product) return
    addToCart(user.id, product)
    toast.success(`${product.title} added to cart`)
  }

  if (isLoading) return <ProductDetailSkeleton />

  if (error || !product) {
    return (
      <main className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <div className="text-4xl">😕</div>
        <p className="text-slate-600 dark:text-slate-300">{error ?? 'Product not found'}</p>
        <Link to="/">
          <Button variant="secondary">Back to products</Button>
        </Link>
      </main>
    )
  }

  const discountedPrice = product.price * (1 - product.discountPercentage / 100)

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 animate-fade-in">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <li><Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400">Products</Link></li>
          <li aria-hidden="true">/</li>
          <li className="capitalize">{product.category}</li>
          <li aria-hidden="true">/</li>
          <li className="truncate text-slate-700 dark:text-slate-200">{product.title}</li>
        </ol>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Images */}
        <div>
          <div className="mb-3 overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-800">
            <img
              src={product.images[selectedImage] ?? product.thumbnail}
              alt={product.title}
              className="h-80 w-full object-contain p-6"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  aria-label={`Image ${i + 1}`}
                  aria-pressed={selectedImage === i}
                  className={`flex-shrink-0 rounded-lg border-2 bg-slate-50 p-1 transition-colors dark:bg-slate-800
                    ${selectedImage === i ? 'border-primary-500' : 'border-transparent hover:border-slate-300'}`}
                >
                  <img src={img} alt="" className="h-16 w-16 object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <p className="mb-1 text-sm font-medium uppercase tracking-wide text-primary-600 dark:text-primary-400">
            {product.brand}
          </p>
          <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
            {product.title}
          </h1>

          <div className="mb-3 flex items-center gap-3">
            <StarRating rating={product.rating} />
            <span className="text-xs text-slate-400">({product.reviews.length} reviews)</span>
          </div>

          <p className="mb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {product.description}
          </p>

          {/* Price */}
          <div className="mb-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">
              ${discountedPrice.toFixed(2)}
            </span>
            {product.discountPercentage > 0 && (
              <>
                <span className="text-lg text-slate-400 line-through">${product.price.toFixed(2)}</span>
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600 dark:bg-red-900/30 dark:text-red-400">
                  -{Math.round(product.discountPercentage)}% OFF
                </span>
              </>
            )}
          </div>

          {/* Availability */}
          <p className={`mb-4 text-sm font-medium ${
            product.availabilityStatus === 'In Stock'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-amber-600 dark:text-amber-400'
          }`}>
            {product.availabilityStatus} ({product.stock} left)
          </p>

          {/* Actions */}
          <div className="mb-6 flex gap-3">
            <Button onClick={handleAddToCart} className="flex-1">
              Add to cart
            </Button>
            <FavoriteButton productId={product.id} className="h-12 w-12" />
          </div>

          {/* Meta */}
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-800">
            {[
              ['Category', product.category],
              ['SKU', product.sku],
              ['Weight', `${product.weight}g`],
              ['Min. Order', `${product.minimumOrderQuantity} units`],
              ['Warranty', product.warrantyInformation],
              ['Shipping', product.shippingInformation],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</dt>
                <dd className="mt-0.5 capitalize text-slate-700 dark:text-slate-200">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Reviews */}
      {product.reviews.length > 0 && (
        <section className="mt-10" aria-labelledby="reviews-heading">
          <h2 id="reviews-heading" className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Customer Reviews
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {product.reviews.map((review, i) => (
              <article
                key={i}
                className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-slate-800 dark:text-slate-100">
                    {review.reviewerName}
                  </span>
                  <StarRating rating={review.rating} />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">{review.comment}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
