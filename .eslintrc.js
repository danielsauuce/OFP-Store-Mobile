module.exports = {
  extends: ['expo', 'prettier'],
  plugins: ['prettier', 'react', 'react-hooks', 'react-native', '@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: { jsx: true },
    project: './tsconfig.eslint.json',
    tsconfigRootDir: __dirname,
  },
  env: {
    'react-native/react-native': true,
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
    },
  },
  rules: {
    'prettier/prettier': 'error',
    'no-console': 'warn',
    '@typescript-eslint/no-unused-vars': 'error',
    'react-native/no-unused-styles': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { varsIgnorePattern: '^_' }],
  },
  ignorePatterns: [
    'node_modules/**',
    'dist/**',
    'android/**',
    'ios/**',
    '.expo/**',
    'babel.config.js',
    'metro.config.js',
    'tailwind.config.js',
    '.eslintrc.js',
  ],
};
