/**
 * 认证相关API
 */

import axios from 'axios';
import { LoginData, RegisterData, AuthResponse, ApiResponse } from './types';

// 在文件顶部添加安全访问localStorage的工具函数
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

// 获取环境变量中的API基础URL，默认为本地环境
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// 创建一个没有拦截器的基础axios实例用于认证操作
const authClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// 设置token过期时间（24小时）和refreshToken过期时间（30天）
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24小时
const REFRESH_TOKEN_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30天

/**
 * 用户登录
 * @param credentials 登录凭据
 */
export const login = async (credentials: LoginData): Promise<AuthResponse> => {
  const response = await authClient.post('/auth/login', credentials);
  
  // 存储token到localStorage
  if (response.data?.token) {
    // 如果用户选择记住我，设置较长的过期时间
    const tokenExpiry = credentials.rememberMe ? Date.now() + REFRESH_TOKEN_EXPIRY : Date.now() + TOKEN_EXPIRY;
    
    saveToStorage('token', response.data.token);
    saveToStorage('tokenExpiry', tokenExpiry.toString());
    
    if (response.data.refreshToken) {
      saveToStorage('refreshToken', response.data.refreshToken);
      
      // 对于刷新令牌，无论是否"记住我"都设置较长的过期时间
      const refreshTokenExpiry = Date.now() + REFRESH_TOKEN_EXPIRY;
      saveToStorage('refreshTokenExpiry', refreshTokenExpiry.toString());
    }
  }
  
  return response.data;
};

/**
 * 用户注册
 * @param userData 用户注册数据
 */
export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  const response = await authClient.post('/auth/register', userData);
  
  // 存储token到localStorage
  if (response.data?.token) {
    const tokenExpiry = Date.now() + TOKEN_EXPIRY;
    saveToStorage('token', response.data.token);
    saveToStorage('tokenExpiry', tokenExpiry.toString());
    
    if (response.data.refreshToken) {
      const refreshTokenExpiry = Date.now() + REFRESH_TOKEN_EXPIRY;
      saveToStorage('refreshToken', response.data.refreshToken);
      saveToStorage('refreshTokenExpiry', refreshTokenExpiry.toString());
    }
  }
  
  return response.data;
};

/**
 * 用户登出
 */
export const logout = async (): Promise<void> => {
  try {
    // 获取当前token和refreshToken
    const token = getFromStorage('token');
    const refreshToken = getFromStorage('refreshToken');
    
    if (token) {
      // 同时发送token和refreshToken（如果有）
      await authClient.post('/auth/logout', 
        refreshToken ? { refreshToken } : {}, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
    } else if (refreshToken) {
      // 如果只有refreshToken，则只发送refreshToken
      await authClient.post('/auth/logout', { refreshToken });
    }
  } finally {
    // 无论API调用是否成功，都清除本地存储的token
    removeFromStorage('token');
    removeFromStorage('tokenExpiry');
    removeFromStorage('refreshToken');
    removeFromStorage('refreshTokenExpiry');
  }
};

/**
 * 检查令牌是否过期
 */
export const isTokenExpired = (): boolean => {
  const tokenExpiry = getFromStorage('tokenExpiry');
  
  if (!tokenExpiry) return true;
  
  return Date.now() > parseInt(tokenExpiry);
};

/**
 * 刷新访问令牌
 */
export const refreshToken = async (): Promise<AuthResponse> => {
  const refreshTokenValue = getFromStorage('refreshToken');
  
  if (!refreshTokenValue) {
    throw new Error('No refresh token available');
  }
  
  // 检查刷新令牌是否过期
  const refreshTokenExpiry = getFromStorage('refreshTokenExpiry');
  
  if (refreshTokenExpiry && Date.now() > parseInt(refreshTokenExpiry)) {
    // 如果刷新令牌过期，清除所有存储并抛出错误
    removeFromStorage('token');
    removeFromStorage('tokenExpiry');
    removeFromStorage('refreshToken');
    removeFromStorage('refreshTokenExpiry');
    throw new Error('Refresh token has expired. Please login again.');
  }
  
  const response = await authClient.post('/auth/refresh-token', { refreshToken: refreshTokenValue });
  
  if (response.data?.token) {
    // 更新令牌和过期时间
    const tokenExpiry = Date.now() + TOKEN_EXPIRY;
    saveToStorage('token', response.data.token);
    saveToStorage('tokenExpiry', tokenExpiry.toString());
    
    if (response.data.refreshToken) {
      const refreshTokenExpiry = Date.now() + REFRESH_TOKEN_EXPIRY;
      saveToStorage('refreshToken', response.data.refreshToken);
      saveToStorage('refreshTokenExpiry', refreshTokenExpiry.toString());
    }
  }
  
  return response.data;
};

/**
 * 忘记密码 - 发送重置邮件
 */
export const forgotPassword = async (email: string): Promise<ApiResponse<{ message: string }>> => {
  const response = await authClient.post('/auth/forgot-password', { email });
  return response.data;
};

/**
 * 重置密码
 */
export const resetPassword = async (token: string, newPassword: string): Promise<ApiResponse<{ message: string }>> => {
  const response = await authClient.post('/auth/reset-password', { token, newPassword });
  return response.data;
}; 