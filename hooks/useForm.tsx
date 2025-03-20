'use client';

import React, { useState, useCallback, ChangeEvent, FormEvent } from 'react';
import { useToast } from '@/components/ui/Toast';
import { ValidationError } from '@/lib/api/errorHandler';

// 验证规则类型
export type ValidationRule<T> = (value: T, formData?: any) => string | null;

// 表单验证规则
export type FormValidationRules<T extends Record<string, any>> = {
  [K in keyof T]?: ValidationRule<T[K]>[];
};

// 表单错误类型
export type FormErrors<T> = {
  [K in keyof T]?: string;
};

// 表单配置选项
interface UseFormOptions<T extends Record<string, any>> {
  initialValues: T;
  validationRules?: FormValidationRules<T>;
  onSubmit?: (values: T) => Promise<void> | void;
  onError?: (errors: FormErrors<T>) => void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  showToasts?: boolean;
}

/**
 * 通用的表单处理hook
 */
export function useForm<T extends Record<string, any>>(options: UseFormOptions<T>) {
  const {
    initialValues,
    validationRules = {} as FormValidationRules<T>,
    onSubmit,
    onError,
    validateOnChange = false,
    validateOnBlur = true,
    showToasts = true,
  } = options;

  const { showToast } = useToast();
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);

  // 验证单个字段
  const validateField = useCallback(
    (name: keyof T, value: any): string | null => {
      const fieldRules = validationRules[name] ?? [];
      if (!fieldRules.length) return null;

      for (const rule of fieldRules) {
        const error = rule(value, values);
        if (error) return error;
      }

      return null;
    },
    [validationRules, values]
  );

  // 验证整个表单
  const validateForm = useCallback((): FormErrors<T> => {
    setIsValidating(true);
    const newErrors: FormErrors<T> = {};
    let hasErrors = false;

    for (const key in validationRules) {
      const field = key as keyof T;
      const error = validateField(field, values[field]);
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      }
    }

    setErrors(newErrors);
    setIsValidating(false);
    return newErrors;
  }, [validateField, validationRules, values]);

  // 处理字段变化
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, type, value } = e.target;
      let newValue: any = value;

      // 处理不同类型的输入
      if (type === 'checkbox') {
        newValue = (e.target as HTMLInputElement).checked;
      } else if (type === 'number') {
        newValue = value === '' ? '' : Number(value);
      }

      setValues((prev) => ({
        ...prev,
        [name]: newValue,
      }));

      // 在更改后立即验证字段
      if (validateOnChange && touched[name as keyof T]) {
        const error = validateField(name as keyof T, newValue);
        setErrors((prev) => ({
          ...prev,
          [name]: error,
        }));
      }
    },
    [touched, validateField, validateOnChange]
  );

  // 处理失焦事件
  const handleBlur = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name } = e.target;
      setTouched((prev) => ({
        ...prev,
        [name]: true,
      }));

      // 在失焦后验证字段
      if (validateOnBlur) {
        const error = validateField(name as keyof T, values[name as keyof T]);
        setErrors((prev) => ({
          ...prev,
          [name]: error,
        }));
      }
    },
    [validateField, validateOnBlur, values]
  );

  // 设置字段值
  const setFieldValue = useCallback(
    (name: keyof T, value: any, shouldValidate = false) => {
      setValues((prev) => ({
        ...prev,
        [name]: value,
      }));

      if (shouldValidate) {
        const error = validateField(name, value);
        setErrors((prev) => ({
          ...prev,
          [name]: error,
        }));
      }
    },
    [validateField]
  );

  // 设置多个字段值
  const setMultipleValues = useCallback(
    (newValues: Partial<T>, shouldValidate = false) => {
      setValues((prev) => ({
        ...prev,
        ...newValues,
      }));

      if (shouldValidate) {
        const newErrors: FormErrors<T> = { ...errors };
        let hasChanges = false;

        for (const key in newValues) {
          const field = key as keyof T;
          const error = validateField(field, newValues[field]);
          
          if (error !== newErrors[field]) {
            newErrors[field] = error || undefined;
            hasChanges = true;
          }
        }

        if (hasChanges) {
          setErrors(newErrors);
        }
      }
    },
    [errors, validateField]
  );

  // 设置字段错误
  const setFieldError = useCallback(
    (name: keyof T, error: string | null) => {
      setErrors((prev) => ({
        ...prev,
        [name]: error || undefined,
      }));
    },
    []
  );

  // 设置多个字段错误
  const setFieldErrors = useCallback(
    (fieldErrors: ValidationError[]) => {
      const newErrors = { ...errors };
      let hasChanges = false;

      fieldErrors.forEach(({ field, message }) => {
        if (field in initialValues) {
          newErrors[field as keyof T] = message;
          hasChanges = true;
        }
      });

      if (hasChanges) {
        setErrors(newErrors);
        
        if (showToasts) {
          showToast({
            type: 'error',
            title: '表单验证失败',
            message: '请修复表单中的错误后重新提交',
          });
        }
      }
    },
    [errors, initialValues, showToasts, showToast]
  );

  // 重置表单
  const resetForm = useCallback(
    (newValues?: T) => {
      setValues(newValues || initialValues);
      setErrors({});
      setTouched({} as Record<keyof T, boolean>);
      setIsSubmitting(false);
    },
    [initialValues]
  );

  // 处理表单提交
  const handleSubmit = useCallback(
    async (e?: FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      setSubmitCount((prev) => prev + 1);
      const formErrors = validateForm();
      const hasErrors = Object.keys(formErrors).length > 0;

      if (hasErrors) {
        if (onError) {
          onError(formErrors);
        }

        if (showToasts) {
          showToast({
            type: 'error',
            title: '表单验证失败',
            message: '请修复表单中的错误后重新提交',
          });
        }

        return;
      }

      if (onSubmit) {
        setIsSubmitting(true);
        try {
          await onSubmit(values);
        } catch (error) {
          console.error('表单提交错误:', error);
          
          // 如果错误是API错误，可以设置字段错误
          if (error && (error as any).validationErrors) {
            setFieldErrors((error as any).validationErrors);
          } else if (showToasts) {
            showToast({
              type: 'error',
              title: '提交失败',
              message: '表单提交过程中发生错误，请稍后再试',
            });
          }
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [onError, onSubmit, setFieldErrors, showToasts, showToast, validateForm, values]
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValidating,
    submitCount,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setMultipleValues,
    setFieldError,
    setFieldErrors,
    resetForm,
    validateForm,
    validateField,
  };
}

// 常用的验证规则
export const ValidationRules = {
  required: (message = '此字段是必填的'): ValidationRule<any> => {
    return (value) => {
      if (value === undefined || value === null || value === '') {
        return message;
      }
      if (Array.isArray(value) && value.length === 0) {
        return message;
      }
      return null;
    };
  },

  email: (message = '请输入有效的电子邮件地址'): ValidationRule<string> => {
    return (value) => {
      if (!value) return null;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value) ? null : message;
    };
  },

  minLength: (min: number, message?: string): ValidationRule<string> => {
    return (value) => {
      if (!value) return null;
      return value.length >= min ? null : message || `最少需要 ${min} 个字符`;
    };
  },

  maxLength: (max: number, message?: string): ValidationRule<string> => {
    return (value) => {
      if (!value) return null;
      return value.length <= max ? null : message || `最多允许 ${max} 个字符`;
    };
  },

  pattern: (regex: RegExp, message = '输入格式不正确'): ValidationRule<string> => {
    return (value) => {
      if (!value) return null;
      return regex.test(value) ? null : message;
    };
  },

  min: (min: number, message?: string): ValidationRule<number> => {
    return (value) => {
      if (value === undefined || value === null || value === 0 || String(value) === '') return null;
      return Number(value) >= min ? null : message || `最小值为 ${min}`;
    };
  },

  max: (max: number, message?: string): ValidationRule<number> => {
    return (value) => {
      if (value === undefined || value === null || value === 0 || String(value) === '') return null;
      return Number(value) <= max ? null : message || `最大值为 ${max}`;
    };
  },

  passwordMatch: (
    matchField: string,
    message = '密码不匹配'
  ): ValidationRule<string> => {
    return (value, formData) => {
      if (!value || !formData) return null;
      return value === formData[matchField] ? null : message;
    };
  },
};

export default useForm; 