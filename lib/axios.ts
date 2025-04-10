import axios from "axios"

// Create axios instance with base URL
const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor to add auth token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Add response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If error is 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem("refresh_token")
        if (!refreshToken) {
          throw new Error("No refresh token available")
        }

        // Attempt to refresh token
        const response = await axios.post("http://localhost:8000/api/users/auth/refresh-token/", {
          refresh_token: refreshToken,
        })

        const { access_token } = response.data
        localStorage.setItem("access_token", access_token)

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`
        return axios(originalRequest)
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        window.location.href = "/auth/login"
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export default axiosInstance
