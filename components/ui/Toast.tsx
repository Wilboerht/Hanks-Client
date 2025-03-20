'use client';

import React, { createContext, useContext, useCallback, useState, ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiX, FiCheck, FiInfo, FiAlertTriangle, FiAlertOctagon } from 'react-icons/fi';
import { cn } from '@/lib/utils';

// Toast 类型
export type ToastType = 'success' | 'error' | 'info' | 'warning';

// Toast 接口
export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  onClose?: () => void;
}

// Toast 上下文
interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => string;
  dismissToast: (id: string) => void;
  dismissAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast 提供者组件
interface ToastProviderProps {
  children: ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxToasts?: number;
}

export function ToastProvider({
  children,
  position = 'bottom-right',
  maxToasts = 5
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);

  // 在客户端渲染后设置mounted状态
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // 生成唯一 ID
  const generateId = () => `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // 显示 Toast
  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = generateId();
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration || 5000,
    };

    setToasts(prevToasts => {
      // 如果达到最大数量，删除最早的
      const updatedToasts = [...prevToasts];
      if (updatedToasts.length >= maxToasts) {
        updatedToasts.shift();
      }
      return [...updatedToasts, newToast];
    });

    // 设置自动关闭
    if (newToast.duration !== Infinity) {
      // 使用函数式更新而不是直接引用dismissToast
      const timeoutId = setTimeout(() => {
        setToasts(currentToasts => 
          currentToasts.filter(toast => toast.id !== id)
        );
      }, newToast.duration);
      
      // 清理超时，避免内存泄漏
      return id;
    }

    return id;
  }, [maxToasts]);

  // 关闭 Toast
  const dismissToast = useCallback((id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  // 关闭所有 Toast
  const dismissAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // 计算位置样式
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-0 left-0';
      case 'top-center':
        return 'top-0 left-1/2 -translate-x-1/2';
      case 'top-right':
        return 'top-0 right-0';
      case 'bottom-left':
        return 'bottom-0 left-0';
      case 'bottom-center':
        return 'bottom-0 left-1/2 -translate-x-1/2';
      case 'bottom-right':
      default:
        return 'bottom-0 right-0';
    }
  };

  // 定义动画变体
  const variants = {
    initial: (position: string) => {
      if (position.includes('top')) {
        return { opacity: 0, y: -24, scale: 0.9 };
      }
      return { opacity: 0, y: 24, scale: 0.9 };
    },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: (position: string) => {
      if (position.includes('left')) {
        return { opacity: 0, x: -24, scale: 0.9 };
      }
      if (position.includes('right')) {
        return { opacity: 0, x: 24, scale: 0.9 };
      }
      if (position.includes('top')) {
        return { opacity: 0, y: -24, scale: 0.9 };
      }
      return { opacity: 0, y: 24, scale: 0.9 };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, dismissToast, dismissAllToasts }}>
      {children}
      {mounted && createPortal(
        <div
          className={cn(
            'fixed z-50 p-4 flex flex-col gap-2 max-w-md pointer-events-none',
            getPositionClasses()
          )}
        >
          <AnimatePresence mode="popLayout">
            {toasts.map(toast => (
              <motion.div
                key={toast.id}
                layout
                custom={position}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={variants}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="pointer-events-auto w-full"
              >
                <ToastItem toast={toast} onClose={() => dismissToast(toast.id)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

// Toast 项组件
interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const { type, title, message } = toast;

  // 根据类型获取样式
  const getTypeClasses = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'warning':
        return 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
    }
  };

  // 获取图标
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FiCheck className="text-green-500 dark:text-green-400 w-5 h-5" />;
      case 'error':
        return <FiAlertOctagon className="text-red-500 dark:text-red-400 w-5 h-5" />;
      case 'warning':
        return <FiAlertTriangle className="text-amber-500 dark:text-amber-400 w-5 h-5" />;
      case 'info':
      default:
        return <FiInfo className="text-blue-500 dark:text-blue-400 w-5 h-5" />;
    }
  };

  // 处理关闭
  const handleClose = () => {
    onClose();
    toast.onClose?.();
  };

  return (
    <div
      className={cn(
        'flex items-start p-4 rounded-lg shadow-md border',
        'backdrop-blur-md bg-opacity-90 dark:bg-opacity-90',
        'text-gray-800 dark:text-gray-200',
        getTypeClasses()
      )}
      role="alert"
    >
      <div className="flex-shrink-0 mr-3">
        {getIcon()}
      </div>
      <div className="flex-1 mr-2">
        {title && (
          <h3 className="font-medium mb-1">{title}</h3>
        )}
        <p className="text-sm opacity-90">{message}</p>
      </div>
      <button
        onClick={handleClose}
        className="flex-shrink-0 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="关闭通知"
      >
        <FiX className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </button>
    </div>
  );
}

// 使用 Toast 的钩子
export function useToast() {
  const context = useContext(ToastContext);
  
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
}

/**
 * 使用示例:
 * 
 * // 1. 在应用入口处包装 ToastProvider
 * <ToastProvider position="bottom-right">
 *   <App />
 * </ToastProvider>
 * 
 * // 2. 在组件中使用 useToast 钩子
 * const { showToast, dismissToast } = useToast();
 * 
 * // 3. 显示不同类型的 Toast
 * // 成功 Toast
 * showToast({
 *   type: 'success',
 *   title: '操作成功',
 *   message: '您的更改已成功保存',
 * });
 * 
 * // 错误 Toast
 * showToast({
 *   type: 'error',
 *   title: '发生错误',
 *   message: '无法完成操作，请稍后再试',
 *   duration: 10000, // 10秒
 * });
 * 
 * // 信息 Toast
 * showToast({
 *   type: 'info',
 *   message: '新版本可用',
 * });
 * 
 * // 警告 Toast
 * const toastId = showToast({
 *   type: 'warning',
 *   title: '注意',
 *   message: '此操作无法撤销',
 *   duration: Infinity, // 不会自动关闭
 * });
 * 
 * // 手动关闭 Toast
 * dismissToast(toastId);
 */ 