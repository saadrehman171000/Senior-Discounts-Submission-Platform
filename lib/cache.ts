import { unstable_cache, revalidateTag } from 'next/cache'
import { NextRequest } from 'next/server'

/**
 * Cache management utilities for the Senior Discounts app
 */

/**
 * Cache tags for different types of data
 */
export const CACHE_TAGS = {
  DISCOUNTS: 'discounts',
  DISCOUNT: (id: string) => `discount:${id}`,
  DISCOUNTS_LIST: 'discounts-list',
  ADMIN_DISCOUNTS: 'admin:discounts',
  ADMIN_DISCOUNT: (id: string) => `admin:discount:${id}`,
  STATS: 'stats',
  CATEGORIES: 'categories',
} as const

/**
 * Cache durations in seconds
 */
export const CACHE_DURATIONS = {
  DISCOUNTS_LIST: 60, // 1 minute for public discounts
  DISCOUNT_DETAIL: 300, // 5 minutes for individual discount
  ADMIN_DATA: 30, // 30 seconds for admin data
  STATS: 3600, // 1 hour for statistics
  CATEGORIES: 86400, // 24 hours for categories
} as const

/**
 * Cache list function using Next.js unstable_cache
 * @param key - Cache key for the list
 * @param fn - Function to execute and cache
 * @returns Cached result
 */
export const cacheList = <T>(key: string, fn: () => Promise<T>) =>
  unstable_cache(fn, [key], { revalidate: 60, tags: ['discounts-list'] })()

/**
 * Bust the discounts list cache
 */
export const bustListCache = () => revalidateTag('discounts-list')

/**
 * Revalidate cache for discounts
 */
export function revalidateDiscounts() {
  revalidateTag(CACHE_TAGS.DISCOUNTS)
  revalidateTag(CACHE_TAGS.STATS)
  bustListCache()
}

/**
 * Revalidate cache for specific discount
 */
export function revalidateDiscount(id: string) {
  revalidateTag(CACHE_TAGS.DISCOUNT(id))
  revalidateTag(CACHE_TAGS.DISCOUNTS)
  revalidateTag(CACHE_TAGS.STATS)
}

/**
 * Revalidate cache for admin data
 */
export function revalidateAdminData() {
  revalidateTag(CACHE_TAGS.ADMIN_DISCOUNTS)
  revalidateTag(CACHE_TAGS.STATS)
}

/**
 * Revalidate cache for specific admin discount
 */
export function revalidateAdminDiscount(id: string) {
  revalidateTag(CACHE_TAGS.ADMIN_DISCOUNT(id))
  revalidateTag(CACHE_TAGS.ADMIN_DISCOUNTS)
}

/**
 * Revalidate cache for categories
 */
export function revalidateCategories() {
  revalidateTag(CACHE_TAGS.CATEGORIES)
}

/**
 * Revalidate specific path
 */
export function revalidatePath(path: string) {
  revalidatePath(path)
}

/**
 * Generate cache key for discounts list
 */
export function generateDiscountsCacheKey(filters: Record<string, any>): string {
  const sortedFilters = Object.keys(filters)
    .sort()
    .map(key => `${key}=${filters[key]}`)
    .join('&')
  
  return `discounts:list:${sortedFilters}`
}

/**
 * Generate cache key for admin discounts list
 */
export function generateAdminDiscountsCacheKey(filters: Record<string, any>): string {
  const sortedFilters = Object.keys(filters)
    .sort()
    .map(key => `${key}=${filters[key]}`)
    .join('&')
  
  return `admin:discounts:list:${sortedFilters}`
}

/**
 * Check if request should bypass cache
 */
export function shouldBypassCache(request: NextRequest): boolean {
  const bypassCache = request.headers.get('x-bypass-cache')
  const cacheControl = request.headers.get('cache-control')
  
  return bypassCache === 'true' || cacheControl === 'no-cache'
}

/**
 * Get cache control headers for response
 */
export function getCacheControlHeaders(
  duration: number = CACHE_DURATIONS.DISCOUNTS_LIST,
  isPublic: boolean = true
): Record<string, string> {
  const headers: Record<string, string> = {}
  
  if (isPublic) {
    headers['Cache-Control'] = `public, s-maxage=${duration}, stale-while-revalidate=${duration * 2}`
  } else {
    headers['Cache-Control'] = `private, s-maxage=${duration}, stale-while-revalidate=${duration * 2}`
  }
  
  return headers
}

/**
 * Cache middleware for API routes
 */
export function withCache<T extends (...args: any[]) => any>(
  fn: T,
  options: {
    tags: string[]
    duration?: number
    isPublic?: boolean
  }
) {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const result = await fn(...args)
    
    // Add cache headers to response if it's a Response object
    if (result instanceof Response) {
      const headers = getCacheControlHeaders(options.duration, options.isPublic)
      Object.entries(headers).forEach(([key, value]) => {
        result.headers.set(key, value)
      })
    }
    
    return result
  }
}

/**
 * Cache invalidation strategies
 */
export const CACHE_STRATEGIES = {
  // Invalidate all discount-related caches when a new discount is submitted
  ON_NEW_SUBMISSION: () => {
    revalidateDiscounts()
    revalidateAdminData()
    bustListCache()
  },
  
  // Invalidate specific caches when a discount status changes
  ON_STATUS_CHANGE: (id: string) => {
    revalidateDiscount(id)
    revalidateAdminDiscount(id)
    revalidateDiscounts()
    revalidateAdminData()
    bustListCache()
  },
  
  // Invalidate stats when counts change
  ON_COUNT_CHANGE: () => {
    revalidateTag(CACHE_TAGS.STATS)
  },
  
  // Invalidate categories when they change
  ON_CATEGORY_CHANGE: () => {
    revalidateCategories()
  },
  
  // Invalidate caches when discount is published
  ON_PUBLISH: (id: string) => {
    revalidateDiscount(id)
    revalidateDiscounts()
    revalidateAdminData()
    bustListCache()
  },
  
  // Invalidate caches when discount is trashed
  ON_TRASH: (id: string) => {
    revalidateDiscount(id)
    revalidateDiscounts()
    revalidateAdminData()
    bustListCache()
  },
} as const
