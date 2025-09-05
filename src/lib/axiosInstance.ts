import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";

const axiosInstance: AxiosInstance = axios.create({
  // baseURL: "http://localhost:8080/api/v1",
  //baseURL: "http://54.210.5.43:8080/api/v1",
  baseURL:"https://ai-medical-back-end.onrender.com/api/v1",
  withCredentials: true,
  timeout: 10000, // 10 second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      console.log("Token from localStorage:", token); // Debug log
      
      // Fix: Check if this is a request to your API (not S3 or external services)
      // You can either check for your actual baseURL or use a different approach
      if (token && config.url && !config.url.includes('amazonaws.com')) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("Authorization header added:", config.headers.Authorization); // Debug log
      } else if (config.url && config.url.includes('amazonaws.com')) {
        // Remove Authorization header for S3 requests
        delete config.headers.Authorization;
        console.log("Authorization header removed for S3 request"); // Debug log
      } else {
        console.log("No token found or external request"); // Debug log
      }
    }
    
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    console.log("Request headers:", config.headers); // Debug log
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
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      console.log("401 Unauthorized - Token may be invalid or expired");
      localStorage.removeItem("token");
      // Optionally redirect to login
      // window.location.href = "/login";
    }
    
    if ((error as any).code === 'ECONNREFUSED') {
      console.error("Connection refused - is the backend server running on localhost:8080?");
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;

// Alternative approach - if you want to be more explicit about which requests need auth
// You could also modify the interceptor like this:

/*
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      
      // List of endpoints that DON'T need authentication
      const publicEndpoints = ['/auth/login', '/auth/register', '/auth/forgot-password'];
      const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint));
      
      // List of external services that shouldn't get the auth token
      const isExternalService = config.url?.includes('amazonaws.com') || 
                               config.url?.includes('s3.') ||
                               config.url?.startsWith('http') && !config.url?.includes('54.210.5.43');
      
      if (token && !isPublicEndpoint && !isExternalService) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("Authorization header added for:", config.url);
      } else {
        delete config.headers.Authorization;
        if (isExternalService) {
          console.log("Authorization header removed for external service:", config.url);
        }
      }
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);
*/