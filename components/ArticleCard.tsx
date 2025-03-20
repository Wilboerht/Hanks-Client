'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiCalendar, FiUser, FiTag } from 'react-icons/fi';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage?: string;
  author: {
    name: string;
    avatar?: string;
  };
  category?: string;
  tags?: string[];
  publishedAt: string;
  readingTime?: string;
}

interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
  imageHeight?: number;
  showExcerpt?: boolean;
  showAuthor?: boolean;
  showDate?: boolean;
  showTags?: boolean;
  showReadingTime?: boolean;
  highlightNew?: boolean;
  maxTagsToShow?: number;
}

/**
 * 文章卡片组件 - 用于展示文章信息的卡片
 */
export default function ArticleCard({
  article,
  variant = 'default',
  className,
  imageHeight = 200,
  showExcerpt = true,
  showAuthor = true,
  showDate = true,
  showTags = true,
  showReadingTime = true,
  highlightNew = false,
  maxTagsToShow = 3,
}: ArticleCardProps) {
  const {
    slug,
    title,
    excerpt,
    coverImage,
    author,
    tags,
    publishedAt,
    readingTime,
  } = article;

  // 确定是否为新文章 (30天内发布)
  const isNew = highlightNew && new Date(publishedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // 计算要显示的标签
  const visibleTags = tags?.slice(0, maxTagsToShow) || [];
  const hasMoreTags = tags && tags.length > maxTagsToShow;

  // 根据变体确定样式
  const cardStyles = cn(
    'group relative flex h-full rounded-lg overflow-hidden transition-all duration-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800',
    {
      'flex-col': variant === 'default',
      'flex-row items-center': variant === 'compact',
      'flex-col md:flex-row md:min-h-[280px]': variant === 'featured',
    },
    'hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700',
    className
  );

  const imageContainerStyles = cn(
    'overflow-hidden',
    {
      'w-full aspect-video': variant === 'default',
      'flex-shrink-0 w-24 h-24 rounded-md mr-4': variant === 'compact',
      'w-full md:w-1/2 aspect-video md:aspect-auto': variant === 'featured',
    }
  );

  const contentStyles = cn(
    'flex flex-col',
    {
      'p-5': variant === 'default',
      'py-2': variant === 'compact',
      'p-5 md:p-8': variant === 'featured',
    },
    variant === 'featured' ? 'md:w-1/2' : 'w-full'
  );

  return (
    <Link href={`/blog/${slug}`} className={cardStyles}>
      {/* 封面图片 */}
      {coverImage && (
        <div className={imageContainerStyles}>
          <div className="relative w-full h-full">
            <Image
              src={coverImage}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </div>
      )}

      {/* 内容区域 */}
      <div className={contentStyles}>
        {/* 标题 */}
        <h3 className="text-lg md:text-xl font-bold mb-2 text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400">
          {isNew && (
            <span className="inline-flex items-center mr-2 px-2 py-0.5 text-xs font-medium rounded bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
              最新
            </span>
          )}
          {title}
        </h3>

        {/* 摘要 */}
        {showExcerpt && excerpt && variant !== 'compact' && (
          <p className="text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">{excerpt}</p>
        )}

        {/* 元数据区域 */}
        <div className="mt-auto pt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
          {/* 作者信息 */}
          {showAuthor && author && (
            <div className="flex items-center">
              <FiUser className="mr-1" />
              <span>{author.name}</span>
            </div>
          )}

          {/* 发布日期 */}
          {showDate && publishedAt && (
            <div className="flex items-center">
              <FiCalendar className="mr-1" />
              <span>{formatDate(publishedAt)}</span>
            </div>
          )}

          {/* 阅读时间 */}
          {showReadingTime && readingTime && (
            <div className="flex items-center">
              <span>{readingTime}</span>
            </div>
          )}
        </div>

        {/* 标签 */}
        {showTags && visibleTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {visibleTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
              >
                <FiTag className="mr-1" size={12} />
                {tag}
              </span>
            ))}
            {hasMoreTags && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                +{tags!.length - maxTagsToShow}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

/**
 * 使用示例:
 * 
 * // 默认卡片
 * <ArticleCard article={article} />
 * 
 * // 紧凑型卡片
 * <ArticleCard 
 *   article={article} 
 *   variant="compact" 
 *   showExcerpt={false}
 *   showTags={false}
 * />
 * 
 * // 特色卡片
 * <ArticleCard 
 *   article={article} 
 *   variant="featured" 
 *   highlightNew={true}
 *   maxTagsToShow={5}
 * />
 */ 