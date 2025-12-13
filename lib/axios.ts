import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Create axios instance with default config
const axiosInstance: AxiosInstance = axios.create({
  baseURL: typeof window !== 'undefined' ? window.location.origin : '',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important: send cookies with requests
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

// Request interceptor - Add access token to requests
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get access token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh on 401
axiosInstance.interceptors.response.use(
  (response) => {
    // Return response data directly
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Skip refresh for auth endpoints to avoid infinite loops
      if (originalRequest.url?.includes('/auth/refresh-token') ||
        originalRequest.url?.includes('/auth/verify-otp')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh token endpoint
        const response = await axios.post(
          '/api/v1/auth/refresh-token',
          {},
          {
            baseURL: typeof window !== 'undefined' ? window.location.origin : '',
            withCredentials: true, // Send refresh token cookie
          }
        );

        if (response.data.success && response.data.accessToken) {
          // Store new access token
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', response.data.accessToken);
          }

          // Update authorization header for the original request
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
          }

          // Process queued requests
          processQueue();
          isRefreshing = false;

          // Retry the original request
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        processQueue(refreshError);
        isRefreshing = false;

        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          // Optionally redirect to login page
          // window.location.href = '/';
        }

        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response) {
      const status = error.response.status;
      interface MessageInterface {
        message: string;
      }
      const data = error.response.data as MessageInterface;

      // Handle specific status codes
      if (status === 403) {
        console.error('Access forbidden');
      } else if (status === 404) {
        console.error('Resource not found');
      } else if (status >= 500) {
        console.error('Server error occurred');
      }

      return Promise.reject({
        ...error,
        message: data?.message || error.message,
        status,
        data,
      });
    } else if (error.request) {
      console.error('No response received from server');
      return Promise.reject({
        ...error,
        message: 'Network error. Please check your connection.',
      });
    } else {
      console.error('Error setting up request:', error.message);
      return Promise.reject({
        ...error,
        message: error.message || 'An unexpected error occurred',
      });
    }
  }
);

export default axiosInstance;
