'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/components/ui/Toast';
import apiFetch, { abortRequest } from '@/lib/api/apiFetch';
import ErrorHandler, { parseApiError } from '@/lib/api/errorHandler';

export interface ValidationError {
  field: string;
  message: string;
}

interface ApiFetchOptions {
  method?: string;
  params?: any;
  data?: any;
  headers?: Record<string, string>;
  withCredentials?: boolean;
  signal?: AbortSignal;
  transform?: (data: any) => any;
  cache?: {
    enabled: boolean;
    ttl?: number;
  };
  retry?: {
    enabled: boolean;
    count?: number;
    delay?: number;
  };
  suppressToast?: boolean;
  showSuccessToast?: boolean;
  successMessage?: string;
}

interface UseApiOptions<T> {
  url?: string;
  method?: 'get' | 'post' | 'put' | 'delete' | 'patch';
  initialData?: T;
  autoFetch?: boolean;
  fetchOnMount?: boolean;
  skipInitialLoad?: boolean;
  params?: Record<string, any>;
  body?: any;
  withCredentials?: boolean;
  headers?: Record<string, string>;
  transform?: (data: any) => T;
  cache?: boolean;
  cacheTTL?: number;
  retry?: boolean;
  retryCount?: number;
  retryDelay?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  showSuccessToast?: boolean;
  successMessage?: string;
  showErrorToast?: boolean;
  errorMessage?: string;
}

interface UseApiResult<T> {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  error: any;
  validationErrors: ValidationError[];
  refetch: (overrideOptions?: Partial<UseApiOptions<T>>) => Promise<T | null>;
  mutate: (newData: T | ((oldData: T | null) => T)) => void;
  request: <R = T>(
    url: string,
    options?: Partial<UseApiOptions<R>>
  ) => Promise<R | null>;
  reset: () => void;
}

/**
 * 自定义hook，用于处理API请求、加载状态和错误处理
 */
export function useApi<T = any>(options: UseApiOptions<T> = {}): UseApiResult<T> {
  const {
    url,
    method = 'get',
    initialData = null,
    autoFetch = true,
    fetchOnMount = true,
    skipInitialLoad = false,
    params,
    body,
    withCredentials = true,
    headers,
    transform,
    cache = false,
    cacheTTL = 5 * 60 * 1000, // 5分钟
    retry = false,
    retryCount = 3,
    retryDelay = 300,
    onSuccess,
    onError,
    showSuccessToast = false,
    successMessage,
    showErrorToast = true,
    errorMessage,
  } = options;

  const toast = useToast();
  const [data, setData] = useState<T | null>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(autoFetch && fetchOnMount && !!url);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  // 跟踪请求是否已被取消
  const abortControllerRef = useRef<AbortController>(new AbortController());
  const didCancel = useRef<boolean>(false);

  // 根据参数生成请求选项
  const getRequestOptions = useCallback((
    overrideOptions?: Partial<UseApiOptions<any>>
  ): ApiFetchOptions => {
    const mergedOptions = { ...options, ...overrideOptions };
    
    return {
      method: mergedOptions.method,
      params: mergedOptions.params,
      data: mergedOptions.body,
      headers: mergedOptions.headers,
      withCredentials: mergedOptions.withCredentials,
      signal: abortControllerRef.current.signal,
      transform: mergedOptions.transform,
      cache: {
        enabled: !!mergedOptions.cache,
        ttl: mergedOptions.cacheTTL,
      },
      retry: {
        enabled: !!mergedOptions.retry,
        count: mergedOptions.retryCount,
        delay: mergedOptions.retryDelay,
      },
      suppressToast: !mergedOptions.showErrorToast,
      showSuccessToast: mergedOptions.showSuccessToast,
      successMessage: mergedOptions.successMessage,
    };
  }, [options]);

  // 执行请求
  const executeRequest = useCallback(async <R = T>(
    requestUrl: string,
    requestOptions?: Partial<UseApiOptions<R>>
  ): Promise<R | null> => {
    if (!requestUrl) return null;
    
    const opts = getRequestOptions(requestOptions);
    
    // 保存当前状态以避免在组件卸载后更新状态
    const isCancelled = didCancel.current;
    if (!isCancelled) {
      setIsLoading(true);
      setIsError(false);
      setError(null);
      setValidationErrors([]);
    }
    
    try {
      const result = await apiFetch<R>(requestUrl, opts);
      
      if (!didCancel.current) {
        // 只有在请求没有被取消的情况下更新状态
        if (requestUrl === url) {
          setData(result as unknown as T);
        }
        
        setIsLoading(false);
        
        // 如果有成功回调，调用它
        if (!didCancel.current) {
          if (requestOptions?.onSuccess) {
            requestOptions.onSuccess(result);
          } else if (onSuccess && requestUrl === url) {
            onSuccess(result as unknown as T);
          }
        }
        
        return result;
      }
      return null;
    } catch (err) {
      if (!didCancel.current) {
        setIsLoading(false);
        setIsError(true);
        setError(err);
        
        // 解析错误
        const parsedError = parseApiError(err);
        
        // 设置验证错误
        if (parsedError.validationErrors) {
          setValidationErrors(parsedError.validationErrors);
        }
        
        // 如果有错误回调，调用它
        if (!didCancel.current) {
          if (requestOptions?.onError) {
            requestOptions.onError(err);
          } else if (onError) {
            onError(err);
          }
          
          // 显示错误通知 - 使用一个稳定的引用，避免无限循环
          if ((requestOptions?.showErrorToast !== false && showErrorToast) || requestOptions?.showErrorToast) {
            // 使用try-catch防止错误处理导致的循环
            try {
              ErrorHandler.handleError(err, toast);
            } catch (toastError) {
              console.error('显示错误通知时出错:', toastError);
            }
          }
        }
      }
      
      return null;
    }
  }, [getRequestOptions, onError, onSuccess, showErrorToast, toast, url]);

  // 重新请求数据
  const refetch = useCallback((
    overrideOptions?: Partial<UseApiOptions<T>>
  ): Promise<T | null> => {
    const requestUrl = overrideOptions?.url || url;
    if (!requestUrl) return Promise.resolve(null);
    
    // 中止之前的请求
    abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    didCancel.current = false;
    
    return executeRequest(requestUrl, overrideOptions);
  }, [executeRequest, url]);

  // 手动执行任意请求
  const request = useCallback(<R = T>(
    requestUrl: string,
    requestOptions?: Partial<UseApiOptions<R>>
  ): Promise<R | null> => {
    return executeRequest<R>(requestUrl, requestOptions);
  }, [executeRequest]);

  // 手动更新数据
  const mutate = useCallback((newData: T | ((oldData: T | null) => T)) => {
    setData(prev => typeof newData === 'function' ? (newData as Function)(prev) : newData);
  }, []);

  // 重置状态
  const reset = useCallback(() => {
    setData(initialData);
    setIsLoading(false);
    setIsError(false);
    setError(null);
    setValidationErrors([]);
  }, [initialData]);

  // 初始加载
  useEffect(() => {
    // 重置取消状态
    didCancel.current = false;
    
    if (url && fetchOnMount && autoFetch && !skipInitialLoad) {
      refetch();
    }
    
    return () => {
      // 组件卸载时，标记为已取消
      didCancel.current = true;
      // 中止任何正在进行的请求
      abortControllerRef.current.abort();
    };
  }, [url, refetch, fetchOnMount, autoFetch, skipInitialLoad]);

  return {
    data,
    isLoading,
    isError,
    error,
    validationErrors,
    refetch,
    mutate,
    request,
    reset,
  };
}

export default useApi; 