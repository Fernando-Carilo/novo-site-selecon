import { FlatCompat } from "@eslint/eslintrc";
import { baseConfig } from "@selecon/config/eslint";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const config = [
  ...baseConfig,
  ...compat.extends("next/core-web-vitals"),
  // next-env.d.ts é gerado/gerenciado automaticamente pelo Next.js — nunca editado à mão.
  { ignores: ["next-env.d.ts"] },
  // Scripts de linha de comando imprimem relatórios no stdout por design.
  { files: ["scripts/**"], rules: { "no-console": "off" } },
];

export default config;
