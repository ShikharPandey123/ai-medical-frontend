import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  withCredentials: true,
  timeout: 10000, // 10 second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error: AxiosError) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`Response received from: ${response.config.url}`, response.data);
    return response;
  },
  (error: AxiosError) => {
    console.error("Axios Error Details:");
    console.error("- URL:", error.config?.url);
    console.error("- Method:", error.config?.method);
    console.error("- Status:", error.response?.status);
    console.error("- Data:", error.response?.data);
    console.error("- Message:", error.message);
    
    if ((error as any).code === 'ECONNREFUSED') {
      console.error("Connection refused - is the backend server running on localhost:8080?");
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
