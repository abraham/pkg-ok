module.exports = {
  parser: '@typescript-eslint/parser',
  env: {
    es2020: true,
    node: true,
    'jest/globals': true,
  },
  plugins: ['@typescript-eslint', 'jest'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  ignorePatterns: ['dist'],
  rules: {},
};
