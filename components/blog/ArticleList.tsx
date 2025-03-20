"use client";

import React, { useState, useEffect } from 'react';
import { ArticleCard } from './ArticleCard';
import { Button } from '@/components/ui/Button';
import { FiGrid, FiList, FiSearch } from 'react-icons/fi';
import { AnimatedElement } from '@/components/ui/AnimatedElement';

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  coverImage?: string;
  tags?: string[];
  featured?: boolean;
}

export interface ArticleListProps {
  articles: Article[];
  initialView?: 'grid' | 'list';
  showViewToggle?: boolean;
  showSearch?: boolean;
  itemsPerPage?: number;
  className?: string;
}

export const ArticleList: React.FC<ArticleListProps> = ({
  articles,
  initialView = 'grid',
  showViewToggle = true,
  showSearch = true,
  itemsPerPage = 6,
  className
}) => {
  const [view, setView] = useState<'grid' | 'list'>(initialView);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>(articles);

  useEffect(() => {
    // 过滤文章基于搜索查询
    if (!searchQuery.trim()) {
      setFilteredArticles(articles);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = articles.filter(article => 
      article.title.toLowerCase().includes(query) || 
      article.excerpt.toLowerCase().includes(query) ||
      article.tags?.some(tag => tag.toLowerCase().includes(query))
    );

    setFilteredArticles(filtered);
    setCurrentPage(1); // 重置到第一页
  }, [searchQuery, articles]);

  // 计算分页
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentArticles = filteredArticles.slice(startIndex, endIndex);

  // 分页导航
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className={className}>
      {/* 控制栏 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        {showSearch && (
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="搜索文章..."
              className="pl-10 pr-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-md dark:bg-neutral-800 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
          </div>
        )}

        <div className="flex space-x-2">
          {showViewToggle && (
            <div className="flex rounded-md overflow-hidden border border-neutral-200 dark:border-neutral-700">
              <button
                onClick={() => setView('grid')}
                className={`p-2 ${
                  view === 'grid'
                    ? 'bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-white'
                    : 'bg-white dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                }`}
                aria-label="网格视图"
              >
                <FiGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-2 ${
                  view === 'list'
                    ? 'bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-white'
                    : 'bg-white dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                }`}
                aria-label="列表视图"
              >
                <FiList className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 没有找到结果 */}
      {currentArticles.length === 0 && (
        <div className="py-10 text-center">
          <p className="text-lg text-neutral-500 dark:text-neutral-400">
            {searchQuery ? `没有找到与"${searchQuery}"相关的文章` : '暂无文章'}
          </p>
        </div>
      )}

      {/* 文章列表 */}
      <div className={
        view === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'flex flex-col space-y-6'
      }>
        {currentArticles.map((article) => (
          <AnimatedElement key={article.id} animation="hover-lift">
            <ArticleCard
              title={article.title}
              excerpt={article.excerpt}
              date={article.date}
              slug={article.slug}
              coverImage={article.coverImage}
              tags={article.tags}
              className={view === 'list' ? 'flex flex-col md:flex-row md:h-48' : ''}
            />
          </AnimatedElement>
        ))}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-8">
          <Button 
            onClick={handlePreviousPage} 
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
          >
            上一页
          </Button>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            第 {currentPage} 页，共 {totalPages} 页
          </span>
          <Button 
            onClick={handleNextPage} 
            disabled={currentPage === totalPages}
            variant="outline"
            size="sm"
          >
            下一页
          </Button>
        </div>
      )}
    </div>
  );
};

export default ArticleList; 