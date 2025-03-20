'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Comment } from '@/lib/api/types';
import { getComments } from '@/lib/api/blog';
import { useToast } from '@/components/ui/Toast';

type SortType = 'newest' | 'oldest' | 'popular';

interface UseCommentsProps {
  postId: string;
  initialComments?: Comment[];
  autoLoad?: boolean;
}

export function useComments({
  postId,
  initialComments = [],
  autoLoad = true
}: UseCommentsProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [isLoading, setIsLoading] = useState<boolean>(autoLoad);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortType>('newest');
  const { showToast } = useToast();

  // 加载评论
  const loadComments = useCallback(async () => {
    if (!postId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getComments(postId);
      setComments(response.data || []);
    } catch (err) {
      console.error('加载评论失败:', err);
      setError('加载评论失败，请稍后再试');
      showToast({
        type: 'error',
        title: '加载失败',
        message: '无法加载评论，请刷新页面重试',
      });
    } finally {
      setIsLoading(false);
    }
  }, [postId, showToast]);

  // 在组件挂载时自动加载评论
  useEffect(() => {
    if (autoLoad && postId) {
      loadComments();
    }
  }, [autoLoad, postId, loadComments]);

  // 根据排序方式对评论进行排序
  const sortedComments = useMemo(() => {
    if (!comments.length) return [];
    
    const commentsCopy = [...comments];
    
    switch (sortBy) {
      case 'newest':
        return commentsCopy.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'oldest':
        return commentsCopy.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case 'popular':
        return commentsCopy.sort((a, b) => {
          const aLikes = Array.isArray(a.likes) ? a.likes.length : (a.likes || 0);
          const bLikes = Array.isArray(b.likes) ? b.likes.length : (b.likes || 0);
          return bLikes - aLikes;
        });
      default:
        return commentsCopy;
    }
  }, [comments, sortBy]);

  // 处理评论添加成功
  const handleCommentAdded = useCallback(() => {
    loadComments();
  }, [loadComments]);

  // 更改排序方式
  const changeSortOrder = useCallback((newSortType: SortType) => {
    setSortBy(newSortType);
  }, []);

  return {
    comments: sortedComments,
    isLoading,
    error,
    sortBy,
    loadComments,
    handleCommentAdded,
    changeSortOrder
  };
}

export default useComments; 