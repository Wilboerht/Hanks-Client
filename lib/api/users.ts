/**
 * 用户相关API
 */

import { apiClient } from './client';
import { User, ApiResponse } from './types';

/**
 * 获取用户个人资料
 */
export const getUserProfile = async (): Promise<ApiResponse<User>> => {
  const response = await apiClient.get('/users/profile');
  return response.data;
};

/**
 * 更新用户个人资料
 * @param userData 用户资料数据
 */
export const updateUserProfile = async (userData: Partial<User>): Promise<ApiResponse<User>> => {
  const response = await apiClient.put('/users/profile', userData);
  return response.data;
};

/**
 * 更改用户密码
 * @param passwordData 密码数据
 */
export const changePassword = async (passwordData: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<ApiResponse<void>> => {
  const response = await apiClient.put('/users/change-password', passwordData);
  return response.data;
};

/**
 * 上传用户头像
 * @param formData 包含头像文件的FormData
 */
export const uploadAvatar = async (formData: FormData): Promise<ApiResponse<{ avatarUrl: string }>> => {
  const response = await apiClient.post('/users/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}; 