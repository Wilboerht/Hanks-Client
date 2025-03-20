/**
 * Spinner组件
 * 用于显示加载状态，支持不同尺寸和颜色
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type SpinnerType = 'border' | 'grow' | 'dots';
type SpinnerColor = 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'danger' 
  | 'warning' 
  | 'info' 
  | 'light' 
  | 'dark' 
  | 'current';

interface SpinnerProps {
  size?: SpinnerSize;
  type?: SpinnerType;
  color?: SpinnerColor;
  fullScreen?: boolean;
  className?: string;
  text?: string;
  textPosition?: 'top' | 'bottom' | 'left' | 'right';
}

export const ButtonSpinner: React.FC<{
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: SpinnerColor;
  className?: string;
}> = ({ size = 'sm', color = 'current', className = '' }) => {
  // 尺寸映射
  const sizeMap: Record<string, string> = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-7 w-7',
  };

  // 颜色映射
  const colorMap: Record<SpinnerColor, string> = {
    primary: 'text-blue-500',
    secondary: 'text-gray-500',
    success: 'text-green-500',
    danger: 'text-red-500',
    warning: 'text-amber-500',
    info: 'text-sky-500',
    light: 'text-gray-300',
    dark: 'text-gray-800',
    current: 'text-current',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-current border-t-transparent',
        sizeMap[size],
        colorMap[color],
        className
      )}
      role="status"
      aria-label="loading"
    />
  );
};

const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  type = 'border',
  color = 'primary',
  fullScreen = false,
  className = '',
  text,
  textPosition = 'bottom',
}) => {
  // 尺寸映射
  const sizeMap: Record<SpinnerSize, string> = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  // 颜色映射
  const colorMap: Record<SpinnerColor, string> = {
    primary: 'text-blue-500',
    secondary: 'text-gray-500',
    success: 'text-green-500',
    danger: 'text-red-500',
    warning: 'text-amber-500',
    info: 'text-sky-500',
    light: 'text-gray-300',
    dark: 'text-gray-800',
    current: 'text-current',
  };

  // 生成spinner样式
  const spinnerClasses = cn(
    'inline-block',
    sizeMap[size],
    colorMap[color],
    className
  );

  // 生成容器样式
  const containerClasses = cn(
    'flex items-center gap-2',
    {
      'justify-center': fullScreen,
      'flex-col': textPosition === 'bottom' || textPosition === 'top',
      'flex-col-reverse': textPosition === 'top',
      'flex-row': textPosition === 'right' || textPosition === 'left',
      'flex-row-reverse': textPosition === 'left',
      'fixed inset-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm': fullScreen,
    }
  );

  // 渲染不同类型的spinner
  const renderSpinner = () => {
    switch (type) {
      case 'border':
        return (
          <div
            className={cn(
              spinnerClasses,
              'animate-spin rounded-full border-2 border-current border-t-transparent'
            )}
            role="status"
            aria-label="loading"
          />
        );
      case 'grow':
        return (
          <div
            className={cn(
              spinnerClasses,
              'animate-pulse rounded-full bg-current'
            )}
            role="status"
            aria-label="loading"
          />
        );
      case 'dots':
        return (
          <div className="flex space-x-1" role="status" aria-label="loading">
            <div className={cn(spinnerClasses, 'h-2 w-2 animate-bounce rounded-full bg-current')} style={{ animationDelay: '0ms' }} />
            <div className={cn(spinnerClasses, 'h-2 w-2 animate-bounce rounded-full bg-current')} style={{ animationDelay: '150ms' }} />
            <div className={cn(spinnerClasses, 'h-2 w-2 animate-bounce rounded-full bg-current')} style={{ animationDelay: '300ms' }} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={containerClasses}>
      {renderSpinner()}
      {text && <span className="text-sm font-medium">{text}</span>}
    </div>
  );
};

export default Spinner;

// 全屏加载指示器
export function FullScreenSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20 dark:bg-opacity-40">
      <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-xl flex flex-col items-center">
        <Spinner size="xl" />
        <p className="mt-4 text-gray-700 dark:text-gray-300 text-lg">加载中...</p>
      </div>
    </div>
  );
}

// 页面加载指示器 - 用于整页面加载
export function PageSpinner() {
  return (
    <div className="min-h-[400px] w-full flex flex-col items-center justify-center">
      <Spinner size="lg" />
      <p className="mt-4 text-gray-500 dark:text-gray-400">页面加载中...</p>
    </div>
  );
}

// 内联加载指示器，显示在各种容器内部
export function InlineSpinner({ text = '加载中...' }) {
  return (
    <div className="flex items-center justify-center py-4">
      <Spinner size="sm" />
      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">{text}</span>
    </div>
  );
} 