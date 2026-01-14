import DOMPurify from 'dompurify'

/**
 * Sanitizes HTML content using DOMPurify
 * @param html - HTML string to sanitize
 * @param allowHtml - Whether to allow HTML tags (default: false for plain text)
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string, allowHtml = false): string {
  if (!html) return ''

  if (!allowHtml) {
    // For plain text, strip all HTML tags
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
    })
  }

  // For HTML content, use default DOMPurify config with safe defaults
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'span'],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
    ALLOWED_URI_REGEXP: /^(https?|mailto):/,
    ADD_ATTR: ['target', 'rel'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick'],
  })
}

/**
 * Sanitizes plain text content (removes all HTML)
 * @param text - Text to sanitize
 * @returns Sanitized text without HTML
 */
export function sanitizeText(text: string): string {
  return sanitizeHtml(text, false)
}

/**
 * Validates and sanitizes a URL
 * @param url - URL to validate
 * @param allowedProtocols - Array of allowed protocols (default: ['https:', 'http:', 'data:'])
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeUrl(
  url: string,
  allowedProtocols: string[] = ['https:', 'http:', 'data:']
): string {
  if (!url) return ''

  try {
    // Parse URL relative to current origin if needed
    const parsed = new URL(url, typeof window !== 'undefined' ? window.location.origin : undefined)

    // Check if protocol is allowed
    if (!allowedProtocols.includes(parsed.protocol)) {
      return ''
    }

    // Additional validation: prevent javascript: and data: URLs with scripts
    if (parsed.protocol === 'javascript:') {
      return ''
    }

    if (parsed.protocol === 'data:') {
      // Only allow safe data URLs (images, etc.)
      const dataUrlPattern = /^data:(image|video|audio)\/[^;]+;base64,/
      if (!dataUrlPattern.test(url)) {
        return ''
      }
    }

    // Use DOMPurify to sanitize the URL
    const sanitized = DOMPurify.sanitize(url, {
      ALLOWED_URI_REGEXP: new RegExp(
        `^(${allowedProtocols.map(p => p.replace(':', '')).join('|')}):`
      ),
    })

    return sanitized
  } catch {
    // Invalid URL
    return ''
  }
}

/**
 * Validates if a URL is safe to use
 * @param url - URL to validate
 * @param allowedProtocols - Array of allowed protocols
 * @returns true if URL is safe, false otherwise
 */
export function isValidUrl(
  url: string,
  allowedProtocols: string[] = ['https:', 'http:', 'data:']
): boolean {
  if (!url) return false

  try {
    const parsed = new URL(url, typeof window !== 'undefined' ? window.location.origin : undefined)

    if (!allowedProtocols.includes(parsed.protocol)) {
      return false
    }

    // Block javascript: protocol
    if (parsed.protocol === 'javascript:') {
      return false
    }

    // Validate data URLs
    if (parsed.protocol === 'data:') {
      const dataUrlPattern = /^data:(image|video|audio)\/[^;]+;base64,/
      return dataUrlPattern.test(url)
    }

    return true
  } catch {
    return false
  }
}

/**
 * Sanitizes an object's string properties recursively
 * @param obj - Object to sanitize
 * @param allowHtml - Whether to allow HTML in strings
 * @returns Sanitized object
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T, allowHtml = false): T {
  if (!obj || typeof obj !== 'object') {
    return obj
  }

  const sanitized = { ...obj }

  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      ;(sanitized[key] as unknown) = allowHtml
        ? sanitizeHtml(sanitized[key] as string, true)
        : sanitizeText(sanitized[key] as string)
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(
        sanitized[key] as Record<string, unknown>,
        allowHtml
      ) as T[Extract<keyof T, string>]
    }
  }

  return sanitized
}
