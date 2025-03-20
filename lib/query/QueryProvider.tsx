'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// 创建一个QueryClient实例
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 默认的staleTime，防止频繁重新获取
      staleTime: 1000 * 60, // 1分钟
      // 重试配置
      retry: 1,
      // 错误处理策略
      refetchOnWindowFocus: process.env.NODE_ENV === 'production',
      // 缓存数据保留时间
      gcTime: 1000 * 60 * 5, // 5分钟
    },
    mutations: {
      // 默认1次重试
      retry: 1,
    },
  },
});

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * 全局React Query提供器
 * 提供统一的数据获取和缓存层
 */
export default function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 仅在开发模式下显示React Query开发工具 */}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

// 导出QueryClient以便在其他地方使用
export { queryClient }; 