import globals from "globals"
import pluginJs from "@eslint/js"
import tseslint from "typescript-eslint"
import pluginReact from "eslint-plugin-react"
import pluginReactHooks from "eslint-plugin-react-hooks"
import unusedImports from "eslint-plugin-unused-imports"
import eslintPluginImport from "eslint-plugin-import"

/** @type {import("eslint").Linter.Config[]} */
const config = [
  { ignores: [".next/**", "public/**", "next.config.js", "postcss.config.js"] },
  { files: ["**/*.{mjs,cjs,ts,tsx}"] },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    plugins: {
      import: eslintPluginImport,
      "unused-imports": unusedImports,
      "react-hooks": pluginReactHooks,
    },
  },
  {
    rules: {
      "no-undef": 0,
      "no-console": "off",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/no-unknown-property": ["error", { ignore: ["jsx", "global"] }],
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
      ],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
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
      "no-restricted-imports": "off",
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
  {
    // Disallow self-barrel imports that create cycles
    files: ["src/components/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        { paths: ["@/components/ui"] },
      ],
      "import/no-cycle": ["warn", { ignoreExternal: true }],
    },
  },
  {
    files: ["src/contexts/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        { paths: ["@/contexts"] },
      ],
      "import/no-cycle": ["warn", { ignoreExternal: true }],
    },
  },
  {
    files: ["src/hooks/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        { paths: ["@/hooks"] },
      ],
      "import/no-cycle": ["warn", { ignoreExternal: true }],
    },
  },
  {
    files: ["src/lib/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        { paths: ["@/lib"] },
      ],
      "import/no-cycle": ["warn", { ignoreExternal: true }],
    },
  },
  {
    files: ["src/types/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        { paths: ["@/types"] },
      ],
      "import/no-cycle": ["warn", { ignoreExternal: true }],
    },
  },
  {
    // Allow barrels to aggregate within their own folder
    files: [
      "src/components/ui/**/index.{ts,tsx}",
      "src/contexts/index.{ts,tsx}",
      "src/hooks/index.{ts,tsx}",
      "src/lib/index.{ts,tsx}",
      "src/types/index.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": "off",
    },
  },
  {
    // Relax restrictions in tests to allow flexible imports
    files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}", "**/__tests__/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
]
export default config
