/**
 * 博客相关API请求方法
 */

import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';
import { ApiResponse, Post, PostCreateData, PostUpdateData, Comment, CommentCreateData } from './types';

/**
 * 获取博客文章列表
 */
export const getPosts = async (page = 1, limit = 10, tag?: string, search?: string) => {
  let url = `${ENDPOINTS.BLOG.LIST}?page=${page}&limit=${limit}`;
  
  if (tag) {
    url += `&tag=${encodeURIComponent(tag)}`;
  }
  
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  
  const response = await apiClient.get<ApiResponse<{ posts: Post[], totalPages: number }>>(url);
  return response.data;
};

/**
 * 获取单篇博客文章详情
 */
export const getPostById = async (id: string) => {
  const response = await apiClient.get<ApiResponse<Post>>(ENDPOINTS.BLOG.DETAIL(id));
  return response.data;
};

/**
 * 创建新博客文章
 */
export const createPost = async (postData: PostCreateData) => {
  const response = await apiClient.post<ApiResponse<Post>>(ENDPOINTS.BLOG.CREATE, postData);
  return response.data;
};

/**
 * 更新博客文章
 */
export const updatePost = async (id: string, postData: PostUpdateData) => {
  const response = await apiClient.put<ApiResponse<Post>>(ENDPOINTS.BLOG.UPDATE(id), postData);
  return response.data;
};

/**
 * 删除博客文章
 */
export const deletePost = async (id: string) => {
  const response = await apiClient.delete<ApiResponse<void>>(ENDPOINTS.BLOG.DELETE(id));
  return response.data;
};

/**
 * 获取博客标签列表
 */
export const getTags = async () => {
  const response = await apiClient.get<ApiResponse<{ name: string, count: number }[]>>(ENDPOINTS.BLOG.TAGS);
  return response.data;
};

/**
 * 获取文章评论
 */
export const getComments = async (postId: string) => {
  const response = await apiClient.get<ApiResponse<Comment[]>>(ENDPOINTS.BLOG.COMMENTS(postId));
  return response.data;
};

/**
 * 添加评论
 */
export const addComment = async (commentData: CommentCreateData) => {
  const response = await apiClient.post<ApiResponse<Comment>>(
    ENDPOINTS.BLOG.ADD_COMMENT(commentData.articleId),
    { content: commentData.content, parentId: commentData.parentId }
  );
  return response.data;
}; 