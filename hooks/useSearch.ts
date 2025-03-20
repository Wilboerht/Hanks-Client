'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSearchOptions<T> {
  initialQuery?: string;
  debounceTime?: number;
  minQueryLength?: number;
  searchFn?: (query: string) => Promise<T[]> | T[];
  onSearch?: (query: string, results: T[]) => void;
  onError?: (error: Error) => void;
}

/**
 * 搜索钩子 - 用于搜索功能的状态管理和防抖
 * 
 * @param options 配置选项
 * @returns 搜索状态和方法
 */
export function useSearch<T>({
  initialQuery = '',
  debounceTime = 300,
  minQueryLength = 2,
  searchFn,
  onSearch,
  onError
}: UseSearchOptions<T> = {}) {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [results, setResults] = useState<T[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // 防抖处理
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    timerRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceTime);
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [query, debounceTime]);
  
  // 处理搜索
  const performSearch = useCallback(async () => {
    // 如果查询为空或小于最小长度要求，清空结果
    if (!debouncedQuery || debouncedQuery.length < minQueryLength) {
      setResults([]);
      return;
    }
    
    setIsSearching(true);
    setError(null);
    
    // 如果有正在进行的请求，取消它
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // 创建新的中止控制器
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    try {
      let searchResults: T[] = [];
      
      if (searchFn) {
        const result = await searchFn(debouncedQuery);
        searchResults = result;
      }
      
      // 如果请求已中止，不更新状态
      if (signal.aborted) return;
      
      setResults(searchResults);
      setHasSearched(true);
      onSearch?.(debouncedQuery, searchResults);
    } catch (err) {
      // 如果请求已中止，不更新状态
      if (signal.aborted) return;
      
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
    } finally {
      // 如果请求已中止，不更新状态
      if (!signal.aborted) {
        setIsSearching(false);
      }
    }
  }, [debouncedQuery, minQueryLength, searchFn, onSearch, onError]);
  
  // 当防抖查询变化时执行搜索
  useEffect(() => {
    if (debouncedQuery) {
      performSearch();
    } else {
      setResults([]);
      setHasSearched(false);
    }
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedQuery, performSearch]);
  
  // 清除搜索
  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setResults([]);
    setIsSearching(false);
    setError(null);
    setHasSearched(false);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);
  
  // 手动触发搜索
  const triggerSearch = useCallback((searchQuery?: string) => {
    const finalQuery = searchQuery !== undefined ? searchQuery : query;
    setQuery(finalQuery);
    setDebouncedQuery(finalQuery);
  }, [query]);
  
  return {
    // 状态
    query,
    results,
    isSearching,
    error,
    hasSearched,
    
    // 方法
    setQuery,
    clearSearch,
    triggerSearch,
    
    // 工具属性
    isEmpty: results.length === 0 && hasSearched,
    isQueryTooShort: debouncedQuery.length > 0 && debouncedQuery.length < minQueryLength,
  };
}

/**
 * 快速本地搜索钩子 - 用于在客户端对数据集进行搜索
 * 
 * @param data 要搜索的数据数组
 * @param options 配置选项
 * @returns 搜索状态和方法
 */
export function useLocalSearch<T>({
  data,
  searchKeys,
  initialQuery = '',
  debounceTime = 200,
  minQueryLength = 1,
  caseSensitive = false,
  exactMatch = false,
}: {
  data: T[];
  searchKeys: (keyof T)[];
  initialQuery?: string;
  debounceTime?: number;
  minQueryLength?: number;
  caseSensitive?: boolean;
  exactMatch?: boolean;
}) {
  // 本地搜索函数
  const localSearchFn = useCallback((query: string): T[] => {
    if (!query || query.length < minQueryLength) {
      return [];
    }
    
    // 准备搜索查询
    const searchQuery = caseSensitive ? query : query.toLowerCase();
    
    return data.filter(item => {
      // 检查每个搜索键
      return searchKeys.some(key => {
        const value = String(item[key]);
        const valueToSearch = caseSensitive ? value : value.toLowerCase();
        
        if (exactMatch) {
          return valueToSearch === searchQuery;
        } else {
          return valueToSearch.includes(searchQuery);
        }
      });
    });
  }, [data, searchKeys, minQueryLength, caseSensitive, exactMatch]);
  
  return useSearch<T>({
    initialQuery,
    debounceTime,
    minQueryLength,
    searchFn: localSearchFn,
  });
}

/**
 * 使用示例:
 * 
 * // 基本用法
 * const {
 *   query,
 *   setQuery,
 *   results,
 *   isSearching,
 *   isEmpty,
 *   clearSearch
 * } = useSearch<User>({
 *   debounceTime: 500,
 *   searchFn: async (q) => {
 *     const response = await fetch(`/api/users?q=${q}`);
 *     return response.json();
 *   }
 * });
 * 
 * // 客户端快速搜索
 * const users = [{id: 1, name: 'John'}, {id: 2, name: 'Jane'}];
 * const {
 *   query,
 *   setQuery,
 *   results,
 *   isEmpty
 * } = useLocalSearch({
 *   data: users,
 *   searchKeys: ['name'],
 *   caseSensitive: false
 * });
 */ 