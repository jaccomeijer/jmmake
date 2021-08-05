module.exports = {
  env: {
    browser: true,
    node: true,
  },
  ignorePatterns: ['/**/node_modules/*', '/**/*.js', '/**/build/*'],
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,
    '@typescript-eslint/no-non-null-assertion': 0,
    '@typescript-eslint/camelcase': 0,
    'import/order': 2,
    'import/no-unresolved': 0,
  },
}
