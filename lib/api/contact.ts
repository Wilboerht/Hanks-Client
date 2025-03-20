/**
 * 联系表单相关API请求方法
 */

import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';
import { ApiResponse, ContactFormData } from './types';

/**
 * 发送联系表单
 */
export const sendContactForm = async (formData: ContactFormData) => {
  const response = await apiClient.post<ApiResponse<{ message: string }>>(
    ENDPOINTS.CONTACT.SEND, 
    formData
  );
  return response.data;
}; 