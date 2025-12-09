import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Create axios instance with default config
const axiosInstance: AxiosInstance = axios.create({
  baseURL: typeof window !== 'undefined' ? window.location.origin : '',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // You can add auth tokens, modify headers, etc. here
    // Example: config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
/**
 * @salman seems like cursors avaratham ith ingane alla
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // Return response data directly
    return response;
  },
  (error: AxiosError) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      interface MessageInterface {
        message: string
      }
      const data = error.response.data as MessageInterface;

      // Handle specific status codes
      if (status === 401) {
        // Unauthorized - could redirect to login
        console.error('Unauthorized access');
      } else if (status === 403) {
        // Forbidden
        console.error('Access forbidden');
      } else if (status === 404) {
        // Not found
        console.error('Resource not found');
      } else if (status >= 500) {
        // Server error
        console.error('Server error occurred');
      }

      // Return error with response data
      return Promise.reject({
        ...error,
        message: data?.message || error.message,
        status,
        data,
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received from server');
      return Promise.reject({
        ...error,
        message: 'Network error. Please check your connection.',
      });
    } else {
      // Something else happened
      console.error('Error setting up request:', error.message);
      return Promise.reject({
        ...error,
        message: error.message || 'An unexpected error occurred',
      });
    }
  }
);

export default axiosInstance;



