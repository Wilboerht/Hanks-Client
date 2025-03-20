'use client';

import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { useSearch } from '@/hooks/useSearch';
import { AnimatePresence, motion } from 'framer-motion';

interface SearchBarProps<T> {
  placeholder?: string;
  className?: string;
  searchFn?: (query: string) => Promise<T[]> | T[];
  onSearch?: (query: string, results: T[]) => void;
  onSelect?: (item: T) => void;
  minQueryLength?: number;
  debounceTime?: number;
  autoFocus?: boolean;
  renderItem?: (item: T, index: number) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
  renderLoading?: () => React.ReactNode;
  renderError?: (error: Error) => React.ReactNode;
  maxResults?: number;
}

/**
 * 搜索栏组件 - 可重用的搜索界面，与useSearch钩子集成
 */
export function SearchBar<T>({
  placeholder = '搜索...',
  className = '',
  searchFn,
  onSearch,
  onSelect,
  minQueryLength = 2,
  debounceTime = 300,
  autoFocus = false,
  renderItem,
  renderEmpty,
  renderLoading,
  renderError,
  maxResults = 5
}: SearchBarProps<T>) {
  const {
    query,
    setQuery,
    results,
    isSearching,
    error,
    isEmpty,
    isQueryTooShort,
    clearSearch,
    hasSearched
  } = useSearch<T>({
    searchFn,
    onSearch,
    minQueryLength,
    debounceTime
  });

  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 自动聚焦
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // 监听点击事件，实现点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 当搜索时打开下拉菜单
  useEffect(() => {
    if (query && query.length >= minQueryLength) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [query, minQueryLength]);

  // 点击搜索结果项
  const handleSelect = (item: T) => {
    if (onSelect) {
      onSelect(item);
      clearSearch();
      setIsOpen(false);
    }
  };

  // 渲染搜索结果
  const renderResults = () => {
    if (isSearching) {
      return (
        <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
          {renderLoading ? renderLoading() : '搜索中...'}
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 text-center text-sm text-red-500">
          {renderError ? renderError(error) : `搜索出错: ${error.message}`}
        </div>
      );
    }

    if (isQueryTooShort) {
      return (
        <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
          请输入至少 {minQueryLength} 个字符...
        </div>
      );
    }

    if (isEmpty && hasSearched) {
      return (
        <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
          {renderEmpty ? renderEmpty() : '没有找到匹配结果'}
        </div>
      );
    }

    const displayResults = maxResults ? results.slice(0, maxResults) : results;

    return (
      <div className="py-2">
        {displayResults.map((item, index) => (
          <div
            key={index}
            onClick={() => handleSelect(item)}
            className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
          >
            {renderItem ? renderItem(item, index) : JSON.stringify(item)}
          </div>
        ))}
        {results.length > maxResults && (
          <div className="px-4 py-2 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800">
            显示 {maxResults} 个结果中的 {results.length} 个
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative flex items-center">
        <FiSearch className="absolute left-3 text-gray-400 dark:text-gray-500" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-10 py-2 w-full border border-gray-300 dark:border-gray-700 rounded-lg 
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                   focus:outline-none focus:border-primary-500 dark:focus:border-primary-500
                   transition-all duration-200"
          onFocus={() => {
            if (query && query.length >= minQueryLength) {
              setIsOpen(true);
            }
          }}
        />
        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={clearSearch}
              className="absolute right-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Clear search"
            >
              <FiX className="text-gray-400 dark:text-gray-500" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden max-h-80 overflow-y-auto"
          >
            {renderResults()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * 使用示例:
 * 
 * interface User {
 *   id: number;
 *   name: string;
 *   email: string;
 * }
 * 
 * const searchUsers = async (query: string): Promise<User[]> => {
 *   const res = await fetch(`/api/users?search=${query}`);
 *   return res.json();
 * };
 * 
 * <SearchBar<User>
 *   placeholder="搜索用户..."
 *   searchFn={searchUsers}
 *   onSelect={(user) => {
 *     console.log('Selected user:', user);
 *   }}
 *   renderItem={(user) => (
 *     <div className="flex items-center">
 *       <div className="ml-3">
 *         <p className="font-medium">{user.name}</p>
 *         <p className="text-sm text-gray-500">{user.email}</p>
 *       </div>
 *     </div>
 *   )}
 * />
 */ 