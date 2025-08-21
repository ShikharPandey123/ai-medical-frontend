import axios from "axios"

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
  timeout: 10000, // 10 second timeout
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`)
    return config
  },
  (error) => {
    console.error("Request Error:", error)
    return Promise.reject(error)
  }
)

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`Response received from: ${response.config.url}`, response.data)
    return response
  },
  (error) => {
    console.error("Axios Error Details:")
    console.error("- URL:", error.config?.url)
    console.error("- Method:", error.config?.method)
    console.error("- Status:", error.response?.status)
    console.error("- Data:", error.response?.data)
    console.error("- Message:", error.message)
    
    if (error.code === 'ECONNREFUSED') {
      console.error("Connection refused - is the backend server running on localhost:8080?")
    }
    
    return Promise.reject(error)
  }
)

export default axiosInstance