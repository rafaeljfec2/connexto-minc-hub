export function useMockMode(): boolean {
  return import.meta.env.VITE_MOCK_MODE === 'true' || !import.meta.env.VITE_API_URL
}
