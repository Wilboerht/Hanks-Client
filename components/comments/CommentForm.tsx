'use client';

import { useState, useRef, useEffect } from 'react';
import { FiSend, FiAlertCircle, FiInfo } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { useOfflineDetection } from '@/hooks/useOfflineDetection';
import { addComment } from '@/lib/api/blog';
import { useToast } from '@/components/ui/Toast';
import { ButtonSpinner } from '@/components/ui/Spinner';
import { motion, AnimatePresence } from 'framer-motion';

interface CommentFormProps {
  postId: string;
  parentId?: string;
  onCommentAdded?: () => void;
  onCancel?: () => void;
  placeholder?: string;
  initialValue?: string;
  autoFocus?: boolean;
}

export default function CommentForm({
  postId,
  parentId,
  onCommentAdded,
  onCancel,
  placeholder = '写下您的评论...',
  initialValue = '',
  autoFocus = false
}: CommentFormProps) {
  const [content, setContent] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isAuthenticated, user } = useAuth();
  const { isOnline, addOfflineAction } = useOfflineDetection();
  const { showToast } = useToast();

  // 自动聚焦和调整高度
  useEffect(() => {
    if (textareaRef.current && autoFocus) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    // 设置字符数
    setCharCount(content.length);
    
    // 自动调整高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 300)}px`;
    }
  }, [content]);

  // 提交评论
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('评论内容不能为空');
      return;
    }
    
    if (!isAuthenticated) {
      setError('请先登录后再发表评论');
      return;
    }
    
    if (content.length > 1000) {
      setError('评论内容不能超过1000字');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // 离线模式下的处理
      if (!isOnline) {
        // 添加一个离线操作
        addOfflineAction({
          type: 'ADD_COMMENT',
          payload: { postId, content, parentId },
          endpoint: `/api/blog/posts/${postId}/comments`,
          method: 'POST'
        });
        
        showToast({
          type: 'info',
          title: '已保存到离线队列',
          message: '您的评论将在网络恢复后自动发送',
        });
        
        setContent('');
        onCommentAdded?.();
        setIsSubmitting(false);
        return;
      }
      
      // 在线模式下的处理
      const response = await addComment({
        articleId: postId,
        content,
        parentId
      });
      
      if (response.status >= 200 && response.status < 300) {
        showToast({
          type: 'success',
          message: parentId ? '回复已发布' : '评论已发布',
        });
        
        setContent('');
        onCommentAdded?.();
      } else {
        setError(response.message || '评论发布失败，请稍后再试');
        showToast({
          type: 'error',
          title: '评论发布失败',
          message: response.message || '请稍后再试',
        });
      }
    } catch (err) {
      console.error('提交评论出错:', err);
      setError('评论提交失败，请稍后再试');
      showToast({
        type: 'error',
        title: '评论发布失败',
        message: '发生了错误，请稍后再试',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 取消评论
  const handleCancel = () => {
    setContent('');
    setError(null);
    onCancel?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={isAuthenticated ? placeholder : '请登录后发表评论'}
          disabled={!isAuthenticated || isSubmitting}
          className="w-full p-3 border border-neutral-200 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 min-h-[120px] resize-none transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60 disabled:cursor-not-allowed"
          aria-label="评论内容"
        />
        
        {/* 字符计数 */}
        <div className="absolute bottom-3 right-3 text-xs text-neutral-400">
          {charCount}/1000
        </div>
      </div>
      
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-start p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
          >
            <FiAlertCircle className="mt-0.5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 离线提示 */}
      {!isOnline && (
        <div className="flex items-start p-3 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
          <FiInfo className="mt-0.5 mr-2 flex-shrink-0" />
          <span>您当前处于离线状态，评论将在网络恢复后发送</span>
        </div>
      )}
      
      <div className="flex justify-between">
        {onCancel && (
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            取消
          </button>
        )}
        
        <button
          type="submit"
          disabled={!isAuthenticated || isSubmitting || !content.trim()}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 dark:bg-primary-700 rounded-md hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
        >
          {isSubmitting ? (
            <>
              <ButtonSpinner color="light" size="sm" />
              提交中...
            </>
          ) : (
            <>
              <FiSend className="mr-2" />
              {parentId ? '回复' : '发布评论'}
            </>
          )}
        </button>
      </div>
    </form>
  );
} 