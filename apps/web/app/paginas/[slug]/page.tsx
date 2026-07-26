import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ContentPageDetail } from "@selecon/contracts";
import { fetchApiOrNull } from "@/lib/api-server";

async function getPage(slug: string): Promise<ContentPageDetail | null> {
  return fetchApiOrNull<ContentPageDetail>(`/public/content/pages/${slug}`);
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
      <div className="text-text-primary mt-6 whitespace-pre-wrap text-base leading-relaxed">
        {page.body}
      </div>
    </article>
  );
}
