"use client";

import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ProfileSectionProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  title,
  subtitle,
  children,
  actions,
  className,
  ...props
}) => {
  return (
    <section className={cn('mb-16 md:mb-20', className)} {...props}>
      {(title || subtitle || actions) && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8">
          <div>
            {title && <h2 className="text-2xl md:text-3xl font-bold mb-2">{title}</h2>}
            {subtitle && <p className="text-neutral-600 dark:text-neutral-400">{subtitle}</p>}
          </div>
          {actions && <div className="mt-4 sm:mt-0">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
};

export default ProfileSection; 