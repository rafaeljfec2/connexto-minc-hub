import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache por 5 minutos
      staleTime: 5 * 60 * 1000,
      // Manter dados em cache por 10 minutos
      gcTime: 10 * 60 * 1000,
      // Não refetch automaticamente ao focar na janela
      refetchOnWindowFocus: false,
      // Não refetch automaticamente ao reconectar
      refetchOnReconnect: false,
      // Retry 1 vez em caso de erro
      retry: 1,
      // Não refetch em mount se dados estiverem frescos
      refetchOnMount: false,
    },
    mutations: {
      // Retry 0 vezes em mutações
      retry: 0,
    },
  },
})
