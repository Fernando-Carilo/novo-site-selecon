import { legacyRedirects } from "./redirects.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@selecon/ui", "@selecon/contracts"],
  images: {
    // Fotos oficiais em alta resolução servidas pela Central de Serviços / CDN (seção 13.2).
    remotePatterns: [
      { protocol: "https", hostname: "selecon.org.br" },
      { protocol: "https", hostname: "www.selecon.org.br" },
      { protocol: "https", hostname: "**.selecon.org.br" },
      ...(process.env.NEXT_IMAGE_EXTRA_HOST
        ? [{ protocol: "https", hostname: process.env.NEXT_IMAGE_EXTRA_HOST }]
        : []),
    ],
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return legacyRedirects;
  },
  // Regra 13.1: nunca indexar rascunhos, admin, área do candidato autenticada, tickets ou denúncias.
  async headers() {
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "DENY" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
      },
    ];
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
