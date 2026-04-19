import js from '@eslint/js';
import tsEslintPlugin from '@typescript-eslint/eslint-plugin';
import tsEslintParser from '@typescript-eslint/parser';
import eslintConfigPrettier from 'eslint-config-prettier';
import jest from 'eslint-plugin-jest';
import globals from 'globals';

export default [
  {
    ignores: ['dist'],
  },
  {
    ...js.configs.recommended,
    files: ['**/*.{cjs,mjs,js}'],
    languageOptions: {
      ...js.configs.recommended.languageOptions,
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsEslintParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tsEslintPlugin,
    },
    rules: {
      ...tsEslintPlugin.configs.recommended.rules,
    },
  },
  {
    ...jest.configs['flat/recommended'],
    files: ['**/*.test.ts'],
    rules: {
      ...jest.configs['flat/recommended'].rules,
      'jest/no-alias-methods': 'off',
      'jest/no-done-callback': 'off',
    },
  },
  eslintConfigPrettier,
];
