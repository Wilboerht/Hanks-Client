"use client";

import React, { forwardRef, createContext, useContext, useId } from 'react';
import { cn } from '@/lib/utils';
import { VariantProps, cva } from 'class-variance-authority';

// 创建FormControl变体
const formControlVariants = cva(
  "w-full transition-colors",
  {
    variants: {
      variant: {
        default: "border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 focus-visible:border-primary-500 dark:focus-visible:border-primary-400",
        filled: "bg-neutral-100 dark:bg-neutral-800 border-2 border-transparent rounded-md focus-visible:outline-none focus-visible:bg-transparent focus-visible:border-primary-500 dark:focus-visible:border-primary-400",
        flushed: "border-b-2 border-neutral-200 dark:border-neutral-700 rounded-none px-0 focus-visible:outline-none focus-visible:border-primary-500 dark:focus-visible:border-primary-400",
        unstyled: "border-none bg-transparent focus-visible:outline-none p-0",
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2",
        lg: "px-4 py-3 text-lg",
      },
      state: {
        error: "border-red-500 dark:border-red-500 focus-visible:border-red-500 dark:focus-visible:border-red-500 focus-visible:ring-red-500/30",
        success: "border-green-500 dark:border-green-500 focus-visible:border-green-500 dark:focus-visible:border-green-500 focus-visible:ring-green-500/30",
        warning: "border-amber-500 dark:border-amber-500 focus-visible:border-amber-500 dark:focus-visible:border-amber-500 focus-visible:ring-amber-500/30",
      },
      isDisabled: {
        true: "opacity-50 cursor-not-allowed",
      },
      isReadOnly: {
        true: "cursor-default",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

// FormContext for managing form state and layout
type FormContextValue = {
  id: string;
  labelSize?: "sm" | "md" | "lg";
  showRequiredIndicator?: boolean;
  showOptionalIndicator?: boolean;
  layout?: "vertical" | "horizontal";
};

const FormContext = createContext<FormContextValue | undefined>(undefined);

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    return { id: "", labelSize: "md", layout: "vertical", showRequiredIndicator: true, showOptionalIndicator: false };
  }
  return context;
};

// Form
interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  id?: string;
  labelSize?: "sm" | "md" | "lg";
  showRequiredIndicator?: boolean;
  showOptionalIndicator?: boolean;
  layout?: "vertical" | "horizontal";
}

const Form = forwardRef<HTMLFormElement, FormProps>(
  ({ 
    id, 
    labelSize = "md", 
    showRequiredIndicator = true, 
    showOptionalIndicator = false, 
    layout = "vertical",
    className, 
    children, 
    ...props 
  }, ref) => {
    const formId = useId();
    const contextValue = {
      id: id || formId,
      labelSize,
      showRequiredIndicator,
      showOptionalIndicator,
      layout,
    };

    return (
      <FormContext.Provider value={contextValue}>
        <form 
          ref={ref} 
          id={id || formId} 
          className={cn("space-y-4", className)} 
          {...props}
        >
          {children}
        </form>
      </FormContext.Provider>
    );
  }
);

Form.displayName = "Form";

// FormGroup
interface FormGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  id?: string;
  label?: string;
  subLabel?: string;
  htmlFor?: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  hint?: string;
}

const FormGroup = forwardRef<HTMLDivElement, FormGroupProps>(
  ({ id, label, subLabel, htmlFor, required, optional, error, hint, className, children, ...props }, ref) => {
    const form = useFormContext();
    const groupId = id || `form-group-${useId()}`;
    const labelId = `${groupId}-label`;
    const descriptionId = hint ? `${groupId}-description` : undefined;
    const errorId = error ? `${groupId}-error` : undefined;

    const labelSizeClass: Record<string, string> = {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    };

    return (
      <div 
        ref={ref}
        id={groupId}
        className={cn(
          "w-full",
          form.layout === "horizontal" ? "sm:flex sm:items-start sm:gap-4" : "",
          className
        )} 
        {...props}
      >
        {label && (
          <div className={form.layout === "horizontal" ? "sm:w-1/3 pt-2" : ""}>
            <label 
              id={labelId} 
              htmlFor={htmlFor} 
              className={cn(
                "block font-medium text-neutral-900 dark:text-neutral-100 mb-1",
                labelSizeClass[form.labelSize || "md"]
              )}
            >
              {label}
              {required && form.showRequiredIndicator && (
                <span className="ml-1 text-red-500">*</span>
              )}
              {optional && form.showOptionalIndicator && (
                <span className="ml-1 text-sm text-neutral-500 dark:text-neutral-400 font-normal">
                  (可选)
                </span>
              )}
            </label>
            {subLabel && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 -mt-1 mb-1">
                {subLabel}
              </p>
            )}
          </div>
        )}
        
        <div className={cn(
          "w-full", 
          form.layout === "horizontal" && label ? "sm:w-2/3" : "w-full"
        )}>
          {children}
          
          {hint && !error && (
            <p 
              id={descriptionId} 
              className="mt-1 text-sm text-neutral-500 dark:text-neutral-400"
            >
              {hint}
            </p>
          )}
          
          {error && (
            <p 
              id={errorId} 
              className="mt-1 text-sm text-red-600 dark:text-red-400"
            >
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }
);

FormGroup.displayName = "FormGroup";

// Input
interface InputProps 
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">, 
    VariantProps<typeof formControlVariants> {
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    size, 
    state, 
    isDisabled, 
    isReadOnly,
    leftElement,
    rightElement,
    type = "text",
    ...props 
  }, ref) => {
    return (
      <div className="relative w-full">
        {leftElement && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-500 dark:text-neutral-400">
            {leftElement}
          </div>
        )}
        
        <input
          type={type}
          ref={ref}
          disabled={isDisabled === true || undefined}
          readOnly={isReadOnly === true || undefined}
          className={cn(
            formControlVariants({ variant, size, state, isDisabled, isReadOnly }),
            leftElement && "pl-10",
            rightElement && "pr-10",
            className
          )}
          {...props}
        />
        
        {rightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-neutral-500 dark:text-neutral-400">
            {rightElement}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

// Textarea
interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size">,
    VariantProps<typeof formControlVariants> {}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, size, state, isDisabled, isReadOnly, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        disabled={isDisabled === true || undefined}
        readOnly={isReadOnly === true || undefined}
        className={cn(
          formControlVariants({ variant, size, state, isDisabled, isReadOnly }),
          "min-h-[80px] resize-vertical",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

// Select
interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size">,
    VariantProps<typeof formControlVariants> {
  options?: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    className, 
    variant, 
    size, 
    state, 
    isDisabled, 
    isReadOnly,
    children,
    options,
    placeholder,
    ...props 
  }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          disabled={isDisabled === true || undefined}
          className={cn(
            formControlVariants({ variant, size, state, isDisabled, isReadOnly }),
            "appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%3E%3Cpath%20d%3D%22M10.3%203.3L6%207.6%201.7%203.3c-.4-.4-1-.4-1.4%200-.4.4-.4%201%200%201.4l5%205c.4.4%201%20.4%201.4%200l5-5c.4-.4.4-1%200-1.4-.4-.4-1-.4-1.4%200z%22%20fill%3D%22%23777%22%20aria-hidden%3D%22true%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-right-[.75rem] bg-center-y pr-10",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          
          {options
            ? options.map((option) => (
                <option 
                  key={option.value} 
                  value={option.value} 
                  disabled={option.disabled}
                >
                  {option.label}
                </option>
              ))
            : children}
        </select>
      </div>
    );
  }
);

Select.displayName = "Select";

// Checkbox
interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const checkboxId = id || useId();
    
    return (
      <div className="flex items-center">
        <input
          id={checkboxId}
          type="checkbox"
          ref={ref}
          className={cn(
            "h-4 w-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-800 dark:checked:bg-primary-600 dark:focus:ring-primary-500 dark:focus:ring-offset-neutral-900",
            className
          )}
          {...props}
        />
        {label && (
          <label
            htmlFor={checkboxId}
            className="ml-2 block text-sm text-neutral-900 dark:text-neutral-100"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

// RadioGroup
interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  name: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  options?: RadioOption[];
  orientation?: "horizontal" | "vertical";
  gap?: "sm" | "md" | "lg";
}

const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ 
    className, 
    name, 
    value, 
    defaultValue, 
    onChange, 
    options = [], 
    orientation = "vertical",
    gap = "md",
    children,
    ...props 
  }, ref) => {
    const groupId = useId();
    
    const gapClass: Record<string, string> = {
      sm: orientation === "vertical" ? "space-y-1" : "space-x-2",
      md: orientation === "vertical" ? "space-y-2" : "space-x-4",
      lg: orientation === "vertical" ? "space-y-3" : "space-x-6",
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    };
    
    return (
      <div
        ref={ref}
        role="radiogroup"
        className={cn(
          "w-full",
          orientation === "horizontal" ? "flex items-center" : "flex flex-col",
          gapClass[gap],
          className
        )}
        {...props}
      >
        {options.length > 0
          ? options.map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  type="radio"
                  id={`${groupId}-${option.value}`}
                  name={name}
                  value={option.value}
                  checked={value === option.value}
                  defaultChecked={defaultValue === option.value}
                  onChange={handleChange}
                  disabled={option.disabled}
                  className="h-4 w-4 text-primary-600 border-neutral-300 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-800 dark:checked:bg-primary-600 dark:focus:ring-primary-500 dark:focus:ring-offset-neutral-900"
                />
                <label
                  htmlFor={`${groupId}-${option.value}`}
                  className="ml-2 block text-sm text-neutral-900 dark:text-neutral-100"
                >
                  {option.label}
                </label>
              </div>
            ))
          : children}
      </div>
    );
  }
);

RadioGroup.displayName = "RadioGroup";

// Switch
interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: string;
  description?: string;
  size?: "sm" | "md" | "lg";
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, id, size = "md", ...props }, ref) => {
    const switchId = id || useId();
    
    const sizeClasses: Record<string, string> = {
      sm: "h-4 w-7 after:h-3 after:w-3 after:translate-x-3",
      md: "h-5 w-9 after:h-4 after:w-4 after:translate-x-4",
      lg: "h-6 w-11 after:h-5 after:w-5 after:translate-x-5",
    };
    
    return (
      <div className="flex items-center">
        <input
          id={switchId}
          type="checkbox"
          ref={ref}
          className={cn(
            "appearance-none rounded-full bg-neutral-300 dark:bg-neutral-600 checked:bg-primary-600 dark:checked:bg-primary-600 relative transition-colors duration-200 ease-in-out cursor-pointer",
            // After pseudo-element for the switch handle
            "after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:transition-transform after:duration-200 after:ease-in-out",
            // Hover and focus states
            "hover:bg-neutral-400 dark:hover:bg-neutral-500 checked:hover:bg-primary-700 dark:checked:hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-neutral-900",
            // Size variations
            sizeClasses[size],
            className
          )}
          {...props}
        />
        {(label || description) && (
          <div className="ml-3">
            {label && (
              <label
                htmlFor={switchId}
                className="text-sm font-medium text-neutral-900 dark:text-neutral-100"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Switch.displayName = "Switch";

// Export components
export { Form, FormGroup, Input, Textarea, Select, Checkbox, RadioGroup, Switch }; 