module.exports = {
  root: true,
  extends: ['universe/native', 'plugin:react-hooks/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  env: { es6: true, node: true, jest: true },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '.expo/',
    '*.md',
    '*.json',
    '.serena/',
    'docs/',
    'WARP.md*',
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    // パフォーマンス関連
    'react-hooks/exhaustive-deps': 'warn',
    'react/jsx-no-constructed-context-values': 'warn',
    // コード品質
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    'prefer-const': 'error',
    // 一般的なルール
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
};
