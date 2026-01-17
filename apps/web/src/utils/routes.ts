/**
 * Utilitário para verificação de rotas públicas
 *
 * Rotas públicas são aquelas que não requerem autenticação
 * e não devem fazer chamadas de API autenticadas (como /auth/me)
 */

// Rotas públicas que não devem verificar autenticação
const PUBLIC_ROUTES = ['/login', '/activate'] as const

export type PublicRoute = (typeof PUBLIC_ROUTES)[number]

/**
 * Verifica se a rota atual é uma rota pública
 * @returns true se a rota atual não requer autenticação
 */
export function isPublicRoute(): boolean {
  if (typeof window === 'undefined') return false
  const pathname = window.location.pathname
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route))
}

/**
 * Verifica se um pathname específico é uma rota pública
 * @param pathname - O pathname para verificar
 * @returns true se o pathname não requer autenticação
 */
export function isPublicPathname(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route))
}

/**
 * Retorna a lista de rotas públicas
 * @returns Array com as rotas públicas
 */
export function getPublicRoutes(): readonly string[] {
  return PUBLIC_ROUTES
}
