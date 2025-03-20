'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import Spinner from './Spinner';

export interface SearchInputProps {
  placeholder?: string;
  initialValue?: string;
  onSearch?: (value: string) => void;
  onChange?: (value: string) => void;
  debounceMs?: number;
  className?: string;
  inputClassName?: string;
  showClearButton?: boolean;
  loading?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'outlined' | 'filled' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  enterKeyHint?: 'search' | 'go' | 'done' | 'enter';
  searchButtonLabel?: string;
  clearButtonLabel?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = '搜索...',
  initialValue = '',
  onSearch,
  onChange,
  debounceMs = 300,
  className = '',
  inputClassName = '',
  showClearButton = true,
  loading = false,
  autoFocus = false,
  disabled = false,
  variant = 'default',
  size = 'md',
  enterKeyHint = 'search',
  searchButtonLabel = '搜索',
  clearButtonLabel = '清除搜索',
}) => {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 处理输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    // 如果有onChange回调，立即调用
    if (onChange) {
      onChange(newValue);
    }

    // 清除之前的定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // 设置新的定时器
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedValue(newValue);
    }, debounceMs);
  };

  // 处理搜索提交
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (onSearch) {
      onSearch(value);
    }
    
    // 去除焦点
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  // 清除搜索
  const handleClear = () => {
    setValue('');
    setDebouncedValue('');
    
    if (onChange) {
      onChange('');
    }
    
    if (onSearch) {
      onSearch('');
    }
    
    // 聚焦到输入框
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // 自动聚焦
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // 当防抖值变化时触发搜索
  useEffect(() => {
    if (onSearch && debouncedValue !== initialValue) {
      onSearch(debouncedValue);
    }
  }, [debouncedValue, initialValue, onSearch]);

  // 清理防抖定时器
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // 生成容器类名
  const containerClassName = cn(
    'flex items-center relative',
    {
      'opacity-70 pointer-events-none': disabled,
      'rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 overflow-hidden': variant === 'outlined',
      'rounded-lg bg-gray-100 dark:bg-gray-700': variant === 'filled',
      'border-b border-gray-300 dark:border-gray-600': variant === 'minimal',
      'rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm': variant === 'default',
      'h-8': size === 'sm',
      'h-10': size === 'md',
      'h-12': size === 'lg',
    },
    className
  );

  // 生成输入框类名
  const internalInputClassName = cn(
    'flex-grow bg-transparent outline-none px-3',
    {
      'text-sm': size === 'sm',
      'text-base': size === 'md',
      'text-lg': size === 'lg',
      'focus:ring-0': variant !== 'default',
      'focus:border-transparent': variant !== 'default',
    },
    inputClassName
  );

  return (
    <form
      className={containerClassName}
      onSubmit={handleSubmit}
      role="search"
    >
      <input
        ref={inputRef}
        type="search"
        className={internalInputClassName}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        enterKeyHint={enterKeyHint}
        aria-label={placeholder}
      />

      {/* 清除按钮 */}
      {showClearButton && value && !loading && (
        <button
          type="button"
          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={handleClear}
          aria-label={clearButtonLabel}
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      )}

      {/* 加载指示器 */}
      {loading && (
        <div className="pr-2">
          <Spinner size="sm" color="secondary" />
        </div>
      )}

      {/* 搜索按钮 */}
      <button
        type="submit"
        className={cn(
          'flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
          {
            'p-1 mr-1': size === 'sm',
            'p-2 mr-1': size === 'md' || size === 'lg',
          }
        )}
        disabled={disabled}
        aria-label={searchButtonLabel}
      >
        <MagnifyingGlassIcon className={cn({
          'h-4 w-4': size === 'sm',
          'h-5 w-5': size === 'md',
          'h-6 w-6': size === 'lg',
        })} />
      </button>
    </form>
  );
};

export default SearchInput;

/**
 * 使用示例:
 * 
 * // 基本使用
 * const [searchValue, setSearchValue] = useState('');
 * 
 * <SearchInput
 *   value={searchValue}
 *   onValueChange={setSearchValue}
 *   onSearch={(value) => console.log('Searching for:', value)}
 *   placeholder="搜索文章..."
 * />
 * 
 * // 填充变体
 * <SearchInput
 *   value={searchValue}
 *   onValueChange={setSearchValue}
 *   variant="filled"
 *   placeholder="搜索项目..."
 * />
 */ 