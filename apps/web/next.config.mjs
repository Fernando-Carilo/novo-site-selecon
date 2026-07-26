/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@selecon/ui", "@selecon/contracts"],
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
