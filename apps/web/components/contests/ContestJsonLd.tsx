import type { Contest } from "@/lib/content/types";
import { SITE_NAME, SITE_URL } from "@/lib/site";

interface ContestJsonLdProps {
  contest: Contest;
}

/**
 * Dados estruturados da página do edital (seção 9.4 / 13): `BreadcrumbList` para a trilha e
 * `WebPage` com datas e o órgão responsável. Apenas fatos do dataset — nada inferido.
 */
export function ContestJsonLd({ contest }: ContestJsonLdProps) {
  const pageUrl = `${SITE_URL}/concursos/${contest.slug}`;
  const firstPublication = contest.publications
    .map((publication) => publication.publishedAt)
    .filter((date): date is string => Boolean(date))
    .sort()
    .at(0);

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Concursos", item: `${SITE_URL}/concursos` },
      { "@type": "ListItem", position: 3, name: contest.title, item: pageUrl },
    ],
  };

  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": pageUrl,
    url: pageUrl,
    name: contest.title,
    description: contest.summary,
    inLanguage: "pt-BR",
    ...(firstPublication ? { datePublished: firstPublication } : {}),
    dateModified: contest.updatedAt,
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    about: {
      "@type": "GovernmentOrganization",
      name: contest.organization.name,
      address: {
        "@type": "PostalAddress",
        addressLocality: contest.organization.city,
        addressRegion: contest.organization.uf,
        addressCountry: "BR",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }}
      />
    </>
  );
}
