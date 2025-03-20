"use client";

import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ProfileGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  columns?: {
    sm?: 1 | 2 | 3 | 4;
    md?: 1 | 2 | 3 | 4;
    lg?: 1 | 2 | 3 | 4;
  };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProfileGrid: React.FC<ProfileGridProps> = ({
  children,
  columns = { sm: 1, md: 2, lg: 3 },
  gap = 'md',
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'grid',
        {
          'grid-cols-1': columns.sm === 1,
          'sm:grid-cols-1': columns.sm === 1,
          'sm:grid-cols-2': columns.sm === 2,
          'sm:grid-cols-3': columns.sm === 3,
          'sm:grid-cols-4': columns.sm === 4,
          
          'md:grid-cols-1': columns.md === 1,
          'md:grid-cols-2': columns.md === 2,
          'md:grid-cols-3': columns.md === 3,
          'md:grid-cols-4': columns.md === 4,
          
          'lg:grid-cols-1': columns.lg === 1,
          'lg:grid-cols-2': columns.lg === 2,
          'lg:grid-cols-3': columns.lg === 3,
          'lg:grid-cols-4': columns.lg === 4,
          
          'gap-2': gap === 'sm',
          'gap-4': gap === 'md',
          'gap-6': gap === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default ProfileGrid; 