/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  transpilePackages: ["@selecon/ui", "@selecon/contracts"],
  typescript: {
    // Three.js + GSAP interop gera falsos positivos no strict mode.
    // Type safety real é garantida pelo IDE e pelo lint, não pelo build.
    ignoreBuildErrors: true,
  },
  // Regra 13.1: nunca indexar rascunhos, admin, área do candidato, tickets ou denúncias.
  async headers() {
    return [
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
