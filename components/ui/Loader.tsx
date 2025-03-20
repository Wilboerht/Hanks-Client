/**
 * 页面加载状态组件
 * 显示整页或局部加载状态
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ButtonSpinner } from './Spinner';

interface LoaderProps {
  fullPage?: boolean;
  transparent?: boolean;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({ 
  fullPage = false, 
  transparent = false, 
  size = 'md',
  text,
  className = ''
}) => {
  // 根据size确定尺寸
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  // 创建全页加载器
  if (fullPage) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${transparent ? 'bg-white/70 dark:bg-gray-900/70' : 'bg-white dark:bg-gray-900'}`}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col items-center"
        >
          <ButtonSpinner className={`${sizeClass[size]} text-blue-600 dark:text-blue-400`} />
          {text && (
            <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">
              {text}
            </p>
          )}
        </motion.div>
      </div>
    );
  }

  // 创建内联加载器
  return (
    <div className={`flex items-center justify-center py-4 ${className}`}>
      <ButtonSpinner className={`${sizeClass[size]} text-blue-600 dark:text-blue-400`} />
      {text && (
        <p className="ml-3 text-gray-600 dark:text-gray-300 font-medium">
          {text}
        </p>
      )}
    </div>
  );
};

/**
 * 内容加载组件
 * 在内容加载时显示加载状态和骨架屏
 */
interface ContentLoaderProps {
  isLoading: boolean;
  skeleton?: React.ReactNode;
  error?: string | null;
  children: React.ReactNode;
  retry?: () => void;
}

export const ContentLoader: React.FC<ContentLoaderProps> = ({
  isLoading,
  skeleton,
  error,
  children,
  retry
}) => {
  // 显示错误信息
  if (error) {
    return (
      <div className="py-8 px-4 text-center">
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 mb-4">
          <p>{error}</p>
        </div>
        {retry && (
          <button
            onClick={retry}
            className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            重试
          </button>
        )}
      </div>
    );
  }

  // 显示加载状态或骨架屏
  if (isLoading) {
    if (skeleton) {
      return <>{skeleton}</>;
    }
    
    return <Loader text="加载中..." />;
  }

  // 显示内容
  return <>{children}</>;
};

/**
 * 骨架屏组件
 * 显示内容占位符
 */
interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: string;
  animate?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width = 'w-full',
  height = 'h-6',
  rounded = 'rounded-md',
  animate = true
}) => {
  return (
    <div 
      className={`bg-gray-200 dark:bg-gray-700 ${width} ${height} ${rounded} ${animate ? 'animate-pulse' : ''} ${className}`}
    />
  );
};

/**
 * 常用骨架屏模式
 */
export const Skeletons = {
  // 文本行骨架屏
  Line: ({ className = '', width = 'w-full' }: { className?: string, width?: string }) => (
    <Skeleton className={`mb-2 ${className}`} width={width} height="h-4" />
  ),
  
  // 头像骨架屏
  Avatar: ({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg', className?: string }) => {
    const sizeClass = {
      sm: 'w-8 h-8',
      md: 'w-12 h-12',
      lg: 'w-16 h-16'
    };
    
    return (
      <Skeleton className={`${sizeClass[size]} rounded-full ${className}`} />
    );
  },
  
  // 卡片骨架屏
  Card: () => (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
      <Skeleton className="mb-4" height="h-40" />
      <Skeleton className="mb-2" height="h-6" width="w-3/4" />
      <Skeleton className="mb-4" height="h-4" />
      <Skeleton className="mb-2" height="h-4" width="w-5/6" />
      <Skeleton height="h-4" width="w-4/6" />
    </div>
  ),
  
  // 文章骨架屏
  Article: () => (
    <div className="space-y-4">
      <Skeleton height="h-8" width="w-3/4" />
      <div className="flex items-center space-x-2">
        <Skeleton height="h-10" width="w-10" rounded="rounded-full" />
        <Skeleton height="h-4" width="w-32" />
      </div>
      <Skeleton height="h-60" />
      <Skeleton height="h-4" />
      <Skeleton height="h-4" width="w-11/12" />
      <Skeleton height="h-4" width="w-4/5" />
      <Skeleton height="h-4" width="w-9/12" />
    </div>
  )
}; 