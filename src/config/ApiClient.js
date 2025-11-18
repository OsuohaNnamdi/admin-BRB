import axios from 'axios';

const API_BASE_URL = 'https://apiskincare.pythonanywhere.com/api/v1';
const TOKEN_KEY = 'adminToken';

class ApiClient {
  constructor() {
    // Base instance without token
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Instance with token handling
    this.axiosInstanceWithToken = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupTokenInterceptor();
    this.setupResponseInterceptor();
  }

  setupTokenInterceptor() {
    this.axiosInstanceWithToken.interceptors.request.use(
      async (config) => {
        const token = await this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  setupResponseInterceptor() {
    this.axiosInstanceWithToken.interceptors.response.use(
      response => response,
      async error => {
        if (error.response?.status === 401) {
          await this.removeToken();
          // Redirect to login page if we're not already there
          if (window.location.pathname !== '/admin/login') {
            window.location.href = '/admin/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Cache Storage Token Management
  async getToken() {
    try {
      // Check if cache storage is available
      if (!('caches' in window)) {
        console.warn('Cache storage not available, falling back to localStorage');
        return localStorage.getItem(TOKEN_KEY);
      }
      
      const cache = await caches.open('auth-token');
      const response = await cache.match(TOKEN_KEY);
      
      if (response) {
        const token = await response.text();
        return token;
      }
      return null;
    } catch (error) {
      console.error('Error getting token from cache:', error);
      // Fallback to localStorage if cache fails
      return localStorage.getItem(TOKEN_KEY);
    }
  }

  async removeToken() {
    try {
      // Remove from cache storage
      if ('caches' in window) {
        const cache = await caches.open('auth-token');
        await cache.delete(TOKEN_KEY);
      }
      
      // Also remove from localStorage as backup
      localStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }

  async storeToken(token) {
    try {
      // Store in cache storage primarily
      if ('caches' in window) {
        const cache = await caches.open('auth-token');
        const response = new Response(token, {
          headers: { 'Content-Type': 'text/plain' }
        });
        await cache.put(TOKEN_KEY, response);
      }
      
      // Also store in localStorage as backup
      localStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error storing token:', error);
      // Fallback to localStorage if cache fails
      localStorage.setItem(TOKEN_KEY, token);
    }
  }

  // Core HTTP methods
  get(url, config = {}, useToken = false) {
    const instance = useToken ? this.axiosInstanceWithToken : this.axiosInstance;
    return instance.get(url, config);
  }

// ApiClient.js - Update the post method to handle FormData
post(url, data, config = {}, useToken = false) {
  const instance = useToken ? this.axiosInstanceWithToken : this.axiosInstance;
  
  // If data is FormData, don't set Content-Type header (let browser set it with boundary)
  if (data instanceof FormData) {
    const formDataConfig = {
      ...config,
      headers: {
        ...config.headers,
        'Content-Type': undefined, // Let browser set the content type with boundary
      }
    };
    return instance.post(url, data, formDataConfig);
  }
  
  return instance.post(url, data, config);
}

  put(url, data, config = {}, useToken = false) {
    const instance = useToken ? this.axiosInstanceWithToken : this.axiosInstance;
    return instance.put(url, data, config);
  }

  patch(url, data, config = {}, useToken = false) {
    const instance = useToken ? this.axiosInstanceWithToken : this.axiosInstance;
    return instance.patch(url, data, config);
  }

  delete(url, config = {}, useToken = false) {
    const instance = useToken ? this.axiosInstanceWithToken : this.axiosInstance;
    return instance.delete(url, config);
  }

  // Auth status check
  async isLoggedIn() {
    const token = await this.getToken();
    return token !== null;
  }

  // Clear all cached data (optional, for complete cleanup)
  async clearAllCache() {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}

export default new ApiClient();