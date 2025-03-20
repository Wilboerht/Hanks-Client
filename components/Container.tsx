import React from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'auto';
}

/**
 * 响应式容器组件 - 提供一致的内容宽度和边距
 */
export function Container({
  children,
  className,
  as: Component = 'div',
  size = 'lg'
}: ContainerProps) {
  const sizeClasses = {
    sm: 'max-w-3xl',
    md: 'max-w-4xl',
    lg: 'max-w-7xl',
    xl: 'max-w-[90rem]',
    full: 'max-w-full',
    auto: ''
  };

  return (
    <Component
      className={cn(
        'w-full mx-auto px-4 sm:px-6 lg:px-8',
        sizeClasses[size],
        className
      )}
    >
      {children}
    </Component>
  );
}

/**
 * 使用示例:
 * 
 * // 基本用法
 * <Container>
 *   <h1>页面内容</h1>
 * </Container>
 * 
 * // 小尺寸容器用于文章内容
 * <Container size="sm" className="py-8">
 *   <article>...</article>
 * </Container>
 * 
 * // 作为其他元素
 * <Container as="section" size="full">
 *   <div>全宽内容</div>
 * </Container>
 */ 