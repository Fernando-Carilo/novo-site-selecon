import type { Metadata } from "next";
import type { ReactNode } from "react";
import { HydrationMarker } from "@/components/HydrationMarker";
import { SiteChrome } from "@/components/SiteChrome";
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
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
