/**
 * API客户端配置
 * 处理请求拦截、认证和错误处理
 */

import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { refreshToken, isTokenExpired } from './auth';

// 获取API基础URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// 安全地访问localStorage，防止在服务器端渲染中报错
const saveToStorage = (key: string, value: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, value);
  }
};

const removeFromStorage = (key: string) => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(key);
  }
};

const getFromStorage = (key: string): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
};

// 创建axios实例
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15秒超时
});

// 开发环境下输出请求和响应日志
if (process.env.NODE_ENV === 'development') {
  apiClient.interceptors.request.use(
    request => {
      console.log('API Request:', request.method?.toUpperCase(), 
        `${request.baseURL || ''}${request.url || ''}`);
      return request;
    },
    error => {
      console.error('API Request Error:', error);
      return Promise.reject(error);
    }
  );

  apiClient.interceptors.response.use(
    response => {
      console.log('API Response:', response.status, response.config.method?.toUpperCase(), response.config.url);
      return response;
    },
    error => {
      console.error('API Response Error:', error.response?.status, error.response?.data || error.message);
      return Promise.reject(error);
    }
  );
}

// 是否正在刷新token的标志
let isRefreshing = false;
// 等待token刷新的请求队列
let refreshSubscribers: ((token: string) => void)[] = [];

/**
 * 将请求添加到等待队列
 */
const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

/**
 * 执行队列中的所有请求
 */
const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

// 请求拦截器：添加认证token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // 确保在服务器端不要尝试访问localStorage
    if (typeof window === 'undefined') {
      return config;
    }
    
    // 检查是否有token存在
    const token = getFromStorage('token');
    
    if (token) {
      // 检查token是否过期
      if (isTokenExpired() && !config.url?.includes('/auth/refresh-token')) {
        // 如果token过期且当前请求不是刷新token请求
        if (!isRefreshing) {
          isRefreshing = true;
          
          try {
            // 刷新token
            const response = await refreshToken();
            const newToken = response.data.token;
            
            // 通知所有等待的请求
            onTokenRefreshed(newToken);
            isRefreshing = false;
            
            // 为当前请求添加新token
            config.headers.Authorization = `Bearer ${newToken}`;
          } catch (error) {
            isRefreshing = false;
            // 刷新失败，清除token
            removeFromStorage('token');
            removeFromStorage('tokenExpiry');
            removeFromStorage('refreshToken');
            removeFromStorage('refreshTokenExpiry');
            
            // 重定向到登录页（如果在客户端）
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            return Promise.reject(error);
          }
        } else {
          // 如果已经在刷新token，将当前请求添加到等待队列
          return new Promise<InternalAxiosRequestConfig>((resolve) => {
            subscribeTokenRefresh((token: string) => {
              config.headers.Authorization = `Bearer ${token}`;
              resolve(config);
            });
          });
        }
      } else {
        // token未过期，正常添加到请求头
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient; 