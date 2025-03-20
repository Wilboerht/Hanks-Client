"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { FiMessageSquare, FiThumbsUp, FiFlag, FiMoreHorizontal, FiTrash, FiEdit, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { cn } from '@/lib/utils';
import { AnimatedElement } from '@/components/ui/AnimatedElement';

export interface CommentType {
  id: string;
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  content: string;
  createdAt: string;
  updatedAt?: string;
  likes: number;
  userHasLiked?: boolean;
  parentId?: string;
  replies?: CommentType[];
}

export interface CommentSectionProps {
  comments: CommentType[];
  postId: string;
  onAddComment?: (content: string, parentId?: string) => Promise<void>;
  onEditComment?: (id: string, content: string) => Promise<void>;
  onDeleteComment?: (id: string) => Promise<void>;
  onLikeComment?: (id: string, liked: boolean) => Promise<void>;
  onReportComment?: (id: string, reason: string) => Promise<void>;
  className?: string;
  maxNestedLevel?: number;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  postId,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onLikeComment,
  onReportComment,
  className,
  maxNestedLevel = 3
}) => {
  const [newComment, setNewComment] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'popular'>('newest');
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  const { user, isAuthenticated } = useAuth();

  // 排序评论
  const sortedComments = [...comments].sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortOrder === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else {
      return b.likes - a.likes;
    }
  });

  // 根评论（无parentId的评论）
  const rootComments = sortedComments.filter(comment => !comment.parentId);

  // 按照ID获取评论的回复
  const getRepliesForComment = (commentId: string): CommentType[] => {
    return sortedComments.filter(comment => comment.parentId === commentId);
  };

  // 提交新评论
  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    if (!isAuthenticated) {
      setError('请先登录后再发表评论');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onAddComment?.(newComment, replyToId || undefined);
      setNewComment('');
      setReplyToId(null);
    } catch (err) {
      setError('评论提交失败，请稍后再试');
      console.error('提交评论出错:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 提交编辑的评论
  const handleSubmitEdit = async (commentId: string) => {
    if (!editContent.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      await onEditComment?.(commentId, editContent);
      setEditingId(null);
    } catch (err) {
      setError('评论编辑失败，请稍后再试');
      console.error('编辑评论出错:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 删除评论
  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('确定要删除这条评论吗？此操作无法撤销。')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onDeleteComment?.(commentId);
    } catch (err) {
      setError('评论删除失败，请稍后再试');
      console.error('删除评论出错:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 点赞评论
  const handleLikeComment = async (commentId: string, liked: boolean) => {
    if (!isAuthenticated) {
      setError('请先登录后再点赞');
      return;
    }

    try {
      await onLikeComment?.(commentId, !liked);
    } catch (err) {
      setError('点赞操作失败，请稍后再试');
      console.error('点赞评论出错:', err);
    }
  };

  // 举报评论
  const handleReportComment = async (commentId: string) => {
    if (!reportReason.trim()) return;
    if (!isAuthenticated) {
      setError('请先登录后再举报');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onReportComment?.(commentId, reportReason);
      setReportingId(null);
      setReportReason('');
      alert('感谢您的举报，我们会尽快处理');
    } catch (err) {
      setError('举报提交失败，请稍后再试');
      console.error('举报评论出错:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 开始回复评论
  const handleStartReply = (commentId: string) => {
    setReplyToId(commentId);
    setEditingId(null);
    setReportingId(null);
  };

  // 开始编辑评论
  const handleStartEdit = (comment: CommentType) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
    setReplyToId(null);
    setReportingId(null);
  };

  // 开始举报评论
  const handleStartReport = (commentId: string) => {
    setReportingId(commentId);
    setReportReason('');
    setReplyToId(null);
    setEditingId(null);
  };

  // 切换评论展开/折叠状态
  const toggleCommentExpanded = (commentId: string) => {
    const newExpandedComments = new Set(expandedComments);
    if (expandedComments.has(commentId)) {
      newExpandedComments.delete(commentId);
    } else {
      newExpandedComments.add(commentId);
    }
    setExpandedComments(newExpandedComments);
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 递归渲染评论
  const renderComment = (comment: CommentType, level = 0) => {
    const replies = getRepliesForComment(comment.id);
    const isExpanded = expandedComments.has(comment.id);
    const isCurrentUserAuthor = user?.id === comment.author.id;
    const canReply = level < maxNestedLevel;

    return (
      <AnimatedElement key={comment.id} animation="hover-scale" className="comment-animation">
        <div className={cn(
          "border-b border-neutral-200 dark:border-neutral-700 py-4 last:border-0",
          level > 0 && "ml-6",
        )}>
          {/* 评论主体 */}
          <div className="flex items-start gap-3">
            {/* 头像 */}
            <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden flex-shrink-0">
              {comment.author.avatarUrl ? (
                <img 
                  src={comment.author.avatarUrl} 
                  alt={comment.author.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-500 dark:text-neutral-400 font-medium">
                  {comment.author.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* 评论内容 */}
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                    {comment.author.name}
                    {isCurrentUserAuthor && (
                      <span className="ml-2 text-xs text-primary-600 dark:text-primary-400 font-normal">
                        (作者)
                      </span>
                    )}
                  </h4>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    {formatDate(comment.createdAt)}
                    {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                      <span className="ml-2">(已编辑)</span>
                    )}
                  </div>
                </div>

                {/* 评论操作菜单 */}
                <div className="relative">
                  <div className="flex items-center space-x-2">
                    {/* 点赞按钮 */}
                    <button
                      onClick={() => handleLikeComment(comment.id, !!comment.userHasLiked)}
                      className={cn(
                        "flex items-center text-xs px-2 py-1 rounded",
                        comment.userHasLiked 
                          ? "text-primary-600 dark:text-primary-400"
                          : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      )}
                    >
                      <FiThumbsUp className={cn(
                        "w-3.5 h-3.5 mr-1",
                        comment.userHasLiked && "fill-current"
                      )} />
                      {comment.likes}
                    </button>

                    {/* 回复按钮 */}
                    {canReply && (
                      <button
                        onClick={() => handleStartReply(comment.id)}
                        className="flex items-center text-xs px-2 py-1 rounded text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        <FiMessageSquare className="w-3.5 h-3.5 mr-1" />
                        回复
                      </button>
                    )}

                    {/* 编辑按钮 (仅作者可见) */}
                    {isCurrentUserAuthor && (
                      <button
                        onClick={() => handleStartEdit(comment)}
                        className="flex items-center text-xs px-2 py-1 rounded text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        <FiEdit className="w-3.5 h-3.5 mr-1" />
                        编辑
                      </button>
                    )}

                    {/* 删除按钮 (仅作者可见) */}
                    {isCurrentUserAuthor && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="flex items-center text-xs px-2 py-1 rounded text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        <FiTrash className="w-3.5 h-3.5 mr-1" />
                        删除
                      </button>
                    )}

                    {/* 举报按钮 (非作者可见) */}
                    {!isCurrentUserAuthor && (
                      <button
                        onClick={() => handleStartReport(comment.id)}
                        className="flex items-center text-xs px-2 py-1 rounded text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        <FiFlag className="w-3.5 h-3.5 mr-1" />
                        举报
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 评论文本内容 */}
              {editingId === comment.id ? (
                <div className="mt-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-2 border border-neutral-200 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 text-sm min-h-[100px]"
                    placeholder="编辑您的评论..."
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 text-sm rounded-md border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      disabled={isLoading}
                    >
                      取消
                    </button>
                    <button
                      onClick={() => handleSubmitEdit(comment.id)}
                      className="px-3 py-1 text-sm rounded-md bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600"
                      disabled={isLoading}
                    >
                      {isLoading ? '保存中...' : '保存'}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-1 text-neutral-700 dark:text-neutral-300 whitespace-pre-line">
                  {comment.content}
                </p>
              )}

              {/* 举报表单 */}
              {reportingId === comment.id && (
                <div className="mt-3 p-3 border border-neutral-200 dark:border-neutral-700 rounded-md bg-neutral-50 dark:bg-neutral-800/50">
                  <h5 className="text-sm font-medium mb-2">举报此评论</h5>
                  <textarea
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full p-2 border border-neutral-200 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 text-sm min-h-[80px]"
                    placeholder="请说明举报原因..."
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={() => setReportingId(null)}
                      className="px-3 py-1 text-xs rounded-md border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      disabled={isLoading}
                    >
                      取消
                    </button>
                    <button
                      onClick={() => handleReportComment(comment.id)}
                      className="px-3 py-1 text-xs rounded-md bg-red-600 text-white hover:bg-red-700"
                      disabled={isLoading || !reportReason.trim()}
                    >
                      {isLoading ? '提交中...' : '提交举报'}
                    </button>
                  </div>
                </div>
              )}

              {/* 回复表单 */}
              {replyToId === comment.id && (
                <div className="mt-3">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full p-2 border border-neutral-200 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 text-sm min-h-[100px]"
                    placeholder="写下您的回复..."
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={() => setReplyToId(null)}
                      className="px-3 py-1 text-sm rounded-md border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      disabled={isLoading}
                    >
                      取消
                    </button>
                    <button
                      onClick={handleSubmitComment}
                      className="px-3 py-1 text-sm rounded-md bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600"
                      disabled={isLoading || !newComment.trim()}
                    >
                      {isLoading ? '回复中...' : '回复'}
                    </button>
                  </div>
                </div>
              )}

              {/* 回复列表 */}
              {replies.length > 0 && (
                <div className="mt-3">
                  <button
                    onClick={() => toggleCommentExpanded(comment.id)}
                    className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 flex items-center"
                  >
                    {isExpanded ? (
                      <>
                        <FiChevronUp className="mr-1" />
                        隐藏{replies.length}条回复
                      </>
                    ) : (
                      <>
                        <FiChevronDown className="mr-1" />
                        查看{replies.length}条回复
                      </>
                    )}
                  </button>
                  {isExpanded && (
                    <div className="mt-2 ml-2 pl-2 border-l-2 border-neutral-200 dark:border-neutral-700">
                      {replies.map(reply => renderComment(reply, level + 1))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </AnimatedElement>
    );
  };

  return (
    <div className={cn("comment-section", className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          评论 ({comments.length})
        </h3>
        <div className="flex items-center">
          <span className="text-sm text-neutral-500 dark:text-neutral-400 mr-2">排序方式:</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="text-sm border border-neutral-200 dark:border-neutral-700 rounded py-1 px-2 bg-white dark:bg-neutral-800"
          >
            <option value="newest">最新</option>
            <option value="oldest">最早</option>
            <option value="popular">最热</option>
          </select>
        </div>
      </div>

      {/* 评论输入框 */}
      {replyToId === null && (
        <div className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full p-3 border border-neutral-200 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 min-h-[120px]"
            placeholder={isAuthenticated ? "写下您的评论..." : "请登录后发表评论"}
            disabled={!isAuthenticated || isLoading}
          />
          {error && (
            <div className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              请文明发言，遵守社区规范
            </span>
            <button
              onClick={handleSubmitComment}
              className={cn(
                "px-4 py-2 rounded-md text-white transition-colors",
                isAuthenticated && newComment.trim() 
                  ? "bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600" 
                  : "bg-neutral-300 dark:bg-neutral-700 cursor-not-allowed"
              )}
              disabled={!isAuthenticated || !newComment.trim() || isLoading}
            >
              {isLoading ? '提交中...' : '发表评论'}
            </button>
          </div>
        </div>
      )}

      {/* 评论列表 */}
      <div className="space-y-1">
        {rootComments.length > 0 ? (
          rootComments.map(comment => renderComment(comment))
        ) : (
          <div className="py-10 text-center">
            <p className="text-neutral-500 dark:text-neutral-400">
              暂无评论，来发表第一条评论吧！
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection; 