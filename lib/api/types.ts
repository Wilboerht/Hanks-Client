/**
 * API类型定义
 * 用于前后端数据交互的类型接口
 */

// 通用API响应格式
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

// 用户相关类型
export interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  avatar?: string;
  bio?: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface UserCreateData {
  username: string;
  email: string;
  password: string;
  name?: string;
}

export interface UserUpdateData {
  username?: string;
  email?: string;
  password?: string;
  name?: string;
  avatar?: string;
  bio?: string;
}

// 认证相关类型
export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  status: number;
  message: string;
  data: {
    user: User;
    token: string;
    refreshToken?: string;
  };
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  name?: string;
}

// 文章相关类型
export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  tags?: string[];
  publishedAt: string;
  updatedAt: string;
  readingTime?: string;
  featured?: boolean;
  status: 'draft' | 'published';
  views?: number;
  likes?: number;
}

export interface ArticleCreateData {
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  categoryId?: string;
  tags?: string[];
  status?: 'draft' | 'published';
  featured?: boolean;
}

export interface ArticleUpdateData {
  title?: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  categoryId?: string;
  tags?: string[];
  status?: 'draft' | 'published';
  featured?: boolean;
}

// 评论相关类型
export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  articleId: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  likes?: number;
}

export interface CommentCreateData {
  content: string;
  articleId: string;
  parentId?: string;
}

// 分类相关类型
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  articleCount?: number;
}

export interface CategoryCreateData {
  name: string;
  slug: string;
  description?: string;
}

// 博客相关类型
export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  tags: string[];
  author: User;
  status: 'draft' | 'published';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostCreateData {
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  tags?: string[];
  publishNow?: boolean;
}

export interface PostUpdateData {
  title?: string;
  content?: string;
  excerpt?: string;
  coverImage?: string;
  tags?: string[];
}

// 项目相关类型
export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  content?: string;
  thumbnail?: string;
  technologies: string[];
  sourceUrl?: string;
  demoUrl?: string;
  featured: boolean;
  status: 'active' | 'archived' | 'planned';
  createdAt: string;
  updatedAt: string;
}

export interface ProjectCreateData {
  title: string;
  description: string;
  imageUrl?: string;
  demoUrl?: string;
  sourceUrl?: string;
  technologies: string[];
  featured?: boolean;
  status: 'active' | 'archived' | 'planning';
}

export interface ProjectUpdateData {
  title?: string;
  description?: string;
  imageUrl?: string;
  demoUrl?: string;
  sourceUrl?: string;
  technologies?: string[];
  featured?: boolean;
  status?: 'active' | 'archived' | 'planning';
}

// 联系表单相关类型
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// 分页相关类型
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 标签类型
export interface Tag {
  id: string;
  name: string;
  slug: string;
  count: number;
}

// 搜索相关类型
export interface SearchFilters {
  category?: string;
  tags?: string[];
  author?: string;
  status?: 'draft' | 'published';
  featured?: boolean;
  fromDate?: string;
  toDate?: string;
}

// 离线模式相关类型
export interface OfflineAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  resource: string;
  data: any;
  timestamp: number;
}

// 通知相关类型
export interface Notification {
  id: string;
  type: 'comment' | 'like' | 'follow' | 'system';
  content: string;
  read: boolean;
  createdAt: string;
  data?: any;
} 