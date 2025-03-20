'use client';

import { useState, useEffect } from 'react';

type StorageValue<T> = T | null;

/**
 * 自定义钩子用于在React中持久化状态到localStorage
 * 
 * @param key - localStorage的键名
 * @param initialValue - 默认值，当localStorage中没有值时使用
 * @returns [存储的值, 设置值的函数, 删除值的函数]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T)
): [StorageValue<T>, (value: T | ((val: StorageValue<T>) => T)) => void, () => void] {
  // 获取初始值
  const getInitialValue = (): StorageValue<T> => {
    if (typeof window === 'undefined') {
      // 服务器端渲染时，返回初始值
      return typeof initialValue === 'function'
        ? (initialValue as () => T)()
        : initialValue;
    }

    try {
      // 从localStorage获取值
      const item = window.localStorage.getItem(key);
      
      // 如果找到了值，解析JSON并返回，否则返回初始值
      return item ? JSON.parse(item) : (
        typeof initialValue === 'function'
          ? (initialValue as () => T)()
          : initialValue
      );
    } catch (error) {
      // 如果出错，返回初始值
      console.error(`Error reading localStorage key "${key}":`, error);
      return typeof initialValue === 'function'
        ? (initialValue as () => T)()
        : initialValue;
    }
  };

  // 状态存储值
  const [storedValue, setStoredValue] = useState<StorageValue<T>>(getInitialValue);

  // 设置值的函数
  const setValue = (value: T | ((val: StorageValue<T>) => T)) => {
    try {
      // 允许值是一个函数，类似于React的setState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      
      // 保存到state
      setStoredValue(valueToStore);
      
      // 保存到localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        // 触发存储事件，以便同步其他组件的状态
        window.dispatchEvent(new StorageEvent('storage', {
          key,
          newValue: JSON.stringify(valueToStore),
          storageArea: localStorage
        }));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // 删除值的函数
  const removeValue = () => {
    try {
      setStoredValue(null);
      
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        // 触发存储事件
        window.dispatchEvent(new StorageEvent('storage', {
          key,
          newValue: null,
          storageArea: localStorage
        }));
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  // 监听其他窗口或组件的更改
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 处理存储事件
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.storageArea === localStorage) {
        try {
          const newValue = event.newValue
            ? JSON.parse(event.newValue)
            : null;
          setStoredValue(newValue);
        } catch (e) {
          console.error(`Error parsing localStorage change for key "${key}":`, e);
        }
      }
    };

    // 添加事件监听器
    window.addEventListener('storage', handleStorageChange);
    
    // 清理
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue, removeValue];
}

/**
 * 与useLocalStorage类似，但用于sessionStorage
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T | (() => T)
): [StorageValue<T>, (value: T | ((val: StorageValue<T>) => T)) => void, () => void] {
  // 获取初始值
  const getInitialValue = (): StorageValue<T> => {
    if (typeof window === 'undefined') {
      return typeof initialValue === 'function'
        ? (initialValue as () => T)()
        : initialValue;
    }

    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : (
        typeof initialValue === 'function'
          ? (initialValue as () => T)()
          : initialValue
      );
    } catch (error) {
      console.error(`Error reading sessionStorage key "${key}":`, error);
      return typeof initialValue === 'function'
        ? (initialValue as () => T)()
        : initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState<StorageValue<T>>(getInitialValue);

  const setValue = (value: T | ((val: StorageValue<T>) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
        window.dispatchEvent(new StorageEvent('storage', {
          key,
          newValue: JSON.stringify(valueToStore),
          storageArea: sessionStorage
        }));
      }
    } catch (error) {
      console.error(`Error setting sessionStorage key "${key}":`, error);
    }
  };

  const removeValue = () => {
    try {
      setStoredValue(null);
      
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(key);
        window.dispatchEvent(new StorageEvent('storage', {
          key,
          newValue: null,
          storageArea: sessionStorage
        }));
      }
    } catch (error) {
      console.error(`Error removing sessionStorage key "${key}":`, error);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.storageArea === sessionStorage) {
        try {
          const newValue = event.newValue
            ? JSON.parse(event.newValue)
            : null;
          setStoredValue(newValue);
        } catch (e) {
          console.error(`Error parsing sessionStorage change for key "${key}":`, e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue, removeValue];
} 