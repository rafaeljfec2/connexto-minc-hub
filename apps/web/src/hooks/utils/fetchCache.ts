/**
 * Shared fetch cache to prevent duplicate API calls across multiple hook instances
 * This is especially important when multiple components use the same hooks
 */

interface CacheEntry {
  timestamp: number
  promise: Promise<unknown>
}

const cache = new Map<string, CacheEntry>()
const CACHE_TTL = 1000 // 1 second cache to prevent rapid duplicate calls

export function getCachedFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = CACHE_TTL
): Promise<T> {
  const now = Date.now()
  const entry = cache.get(key)

  // If there's a valid cached promise, return it
  if (entry && now - entry.timestamp < ttl) {
    return entry.promise as Promise<T>
  }

  // Create new fetch promise
  const promise = fetchFn().finally(() => {
    // Clean up cache after TTL
    setTimeout(() => {
      cache.delete(key)
    }, ttl)
  })

  // Cache the promise
  cache.set(key, {
    timestamp: now,
    promise,
  })

  return promise
}

export function clearCache(key?: string): void {
  if (key) {
    cache.delete(key)
  } else {
    cache.clear()
  }
}
