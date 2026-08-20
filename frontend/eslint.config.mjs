import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { FlatCompat } from '@eslint/eslintrc';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  eslintPluginPrettierRecommended,
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
    ],
  },
  {
    rules: {
      // CLAUDE.md: no `any` outside narrowly-scoped casts.
      '@typescript-eslint/no-explicit-any': 'error',
      // Windows-чекаути дають CRLF — інакше весь файл червоний.
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
];

export default eslintConfig;
