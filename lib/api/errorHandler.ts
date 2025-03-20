/**
 * 全局错误处理服务
 * 提供统一的错误处理和用户反馈
 */

import { AxiosError } from 'axios';
import { useToast } from '@/components/ui/Toast';

export type ApiErrorType = 
  | 'auth' // 身份验证错误
  | 'validation' // 表单验证错误
  | 'notFound' // 资源不存在
  | 'server' // 服务器错误
  | 'network' // 网络错误
  | 'unknown'; // 未知错误

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  message: string;
  code?: string;
  errors?: ValidationError[];
  status?: number;
}

// 错误类型映射
const errorTypeMap: Record<number, ApiErrorType> = {
  400: 'validation',
  401: 'auth',
  403: 'auth',
  404: 'notFound',
  500: 'server',
  502: 'server',
  503: 'server',
  504: 'server'
};

/**
 * 解析API错误
 */
export function parseApiError(error: any): {
  type: ApiErrorType;
  message: string;
  details?: any;
  status?: number;
  validationErrors?: ValidationError[];
} {
  // 处理Axios错误
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const errorType = status ? errorTypeMap[status] || 'unknown' : 'network';
    const errorData = error.response?.data as ApiErrorResponse | undefined;
    
    // 处理网络错误
    if (!navigator.onLine || error.message === 'Network Error') {
      return {
        type: 'network',
        message: '网络连接失败，请检查您的网络连接',
        status
      };
    }

    // 提取API错误信息
    const errorMessage = errorData?.message || error.message || '操作失败，请稍后再试';
    
    return {
      type: errorType,
      message: errorMessage,
      details: errorData,
      status,
      validationErrors: errorData?.errors
    };
  }
  
  // 处理一般错误
  return {
    type: 'unknown',
    message: error?.message || '发生未知错误',
    details: error
  };
}

/**
 * 错误处理服务
 * 使用Toast通知用户错误
 */
export const ErrorHandler = {
  // 获取Toast实例 (必须在组件内部调用)
  getToastHandlers() {
    return useToast();
  },

  // 通用错误处理方法
  handleError(error: any, toast?: ReturnType<typeof useToast>) {
    const parsedError = parseApiError(error);
    console.error('API错误:', parsedError);

    // 如果组件传入toast实例，使用它；否则在控制台打印错误
    if (toast) {
      switch (parsedError.type) {
        case 'auth':
          toast.showToast({
            type: 'error',
            title: '认证失败',
            message: parsedError.message,
          });
          break;
        
        case 'validation':
          const validationMessage = parsedError.validationErrors?.length
            ? parsedError.validationErrors.map(e => `${e.field}: ${e.message}`).join('\n')
            : parsedError.message;
            
          toast.showToast({
            type: 'error',
            title: '表单验证失败',
            message: validationMessage,
          });
          break;
        
        case 'notFound':
          toast.showToast({
            type: 'error',
            title: '未找到资源',
            message: parsedError.message,
          });
          break;
        
        case 'network':
          toast.showToast({
            type: 'error',
            title: '网络错误',
            message: parsedError.message,
          });
          break;
        
        case 'server':
          toast.showToast({
            type: 'error',
            title: '服务器错误',
            message: '服务器处理请求时发生错误，请稍后再试',
          });
          break;
        
        default:
          toast.showToast({
            type: 'error',
            title: '操作失败',
            message: parsedError.message,
          });
      }
    }

    return parsedError;
  },

  // 身份验证错误处理
  handleAuthError(error: any, toast?: ReturnType<typeof useToast>): void {
    const parsedError = parseApiError(error);
    
    if (toast) {
      toast.showToast({
        type: 'error',
        title: '认证失败',
        message: '您的登录已过期或无效，请重新登录',
      });
    }
    
    // 可以在这里添加重定向到登录页面的逻辑
    // window.location.href = '/login';
  },

  // 表单验证错误处理
  handleValidationError(error: any, toast?: ReturnType<typeof useToast>): ValidationError[] {
    const parsedError = parseApiError(error);
    const validationErrors = parsedError.validationErrors || [];
    
    if (toast && validationErrors.length) {
      toast.showToast({
        type: 'error',
        title: '表单验证失败',
        message: '请检查表单中的错误并重新提交',
      });
    }
    
    return validationErrors;
  }
};

export default ErrorHandler; 