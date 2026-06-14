import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  getProducts,
  getProductsByCategory,
  searchProducts,
} from '@/api/products'
import { useDebounce } from './useDebounce'
import type { Product } from '@/types'

const PAGE_SIZE = 20

export function useProducts() {
  const [searchParams, setSearchParams] = useSearchParams()

  // URL-synced state
  const query = searchParams.get('q') ?? ''
  const category = searchParams.get('category') ?? ''
  const page = Number(searchParams.get('page') ?? '1')

  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const debouncedQuery = useDebounce(query, 400)
  const abortRef = useRef<AbortController | null>(null)

  const skip = (page - 1) * PAGE_SIZE

  const fetchProducts = useCallback(async () => {
    // Cancel any in-flight request
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setIsLoading(true)
    setError(null)

    try {
      let result
      if (debouncedQuery) {
        result = await searchProducts(debouncedQuery, skip, PAGE_SIZE, controller.signal)
      } else if (category) {
        result = await getProductsByCategory(category, skip, PAGE_SIZE, controller.signal)
      } else {
        result = await getProducts(skip, PAGE_SIZE, controller.signal)
      }
      setProducts(result.products)
      setTotal(result.total)
    } catch (err: unknown) {
      if ((err as { name?: string }).name === 'CanceledError') return
      setError('Failed to load products. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [debouncedQuery, category, skip])

  useEffect(() => {
    void fetchProducts()
    return () => abortRef.current?.abort()
  }, [fetchProducts])

  const setQuery = (q: string) => {
    setSearchParams((p) => {
      const next = new URLSearchParams(p)
      if (q) next.set('q', q); else next.delete('q')
      next.delete('page')
      return next
    }, { replace: true })
  }

  const setCategory = (cat: string) => {
    setSearchParams((p) => {
      const next = new URLSearchParams(p)
      if (cat) next.set('category', cat); else next.delete('category')
      next.delete('page')
      return next
    }, { replace: true })
  }

  const setPage = (p: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (p > 1) next.set('page', String(p)); else next.delete('page')
      return next
    }, { replace: true })
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return {
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
    retry: fetchProducts,
  }
}
