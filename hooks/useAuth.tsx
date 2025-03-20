'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { User } from '@/lib/api/types';
import { useLocalStorage } from './useLocalStorage';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  updateUserData: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(status === 'loading');
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData, removeUserData] = useLocalStorage<User | null>('user', null);

  // 从会话或本地存储加载用户数据
  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true);
      return;
    }

    setIsLoading(false);

    if (status === 'authenticated' && session?.user) {
      // 从会话中提取用户数据
      const sessionUser = session.user as any;
      const userObject: User = {
        id: sessionUser.id || '',
        username: sessionUser.name || '',
        email: sessionUser.email || '',
        avatar: sessionUser.image || undefined,
        bio: sessionUser.bio || undefined,
        role: sessionUser.role || 'user',
        createdAt: sessionUser.createdAt || new Date().toISOString(),
        updatedAt: sessionUser.updatedAt || new Date().toISOString(),
      };
      
      setUser(userObject);
      setUserData(userObject);
    } else if (userData) {
      // 如果会话不存在但有本地存储的用户数据，使用本地存储
      setUser(userData);
    } else {
      // 没有认证
      setUser(null);
      removeUserData();
    }
  }, [session, status, userData, setUserData, removeUserData]);

  // 更新用户数据
  const updateUserData = useCallback((data: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      setUserData(updated);
      return updated;
    });
  }, [setUserData]);

  // 清除错误
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        setUser,
        updateUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 