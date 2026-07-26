import { baseConfig } from "@selecon/config/eslint";

export default [
  ...baseConfig,
  {
    rules: {
      // Decorators do NestJS exigem classes vazias em alguns módulos/DTOs.
      "@typescript-eslint/no-extraneous-class": "off",
    },
  },
];
