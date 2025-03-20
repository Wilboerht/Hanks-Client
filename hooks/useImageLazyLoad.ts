'use client';

import { useState, useEffect, useRef, RefObject } from 'react';

interface ImageLazyLoadOptions {
  rootMargin?: string;
  threshold?: number;
  delay?: number;
  placeholderSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * 自定义钩子，用于图片懒加载
 * 
 * @param src 图片的实际源地址
 * @param options 配置选项
 * @returns 返回引用和加载状态
 */
export function useImageLazyLoad(
  src: string,
  {
    rootMargin = '200px 0px',
    threshold = 0.01,
    delay = 0,
    placeholderSrc = '',
    onLoad,
    onError,
  }: ImageLazyLoadOptions = {}
) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>(placeholderSrc);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // 重置状态
    setIsLoaded(false);
    setIsError(false);
    setCurrentSrc(placeholderSrc);

    // 清理先前的观察者和定时器
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [src, placeholderSrc]);

  useEffect(() => {
    if (!imgRef.current) return;

    const loadImage = () => {
      // 创建一个新的Image对象来预加载
      const img = new Image();
      
      // 图片加载完成事件
      img.onload = () => {
        if (delay > 0) {
          // 添加延迟以避免图像闪烁
          timerRef.current = setTimeout(() => {
            setCurrentSrc(src);
            setIsLoaded(true);
            onLoad?.();
          }, delay);
        } else {
          setCurrentSrc(src);
          setIsLoaded(true);
          onLoad?.();
        }
      };
      
      // 图片加载失败事件
      img.onerror = () => {
        setIsError(true);
        onError?.();
      };
      
      // 开始加载图片
      img.src = src;
    };

    // 创建观察者
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // 当图片进入视口时，开始加载
          loadImage();
          // 停止观察
          if (observerRef.current) {
            observerRef.current.disconnect();
          }
        }
      },
      { rootMargin, threshold }
    );

    // 开始观察
    observerRef.current.observe(imgRef.current);

    return () => {
      // 清理
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [src, rootMargin, threshold, delay, onLoad, onError]);

  return {
    ref: imgRef,
    src: currentSrc,
    isLoaded,
    isError,
  };
}

/**
 * 创建一个使用懒加载的背景图像钩子
 * 
 * @param src 图片的实际源地址
 * @param options 配置选项
 * @returns 返回引用、背景样式和加载状态
 */
export function useBackgroundImageLazyLoad(
  src: string,
  options: ImageLazyLoadOptions = {}
) {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const elementRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const { rootMargin = '200px 0px', threshold = 0.01 } = options;

    // 创建IntersectionObserver
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    // 开始观察
    observerRef.current.observe(elementRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [options]);

  useEffect(() => {
    if (!isInView) return;

    // 预加载图片
    const img = new Image();
    
    img.onload = () => {
      setIsLoaded(true);
      options.onLoad?.();
    };
    
    img.onerror = () => {
      setIsError(true);
      options.onError?.();
    };
    
    img.src = src;
  }, [isInView, src, options]);

  // 计算背景样式
  const backgroundStyle = {
    backgroundImage: isInView && isLoaded ? `url(${src})` : options.placeholderSrc ? `url(${options.placeholderSrc})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return {
    ref: elementRef,
    backgroundStyle,
    isLoaded,
    isError,
    isInView,
  };
}

/**
 * 使用示例:
 * 
 * // 图片懒加载
 * const { ref, src, isLoaded } = useImageLazyLoad('https://example.com/image.jpg', {
 *   placeholderSrc: '/placeholder.jpg',
 *   onLoad: () => console.log('Image loaded'),
 * });
 * 
 * return (
 *   <img 
 *     ref={ref} 
 *     src={src} 
 *     className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
 *     alt="Lazy loaded image" 
 *   />
 * );
 * 
 * // 背景图像懒加载
 * const { ref, backgroundStyle, isLoaded } = useBackgroundImageLazyLoad('https://example.com/bg.jpg');
 * 
 * return (
 *   <div 
 *     ref={ref} 
 *     style={backgroundStyle}
 *     className={`transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
 *   >
 *     Content with lazy loaded background
 *   </div>
 * );
 */ 