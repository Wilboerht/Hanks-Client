"use client";

import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface IconGridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: ReactNode;
  bgColor?: string;
}

export const IconGridItem = React.forwardRef<HTMLDivElement, IconGridItemProps>(
  ({ className, icon, bgColor = 'bg-blue-100 dark:bg-blue-900/30', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          `${bgColor} p-3 rounded-md flex items-center justify-center`,
          className
        )}
        {...props}
      >
        {icon}
      </div>
    );
  }
);

IconGridItem.displayName = 'IconGridItem';

interface IconGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export const IconGrid = React.forwardRef<HTMLDivElement, IconGridProps>(
  ({ className, columns = 2, gap = 'md', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'grid',
          {
            'grid-cols-1': columns === 1,
            'grid-cols-2': columns === 2,
            'grid-cols-3': columns === 3,
            'grid-cols-4': columns === 4,
            'gap-1': gap === 'sm',
            'gap-2': gap === 'md',
            'gap-4': gap === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

IconGrid.displayName = 'IconGrid'; 