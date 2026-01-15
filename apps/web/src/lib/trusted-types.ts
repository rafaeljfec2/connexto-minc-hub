/**
 * Trusted Types configuration for XSS protection
 *
 * This module sets up Trusted Types policies to prevent DOM-based XSS attacks.
 * Trusted Types enforce that only trusted values can be assigned to dangerous DOM APIs.
 */

import DOMPurify from 'dompurify'

// TypeScript declarations for Trusted Types API
interface TrustedTypePolicyFactory {
  createPolicy(
    name: string,
    policy: {
      createHTML?: (input: string) => string
      createScript?: (input: string) => string
      createScriptURL?: (input: string) => string
      createURL?: (input: string) => string
    }
  ): TrustedTypePolicy
  defaultPolicy: TrustedTypePolicy | null
}

interface TrustedTypePolicy {
  createHTML(input: string): TrustedHTML
  createScript(input: string): TrustedScript
  createScriptURL(input: string): TrustedScriptURL
  createURL(input: string): TrustedURL
}

interface TrustedHTML {
  toString(): string
}

interface TrustedScript {
  toString(): string
}

interface TrustedScriptURL {
  toString(): string
}

interface TrustedURL {
  toString(): string
}

declare global {
  interface Window {
    trustedTypes?: TrustedTypePolicyFactory
  }
}

// Check if Trusted Types is supported
const isTrustedTypesSupported =
  globalThis !== undefined && globalThis.window !== undefined && 'trustedTypes' in globalThis.window

/**
 * Creates Trusted Types policies for safe DOM manipulation
 */
export function createTrustedTypesPolicies(): void {
  if (!isTrustedTypesSupported) {
    // Trusted Types não suportado - não é crítico, apenas informativo
    if (globalThis.window !== undefined) {
      import('./logger').then(({ logger }) => {
        logger.warn('Trusted Types not supported in this browser', 'TrustedTypes')
      })
    }
    return
  }

  const trustedTypes = globalThis.window.trustedTypes as TrustedTypePolicyFactory

  try {
    // Default policy for HTML content
    trustedTypes.createPolicy('default', {
      createHTML: (html: string): string => {
        // Sanitize HTML using DOMPurify
        return DOMPurify.sanitize(html, {
          RETURN_TRUSTED_TYPE: true,
          ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'span'],
          ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
          ALLOWED_URI_REGEXP: /^(https?|mailto):/,
          FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
          FORBID_ATTR: ['onerror', 'onload', 'onclick'],
        }) as unknown as string
      },
      createScriptURL: (url: string): string => {
        // Only allow HTTPS and relative URLs for scripts
        if (url.startsWith('https://') || url.startsWith('/')) {
          // Return the URL as-is after validation (Trusted Types will handle it)
          return url
        }
        throw new Error('Script URL must be HTTPS or relative path')
      },
      createURL: (url: string): string => {
        // Validate and sanitize URLs
        try {
          const parsed = new URL(
            url,
            typeof globalThis !== 'undefined' && globalThis.window
              ? globalThis.window.location.origin
              : 'http://localhost'
          )

          // Only allow safe protocols
          if (!['https:', 'http:', 'data:'].includes(parsed.protocol)) {
            throw new Error('URL protocol not allowed')
          }

          // Block javascript: protocol
          if (parsed.protocol === 'javascript:') {
            throw new Error('javascript: protocol not allowed')
          }

          // Validate data URLs
          if (parsed.protocol === 'data:') {
            const dataUrlPattern = /^data:(image|video|audio)\/[^;]+;base64,/
            if (!dataUrlPattern.test(url)) {
              throw new Error('Invalid data URL format')
            }
          }

          // Sanitize with DOMPurify
          const sanitized = DOMPurify.sanitize(url, {
            ALLOWED_URI_REGEXP: /^(https?|data):/,
          })

          // Return the sanitized URL (Trusted Types will handle it)
          return sanitized
        } catch (error) {
          import('./logger').then(({ logger }) => {
            logger.error('Invalid URL', 'TrustedTypes', error)
          })
          throw new Error('Invalid URL')
        }
      },
    })

    // Policy for script content (should be rarely used)
    trustedTypes.createPolicy('script', {
      createScript: (_script: string): string => {
        // In most cases, we should not create scripts dynamically
        // This policy is for edge cases only
        throw new Error('Dynamic script creation is not allowed for security reasons')
      },
    })

    import('./logger').then(({ logger }) => {
      logger.info('Trusted Types policies created successfully', 'TrustedTypes')
    })
  } catch (error) {
    import('./logger').then(({ logger }) => {
      logger.error('Failed to create Trusted Types policies', 'TrustedTypes', error)
    })
  }
}

/**
 * Checks if Trusted Types is enabled and working
 */
export function isTrustedTypesEnabled(): boolean {
  if (!isTrustedTypesSupported) {
    return false
  }

  try {
    const trustedTypes = globalThis.window.trustedTypes as TrustedTypePolicyFactory
    return trustedTypes.defaultPolicy !== null || trustedTypes.defaultPolicy !== undefined
  } catch {
    return false
  }
}

/**
 * Gets the default Trusted Types policy
 */
export function getDefaultPolicy(): TrustedTypePolicy | null {
  if (!isTrustedTypesSupported) {
    return null
  }

  try {
    const trustedTypes = globalThis.window.trustedTypes as TrustedTypePolicyFactory
    return trustedTypes.defaultPolicy
  } catch {
    return null
  }
}
