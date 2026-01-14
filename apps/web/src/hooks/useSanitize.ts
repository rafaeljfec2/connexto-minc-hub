import { useMemo } from 'react'
import { sanitizeHtml, sanitizeText, sanitizeUrl, isValidUrl } from '@/lib/sanitize'

/**
 * React hook for sanitizing data before rendering
 *
 * @example
 * ```tsx
 * const { sanitize, sanitizeUrl: sanitizeUrlSafe } = useSanitize()
 *
 * return (
 *   <div>
 *     <p>{sanitize(userInput)}</p>
 *     <img src={sanitizeUrlSafe(imageUrl)} alt="Safe image" />
 *   </div>
 * )
 * ```
 */
export function useSanitize() {
  const sanitize = useMemo(() => {
    return (text: string, allowHtml = false): string => {
      if (allowHtml) {
        return sanitizeHtml(text, true)
      }
      return sanitizeText(text)
    }
  }, [])

  const sanitizeUrlSafe = useMemo(() => {
    return (url: string, allowedProtocols?: string[]): string => {
      return sanitizeUrl(url, allowedProtocols)
    }
  }, [])

  const isUrlValid = useMemo(() => {
    return (url: string, allowedProtocols?: string[]): boolean => {
      return isValidUrl(url, allowedProtocols)
    }
  }, [])

  return {
    sanitize,
    sanitizeUrl: sanitizeUrlSafe,
    isValidUrl: isUrlValid,
  }
}
