import Axios from 'axios'
import { queryClient } from './query/client'
import type { ApiResponse } from './api'

// Raw axios instance — use directly for multipart/form-data calls.
// For typed JSON, prefer the `api` wrapper from `./api`.
export const axios = Axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

let isRefreshing = false
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = []

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)))
  failedQueue = []
}

// Attach access token from store on every request
axios.interceptors.request.use((config) => {
  const raw = localStorage.getItem('mensa-auth')
  if (raw) {
    try {
      const { state } = JSON.parse(raw) as { state: { accessToken: string | null } }
      if (state.accessToken) {
        config.headers.Authorization = `Bearer ${state.accessToken}`
      }
    } catch {
      // ignore parse errors
    }
  }
  return config
})

// On 401, attempt a silent token refresh then retry the original request.
axios.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean }
    const requestUrl = originalRequest?.url ?? ''

    const isRefreshCall = requestUrl.includes('/auth/refresh')
    const isLoginCall = requestUrl.includes('/auth/login')

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshCall &&
      !isLoginCall
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              resolve(axios(originalRequest))
            },
            reject,
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { data } = await axios.post<ApiResponse<{ accessToken: string }>>('/auth/refresh')
        const newToken = data.data?.accessToken
        if (!newToken) throw new Error('No access token in refresh response')

        const raw = localStorage.getItem('mensa-auth')
        if (raw) {
          const parsed = JSON.parse(raw) as { state: Record<string, unknown> }
          parsed.state.accessToken = newToken
          localStorage.setItem('mensa-auth', JSON.stringify(parsed))
        }

        processQueue(null, newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return axios(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        queryClient.clear()
        localStorage.removeItem('mensa-auth')
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export default axios
