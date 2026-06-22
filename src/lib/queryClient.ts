import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 2,
      retryDelay: (attempt) => Math.min(300 * 2 ** attempt, 5_000),
      refetchOnWindowFocus: false,
    },
  },
})
