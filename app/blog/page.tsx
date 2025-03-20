'use client';

import BlogPosts from './BlogPosts';

export default function BlogPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">博客文章</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          探索我的最新文章，了解技术动态、项目分享和个人见解。
        </p>
      </div>
      
      <BlogPosts />
    </div>
  );
} 