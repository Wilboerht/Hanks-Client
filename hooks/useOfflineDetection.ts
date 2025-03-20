'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

type OfflineAction = {
  type: string;
  payload: any;
  timestamp: number;
  endpoint: string;
  method: string;
};

interface OfflineDetectionHook {
  isOnline: boolean;
  lastOnline: Date | null;
  lastOffline: Date | null;
  isReconnecting: boolean;
  syncOfflineActions: () => Promise<boolean>;
  addOfflineAction: (action: Omit<OfflineAction, 'timestamp'>) => void;
  clearOfflineActions: () => void;
  offlineActions: OfflineAction[];
}

/**
 * 离线检测钩子
 * 提供网络状态检测和离线操作存储
 */
export function useOfflineDetection(): OfflineDetectionHook {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [lastOnline, setLastOnline] = useState<Date | null>(isOnline ? new Date() : null);
  const [lastOffline, setLastOffline] = useState<Date | null>(isOnline ? null : new Date());
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);
  
  // 使用本地存储保存离线操作
  const [offlineActions, setOfflineActions, clearActions] = useLocalStorage<OfflineAction[]>(
    'offline_actions',
    []
  );

  // 确保offlineActions不为undefined
  const safeOfflineActions = offlineActions || [];

  // 处理在线状态变化
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      setLastOnline(new Date());
    };

    const handleOffline = () => {
      setIsOnline(false);
      setLastOffline(new Date());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 初始检查
    setIsOnline(navigator.onLine);
    if (navigator.onLine) {
      setLastOnline(new Date());
    } else {
      setLastOffline(new Date());
    }

    // 定期检查连接
    const intervalId = setInterval(() => {
      // 如果显示在线，但实际无法连接到服务器
      if (navigator.onLine) {
        fetch('/api/health', { 
          method: 'HEAD',
          cache: 'no-cache',
          headers: { 'Cache-Control': 'no-cache' }
        })
          .then(() => {
            if (!isOnline) {
              setIsOnline(true);
              setLastOnline(new Date());
            }
          })
          .catch(() => {
            // 无法连接到服务器，但浏览器认为在线
            if (isOnline) {
              setIsOnline(false);
              setLastOffline(new Date());
            }
          });
      }
    }, 30000); // 每30秒检查一次

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [isOnline]);

  // 添加离线操作
  const addOfflineAction = useCallback((action: Omit<OfflineAction, 'timestamp'>) => {
    setOfflineActions(prev => {
      const newAction: OfflineAction = {
        ...action,
        timestamp: Date.now()
      };
      return [...(prev || []), newAction];
    });
  }, [setOfflineActions]);

  // 清除所有离线操作
  const clearOfflineActions = useCallback(() => {
    clearActions();
  }, [clearActions]);

  // 同步离线操作到服务器
  const syncOfflineActions = useCallback(async (): Promise<boolean> => {
    if (!isOnline || safeOfflineActions.length === 0) {
      return false;
    }

    setIsReconnecting(true);
    
    try {
      // 按时间戳排序操作
      const sortedActions = [...safeOfflineActions].sort(
        (a, b) => a.timestamp - b.timestamp
      );
      
      // 执行所有离线操作
      const results = await Promise.allSettled(
        sortedActions.map(async (action) => {
          try {
            const response = await fetch(action.endpoint, {
              method: action.method,
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(action.payload),
            });
            
            if (!response.ok) {
              throw new Error(`Error: ${response.status}`);
            }
            
            return await response.json();
          } catch (error) {
            console.error(`Failed to sync action: ${action.type}`, error);
            throw error;
          }
        })
      );
      
      // 检查是否所有操作都成功
      const allSucceeded = results.every(result => result.status === 'fulfilled');
      
      // 如果所有操作都成功，清除离线操作队列
      if (allSucceeded) {
        clearOfflineActions();
      } else {
        // 仅保留失败的操作
        const failedActionIndices = results
          .map((result, index) => result.status === 'rejected' ? index : -1)
          .filter(index => index !== -1);
        
        const failedActions = failedActionIndices.map(index => sortedActions[index]);
        setOfflineActions(failedActions);
      }
      
      setIsReconnecting(false);
      return allSucceeded;
    } catch (error) {
      console.error('Error syncing offline actions:', error);
      setIsReconnecting(false);
      return false;
    }
  }, [isOnline, safeOfflineActions, clearOfflineActions, setOfflineActions]);

  // 当重新连接时，尝试同步离线操作
  useEffect(() => {
    if (isOnline && safeOfflineActions.length > 0 && !isReconnecting) {
      syncOfflineActions();
    }
  }, [isOnline, safeOfflineActions, isReconnecting, syncOfflineActions]);

  return {
    isOnline,
    lastOnline,
    lastOffline,
    isReconnecting,
    syncOfflineActions,
    addOfflineAction,
    clearOfflineActions,
    offlineActions: safeOfflineActions,
  };
}

/**
 * 使用示例:
 * 
 * const { 
 *   isOnline, 
 *   addOfflineAction, 
 *   syncOfflineActions, 
 *   offlineActions 
 * } = useOfflineDetection();
 * 
 * // 处理表单提交
 * const handleSubmit = async (data) => {
 *   if (!isOnline) {
 *     // 存储离线操作
 *     addOfflineAction({
 *       type: 'CREATE_POST',
 *       payload: data,
 *       endpoint: '/api/posts',
 *       method: 'POST'
 *     });
 *     return { success: true, offline: true };
 *   }
 *   
 *   // 正常在线操作
 *   const response = await fetch('/api/posts', {
 *     method: 'POST',
 *     body: JSON.stringify(data)
 *   });
 *   return await response.json();
 * };
 */ 