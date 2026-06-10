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
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().setSession(null)
      window.location.href = '/auth'
    }
    return Promise.reject(err.response?.data ?? err)
  }
)

export default api
