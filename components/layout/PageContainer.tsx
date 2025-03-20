import React from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

/**
 * A container component for page content with consistent padding and max-width
 */
export function PageContainer({
  children,
  className,
  fullWidth = false,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 py-8 md:px-6 md:py-12',
        fullWidth ? 'max-w-full' : 'max-w-7xl',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * A section component for grouping content within a page
 */
export function PageSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('mb-8 md:mb-12', className)}>
      {children}
    </section>
  );
}

/**
 * A header component for page titles and descriptions
 */
export function PageHeader({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn('mb-8 md:mb-12', className)}>
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
      {description && (
        <p className="mt-4 text-lg text-muted-foreground">{description}</p>
      )}
    </div>
  );
} 