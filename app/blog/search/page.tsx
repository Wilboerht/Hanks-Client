'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Container } from '@/components/Container';
import SearchInput from '@/components/ui/SearchInput';
import { Article } from '@/lib/api/types';
import { apiFetch } from '@/lib/api/apiFetch';
import { useSearch } from '@/hooks/useSearch';
import ArticleCard from '@/components/ArticleCard';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX } from 'react-icons/fi';
import Link from 'next/link';

// 将API文章格式转换为ArticleCard组件需要的格式
const transformArticleForDisplay = (article: Article) => ({
  id: article.id,
  slug: article.slug,
  title: article.title,
  excerpt: article.excerpt,
  coverImage: article.coverImage,
  author: {
    name: article.author.name,
    avatar: article.author.avatar
  },
  category: article.category?.name,
  tags: article.tags,
  publishedAt: article.publishedAt,
  readingTime: article.readingTime
});

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';

  // 自定义搜索函数，实现API调用
  const searchArticles = async (query: string): Promise<Article[]> => {
    if (!query || query.length < 2) return [];
    return apiFetch<Article[]>(`/articles/search?q=${encodeURIComponent(query)}`);
  };

  // 使用我们的useSearch钩子
  const {
    query,
    setQuery,
    results: articles,
    isSearching,
    error,
    isEmpty,
    hasSearched,
    triggerSearch
  } = useSearch<Article>({
    initialQuery,
    searchFn: searchArticles,
    minQueryLength: 2,
    debounceTime: 500,
  });

  // 在初始加载和URL查询参数变化时触发搜索
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery && urlQuery !== query) {
      triggerSearch(urlQuery);
    }
  }, [searchParams, query, triggerSearch]);

  // 处理搜索提交
  const handleSearch = (value: string) => {
    if (value.trim() && value.trim().length >= 2) {
      // 更新URL，但不会重新加载页面
      router.push(`/blog/search?q=${encodeURIComponent(value.trim())}`, { scroll: false });
    }
  };

  // 页面变体动画
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.4 } },
    exit: { opacity: 0, transition: { duration: 0.3 } }
  };

  // 渲染搜索结果
  const renderSearchResults = () => {
    if (error) {
      return (
        <div className="py-16 text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">搜索出错</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">{error.message}</p>
        </div>
      );
    }

    if (isSearching) {
      return (
        <div className="py-16 text-center">
          <div className="inline-block w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">正在搜索相关文章...</p>
        </div>
      );
    }

    if (isEmpty && hasSearched) {
      return (
        <div className="py-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
            <FiSearch className="text-gray-400 dark:text-gray-500 w-6 h-6" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">未找到相关文章</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
            尝试使用不同的关键词，或者浏览我们的文章分类以找到您感兴趣的内容。
          </p>
          <Link 
            href="/blog"
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
          >
            浏览所有文章
          </Link>
        </div>
      );
    }

    if (articles.length > 0) {
      return (
        <div className="py-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            找到 {articles.length} 篇相关文章
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {articles.map((article, index) => (
                <motion.div 
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <ArticleCard article={transformArticleForDisplay(article)} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <main className="min-h-screen py-10">
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
      >
        <Container>
          <div className="max-w-3xl mx-auto mb-12">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">搜索文章</h1>
            <div className="mb-8">
              <SearchInput
                initialValue={query}
                onChange={setQuery}
                onSearch={handleSearch}
                placeholder="输入关键词搜索文章..."
                variant="filled"
                className="text-lg"
                aria-label="搜索文章"
              />
            </div>
            {renderSearchResults()}
          </div>
        </Container>
      </motion.div>
    </main>
  );
} 