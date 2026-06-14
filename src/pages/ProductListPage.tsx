import { useProducts } from '@/hooks/useProducts'
import { ProductCard } from '@/components/products/ProductCard'
import { CategoryFilter } from '@/components/products/CategoryFilter'
import { Pagination } from '@/components/products/Pagination'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'

export function ProductListPage() {
  const {
    products,
    total,
    totalPages,
    page,
    isLoading,
    error,
    query,
    category,
    setQuery,
    setCategory,
    setPage,
    retry,
  } = useProducts()

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            aria-label="Search products"
            className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm
              shadow-sm transition-colors placeholder-slate-400
              focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20
              dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
          />
        </div>
      </div>

      {/* Category filter */}
      <div className="mb-6">
        <CategoryFilter selected={category} onSelect={setCategory} />
      </div>

      {/* Results meta */}
      {!isLoading && !error && (
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          {total === 0
            ? 'No products found'
            : `Showing ${products.length} of ${total} products`}
          {query && (
            <span>
              {' '}for <strong className="text-slate-700 dark:text-slate-200">"{query}"</strong>
            </span>
          )}
        </p>
      )}

      {/* Loading skeletons */}
      {isLoading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 20 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="text-4xl">⚠️</div>
          <p className="text-slate-600 dark:text-slate-300">{error}</p>
          <Button onClick={retry} variant="secondary">Try again</Button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && products.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="text-5xl">🔍</div>
          <p className="font-medium text-slate-700 dark:text-slate-200">No products match your search</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Try a different search term or remove the category filter.
          </p>
          <Button variant="secondary" onClick={() => { setQuery(''); setCategory('') }}>
            Clear filters
          </Button>
        </div>
      )}

      {/* Product grid */}
      {!isLoading && !error && products.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 animate-fade-in">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </main>
  )
}
