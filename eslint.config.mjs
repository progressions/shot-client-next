import globals from "globals"
import pluginJs from "@eslint/js"
import tseslint from "typescript-eslint"
import pluginReact from "eslint-plugin-react"
import { FlatCompat } from "@eslint/eslintrc"
import unusedImports from "eslint-plugin-unused-imports"
import eslintPluginImport from "eslint-plugin-import"

const compat = new FlatCompat({
  // import.meta.dirname is available after Node.js v20.11.0
  baseDirectory: import.meta.dirname,
})

/** @type {import("eslint").Linter.Config[]} */
const config = [
  { ignores: [".next/**", "public/**", "next.config.js", "postcss.config.js"] },
  { files: ["**/*.{mjs,cjs,ts,tsx}"] },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  ...compat.config({
    extends: ["next"],
    settings: {
      next: {
        rootDir: ".",
      },
    },
  }),
  ...compat.config({
    extends: ["plugin:drizzle/all"],
  }),
  {
    plugins: {
          "unused-imports": unusedImports,
          "eslint-plugin-import": eslintPluginImport,
        },
  },
  {
    rules: {
      "no-undef": 0,
      "no-console": "off",
      "react/react-in-jsx-scope": "off",
      "no-prototype-builtins": "off",
      "drizzle/enforce-delete-with-where": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ]
    },
  },
  {
    files: ["**/*.{tsx}"],
    rules: {
      "no-console": "off",
      "no-prototype-builtins": "off",
      "drizzle/enforce-delete-with-where": "off",
      "import/no-unresolved": "error",
      "import/named": "error",
      "import/no-extraneous-dependencies": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-argument": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/strict-boolean-expressions": "error",
    },
  },
  {
    // Less strict rules for test files
    files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}", "**/test-utils*.tsx", "**/__tests__/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/strict-boolean-expressions": "off",
    },
  },
]
export default config
