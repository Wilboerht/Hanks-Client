"use client";

import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'subtle' | 'filled' | 'glass';
  size?: 'sm' | 'md' | 'lg';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full font-medium',
          {
            'bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-300': variant === 'default',
            'bg-neutral-100/50 dark:bg-neutral-700/50 text-neutral-800 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-600': variant === 'outline',
            'bg-neutral-100/30 dark:bg-neutral-700/30 text-neutral-600 dark:text-neutral-400': variant === 'subtle',
            'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900': variant === 'filled',
            'bg-white/20 dark:bg-neutral-800/40 backdrop-blur-sm text-inherit': variant === 'glass',
            'px-2 py-0.5 text-xs': size === 'sm',
            'px-2.5 py-0.5 text-sm': size === 'md',
            'px-3 py-1 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export interface BadgeGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: 'sm' | 'md' | 'lg';
  wrap?: boolean;
}

export const BadgeGroup = React.forwardRef<HTMLDivElement, BadgeGroupProps>(
  ({ className, gap = 'md', wrap = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          {
            'gap-1': gap === 'sm',
            'gap-1.5': gap === 'md',
            'gap-2': gap === 'lg',
            'flex-wrap': wrap,
          },
          className
        )}
        {...props}
      />
    );
  }
);

BadgeGroup.displayName = 'BadgeGroup'; 