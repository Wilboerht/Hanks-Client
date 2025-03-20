'use client';

import { useState } from 'react';
import { useQueryApi, apiQueryKeys } from '@/hooks/useQueryApi';
import { useNotifications } from '@/lib/context/AppContext';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink,
  PaginationPrevious,
  PaginationNext
} from '@/components/ui/Pagination';

// 文章接口定义
interface Post {
  id: string;
  title: string;
  slug: string;
  summary: string;
  featuredImage?: string;
  author: {
    name: string;
    avatar?: string;
  };
  createdAt: string;
  tags: string[];
}

export default function BlogPosts() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  // 使用通知上下文
  const { setNotificationCount } = useNotifications();
  
  // 构建查询参数
  const queryParams = {
    page: currentPage,
    limit: 9,
    ...(selectedTag ? { tag: selectedTag } : {})
  };
  
  // 使用React Query获取数据
  const { 
    data, 
    isLoading, 
    isError,
    error 
  } = useQueryApi<{ posts: Post[], totalPages: number }>(
    apiQueryKeys('posts', queryParams),
    {
      url: `${process.env.NEXT_PUBLIC_API_URL}/posts`,
      params: queryParams,
      showErrorToast: true
    }
  );
  
  // 使用React Query获取标签
  const { 
    data: tagsData 
  } = useQueryApi<{ tags: { name: string; count: number }[] }>(
    apiQueryKeys('tags'),
    {
      url: `${process.env.NEXT_PUBLIC_API_URL}/posts/tags`,
      showErrorToast: true
    }
  );
  
  // 处理标签点击
  const handleTagClick = (tag: string | null) => {
    setSelectedTag(tag);
    setCurrentPage(1);
  };
  
  // 处理页面变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // 页面顶部滚动
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // 演示如何更新通知计数
  const updateNotifications = () => {
    setNotificationCount(5);
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div 
              key={index} 
              className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 h-64 animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">加载失败</h2>
        <p className="text-red-500 mb-4">{String(error)}</p>
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => window.location.reload()}
        >
          重试
        </button>
      </div>
    );
  }
  
  const { posts = [], totalPages = 1 } = data || {};
  const { tags = [] } = tagsData || { tags: [] };
  
  return (
    <div className="container mx-auto py-8">
      {/* 标签过滤 */}
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          onClick={() => handleTagClick(null)}
          className={`px-3 py-1 rounded-full text-sm ${
            selectedTag === null
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          全部
        </button>
        {tags.map((tag) => (
          <button
            key={tag.name}
            onClick={() => handleTagClick(tag.name)}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedTag === tag.name
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            {tag.name} ({tag.count})
          </button>
        ))}
      </div>

      {/* 演示通知更新 */}
      <button 
        onClick={updateNotifications} 
        className="mb-4 px-3 py-1 bg-purple-500 text-white rounded"
      >
        模拟新通知
      </button>
      
      {/* 文章列表 */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold">没有找到相关文章</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            请尝试其他标签或移除过滤条件
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              href={`/blog/${post.slug}`}
              key={post.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative h-48 w-full">
                {post.featuredImage ? (
                  <Image
                    src={post.featuredImage}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="bg-gray-200 dark:bg-gray-700 h-full w-full flex items-center justify-center">
                    <span className="text-gray-500 dark:text-gray-400">无图片</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 line-clamp-2">{post.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-3">
                  {post.summary}
                </p>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  <span className="mx-2">•</span>
                  <span>{post.author.name}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      
      {/* 分页 */}
      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} />
              </PaginationItem>
            )}
            
            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  onClick={() => handlePageChange(i + 1)}
                  isActive={currentPage === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
} 