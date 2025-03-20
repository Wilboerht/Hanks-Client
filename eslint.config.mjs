import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const compat = new FlatCompat({
  baseDirectory: __filename,
});

/** @type {import('eslint').Linter.FlatConfig[]} */
const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // 允许使用any类型
      '@typescript-eslint/no-explicit-any': 'off',
      // 允许未使用的变量
      '@typescript-eslint/no-unused-vars': 'off',
      // 允许空接口
      '@typescript-eslint/no-empty-object-type': 'off',
      // 允许未转义的实体
      'react/no-unescaped-entities': 'off',
      // 放宽React Hooks规则
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/rules-of-hooks': 'warn',
      // 允许使用img标签而不是Image组件
      '@next/next/no-img-element': 'off',
    }
  }
];

export default eslintConfig;
