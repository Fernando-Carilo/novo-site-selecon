import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { SkipLink } from "@selecon/ui";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import "./globals.css";

// Fonte auto-hospedada pelo Next (sem requisição ao Google em runtime — regra 13.1/13.2).
// A variável é lida pelo token `--font-family-base` em `@selecon/ui/tokens.css`.
const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-inter",
});

const SITE_NAME = "Instituto Selecon";
const SITE_DESCRIPTION =
  "Portal do Instituto Selecon — concursos públicos, notícias, área do candidato, atendimento e canal de integridade em um único lugar.";

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — Concursos públicos, atendimento e integridade`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Portal Integrado`,
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#071b3d",
  width: "device-width",
  initialScale: 1,
};

// Conteúdo e canais vêm da Selecon Central e de variáveis do ambiente de execução
// (não do build): toda rota é renderizada por requisição, com cache de 60 s nas
// chamadas à Central (lib/central.ts).
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="flex min-h-screen flex-col antialiased">
        <SkipLink targetId="main-content" />
        <SiteHeader />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <WhatsAppButton />
      </body>
    </html>
  );
}
