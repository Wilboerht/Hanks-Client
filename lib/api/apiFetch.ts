/**
 * 增强的API请求工具
 * 支持请求缓存、失败重试、统一错误处理和加载状态管理
 */

import { apiClient } from './client';
import { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ErrorHandler, parseApiError } from './errorHandler';

// 缓存接口
interface CacheOptions {
  enabled?: boolean;
  ttl?: number; // 缓存有效期（毫秒）
  key?: string; // 自定义缓存键
}

// 重试接口
interface RetryOptions {
  enabled?: boolean;
  count?: number; // 重试次数
  delay?: number; // 重试延迟（毫秒）
  onRetry?: (error: any, retryCount: number) => void; // 重试回调
}

// 请求接口
interface ApiFetchOptions<T = any> extends AxiosRequestConfig {
  cache?: CacheOptions;
  retry?: RetryOptions;
  onError?: (error: any) => void;
  transform?: (data: any) => T; // 数据转换
  abortOnUnmount?: boolean; // 卸载时中止请求
  suppressToast?: boolean; // 是否抑制自动Toast通知
  showSuccessToast?: boolean; // 是否显示成功的Toast
  successMessage?: string; // 成功消息
  showLoading?: boolean; // 是否显示加载状态
}

// 全局请求中间件
interface RequestMiddleware {
  onRequest?: (config: AxiosRequestConfig) => AxiosRequestConfig;
  onResponse?: (response: AxiosResponse) => AxiosResponse;
  onError?: (error: AxiosError) => Promise<any>;
}

// 请求缓存
const requestCache = new Map<string, { data: any; expires: number }>();

// 活跃请求跟踪
const activeRequests = new Map<string, AbortController>();

// 定义全局中间件列表
const middlewares: RequestMiddleware[] = [];

/**
 * 添加全局请求中间件
 */
export const addRequestMiddleware = (middleware: RequestMiddleware): void => {
  middlewares.push(middleware);
};

/**
 * 生成缓存键
 */
const generateCacheKey = (url: string, params: any = {}, method: string = 'get'): string => {
  return `${method}:${url}:${JSON.stringify(params)}`;
};

/**
 * 设置缓存
 */
const setCache = (key: string, data: any, ttl: number): void => {
  requestCache.set(key, {
    data,
    expires: Date.now() + ttl,
  });
};

/**
 * 获取缓存
 */
const getCache = (key: string): any => {
  const cached = requestCache.get(key);
  if (!cached) return null;

  // 检查是否过期
  if (cached.expires < Date.now()) {
    requestCache.delete(key);
    return null;
  }

  return cached.data;
};

/**
 * 带重试功能的请求
 */
const requestWithRetry = async <T>(
  config: AxiosRequestConfig,
  retryOptions: RetryOptions = {},
  transformFn?: (data: any) => T
): Promise<T> => {
  const { count = 3, delay = 300, onRetry, enabled = true } = retryOptions;
  let retries = 0;

  const executeRequest = async (): Promise<T> => {
    // 应用所有请求中间件
    let finalConfig = { ...config };
    for (const middleware of middlewares) {
      if (middleware.onRequest) {
        finalConfig = middleware.onRequest(finalConfig);
      }
    }

    try {
      const response: AxiosResponse = await apiClient.request(finalConfig);
      
      // 应用所有响应中间件
      let finalResponse = response;
      for (const middleware of middlewares) {
        if (middleware.onResponse) {
          finalResponse = middleware.onResponse(finalResponse);
        }
      }
      
      return transformFn ? transformFn(finalResponse.data) : finalResponse.data;
    } catch (error) {
      // 应用所有错误中间件
      for (const middleware of middlewares) {
        if (middleware.onError && error instanceof AxiosError) {
          try {
            const result = await middleware.onError(error);
            if (result !== undefined) {
              return transformFn ? transformFn(result) : result;
            }
          } catch (middlewareError) {
            // 中间件处理过程中出错，继续使用原始错误
          }
        }
      }

      if (
        enabled &&
        retries < count &&
        error instanceof Error &&
        (error as AxiosError).response?.status !== 401 && // 不重试认证错误
        (error as AxiosError).response?.status !== 403 // 不重试权限错误
      ) {
        retries += 1;
        onRetry?.(error, retries);
        
        // 指数退避算法
        const delayTime = delay * Math.pow(2, retries - 1);
        await new Promise(resolve => setTimeout(resolve, delayTime));
        return executeRequest();
      }
      throw error;
    }
  };

  return executeRequest();
};

/**
 * 增强的API请求函数
 */
export async function apiFetch<T = any>(
  url: string,
  options: ApiFetchOptions<T> = {}
): Promise<T> {
  const {
    method = 'get',
    params,
    data,
    headers,
    cache = { enabled: false, ttl: 1000 * 60 * 5 },
    retry = { enabled: false, count: 3, delay: 300 },
    onError,
    transform,
    abortOnUnmount = false,
    suppressToast = false,
    showSuccessToast = false,
    successMessage,
    showLoading = false,
    ...restOptions
  } = options;

  // 创建中止控制器
  const controller = new AbortController();
  const signal = controller.signal;
  
  // 跟踪这个请求
  const requestKey = generateCacheKey(url, params, method);
  activeRequests.set(requestKey, controller);

  // 在请求完成后清理
  const cleanupRequest = () => {
    activeRequests.delete(requestKey);
  };

  try {
    // 检查缓存
    if (cache.enabled && method.toLowerCase() === 'get') {
      const cacheKey = cache.key || requestKey;
      const cachedData = getCache(cacheKey);

      if (cachedData) {
        cleanupRequest();
        return transform ? transform(cachedData) : cachedData;
      }

      // 执行请求并缓存结果
      const response = await requestWithRetry<T>(
        {
          url,
          method,
          params,
          data,
          headers,
          signal,
          ...restOptions,
        },
        retry,
        transform
      );

      setCache(cacheKey, response, cache.ttl || 1000 * 60 * 5); // 默认5分钟
      cleanupRequest();
      
      // 显示成功提示
      if (showSuccessToast && typeof window !== 'undefined') {
        try {
          const toast = ErrorHandler.getToastHandlers();
          toast.showToast({
            type: 'success',
            title: '操作成功',
            message: successMessage || '请求成功完成',
          });
        } catch (e) {
          // 忽略错误，可能在某些上下文中无法访问toast
        }
      }
      
      return response;
    }

    // 无缓存直接请求
    const response = await requestWithRetry<T>(
      {
        url,
        method,
        params,
        data,
        headers,
        signal,
        ...restOptions,
      },
      retry,
      transform
    );
    
    cleanupRequest();
    
    // 显示成功提示
    if (showSuccessToast && typeof window !== 'undefined') {
      try {
        const toast = ErrorHandler.getToastHandlers();
        toast.showToast({
          type: 'success',
          title: '操作成功',
          message: successMessage || '请求成功完成',
        });
      } catch (e) {
        // 忽略错误，可能在某些上下文中无法访问toast
      }
    }
    
    return response;
  } catch (error) {
    cleanupRequest();
    
    // 处理错误
    onError?.(error);
    
    // 如果不是要求抑制Toast，则显示错误提示
    if (!suppressToast && typeof window !== 'undefined') {
      try {
        const toast = ErrorHandler.getToastHandlers();
        ErrorHandler.handleError(error, toast);
      } catch (e) {
        // 忽略错误，可能在某些上下文中无法访问toast
        console.error('API请求错误:', parseApiError(error));
      }
    }
    
    throw error;
  }
}

/**
 * 提供给React组件使用的辅助函数，用于在卸载时中止请求
 */
export const createRequestAbortController = (): { controller: AbortController; signal: AbortSignal } => {
  const controller = new AbortController();
  return { controller, signal: controller.signal };
};

/**
 * 中止所有进行中的请求
 */
export const abortAllRequests = (): void => {
  activeRequests.forEach(controller => {
    controller.abort();
  });
  activeRequests.clear();
};

/**
 * 中止特定请求
 */
export const abortRequest = (url: string, params: any = {}, method: string = 'get'): boolean => {
  const key = generateCacheKey(url, params, method);
  const controller = activeRequests.get(key);
  if (controller) {
    controller.abort();
    activeRequests.delete(key);
    return true;
  }
  return false;
};

/**
 * 清除指定键或所有缓存
 */
export const clearCache = (key?: string): void => {
  if (key) {
    requestCache.delete(key);
  } else {
    requestCache.clear();
  }
};

/**
 * 批量请求
 */
export async function apiFetchAll<T = any[]>(
  requests: Array<{ url: string; options?: ApiFetchOptions<any> }>,
  allOptions: { abortOnFail?: boolean; suppressToast?: boolean } = {}
): Promise<T> {
  const { abortOnFail = false, suppressToast = false } = allOptions;
  
  try {
    return await Promise.all(
      requests.map(({ url, options = {} }) => 
        apiFetch(url, { ...options, suppressToast })
      )
    ) as unknown as T;
  } catch (error) {
    if (abortOnFail) {
      // 如果需要在任何请求失败时抛出错误，则处理错误并重新抛出
      if (!suppressToast && typeof window !== 'undefined') {
        try {
          const toast = ErrorHandler.getToastHandlers();
          ErrorHandler.handleError(error, toast);
        } catch (e) {
          // 忽略错误
        }
      }
      throw error;
    }
    
    // 即使有部分请求失败，也返回已完成的请求结果
    return requests.map(({ url, options = {} }) => {
      try {
        return apiFetch(url, { ...options, suppressToast });
      } catch (_) {
        return null;
      }
    }) as unknown as T;
  }
}

export default apiFetch; 