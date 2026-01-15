// Service Worker para MINC Teams PWA
// Versão do cache - incrementar quando houver mudanças significativas
const CACHE_VERSION = 'v1.0.0'
const CACHE_NAME = `minc-teams-${CACHE_VERSION}`

// Assets estáticos para cachear na instalação
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
]

// Extensões de arquivos que devem usar Cache First
const CACHE_FIRST_EXTENSIONS = [
  '.js',
  '.css',
  '.png',
  '.jpg',
  '.jpeg',
  '.svg',
  '.woff',
  '.woff2',
  '.ttf',
  '.ico',
]

// URLs de API que devem usar Network First
const API_PATTERNS = ['/minc-teams/v1/']

// Install event - cachear assets estáticos
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...', CACHE_VERSION)
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Caching static assets')
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('[Service Worker] Failed to cache some assets:', err)
        // Não falhar a instalação se alguns assets não puderem ser cacheados
        return Promise.resolve()
      })
    })
  )
  // Forçar ativação imediata do novo service worker
  self.skipWaiting()
})

// Activate event - limpar caches antigos
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...', CACHE_VERSION)
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  // Assumir controle imediato de todas as páginas
  return self.clients.claim()
})

// Fetch event - estratégias de cache
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Ignorar requisições não-GET
  if (request.method !== 'GET') {
    return
  }

  // Ignorar requisições de extensões do navegador
  if (url.protocol === 'chrome-extension:') {
    return
  }

  // Estratégia: Network First para APIs
  if (isApiRequest(url)) {
    event.respondWith(networkFirstStrategy(request))
    return
  }

  // Estratégia: Cache First para assets estáticos
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirstStrategy(request))
    return
  }

  // Estratégia: Stale While Revalidate para outros recursos
  event.respondWith(staleWhileRevalidateStrategy(request))
})

// Verificar se é uma requisição de API
function isApiRequest(url) {
  return API_PATTERNS.some(pattern => url.pathname.includes(pattern))
}

// Verificar se é um asset estático
function isStaticAsset(url) {
  // Mesmo domínio e extensão conhecida
  if (url.origin !== self.location.origin) {
    return false
  }
  return CACHE_FIRST_EXTENSIONS.some(ext => url.pathname.endsWith(ext))
}

// Estratégia: Network First (para APIs)
async function networkFirstStrategy(request) {
  try {
    // Tentar rede primeiro
    const networkResponse = await fetch(request)

    // Se sucesso, cachear resposta
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.log('[Service Worker] Network failed, trying cache:', request.url)

    // Se rede falhar, tentar cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Se não houver cache, retornar erro de rede
    throw error
  }
}

// Estratégia: Cache First (para assets estáticos)
async function cacheFirstStrategy(request) {
  const cache = await caches.open(CACHE_NAME)
  const cachedResponse = await cache.match(request)

  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.error('[Service Worker] Failed to fetch:', request.url, error)
    throw error
  }
}

// Estratégia: Stale While Revalidate (para outros recursos)
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(CACHE_NAME)
  const cachedResponse = await cache.match(request)

  // Buscar atualização em background
  const fetchPromise = fetch(request)
    .then(networkResponse => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone())
      }
      return networkResponse
    })
    .catch(() => {
      // Ignorar erros de rede em background
    })

  // Retornar cache imediatamente se disponível, senão aguardar rede
  return cachedResponse || fetchPromise
}

// Mensagem para atualizar cache manualmente (opcional)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    const urls = event.data.urls || []
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        return cache.addAll(urls)
      })
    )
  }
})
