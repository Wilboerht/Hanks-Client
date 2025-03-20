'use client';

import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface PaginationProps {
  className?: string;
  children?: React.ReactNode;
}

export function Pagination({
  className,
  children,
  ...props
}: PaginationProps) {
  return (
    <nav
      className={cn("flex justify-center", className)}
      {...props}
    >
      {children}
    </nav>
  );
}

interface PaginationContentProps {
  className?: string;
  children?: React.ReactNode;
}

export function PaginationContent({
  className,
  children,
  ...props
}: PaginationContentProps) {
  return (
    <ul
      className={cn("flex items-center gap-1", className)}
      {...props}
    >
      {children}
    </ul>
  );
}

interface PaginationItemProps {
  className?: string;
  children?: React.ReactNode;
}

export function PaginationItem({
  className,
  children,
  ...props
}: PaginationItemProps) {
  return (
    <li className={cn("", className)} {...props}>
      {children}
    </li>
  );
}

interface PaginationLinkProps {
  className?: string;
  children?: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export function PaginationLink({
  className,
  children,
  isActive = false,
  onClick,
  disabled = false,
  ...props
}: PaginationLinkProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "min-h-9 min-w-9 px-3 py-1 rounded-md inline-flex items-center justify-center text-sm font-medium transition-colors",
        isActive
          ? "bg-blue-500 text-white"
          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function PaginationPrevious({
  className,
  children,
  onClick,
  disabled,
  ...props
}: PaginationLinkProps) {
  return (
    <PaginationLink
      onClick={onClick}
      disabled={disabled}
      className={cn("gap-1", className)}
      {...props}
    >
      <ChevronLeftIcon className="h-4 w-4" />
      {children || "Previous"}
    </PaginationLink>
  );
}

export function PaginationNext({
  className,
  children,
  onClick,
  disabled,
  ...props
}: PaginationLinkProps) {
  return (
    <PaginationLink
      onClick={onClick}
      disabled={disabled}
      className={cn("gap-1", className)}
      {...props}
    >
      {children || "Next"}
      <ChevronRightIcon className="h-4 w-4" />
    </PaginationLink>
  );
} 