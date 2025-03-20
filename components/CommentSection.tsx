'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    username: string;
    avatar?: string;
  };
  likes: string[];
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  parentComment?: string;
}

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [postId, page]);

  const fetchComments = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/comments?post=${postId}&page=${page}&limit=10`
      );
      if (!response.ok) throw new Error('Failed to fetch comments');
      const data = await response.json();
      
      if (page === 1) {
        setComments(data.comments);
      } else {
        setComments(prev => [...prev, ...data.comments]);
      }
      
      setHasMore(data.comments.length === 10);
      setLoading(false);
    } catch (err) {
      setError('Failed to load comments');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment,
          post: postId,
          parentComment: replyTo,
        }),
      });

      if (!response.ok) throw new Error('Failed to post comment');
      
      const newCommentData = await response.json();
      setComments(prev => [newCommentData, ...prev]);
      setNewComment('');
      setReplyTo(null);
    } catch (err) {
      setError('Failed to post comment');
    }
  };

  const handleEdit = async (commentId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/comments/${commentId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: editContent }),
        }
      );

      if (!response.ok) throw new Error('Failed to edit comment');
      
      const updatedComment = await response.json();
      setComments(prev =>
        prev.map(comment =>
          comment._id === commentId ? updatedComment : comment
        )
      );
      setEditingComment(null);
      setEditContent('');
    } catch (err) {
      setError('Failed to edit comment');
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/comments/${commentId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) throw new Error('Failed to delete comment');
      
      setComments(prev => prev.filter(comment => comment._id !== commentId));
    } catch (err) {
      setError('Failed to delete comment');
    }
  };

  const handleLike = async (commentId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/comments/${commentId}/like`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) throw new Error('Failed to toggle like');
      
      const updatedComment = await response.json();
      setComments(prev =>
        prev.map(comment =>
          comment._id === commentId ? updatedComment : comment
        )
      );
    } catch (err) {
      setError('Failed to toggle like');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="text-red-500 text-center py-2">{error}</div>
      )}

      {/* Comment Form */}
      {session ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={3}
          />
          <div className="flex justify-between items-center">
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {replyTo ? "Reply" : "Comment"}
            </button>
            {replyTo && (
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                Cancel Reply
              </button>
            )}
          </div>
        </form>
      ) : (
        <p className="text-center text-gray-600">
          Please sign in to leave a comment.
        </p>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment._id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-start space-x-3">
              {comment.author.avatar ? (
                <Image
                  src={comment.author.avatar}
                  alt={comment.author.username}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{comment.author.username}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString()}
                    {comment.isEdited && " (edited)"}
                  </span>
                </div>

                {editingComment === comment._id ? (
                  <div className="mt-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full p-2 border rounded"
                      rows={3}
                    />
                    <div className="mt-2 space-x-2">
                      <button
                        onClick={() => handleEdit(comment._id)}
                        className="text-sm text-indigo-600 hover:text-indigo-800"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingComment(null);
                          setEditContent('');
                        }}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-1">{comment.content}</p>
                )}

                <div className="mt-2 flex items-center space-x-4 text-sm">
                  <button
                    onClick={() => handleLike(comment._id)}
                    className={`flex items-center space-x-1 ${
                      session?.user && comment.likes.includes(session.user.id)
                        ? 'text-indigo-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <span>❤</span>
                    <span>{comment.likes.length}</span>
                  </button>

                  {session && (
                    <>
                      <button
                        onClick={() => {
                          setReplyTo(comment._id);
                          setNewComment('');
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        Reply
                      </button>

                      {session.user.id === comment.author._id && (
                        <>
                          <button
                            onClick={() => {
                              setEditingComment(comment._id);
                              setEditContent(comment.content);
                            }}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(comment._id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center">
          <button
            onClick={() => setPage(prev => prev + 1)}
            className="px-4 py-2 text-indigo-600 hover:text-indigo-800"
          >
            Load More Comments
          </button>
        </div>
      )}
    </div>
  );
} 