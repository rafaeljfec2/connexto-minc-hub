/**
 * Utilitário para verificação de rotas públicas
 *
 * Rotas públicas são aquelas que não requerem autenticação
 * e não devem fazer chamadas de API autenticadas (como /auth/me)
 */

// Rotas públicas que não devem verificar autenticação
const PUBLIC_ROUTES_PREFIX = ['/login', '/activate'] as const
const PUBLIC_ROUTES_EXACT = ['/'] as const

export type PublicRoute =
  | (typeof PUBLIC_ROUTES_PREFIX)[number]
  | (typeof PUBLIC_ROUTES_EXACT)[number]

function matchesPublicRoute(pathname: string): boolean {
  if ((PUBLIC_ROUTES_EXACT as readonly string[]).includes(pathname)) return true
  return PUBLIC_ROUTES_PREFIX.some(route => pathname.startsWith(route))
}

/**
 * Verifica se a rota atual é uma rota pública
 * @returns true se a rota atual não requer autenticação
 */
export function isPublicRoute(): boolean {
  if (globalThis.window === undefined) return false
  return matchesPublicRoute(globalThis.window.location.pathname)
}

/**
 * Verifica se um pathname específico é uma rota pública
 * @param pathname - O pathname para verificar
 * @returns true se o pathname não requer autenticação
 */
export function isPublicPathname(pathname: string): boolean {
  return matchesPublicRoute(pathname)
}

/**
 * Retorna a lista de rotas públicas
 * @returns Array com as rotas públicas
 */
export function getPublicRoutes(): readonly string[] {
  return [...PUBLIC_ROUTES_EXACT, ...PUBLIC_ROUTES_PREFIX]
}
