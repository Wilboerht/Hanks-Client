/**
 * 项目相关API请求方法
 */

import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';
import { ApiResponse, Project, ProjectCreateData, ProjectUpdateData } from './types';

/**
 * 获取项目列表
 */
export const getProjects = async (status?: 'active' | 'archived' | 'planning') => {
  let url = ENDPOINTS.PROJECTS.LIST;
  
  if (status) {
    url += `?status=${status}`;
  }
  
  const response = await apiClient.get<ApiResponse<Project[]>>(url);
  return response.data;
};

/**
 * 获取单个项目详情
 */
export const getProjectById = async (id: string) => {
  const response = await apiClient.get<ApiResponse<Project>>(ENDPOINTS.PROJECTS.DETAIL(id));
  return response.data;
};

/**
 * 创建新项目
 */
export const createProject = async (projectData: ProjectCreateData) => {
  const response = await apiClient.post<ApiResponse<Project>>(ENDPOINTS.PROJECTS.CREATE, projectData);
  return response.data;
};

/**
 * 更新项目
 */
export const updateProject = async (id: string, projectData: ProjectUpdateData) => {
  const response = await apiClient.put<ApiResponse<Project>>(ENDPOINTS.PROJECTS.UPDATE(id), projectData);
  return response.data;
};

/**
 * 删除项目
 */
export const deleteProject = async (id: string) => {
  const response = await apiClient.delete<ApiResponse<void>>(ENDPOINTS.PROJECTS.DELETE(id));
  return response.data;
};

/**
 * 获取精选项目
 */
export const getFeaturedProjects = async () => {
  const response = await apiClient.get<ApiResponse<Project[]>>(`${ENDPOINTS.PROJECTS.LIST}?featured=true`);
  return response.data;
}; 