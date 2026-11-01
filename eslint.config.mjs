import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';
import jest from 'eslint-plugin-jest';
import nodePlugin from 'eslint-plugin-n';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';

export default defineConfig(
  {
    ignores: ['dist'],
  },
  nodePlugin.configs['flat/recommended-module'],
  {
    settings: {
      n: {
        convertPath: { 'src/**/*.ts': ['^src/(.+)\\.ts$', 'dist/$1.js'] },
      },
    },
    rules: {
      'n/no-missing-import': ['error', { ignoreTypeImport: true }],
      'n/no-unpublished-import': ['error', { ignoreTypeImport: true }],
      'n/prefer-node-protocol': 'error',
    },
  },
  {
    files: ['**/*.{cjs,mjs,js}'],
    languageOptions: {
      ...js.configs.recommended.languageOptions,
      globals: {
        ...globals.node,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
    },
  },
  {
    files: ['**/*.ts'],
    extends: [tseslint.configs.strictTypeChecked, tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: fileURLToPath(new URL('.', import.meta.url)),
      },
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Allows the expect(() => fn()).toThrow() idiom
      '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
    },
  },
  {
    files: ['**/*.test.ts'],
    plugins: {
      jest,
    },
    languageOptions: {
      globals: jest.environments.globals.globals,
    },
    rules: {
      ...jest.configs['flat/recommended'].rules,
      'jest/no-alias-methods': 'off',
      'jest/no-done-callback': 'off',
    },
  },
  eslintConfigPrettier,
);
