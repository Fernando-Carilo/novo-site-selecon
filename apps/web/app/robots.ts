import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** Seção 13.1: nunca indexar admin, área do candidato autenticada, tickets ou denúncias. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/atendimento/protocolo/", "/denuncias/consulta"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
