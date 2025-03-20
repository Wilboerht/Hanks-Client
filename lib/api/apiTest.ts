/**
 * API测试工具
 * 用于验证前后端通信是否正常工作
 */

import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';

// 安全地访问localStorage，防止在服务器端渲染中报错
const saveToStorage = (key: string, value: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, value);
  }
};

const removeFromStorage = (key: string) => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(key);
  }
};

const getFromStorage = (key: string): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
};

interface HealthCheckResponse {
  status: string;
  message: string;
  timestamp: string;
  env: string;
  version: string;
}

/**
 * 测试API连接
 * 这个函数会发送请求到服务器的健康检查端点，验证连接是否正常
 */
export async function testApiConnection(): Promise<{
  success: boolean;
  message: string;
  serverInfo?: {
    version: string;
    environment: string;
    timestamp: string;
  };
}> {
  try {
    // 尝试访问API健康检查端点
    const response = await apiClient.get<HealthCheckResponse>('/health');
    
    return {
      success: true,
      message: '成功连接到API服务器',
      serverInfo: {
        version: response.data.version || '未知',
        environment: response.data.env || '未知',
        timestamp: response.data.timestamp || new Date().toISOString()
      }
    };
  } catch (error: any) {
    console.error('API连接测试失败:', error);
    
    // 如果健康检查失败，尝试访问根路径
    try {
      const rootResponse = await apiClient.get<{status: string, message: string, timestamp: string}>('');
      return {
        success: true,
        message: '成功连接到API服务器根路径',
        serverInfo: {
          version: '未知',
          environment: '未知',
          timestamp: rootResponse.data.timestamp || new Date().toISOString()
        }
      };
    } catch (rootError) {
      console.error('API根路径连接也失败:', rootError);
      return {
        success: false,
        message: `无法连接到API服务器: ${error.message || '未知错误'}`
      };
    }
  }
}

/**
 * 测试认证流程
 * 这个函数会尝试使用测试账号登录，验证认证流程是否正常
 */
export async function testAuthFlow(
  testEmail: string = 'test@example.com',
  testPassword: string = 'password123'
): Promise<{
  success: boolean;
  message: string;
  steps: {
    name: string;
    success: boolean;
    message: string;
  }[];
}> {
  const steps: {
    name: string;
    success: boolean;
    message: string;
  }[] = [];
  
  try {
    // 步骤1: 登录
    try {
      const loginResponse = await apiClient.post(ENDPOINTS.AUTH.LOGIN, {
        email: testEmail,
        password: testPassword
      });
      
      console.log('登录响应:', loginResponse.data);
      
      steps.push({
        name: '登录测试',
        success: true,
        message: '登录成功'
      });
      
      // 获取token
      const token = loginResponse.data.token;
      const refreshToken = loginResponse.data.refreshToken;
      
      if (!token) {
        steps.push({
          name: '提取Token',
          success: false,
          message: '登录响应中没有找到token'
        });
        throw new Error('登录响应中没有找到token');
      }
      
      // 保存token到localStorage
      saveToStorage('token', token);
      if (refreshToken) {
        saveToStorage('refreshToken', refreshToken);
      }
      
      steps.push({
        name: '提取Token',
        success: true,
        message: '成功提取token'
      });
      
      // 步骤2: 使用token获取个人资料
      try {
        const profileResponse = await apiClient.get(ENDPOINTS.USERS.PROFILE, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        console.log('个人资料响应:', profileResponse.data);
        
        steps.push({
          name: '获取用户资料',
          success: true,
          message: '成功获取用户资料'
        });
      } catch (error) {
        console.error('获取用户资料错误:', error);
        steps.push({
          name: '获取用户资料',
          success: false,
          message: `获取用户资料失败: ${(error as any).message || '未知错误'}`
        });
      }
      
      // 步骤3: 如果有refreshToken，测试token刷新
      if (refreshToken) {
        try {
          const refreshResponse = await apiClient.post(ENDPOINTS.AUTH.REFRESH, {
            refreshToken
          });
          
          console.log('刷新token响应:', refreshResponse.data);
          
          const newToken = refreshResponse.data.token;
          
          if (newToken) {
            // 更新localStorage中的token
            saveToStorage('token', newToken);
            
            steps.push({
              name: '刷新Token',
              success: true,
              message: '成功刷新token'
            });
          } else {
            steps.push({
              name: '刷新Token',
              success: false,
              message: '刷新token响应中没有找到新token'
            });
          }
        } catch (error) {
          console.error('刷新token错误:', error);
          steps.push({
            name: '刷新Token',
            success: false,
            message: `刷新token失败: ${(error as any).message || '未知错误'}`
          });
        }
      }
      
      // 步骤4: 登出
      try {
        const logoutResponse = await apiClient.post(
          ENDPOINTS.AUTH.LOGOUT, 
          refreshToken ? { refreshToken } : {}, 
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        console.log('登出响应:', logoutResponse.data);
        
        // 清除localStorage中的token
        removeFromStorage('token');
        removeFromStorage('refreshToken');
        
        steps.push({
          name: '登出测试',
          success: true,
          message: '成功登出'
        });
      } catch (error) {
        console.error('登出错误:', error);
        steps.push({
          name: '登出测试',
          success: false,
          message: `登出失败: ${(error as any).message || '未知错误'}`
        });
      }
      
    } catch (error) {
      console.error('登录错误:', error);
      steps.push({
        name: '登录测试',
        success: false,
        message: `登录失败: ${(error as any).message || '未知错误'}`
      });
      throw error;
    }
    
    // 确定整体测试结果
    const allSuccess = steps.every(step => step.success);
    
    return {
      success: allSuccess,
      message: allSuccess ? '认证流程测试成功' : '认证流程测试部分失败',
      steps
    };
    
  } catch (error) {
    console.error('认证流程测试错误:', error);
    return {
      success: false,
      message: `认证流程测试失败: ${(error as any).message || '未知错误'}`,
      steps
    };
  }
}

/**
 * 测试数据API
 * 这个函数会尝试获取博客文章列表，验证数据API是否正常
 */
export async function testDataApi(): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> {
  try {
    const response = await apiClient.get(ENDPOINTS.BLOG.LIST);
    
    console.log('数据API响应:', response.data);
    
    return {
      success: true,
      message: '成功获取数据',
      data: response.data
    };
  } catch (error: any) {
    console.error('数据API测试失败:', error);
    
    return {
      success: false,
      message: `获取数据失败: ${error.message || '未知错误'}`
    };
  }
} 