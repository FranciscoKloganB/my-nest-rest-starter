const folderPaths = ["@article", "@auth", "@shared", "@user", "@src", "@test"]

const noUnusedVarRule = [
  "error",
  {
    vars: "all",
    varsIgnorePattern: "^_",
    args: "after-used",
    argsIgnorePattern: "^_",
    ignoreRestSiblings: true,
  },
]

module.exports = {
  env: {
    node: true,
    jest: true,
  },
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    "prettier",
  ],
  ignorePatterns: [
    // Folders
    ".github/",
    ".husky/",
    ".next/",
    ".turbo/",
    ".vscode/",
    "**/build/",
    "**/coverage/",
    "**/deploy/",
    "**/dist/",
    "**/node_modules/",
    "**/public/build/",
    "**/storybook-static/",
    // Files
    "**/.gitignore",
    "**/.env",
    "**/.envrc",
    "**/.env.*",
    "**/.eslintrc.js",
    "**/mockServiceWorker.js",
    // Extensions
    "**/*.css",
    "**/*.d.ts",
    "**/*.html",
    "**/*.md",
    "**/*.json",
  ],
  plugins: [
    "@typescript-eslint",
    "import",
    "simple-import-sort",
    "sort-keys-fix",
    "no-only-tests",
    "unused-imports",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
    sourceType: "module",
  },
  root: true,
  rules: {
    curly: "error",
    quotes: [
      "error",
      "double",
      {
        avoidEscape: false,
        allowTemplateLiterals: true,
      },
    ],
    "@typescript-eslint/consistent-type-exports": "error",
    "@typescript-eslint/consistent-type-imports": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/naming-convention": [
      "error",
      {
        "selector": "interface",
        "format": ["PascalCase"],
        "custom": {
          "regex": "^I[A-Z]",
          "match": true,
        },
      },
    ],
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": noUnusedVarRule,
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/sort-type-constituents": "error",
    /**
     * This is handled by `unused-imports/no-unused-vars` from `unused-imports` plugin
     */
    "@typescript-eslint/no-unused-vars": "off",
    /**
     * Prefers allows arrow functions expression-style over block-body when possible
     *
     * E.g.:
     * const fn = () => 1
     * const fn = () => ({})
     */
    "arrow-body-style": ["error", "as-needed"],
    "comma-dangle": ["error", "only-multiline"],
    "import/exports-last": "error",
    "import/first": "error",
    "import/group-exports": "error",
    "import/newline-after-import": "error",
    "import/no-duplicates": "error",
    "max-len": [
      "error",
      {
        code: 88,
        tabWidth: 2,
        ignoreStrings: true,
        ignoreComments: true,
        ignoreTemplateLiterals: true,
        ignoreTrailingComments: true,
        ignoreUrls: true,
      },
    ],
    "newline-before-return": "error",
    "no-only-tests/no-only-tests": "error",
    "simple-import-sort/imports": [
      "error",
      {
        groups: [
          [
            "^@nestjs",
            "^@nestjs\\/([a-z0-9]+)",
            "^nestjs",
            "^nestjs\\/([a-z0-9]+)",
            "^nestjs-([a-z0-9]+)",
            "^jest\\/([a-z0-9]+)",
            "^jest-([a-z0-9]+)",
            "^@?\\w",
          ],
          [`^(${folderPaths.join("|")})(/.*|$)`],
          ["^\\.", "^"],
          ["^\\../.", "^"],
          ["^\\../../.", "^"],
        ],
      },
    ],
    "simple-import-sort/exports": "error",
    "sort-keys-fix/sort-keys-fix": "error",
    "sort-vars": "error",
    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-vars": noUnusedVarRule,
    "prettier/prettier": ["error", { usePrettierrc: true }],
  },
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts"],
    },
    "import/resolver": {
      node: {
        extensions: [".js", ".ts"],
        project: ["./tsconfig.json"],
      },
      typescript: {
        alwaysTryTypes: true,
        project: ["./tsconfig.json"],
      },
    },
  },
}
