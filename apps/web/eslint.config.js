import { FlatCompat } from "@eslint/eslintrc";
import { baseConfig } from "@selecon/config/eslint";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const config = [
  ...baseConfig,
  ...compat.extends("next/core-web-vitals"),
  // next-env.d.ts é gerado/gerenciado automaticamente pelo Next.js — nunca editado à mão.
  { ignores: ["next-env.d.ts"] },
];

export default config;
