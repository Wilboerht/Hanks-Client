/**
 * 表单验证工具函数
 */

// 邮箱验证
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 密码强度验证 (至少8位，包含大小写字母和数字)
export const isStrongPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

// 简单密码验证 (至少6位)
export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

// 用户名验证 (2-20位字符)
export const isValidUsername = (username: string): boolean => {
  return username.length >= 2 && username.length <= 20;
};

// URL验证
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// 手机号验证 (中国大陆)
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// 字段必填验证
export const isRequired = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

// 字段长度验证
export const isLengthBetween = (value: string, min: number, max: number): boolean => {
  return value.length >= min && value.length <= max;
};

// 数值范围验证
export const isNumberInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

// 表单验证错误类型
export type ValidationError = { [key: string]: string | null | undefined };

// 通用验证函数
export const validateForm = <T extends Record<string, any>>(
  values: T,
  validations: { [K in keyof T]?: Array<(value: T[K]) => string | null> }
): ValidationError => {
  const errors: ValidationError = {};

  for (const field in validations) {
    const value = values[field];
    const validators = validations[field] || [];

    for (const validator of validators) {
      const error = validator(value);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  }

  return errors;
};

// 常用验证器
export const validators = {
  required: (message: string = '此字段为必填项') => 
    (value: any) => isRequired(value) ? null : message,
  
  email: (message: string = '请输入有效的邮箱地址') => 
    (value: string) => isValidEmail(value) ? null : message,
  
  password: (message: string = '密码至少需要6个字符') => 
    (value: string) => isValidPassword(value) ? null : message,
  
  strongPassword: (message: string = '密码至少需要8个字符，包含大小写字母和数字') => 
    (value: string) => isStrongPassword(value) ? null : message,
  
  minLength: (min: number, message: string = `至少需要${min}个字符`) => 
    (value: string) => value.length >= min ? null : message,
  
  maxLength: (max: number, message: string = `不能超过${max}个字符`) => 
    (value: string) => value.length <= max ? null : message,
  
  pattern: (regex: RegExp, message: string = '格式不正确') => 
    (value: string) => regex.test(value) ? null : message,
  
  match: (matchValue: any, message: string = '两个值不匹配') => 
    (value: any) => value === matchValue ? null : message,
  
  url: (message: string = '请输入有效的URL') => 
    (value: string) => isValidUrl(value) ? null : message,
  
  phone: (message: string = '请输入有效的手机号码') => 
    (value: string) => isValidPhoneNumber(value) ? null : message,
}; 