"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowRight } from 'react-icons/fi';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { AnimatedElement } from '@/components/ui/AnimatedElement';

export interface ArticleCardProps {
  title: string;
  excerpt: string;
  date: string;
  slug: string;
  coverImage?: string;
  tags?: string[];
  className?: string;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  title,
  excerpt,
  date,
  slug,
  coverImage,
  tags,
  className
}) => {
  return (
    <AnimatedElement animation="hover-lift">
      <article className={cn(
        "border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden hover:shadow-md transition-shadow",
        className
      )}>
        {coverImage && (
          <div className="relative h-48 w-full">
            <Image 
              src={coverImage} 
              alt={title}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="p-6">
          <span className="text-sm text-neutral-500 dark:text-neutral-400">{date}</span>
          <h3 className="text-xl font-bold mt-2 mb-3">{title}</h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">{excerpt}</p>
          <Link 
            href={`/blog/${slug}`} 
            className="text-neutral-900 dark:text-white font-medium hover:underline inline-flex items-center"
          >
            阅读全文 <FiArrowRight className="ml-1" />
          </Link>
        </div>
      </article>
    </AnimatedElement>
  );
};

export default ArticleCard; 