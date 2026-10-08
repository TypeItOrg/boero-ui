import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const explicitImportRestrictions = [
  {
    selector: "ImportNamespaceSpecifier",
    message: "Usá imports explícitos; no se permiten imports wildcard.",
  },
  {
    selector: "ImportDeclaration[source.value='react'] > ImportDefaultSpecifier",
    message: "Importá los miembros de React por nombre, nunca su exportación default.",
  },
  {
    selector: "ImportDeclaration[source.value='react'] > ImportSpecifier[imported.name='default']",
    message: "Importá los miembros de React por nombre, nunca su exportación default.",
  },
  {
    selector: "MemberExpression[object.name='React']",
    message: "Importá el miembro directamente desde react, sin usar React.algo.",
  },
  {
    selector: "TSQualifiedName[left.name='React']",
    message: "Importá el tipo directamente desde react, sin usar React.algo.",
  },
];

const statementPaddingRules = [
  { blankLine: "always", prev: "*", next: ["block-like", "function", "class"] },
  { blankLine: "always", prev: ["block-like", "function", "class"], next: "*" },
  { blankLine: "always", prev: "*", next: "return" },
  { blankLine: "always", prev: "directive", next: "import" },
  { blankLine: "always", prev: "import", next: "*" },
  { blankLine: "any", prev: "import", next: "import" },
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,mts}"],
    rules: {
      curly: ["error", "all"],
      "import/first": "error",
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index", "object"],
          pathGroups: [
            { pattern: "react", group: "builtin", position: "before" },
            { pattern: "next{,/**}", group: "external", position: "before" },
            { pattern: "@common/**", group: "internal", position: "before" },
            { pattern: "@features/**", group: "internal", position: "before" },
            { pattern: "@app/**", group: "internal", position: "before" },
            { pattern: "@/**", group: "internal", position: "after" },
          ],
          pathGroupsExcludedImportTypes: ["object"],
          distinctGroup: true,
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "no-restricted-syntax": ["error", ...explicitImportRestrictions],
      "padding-line-between-statements": ["error", ...statementPaddingRules],
    },
  },
  {
    files: ["src/**/*.{ts,tsx,mts}"],
    ignores: ["**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "padding-line-between-statements": [
        "error",
        ...statementPaddingRules,
        { blankLine: "always", prev: "*", next: ["multiline-const", "multiline-let", "multiline-var"] },
        { blankLine: "always", prev: ["multiline-const", "multiline-let", "multiline-var"], next: "*" },
        { blankLine: "always", prev: ["const", "let", "var"], next: ["expression", "if", "switch", "for", "while", "try"] },
        { blankLine: "always", prev: "expression", next: ["const", "let", "var"] },
      ],
    },
  },
  {
    files: ["src/common/hooks/**/*.{ts,tsx}", "src/features/*/hooks/**/*.{ts,tsx}"],
    ignores: ["**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "no-nested-ternary": "error",
    },
  },
  {
    files: ["src/**/*.{ts,tsx,mts}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [{ group: ["./**", "../**"], message: "Usá los aliases @features, @common, @app o @/." }],
        },
      ],
    },
  },
  {
    files: ["src/**/*.{ts,tsx,mts}"],
    ignores: ["**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "max-lines": ["error", { max: 200, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    files: [
      "src/features/enrollment-applications/**/*.{ts,tsx}",
      "src/features/enrollment-periods/**/*.{ts,tsx}",
      "src/app/api/enrollment-applications/**/*.ts",
    ],
    ignores: ["**/*.test.ts", "**/*.test.tsx", "**/constants/**"],
    rules: {
      curly: ["error", "all"],
      "no-restricted-syntax": [
        "error",
        ...explicitImportRestrictions,
        {
          selector: "Property[key.name=/^(message|error)$/][value.type='Literal']",
          message: "Centralizá los mensajes en ENROLLMENT_MESSAGES.",
        },
        {
          selector: "Property[key.name=/^(message|error)$/][value.type='TemplateLiteral']",
          message: "Centralizá los mensajes parametrizados en ENROLLMENT_MESSAGES.",
        },
        {
          selector: "NewExpression[callee.name='Error'] > Literal",
          message: "Usá una constante del catálogo de mensajes.",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "coverage/**",
  ]),
]);

export default eslintConfig;
