import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage } from "@/lib/central";
import { PublicationBody } from "@/components/content/PublicationBody";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return { title: "Página não encontrada" };
  return { title: page.title, description: page.summary ?? undefined };
}

/** Páginas institucionais (Quem somos, Transparência, Política de privacidade…) publicadas na Central. */
export default async function InstitutionalPage({ params }: Params) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <p className="text-action-blue text-xs font-semibold uppercase tracking-[0.12em]">
        Instituto Selecon
      </p>
      <h1 className="text-navy-primary mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        {page.title}
      </h1>
      {page.summary ? (
        <p className="text-text-secondary mt-4 text-lg leading-relaxed">{page.summary}</p>
      ) : null}
      <PublicationBody body={page.body} format={page.bodyFormat} />
    </article>
  );
}
