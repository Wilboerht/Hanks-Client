/**
 * 认证相关自定义Hook
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import * as authApi from '../api/auth';
import * as userApi from '../api/users';
import { User, LoginData, RegisterData } from '../api/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });
  
  const router = useRouter();

  // 检查用户是否已经登录
  const checkAuth = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // 只在客户端检查localStorage中的token
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
          return;
        }
        
        // 获取用户信息
        const userResponse = await userApi.getUserProfile();
        setAuthState({
          user: userResponse.data,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      }
    } catch (error) {
      // 处理错误情况，可能是token已过期
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: '会话已过期，请重新登录'
      });
    }
  }, []);

  // 组件挂载时检查认证状态
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 登录方法
  const login = async (credentials: LoginData) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await authApi.login(credentials);
      
      // 存储登录状态
      if (credentials.rememberMe) {
        // 如果用户选择"记住我"，将登录状态保存在localStorage
        localStorage.setItem('rememberMe', 'true');
      } else {
        // 否则移除"记住我"标记
        localStorage.removeItem('rememberMe');
      }
      
      setAuthState({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '登录失败，请检查凭据';
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      
      throw error;
    }
  };

  // 注册方法
  const register = async (userData: RegisterData) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await authApi.register(userData);
      
      setAuthState({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '注册失败，请稍后再试';
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      
      throw error;
    }
  };

  // 登出方法
  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      await authApi.logout();
      
      // 清除所有相关存储数据
      localStorage.removeItem('rememberMe');
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
      
      router.push('/login');
    } catch (error) {
      // 即使API调用失败，我们仍然清除本地状态
      localStorage.removeItem('rememberMe');
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
      
      router.push('/login');
    }
  };

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,
    login,
    register,
    logout,
    checkAuth
  };
} 