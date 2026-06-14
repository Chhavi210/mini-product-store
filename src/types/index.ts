// ── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthUser {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  gender: string
  image: string
  token: string
  refreshToken: string
}

export interface AuthResponse {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  gender: string
  image: string
  accessToken: string
  refreshToken: string
}

export interface RefreshResponse {
  accessToken: string
  refreshToken: string
}

// ── Products ──────────────────────────────────────────────────────────────────

export interface Product {
  id: number
  title: string
  description: string
  price: number
  discountPercentage: number
  rating: number
  stock: number
  brand: string
  category: string
  thumbnail: string
  images: string[]
  tags: string[]
  sku: string
  weight: number
  dimensions: {
    width: number
    height: number
    depth: number
  }
  warrantyInformation: string
  shippingInformation: string
  availabilityStatus: string
  reviews: ProductReview[]
  returnPolicy: string
  minimumOrderQuantity: number
  meta: {
    createdAt: string
    updatedAt: string
    barcode: string
    qrCode: string
  }
}

export interface ProductReview {
  rating: number
  comment: string
  date: string
  reviewerName: string
  reviewerEmail: string
}

export interface ProductsResponse {
  products: Product[]
  total: number
  skip: number
  limit: number
}

export interface Category {
  slug: string
  name: string
  url: string
}

// ── Pagination ────────────────────────────────────────────────────────────────

export interface PaginationParams {
  limit: number
  skip: number
}

export interface ProductFilters extends PaginationParams {
  search: string
  category: string
}

// ── Cart ──────────────────────────────────────────────────────────────────────

export interface CartItem {
  product: Product
  quantity: number
}

// ── Store slices ──────────────────────────────────────────────────────────────

export interface AuthState {
  user: AuthUser | null
  token: string | null
  refreshToken: string | null
  isLoading: boolean
  setAuth: (user: AuthUser, token: string, refreshToken: string) => void
  clearAuth: () => void
  setLoading: (loading: boolean) => void
}

export interface FavoritesState {
  // Map of userId → Set of productIds (stored as arrays for JSON serialization)
  favorites: Record<string, number[]>
  addFavorite: (userId: number, productId: number) => void
  removeFavorite: (userId: number, productId: number) => void
  isFavorite: (userId: number, productId: number) => boolean
  getFavorites: (userId: number) => number[]
  clearUserFavorites: (userId: number) => void
}

export interface ThemeState {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
}

export interface CartState {
  // Map of userId → cart items
  carts: Record<string, CartItem[]>
  addToCart: (userId: number, product: Product) => void
  removeFromCart: (userId: number, productId: number) => void
  updateQuantity: (userId: number, productId: number, quantity: number) => void
  getCart: (userId: number) => CartItem[]
  getCartCount: (userId: number) => number
  getCartTotal: (userId: number) => number
  clearUserCart: (userId: number) => void
}

// ── API errors ────────────────────────────────────────────────────────────────

export interface ApiError {
  message: string
  status?: number
}
