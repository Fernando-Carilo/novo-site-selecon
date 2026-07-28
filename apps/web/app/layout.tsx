import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { HydrationMarker } from "@/components/HydrationMarker";
import { SiteChrome } from "@/components/SiteChrome";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Instituto Selecon",
  description: "Portal Integrado do Instituto Selecon — concursos, atendimento e integridade.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="min-h-screen font-sans antialiased">
        <HydrationMarker />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
