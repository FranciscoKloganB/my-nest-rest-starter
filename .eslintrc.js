const folderPaths = ['@article', '@auth', '@shared', '@user', '@src'];

const noUnusedVarRule = [
  'error',
  {
    vars: 'all',
    varsIgnorePattern: '^_',
    args: 'after-used',
    argsIgnorePattern: '^_',
    ignoreRestSiblings: true,
  },
];

module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint/eslint-plugin',
    'simple-import-sort',
    'import',
    'unused-imports',
    'prettier',
  ],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'prettier',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    curly: 'error',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': noUnusedVarRule,
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': noUnusedVarRule,
    'simple-import-sort/exports': 'error',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    'simple-import-sort/imports': [
      'warn',
      {
        groups: [
          [
            '^@nestjs',
            '^@nestjs\\/([a-z0-9]+)',
            '^nestjs',
            '^nestjs\\/([a-z0-9]+)',
            '^nestjs-([a-z0-9]+)',
            '^jest\\/([a-z0-9]+)',
            '^jest-([a-z0-9]+)',
            '^@?\\w',
          ],
          [`^(${folderPaths.join('|')})(/.*|$)`],
          ['^\\.', '^'],
        ],
      },
    ],
    'prettier/prettier': ['error', { usePrettierrc: true }],
  },
};
