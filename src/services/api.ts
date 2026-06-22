import axios from 'axios'
import { env } from '@/config/env'
import { useAuthStore } from '@/stores/authStore'

const api = axios.create({
  baseURL: env.API_BASE_URL,
})

api.interceptors.request.use((config) => {
  const session = useAuthStore.getState().session
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res.data,
  async (err) => {
    const config = err.config

    // Retry up to MAX_RETRIES times on network errors or 5xx (covers transient CORS/office-wifi drops)
    const MAX_RETRIES = 2
    const isNetworkError = !err.response
    const isServerError = err.response?.status >= 500
    const retryCount: number = Number(config?._retryCount) || 0

    if (config && (isNetworkError || isServerError) && retryCount < MAX_RETRIES) {
      config._retryCount = retryCount + 1
      await new Promise((r) => setTimeout(r, 300 * config._retryCount))
      return api(config)
    }

    if (err.response?.status === 401) {
      useAuthStore.getState().setSession(null)
      window.location.href = '/auth'
    }
    return Promise.reject(err.response?.data ?? err)
  }
)

export default api
