'use client';

import React, { Suspense, ComponentType, lazy, LazyExoticComponent } from 'react';

interface DynamicImportProps {
  component: ComponentType<any>;
  fallback?: React.ReactNode;
  props?: Record<string, any>;
}

/**
 * 动态导入组件包装器
 * 用于懒加载组件，减少初始加载包体积
 */
export default function DynamicImport({
  component: Component,
  fallback = <div className="inline-flex items-center gap-2">
    <div className="w-4 h-4 border-2 border-current border-r-transparent animate-spin rounded-full" />
    <span>加载组件中...</span>
  </div>,
  props = {}
}: DynamicImportProps) {
  return (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  );
}

/**
 * 创建可动态导入的组件
 * @param importFn 组件导入函数
 * @returns 懒加载组件
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): LazyExoticComponent<T> {
  return lazy(importFn);
}

/**
 * 预加载组件
 * 可以在需要之前预先加载组件
 * 例如：用户悬停在链接上时预加载对应页面组件
 */
export function preloadComponent(importFn: () => Promise<any>): void {
  void importFn();
}

/**
 * 带有自定义加载指示器的动态导入组件
 */
export function DynamicImportWithCustomFallback({
  component: Component,
  fallback,
  props = {}
}: DynamicImportProps) {
  return (
    <Suspense fallback={fallback || <div className="inline-flex items-center gap-2">
      <div className="w-4 h-4 border-2 border-current border-r-transparent animate-spin rounded-full" />
      <span>加载组件中...</span>
    </div>}>
      <Component {...props} />
    </Suspense>
  );
}

/**
 * 使用示例:
 * 
 * 1. 创建懒加载组件:
 * const LazyHeavyComponent = createLazyComponent(() => import('@/components/HeavyComponent'));
 * 
 * 2. 在组件中使用:
 * <DynamicImport 
 *   component={LazyHeavyComponent} 
 *   props={{ someData: data }} 
 * />
 * 
 * 或者使用自定义加载状态:
 * <DynamicImportWithCustomFallback
 *   component={LazyHeavyComponent}
 *   fallback={<div>自定义加载中...</div>}
 *   props={{ someData: data }}
 * />
 */ 