import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ContentPageDetail } from "@selecon/contracts";
import { fetchApiOrNull } from "@/lib/api-server";
import { PublicationBody } from "@/components/content/PublicationBody";

export const metadata: Metadata = {
  title: "Termos de Uso | Instituto Selecon",
  robots: { index: true, follow: true },
};

export default async function TermsOfUsePage() {
  const page = await fetchApiOrNull<ContentPageDetail & { bodyFormat?: "TEXT" | "HTML" | null }>(
    "/public/content/pages/termos-de-uso",
  );
  if (!page) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-navy-primary text-3xl font-bold">{page.title}</h1>
      <PublicationBody body={page.body} format={page.bodyFormat} />
    </article>
  );
}
