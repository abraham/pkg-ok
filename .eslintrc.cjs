module.exports = {
  env: {
    es2021: true,
    node: true,
    'jest/globals': true
  },
  plugins: [
    'jest'
  ],
  extends: [
    'standard'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
  }
}
