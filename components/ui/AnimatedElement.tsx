"use client";

import React, { ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';

export interface AnimatedElementProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  animation?: 'hover-lift' | 'hover-glow' | 'hover-scale' | 'pulse' | 'none';
  duration?: 'fast' | 'normal' | 'slow';
  delay?: number;
  disabled?: boolean;
}

export const AnimatedElement = React.forwardRef<HTMLDivElement, AnimatedElementProps>(
  ({ 
    className, 
    children, 
    animation = 'hover-lift', 
    duration = 'normal',
    delay = 0,
    disabled = false,
    ...props 
  }, ref) => {
    const [isHovered, setIsHovered] = useState(false);
    
    const durationClass: Record<string, string> = {
      'fast': 'duration-200',
      'normal': 'duration-300',
      'slow': 'duration-500'
    };
    
    const animationClasses: Record<string, string> = {
      'hover-lift': 'hover:-translate-y-1 hover:shadow-elegant',
      'hover-glow': 'hover:shadow-glow',
      'hover-scale': 'hover:scale-105',
      'pulse': 'animate-pulse',
      'none': ''
    };

    const animationClass = disabled ? '' : animationClasses[animation];

    return (
      <div
        ref={ref}
        className={cn(
          'transition-all',
          durationClass[duration],
          animationClass,
          {
            [`delay-${delay}`]: delay > 0 && delay <= 1000,
          },
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AnimatedElement.displayName = 'AnimatedElement'; 