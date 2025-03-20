import { useState, useCallback, ChangeEvent, FormEvent } from 'react';
import { ValidationError, validateForm } from './validators';

interface UseFormOptions<T> {
  initialValues: T;
  validations?: { [K in keyof T]?: Array<(value: T[K]) => string | null> };
  onSubmit?: (values: T, formHelpers: FormHelpers<T>) => void | Promise<void>;
}

export interface FormHelpers<T> {
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldTouched: (field: keyof T, isTouched?: boolean) => void;
  setFieldError: (field: keyof T, error: string | null) => void;
  resetForm: () => void;
  validateField: (field: keyof T) => boolean;
  validateForm: () => boolean;
  setSubmitting: (isSubmitting: boolean) => void;
  setValues: (values: Partial<T>) => void;
  setErrors: (errors: Partial<ValidationError>) => void;
  setTouched: (touched: Partial<Record<keyof T, boolean>>) => void;
}

export interface FormState<T> {
  values: T;
  errors: ValidationError;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validations = {},
  onSubmit,
}: UseFormOptions<T>) {
  const [formState, setFormState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: Object.keys(initialValues).reduce((acc, key) => {
      acc[key as keyof T] = false;
      return acc;
    }, {} as Record<keyof T, boolean>),
    isSubmitting: false,
    isValid: true,
  });

  // 验证单个字段
  const validateField = useCallback(
    (field: keyof T): boolean => {
      const fieldValidators = validations[field] || [];
      let fieldError: string | null = null;

      for (const validator of fieldValidators) {
        const error = validator(formState.values[field]);
        if (error) {
          fieldError = error;
          break;
        }
      }

      setFormState((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          [field]: fieldError,
        },
        isValid: Object.values({ ...prev.errors, [field]: fieldError }).every(
          (error) => !error
        ),
      }));

      return !fieldError;
    },
    [formState.values, validations]
  );

  // 验证整个表单
  const validateAllFields = useCallback((): boolean => {
    const errors = validateForm(formState.values, validations);
    const isValid = Object.keys(errors).length === 0;

    setFormState((prev) => ({
      ...prev,
      errors,
      isValid,
    }));

    return isValid;
  }, [formState.values, validations]);

  // 设置字段值
  const setFieldValue = useCallback(
    (field: keyof T, value: any) => {
      setFormState((prev) => ({
        ...prev,
        values: {
          ...prev.values,
          [field]: value,
        },
      }));
    },
    []
  );

  // 设置字段触摸状态
  const setFieldTouched = useCallback(
    (field: keyof T, isTouched: boolean = true) => {
      setFormState((prev) => ({
        ...prev,
        touched: {
          ...prev.touched,
          [field]: isTouched,
        },
      }));
    },
    []
  );

  // 设置字段错误
  const setFieldError = useCallback(
    (field: keyof T, error: string | null) => {
      setFormState((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          [field]: error,
        },
        isValid: Object.values({ ...prev.errors, [field]: error }).every(
          (err) => !err
        ),
      }));
    },
    []
  );

  // 重置表单
  const resetForm = useCallback(() => {
    setFormState({
      values: initialValues,
      errors: {},
      touched: Object.keys(initialValues).reduce((acc, key) => {
        acc[key as keyof T] = false;
        return acc;
      }, {} as Record<keyof T, boolean>),
      isSubmitting: false,
      isValid: true,
    });
  }, [initialValues]);

  // 设置提交状态
  const setSubmitting = useCallback((isSubmitting: boolean) => {
    setFormState((prev) => ({
      ...prev,
      isSubmitting,
    }));
  }, []);

  // 批量设置值
  const setValues = useCallback((values: Partial<T>) => {
    setFormState((prev) => ({
      ...prev,
      values: { ...prev.values, ...values },
    }));
  }, []);

  // 批量设置错误
  const setErrors = useCallback((errors: Partial<ValidationError>) => {
    setFormState((prev) => ({
      ...prev,
      errors: { ...prev.errors, ...errors },
      isValid: Object.values({ ...prev.errors, ...errors }).every((error) => !error),
    }));
  }, []);

  // 批量设置触摸状态
  const setTouched = useCallback((touched: Partial<Record<keyof T, boolean>>) => {
    setFormState((prev) => ({
      ...prev,
      touched: { ...prev.touched, ...touched },
    }));
  }, []);

  // 处理字段变更
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target;
      const fieldValue = type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : value;

      setFieldValue(name as keyof T, fieldValue);
    },
    [setFieldValue]
  );

  // 处理字段失焦
  const handleBlur = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name } = e.target;
      setFieldTouched(name as keyof T, true);
      validateField(name as keyof T);
    },
    [setFieldTouched, validateField]
  );

  // 处理表单提交
  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      
      // 标记所有字段为已触摸
      const allTouched = Object.keys(formState.values).reduce(
        (acc, key) => {
          acc[key as keyof T] = true;
          return acc;
        },
        {} as Record<keyof T, boolean>
      );
      
      setFormState((prev) => ({
        ...prev,
        touched: allTouched,
      }));
      
      const isValid = validateAllFields();
      
      if (isValid && onSubmit) {
        setSubmitting(true);
        
        try {
          await onSubmit(formState.values, {
            setFieldValue,
            setFieldTouched,
            setFieldError,
            resetForm,
            validateField,
            validateForm: validateAllFields,
            setSubmitting,
            setValues,
            setErrors,
            setTouched,
          });
        } catch (error) {
          console.error('Form submission error:', error);
        } finally {
          setSubmitting(false);
        }
      }
    },
    [
      formState.values,
      validateAllFields,
      onSubmit,
      setFieldValue,
      setFieldTouched,
      setFieldError,
      resetForm,
      validateField,
      setSubmitting,
      setValues,
      setErrors,
      setTouched,
    ]
  );

  // 公开的表单助手和状态
  const formHelpers: FormHelpers<T> = {
    setFieldValue,
    setFieldTouched,
    setFieldError,
    resetForm,
    validateField,
    validateForm: validateAllFields,
    setSubmitting,
    setValues,
    setErrors,
    setTouched,
  };

  return {
    values: formState.values,
    errors: formState.errors,
    touched: formState.touched,
    isSubmitting: formState.isSubmitting,
    isValid: formState.isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    ...formHelpers,
  };
} 