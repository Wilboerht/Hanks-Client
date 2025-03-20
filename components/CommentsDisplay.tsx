'use client';

import { useState, useEffect } from 'react';
import { FiMessageSquare, FiUser, FiClock, FiCornerDownRight, FiThumbsUp } from 'react-icons/fi';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';
import { Comment } from '@/lib/api/types';
import { useAuth } from '@/hooks/useAuth';
import CommentForm from './comments/CommentForm';
import { motion, AnimatePresence } from 'framer-motion';

interface CommentsDisplayProps {
  postId: string;
  comments: Comment[];
  onAddComment?: () => void;
  isLoading?: boolean;
}

export default function CommentsDisplay({
  postId,
  comments,
  onAddComment,
  isLoading = false
}: CommentsDisplayProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  
  // 创建评论树结构
  const commentTree = buildCommentTree(comments);
  
  // 处理回复操作
  const handleReply = (commentId: string) => {
    setReplyingTo(prevId => prevId === commentId ? null : commentId);
  };
  
  // 评论添加成功后的处理
  const handleCommentAdded = () => {
    setReplyingTo(null);
    if (onAddComment) onAddComment();
  };

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
        <FiMessageSquare className="mr-2" />
        评论 ({comments.length})
      </h3>
      
      {/* 主评论表单 */}
      <div className="mb-10">
        <CommentForm 
          postId={postId}
          onCommentAdded={handleCommentAdded}
          placeholder="写下您的评论..."
        />
      </div>
      
      {/* 评论列表 */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="inline-block w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-6">
          {commentTree.map(comment => (
            <CommentItem 
              key={comment.id}
              comment={comment}
              postId={postId}
              replyingTo={replyingTo}
              onReply={handleReply}
              onCommentAdded={handleCommentAdded}
              level={0}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">暂无评论，成为第一个评论的人吧！</p>
        </div>
      )}
    </div>
  );
}

// 评论项组件
interface CommentItemProps {
  comment: CommentWithReplies;
  postId: string;
  replyingTo: string | null;
  onReply: (commentId: string) => void;
  onCommentAdded: () => void;
  level: number;
}

function CommentItem({ comment, postId, replyingTo, onReply, onCommentAdded, level }: CommentItemProps) {
  const { isAuthenticated } = useAuth();
  const maxDepth = 3; // 最大嵌套深度
  
  const isReplyOpen = replyingTo === comment.id;
  
  return (
    <div className={`relative ${level > 0 ? 'ml-4 sm:ml-8 pl-4 sm:pl-6 border-l-2 border-gray-200 dark:border-gray-700' : ''}`}>
      <div className="flex items-start space-x-3 sm:space-x-4">
        {/* 用户头像 */}
        <div className="flex-shrink-0">
          {comment.author?.avatar ? (
            <Image
              src={comment.author.avatar}
              alt={comment.author.name || '用户'}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <FiUser className="text-gray-500 dark:text-gray-400" />
            </div>
          )}
        </div>
        
        {/* 评论内容 */}
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 dark:bg-gray-850 p-4 rounded-lg">
            {/* 作者信息和时间 */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  {comment.author?.name || '匿名用户'}
                </h4>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <FiClock className="mr-1" size={14} />
                  <span>{formatDate(comment.createdAt)}</span>
                </div>
              </div>
            </div>
            
            {/* 评论文字内容 */}
            <div className="prose dark:prose-dark prose-sm max-w-none">
              <p>{comment.content}</p>
            </div>
          </div>
          
          {/* 操作按钮 */}
          <div className="flex items-center mt-2 space-x-4">
            {isAuthenticated && level < maxDepth && (
              <button
                onClick={() => onReply(comment.id)}
                className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
              >
                <FiCornerDownRight className="mr-1" size={14} />
                {isReplyOpen ? '取消回复' : '回复'}
              </button>
            )}
          </div>
          
          {/* 回复表单 */}
          <AnimatePresence>
            {isReplyOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 overflow-hidden"
              >
                <CommentForm
                  postId={postId}
                  parentId={comment.id}
                  onCommentAdded={onCommentAdded}
                  onCancel={() => onReply(comment.id)}
                  placeholder={`回复 ${comment.author?.name || '该用户'}...`}
                  autoFocus
                />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* 回复评论 */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map(reply => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  postId={postId}
                  replyingTo={replyingTo}
                  onReply={onReply}
                  onCommentAdded={onCommentAdded}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 带回复的评论类型
interface CommentWithReplies extends Comment {
  replies?: CommentWithReplies[];
}

// 构建评论树结构函数
function buildCommentTree(comments: Comment[]): CommentWithReplies[] {
  const commentMap: Record<string, CommentWithReplies> = {};
  const rootComments: CommentWithReplies[] = [];
  
  // 先构建映射
  comments.forEach(comment => {
    commentMap[comment.id] = { ...comment, replies: [] };
  });
  
  // 建立父子关系
  comments.forEach(comment => {
    if (comment.parentId && commentMap[comment.parentId]) {
      // 如果有父评论，添加到父评论的回复列表
      commentMap[comment.parentId].replies!.push(commentMap[comment.id]);
    } else {
      // 否则作为根评论
      rootComments.push(commentMap[comment.id]);
    }
  });
  
  return rootComments;
}

/**
 * 使用示例:
 * 
 * // 在博客文章详情页
 * const [comments, setComments] = useState<Comment[]>([]);
 * const [isLoading, setIsLoading] = useState(true);
 * 
 * // 加载评论
 * const loadComments = async () => {
 *   setIsLoading(true);
 *   try {
 *     const response = await getComments(postId);
 *     setComments(response.data);
 *   } catch (error) {
 *     console.error('加载评论失败', error);
 *   } finally {
 *     setIsLoading(false);
 *   }
 * };
 * 
 * // 添加评论后刷新
 * const handleCommentAdded = () => {
 *   loadComments();
 * };
 * 
 * <CommentsDisplay
 *   postId={postId}
 *   comments={comments}
 *   onAddComment={handleCommentAdded}
 *   isLoading={isLoading}
 * />
 */ 