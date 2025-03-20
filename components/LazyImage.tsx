'use client';

import { useState, useEffect, useRef, memo } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty' | 'shimmer';
  blurDataURL?: string;
  sizes?: string;
  quality?: number;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
}

const LazyImage = memo(function LazyImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  imgClassName = '',
  priority = false,
  placeholder = 'shimmer',
  blurDataURL,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 80,
  onLoad,
  onError,
  fallbackSrc
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(!priority);
  const [error, setError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // 使用 IntersectionObserver 检测图片是否进入视口
  useEffect(() => {
    if (!imgRef.current || priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '200px 0px', // 提前200px加载
        threshold: 0.01
      }
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [priority]);

  // 图片加载完成
  const handleImageLoad = () => {
    setIsLoading(false);
    setError(false);
    onLoad?.();
  };

  // 图片加载失败
  const handleImageError = () => {
    setIsLoading(false);
    setError(true);
    onError?.();
  };

  // 生成占位符内容
  const renderPlaceholder = () => {
    if (!isLoading) return null;

    if (placeholder === 'shimmer') {
      return (
        <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
      );
    }
    
    if (placeholder === 'blur' && blurDataURL) {
      return (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-md scale-110"
          style={{ backgroundImage: `url(${blurDataURL})` }}
        />
      );
    }
    
    return null;
  };

  // 渲染失败状态
  const renderError = () => {
    if (!error) return null;

    if (fallbackSrc) {
      return (
        <Image
          src={fallbackSrc}
          alt={alt}
          width={width}
          height={height}
          fill={fill}
          className={cn("object-cover", imgClassName)}
          sizes={sizes}
          quality={quality}
        />
      );
    }

    return (
      <div className="flex items-center justify-center w-full h-full bg-neutral-100 dark:bg-neutral-800">
        <svg 
          className="w-12 h-12 text-neutral-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  };

  return (
    <div 
      ref={imgRef}
      className={cn(
        "relative overflow-hidden",
        fill ? "w-full h-full" : "",
        className
      )}
      style={!fill ? { width, height } : undefined}
    >
      {renderPlaceholder()}
      {renderError()}

      {(priority || isInView) && !error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoading ? 0 : 1 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full"
        >
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            fill={fill}
            quality={quality}
            className={cn(
              "object-cover duration-500 ease-in-out",
              isLoading ? "scale-105 blur-md" : "scale-100 blur-0",
              imgClassName
            )}
            sizes={sizes}
            priority={priority}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
          />
        </motion.div>
      )}
    </div>
  );
});

export default LazyImage; 