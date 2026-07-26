// @ts-check
import js from "@eslint/js";
import tseslint from "typescript-eslint";

/**
 * Base ESLint flat config compartilhada por todos os apps/pacotes do monorepo.
 * Cada app/pacote importa isto e adiciona overrides específicos (ex.: plugin do Next.js).
 */
export const baseConfig = tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
      "**/.turbo/**",
      "**/node_modules/**",
      "**/generated/**",
      "**/coverage/**",
    ],
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
);

export default baseConfig;
