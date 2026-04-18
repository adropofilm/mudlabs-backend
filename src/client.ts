import axios from 'axios'

/**
 * Axios instance for frontend consumption
 * Frontend imports this from @mudlab/backend
 * Automatically attaches JWT token to all requests
 */
export const api = axios.create({
  baseURL: process.env.API_URL || 'http://localhost:3000',
})

// Interceptor: attach JWT token from localStorage
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor: handle 401 Unauthorized (token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
