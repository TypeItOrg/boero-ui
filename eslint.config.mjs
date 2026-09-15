import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx,mts}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [{ group: ["./**", "../**"], message: "Usá los aliases @features, @common, @app o @/." }] }],
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
        { selector: "Property[key.name=/^(message|error)$/][value.type='Literal']", message: "Centralizá los mensajes en ENROLLMENT_MESSAGES." },
        {
          selector: "Property[key.name=/^(message|error)$/][value.type='TemplateLiteral']",
          message: "Centralizá los mensajes parametrizados en ENROLLMENT_MESSAGES.",
        },
        { selector: "NewExpression[callee.name='Error'] > Literal", message: "Usá una constante del catálogo de mensajes." },
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
  ]),
]);

export default eslintConfig;
