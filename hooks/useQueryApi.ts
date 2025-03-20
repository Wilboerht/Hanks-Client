'use client';

import { 
  useQuery, 
  useMutation, 
  UseQueryOptions, 
  UseMutationOptions,
  QueryKey
} from '@tanstack/react-query';
import { useToast } from '@/components/ui/Toast';
import { queryClient } from '@/lib/query/QueryProvider';
import apiFetch from '@/lib/api/apiFetch';
import { parseApiError } from '@/lib/api/errorHandler';

// 重用已有的ValidationError接口
export interface ValidationError {
  field: string;
  message: string;
}

// API请求配置接口
export interface ApiRequestConfig {
  url: string;
  method?: 'get' | 'post' | 'put' | 'delete' | 'patch';
  params?: Record<string, any>;
  body?: any;
  headers?: Record<string, string>;
  withCredentials?: boolean;
  showSuccessToast?: boolean;
  successMessage?: string;
  showErrorToast?: boolean;
  errorMessage?: string;
}

/**
 * 自定义查询钩子，用于获取数据
 * @param queryKey 查询键，用于缓存和标识
 * @param config API请求配置
 * @param options React Query的选项
 */
export function useQueryApi<TData = any, TError = unknown>(
  queryKey: QueryKey,
  config: ApiRequestConfig,
  options?: Omit<UseQueryOptions<TData, TError, TData, QueryKey>, 'queryKey' | 'queryFn'>
) {
  const toast = useToast();
  
  return useQuery<TData, TError>({
    queryKey,
    queryFn: async () => {
      try {
        const { url, method = 'get', params, body, headers, withCredentials = true } = config;
        
        const response = await apiFetch<TData>(url, {
          method,
          params,
          data: body,
          headers,
          withCredentials,
        });
        
        // 成功通知
        if (config.showSuccessToast && config.successMessage) {
          toast.showToast({
            type: 'success',
            title: '成功',
            message: config.successMessage
          });
        }
        
        return response;
      } catch (error) {
        // 错误处理
        const parsedError = parseApiError(error);
        
        if (config.showErrorToast !== false) {
          toast.showToast({
            type: 'error',
            title: '错误',
            message: config.errorMessage || parsedError.message || '请求失败'
          });
        }
        
        throw error;
      }
    },
    ...options
  });
}

/**
 * 自定义变更钩子，用于修改数据（POST, PUT, DELETE等）
 * @param config API请求配置
 * @param options React Query的变更选项
 */
export function useMutationApi<TData = any, TVariables = unknown, TError = unknown, TContext = unknown>(
  config: Omit<ApiRequestConfig, 'params'> & { 
    // 变更成功后无效化的查询键
    invalidateQueries?: QueryKey[];
    // 变更成功后重置的查询键
    resetQueries?: QueryKey[];
  },
  options?: Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'>
) {
  const toast = useToast();
  
  return useMutation<TData, TError, TVariables, TContext>({
    mutationFn: async (variables: TVariables) => {
      try {
        const { url, method = 'post', body, headers, withCredentials = true } = config;
        
        // 对于变更，我们将variables与预设的body合并
        const mergedBody = typeof variables === 'object' && !Array.isArray(variables) && variables !== null 
          ? { ...body, ...variables } 
          : variables || body;
        
        const response = await apiFetch<TData>(url, {
          method,
          data: mergedBody,
          headers,
          withCredentials
        });
        
        // 成功通知
        if (config.showSuccessToast !== false && config.successMessage) {
          toast.showToast({
            type: 'success',
            title: '成功',
            message: config.successMessage
          });
        }
        
        return response;
      } catch (error) {
        // 错误处理
        const parsedError = parseApiError(error);
        
        if (config.showErrorToast !== false) {
          toast.showToast({
            type: 'error',
            title: '错误',
            message: config.errorMessage || parsedError.message || '请求失败'
          });
        }
        
        throw error;
      }
    },
    onSuccess: (data, variables, context) => {
      // 调用原始的onSuccess处理程序（如果存在）
      if (options?.onSuccess) {
        options.onSuccess(data, variables, context);
      }
      
      // 无效化查询，强制React Query重新获取数据
      if (config.invalidateQueries?.length) {
        config.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
      
      // 重置查询，从缓存中删除数据
      if (config.resetQueries?.length) {
        config.resetQueries.forEach(queryKey => {
          queryClient.resetQueries({ queryKey });
        });
      }
    },
    ...options
  });
}

/**
 * 获取API查询键的工具函数
 * 可用于构建一致的查询键层次结构
 */
export function apiQueryKeys(baseKey: string, params?: Record<string, any>) {
  return params ? [baseKey, params] : [baseKey];
}

/**
 * 预获取数据的工具函数
 * 可用于预加载数据，例如在页面导航前
 */
export async function prefetchApiQuery<TData = any>(
  queryKey: QueryKey,
  config: ApiRequestConfig,
  options?: { staleTime?: number }
) {
  return queryClient.prefetchQuery({
    queryKey,
    queryFn: async () => {
      const { url, method = 'get', params, body, headers, withCredentials = true } = config;
      
      return apiFetch<TData>(url, {
        method,
        params,
        data: body,
        headers,
        withCredentials
      });
    },
    staleTime: options?.staleTime || 60 * 1000 // 默认1分钟
  });
}

// 为了方便使用，可导出这些实用函数
export const apiUtils = {
  // 使查询无效（强制刷新）
  invalidateQueries: (queryKey: QueryKey) => queryClient.invalidateQueries({ queryKey }),
  
  // 设置缓存数据（手动更新）
  setQueryData: <T>(queryKey: QueryKey, updater: T | ((oldData: T | undefined) => T)) => 
    queryClient.setQueryData(queryKey, updater),
  
  // 获取缓存数据
  getQueryData: <T>(queryKey: QueryKey) => queryClient.getQueryData<T>(queryKey),
  
  // 重置缓存
  resetQueries: (queryKey: QueryKey) => queryClient.resetQueries({ queryKey }),

  // 清除整个缓存
  clearCache: () => queryClient.clear()
}; 