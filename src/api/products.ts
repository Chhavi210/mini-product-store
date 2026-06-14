import { apiClient } from './client'
import type { Category, Product, ProductsResponse } from '@/types'

const LIMIT = 20

export async function getProducts(
  skip = 0,
  limit = LIMIT,
  signal?: AbortSignal,
): Promise<ProductsResponse> {
  const { data } = await apiClient.get<ProductsResponse>('/products', {
    params: { limit, skip },
    signal,
  })
  return data
}

export async function searchProducts(
  q: string,
  skip = 0,
  limit = LIMIT,
  signal?: AbortSignal,
): Promise<ProductsResponse> {
  const { data } = await apiClient.get<ProductsResponse>('/products/search', {
    params: { q, limit, skip },
    signal,
  })
  return data
}

export async function getProductsByCategory(
  category: string,
  skip = 0,
  limit = LIMIT,
  signal?: AbortSignal,
): Promise<ProductsResponse> {
  const { data } = await apiClient.get<ProductsResponse>(
    `/products/category/${encodeURIComponent(category)}`,
    { params: { limit, skip }, signal },
  )
  return data
}

export async function getProduct(id: number, signal?: AbortSignal): Promise<Product> {
  const { data } = await apiClient.get<Product>(`/products/${id}`, { signal })
  return data
}

export async function getCategories(signal?: AbortSignal): Promise<Category[]> {
  const { data } = await apiClient.get<Category[]>('/products/categories', { signal })
  return data
}

export async function getProductsByIds(ids: number[]): Promise<Product[]> {
  // DummyJSON doesn't support bulk-by-ID, fetch concurrently
  const results = await Promise.allSettled(ids.map((id) => getProduct(id)))
  return results
    .filter((r): r is PromiseFulfilledResult<Product> => r.status === 'fulfilled')
    .map((r) => r.value)
}
