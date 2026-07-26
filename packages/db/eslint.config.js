import { baseConfig } from "@selecon/config/eslint";

export default [
  ...baseConfig,
  {
    ignores: ["generated/**", "prisma/migrations/**"],
  },
];
