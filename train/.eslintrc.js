module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  extends: ['plugin:@typesript-eslint/recommended'],
  env: { 'node': true },
  rules: {
    indent: 'off',
    '@typescirpt-eslint/indent': 'off'
  }
}
