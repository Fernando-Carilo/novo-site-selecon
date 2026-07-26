import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SkipLink } from "@selecon/ui";
import { HydrationMarker } from "@/components/HydrationMarker";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "Instituto Selecon",
  description: "Portal Integrado do Instituto Selecon — concursos, atendimento e integridade.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen antialiased">
        <HydrationMarker />
        <SkipLink targetId="main-content" />
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
