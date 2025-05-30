// .eslintrc.js
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'next',
    'next/core-web-vitals',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:unused-imports/recommended',
  ],
  plugins: ['react', 'react-hooks', 'unused-imports'],
  rules: {
    // React Hook 安全性
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // 自動移除未使用的 import/變數
    'unused-imports/no-unused-imports': 'warn',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_', // 允許 _開頭的變數不被視為未使用
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],

    // 其他推薦設置
    'no-console': 'warn', // 可選，避免意外保留 console.log
    'no-constant-condition': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
