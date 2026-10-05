/**
 * Gera docs/migration/content-inventory.csv a partir do dataset migrado (seção 14.1).
 * Uso: pnpm --filter @selecon/web inventory
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { CONTESTS } from "../lib/content/data/contests";
import { NEWS } from "../lib/content/data/news";
import { SERVICES } from "../lib/content/data/services";
import { legacyRedirects } from "../redirects.mjs";

type Row = Record<string, string | number | undefined>;

function csv(rows: Row[], columns: string[]): string {
  const escape = (value: unknown) => {
    const text = value === undefined || value === null ? "" : String(value);
    return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return [
    columns.join(","),
    ...rows.map((row) => columns.map((c) => escape(row[c])).join(",")),
  ].join("\n");
}

const rows: Row[] = [];

for (const contest of CONTESTS) {
  rows.push({
    tipo: "concurso",
    titulo: contest.title,
    slug_novo: `/concursos/${contest.slug}`,
    url_legada: contest.legacyUrl ?? "",
    redirect_301: contest.legacyUrl ? "sim" : "n/a",
    situacao: contest.status,
    orgao: contest.organization.name,
    uf: contest.organization.uf,
    publicacoes: contest.publications.length,
    documentos_externos: contest.publications.filter((p) => p.url).length,
    links_servico: contest.serviceLinks.length,
    atualizado_em: contest.updatedAt,
    qualidade:
      contest.positions.length && contest.timeline.length
        ? "completo"
        : "parcial — complementar na Central",
  });
}
for (const post of NEWS) {
  rows.push({
    tipo: "noticia",
    titulo: post.title,
    slug_novo: `/noticias/${post.slug}`,
    url_legada: "",
    redirect_301: "n/a",
    situacao: post.category,
    orgao: "",
    uf: "",
    publicacoes: 0,
    documentos_externos: 0,
    links_servico: post.contestSlug ? 1 : 0,
    atualizado_em: post.publishedAt,
    qualidade: "completo",
  });
}
for (const service of SERVICES) {
  rows.push({
    tipo: "servico",
    titulo: service.title,
    slug_novo: `/servicos/${service.slug}`,
    url_legada: "",
    redirect_301: "n/a",
    situacao: "publicado",
    orgao: "",
    uf: "",
    publicacoes: 0,
    documentos_externos: 0,
    links_servico: 0,
    atualizado_em: "2026-10-05",
    qualidade: "completo",
  });
}
for (const redirect of legacyRedirects) {
  if (redirect.source.startsWith("/concursos/")) continue;
  rows.push({
    tipo: "pagina",
    titulo: redirect.source,
    slug_novo: redirect.destination,
    url_legada: `https://selecon.org.br${redirect.source}/`,
    redirect_301: "sim",
    situacao: "migrado",
    orgao: "",
    uf: "",
    publicacoes: 0,
    documentos_externos: 0,
    links_servico: 0,
    atualizado_em: "2026-10-05",
    qualidade: "completo",
  });
}

const columns = [
  "tipo",
  "titulo",
  "slug_novo",
  "url_legada",
  "redirect_301",
  "situacao",
  "orgao",
  "uf",
  "publicacoes",
  "documentos_externos",
  "links_servico",
  "atualizado_em",
  "qualidade",
];
const outDir = resolve(import.meta.dirname, "../../../docs/migration");
mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, "content-inventory.csv"), `${csv(rows, columns)}\n`, "utf8");
console.log(`Inventário gerado com ${rows.length} itens em docs/migration/content-inventory.csv`);
