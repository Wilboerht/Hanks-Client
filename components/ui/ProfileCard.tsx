"use client";

import React, { ReactNode } from 'react';
import { Card } from './Card';
import { cn } from '@/lib/utils';

export interface ProfileCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'glass' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  colSpan?: 1 | 2 | 3;
  rowSpan?: 1 | 2;
  background?: string | ReactNode;
  gradient?: string;
  badge?: string;
  footer?: ReactNode;
  children?: ReactNode;
  centered?: boolean;
}

export const ProfileCard = React.forwardRef<HTMLDivElement, ProfileCardProps>(
  ({ 
    className, 
    variant = 'default', 
    padding = 'md', 
    hover = true,
    title,
    subtitle,
    icon,
    colSpan = 1,
    rowSpan = 1,
    background,
    gradient,
    badge,
    footer,
    children,
    centered = false,
    ...props 
  }, ref) => {
    return (
      <Card
        ref={ref}
        variant={variant}
        padding={gradient || typeof background === 'string' ? 'none' : padding}
        hover={hover}
        className={cn(
          'relative overflow-hidden',
          {
            'col-span-1': colSpan === 1,
            'col-span-2 sm:col-span-2': colSpan === 2,
            'col-span-3 sm:col-span-3': colSpan === 3,
            'row-span-1': rowSpan === 1,
            'row-span-2': rowSpan === 2,
            'h-60': rowSpan === 1,
            'h-full': rowSpan === 2,
            'flex flex-col justify-center items-center text-center': centered,
          },
          className
        )}
        {...props}
      >
        {background && typeof background === 'string' ? (
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${background})` }} />
        ) : background ? (
          <div className="absolute inset-0">{background}</div>
        ) : null}
        
        {gradient && (
          <div className={`absolute inset-0 ${gradient}`} />
        )}
        
        <div className={cn(
          'relative', 
          { 'p-3': padding === 'sm' && (gradient || typeof background === 'string'),
            'p-6': padding === 'md' && (gradient || typeof background === 'string'),
            'p-8': padding === 'lg' && (gradient || typeof background === 'string'),
            'flex flex-col h-full': true
          }
        )}>
          {badge && (
            <div className="mb-2">
              <span className="inline-block bg-white/20 dark:bg-neutral-800/40 rounded-full px-2 py-0.5 text-xs backdrop-blur-sm">
                {badge}
              </span>
            </div>
          )}
          
          {icon && (
            <div className="mb-4">
              {icon}
            </div>
          )}
          
          {title && (
            <h3 className={cn(
              "text-xl font-bold mb-1",
              {
                "text-white": gradient || (typeof background === 'string'),
              }
            )}>
              {title}
            </h3>
          )}
          
          {subtitle && (
            <p className={cn(
              "text-neutral-600 dark:text-neutral-400 mb-3",
              {
                "text-white/80": gradient || (typeof background === 'string'),
              }
            )}>
              {subtitle}
            </p>
          )}
          
          <div className={cn(
            "flex-grow",
            {
              "text-white": gradient || (typeof background === 'string'),
            }
          )}>
            {children}
          </div>
          
          {footer && (
            <div className="mt-auto pt-4">
              {footer}
            </div>
          )}
        </div>
      </Card>
    );
  }
);

ProfileCard.displayName = 'ProfileCard'; 