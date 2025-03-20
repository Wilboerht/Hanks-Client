'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeftIcon, CalendarIcon, UserIcon, TagIcon, ClockIcon, ShareIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import CommentSection from '@/components/CommentSection';
import Spinner from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import useApi from '@/hooks/useApi';

// 完整的博客文章数据
interface Post {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  author: {
    username: string;
    avatar?: string;
  };
  readingTime?: string;
  tags: string[];
  publishedAt: string;
  updatedAt?: string;
}

// 文章详情页
const BlogPostPage = () => {
  const params = useParams();
  const slug = params.slug as string;
  const toast = useToast();
  
  // 使用自定义hook获取文章数据
  const { data: post, isLoading, isError } = useApi<Post>({
    url: `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${slug}`,
    showErrorToast: true,
  });

  // 如果正在加载
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" text="正在加载文章..." />
      </div>
    );
  }

  // 如果加载出错
  if (isError || !post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">未找到文章</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          抱歉，我们无法加载您请求的文章。它可能已被移除或您可能使用了错误的链接。
        </p>
        <Link
          href="/blog"
          className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          返回博客列表
        </Link>
      </div>
    );
  }

  // 处理日期显示
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 返回链接 */}
      <div className="mb-6">
        <Link
          href="/blog"
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          返回博客列表
        </Link>
      </div>

      <article className="max-w-4xl mx-auto">
        {/* 封面图 */}
        {post.coverImage && (
          <div className="relative w-full h-[400px] rounded-xl overflow-hidden mb-8">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* 文章头部信息 */}
        <header className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4"
          >
            {post.title}
          </motion.h1>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            {/* 作者信息 */}
            <div className="flex items-center">
              <UserIcon className="h-4 w-4 mr-1" />
              <span>{post.author.username}</span>
            </div>

            {/* 发布日期 */}
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1" />
              <span>{formatDate(post.publishedAt)}</span>
            </div>

            {/* 阅读时间 */}
            {post.readingTime && (
              <div className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                <span>{post.readingTime}</span>
              </div>
            )}

            {/* 分享按钮 */}
            <button className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <ShareIcon className="h-4 w-4 mr-1" />
              <span>分享</span>
            </button>
          </div>

          {/* 标签 */}
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag)}`}
                className="flex items-center px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <TagIcon className="h-3 w-3 mr-1" />
                {tag}
              </Link>
            ))}
          </div>
        </header>

        {/* 文章内容 */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          {/* 渲染内容 */}
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        {/* 文章元信息 */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-400">
          {post.updatedAt && (
            <p>
              最后更新：{formatDate(post.updatedAt)}
            </p>
          )}
        </div>

        {/* 评论区 */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">评论</h2>
          <CommentSection postId={post._id} />
        </section>
      </article>
    </div>
  );
};

export default BlogPostPage; 