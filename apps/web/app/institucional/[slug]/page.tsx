import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ContentPageDetail } from "@selecon/contracts";
import { fetchApiOrNull } from "@/lib/api-server";
import { PublicationBody } from "@/components/content/PublicationBody";

// Campo extra enviado pela Selecon Central (ausente no apps/api local).
type PageFromCentral = ContentPageDetail & { bodyFormat?: "TEXT" | "HTML" | null };

async function getPage(slug: string): Promise<PageFromCentral | null> {
  return fetchApiOrNull<PageFromCentral>(`/public/content/pages/${slug}`);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return { title: "Página não encontrada | Instituto Selecon" };
  return { title: `${page.title} | Instituto Selecon` };
}

export default async function InstitutionalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-navy-primary text-3xl font-bold">{page.title}</h1>
      <PublicationBody body={page.body} format={page.bodyFormat} />
    </article>
  );
}
