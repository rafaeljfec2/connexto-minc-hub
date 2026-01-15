/**
 * Shared fetch cache to prevent duplicate API calls across multiple hook instances
 * This is especially important when multiple components use the same hooks
 */

interface CacheEntry {
  timestamp: number
  promise: Promise<unknown>
}

const cache = new Map<string, CacheEntry>()
const CACHE_TTL = 500 // 500ms cache to prevent rapid duplicate calls (reduced from 1s)

export function getCachedFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = CACHE_TTL
): Promise<T> {
  const now = Date.now()
  const entry = cache.get(key)

  // If there's a valid cached promise, return it
  // But only if it's still pending - if resolved, create new fetch
  if (entry && now - entry.timestamp < ttl) {
    // Check if promise is still pending
    const cachedPromise = entry.promise as Promise<T>
    // Return cached promise - it will resolve/reject and update state
    return cachedPromise
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
