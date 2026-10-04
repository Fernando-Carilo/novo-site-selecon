/**
 * Conteúdo público vindo da Selecon Central (CRM de atendimento), que gere as
 * publicações e decide quais certames aparecem no site, com o ProSeleta como
 * base. Endpoints: /public/content/news, /public/content/pages/:slug,
 * /public/contests, /public/contests/:slug.
 *
 * Configuração: CONTENT_API_URL (ex.: https://atendimento.selecon.org.br/api).
 * Sem ela, as funções devolvem vazio e as páginas mostram estado honesto —
 * nunca conteúdo inventado.
 */
const BASE = (process.env.CONTENT_API_URL ?? "").trim().replace(/\/+$/, "");

export const isCentralConfigured = () => BASE.length > 0;

export type NewsSummary = {
  id: string;
  slug: string;
  title: string;
  categoryName: string | null;
  publishedAt: string | null;
  updatedAt: string;
  summary: string | null;
  bodyFormat: "TEXT" | "HTML";
  coverUrl: string | null;
  contest: { name: string; slug: string | null } | null;
};
export type NewsDetail = NewsSummary & { body: string };
export type PageDetail = {
  id: string;
  slug: string;
  title: string;
  body: string;
  bodyFormat: "TEXT" | "HTML";
  summary: string | null;
  publishedAt: string | null;
  updatedAt: string;
};
export type ContestSummary = {
  id: string;
  slug: string;
  title: string;
  organization: string;
  status: "PUBLISHED" | "SUSPENDED" | "CLOSED" | "ARCHIVED";
  shortDescription: string;
  registrationOpensAt: string | null;
  registrationClosesAt: string | null;
  examDate: string | null;
  updatedAt: string;
  fullName: string;
  city: string | null;
  state: string | null;
  featured: boolean;
  milestoneCount: number;
};
export type ContestDetail = ContestSummary & {
  publishedAt: string | null;
  faqs: { id: string; question: string; answer: string; order: number }[];
  milestones: {
    id: string;
    label: string;
    date: string | null;
    description: string | null;
    status: string;
  }[];
  documents: {
    id: string;
    title: string;
    type: string | null;
    url: string;
    publicDate: string | null;
  }[];
};

async function get<T>(path: string): Promise<T | null> {
  if (!BASE) return null;
  try {
    const response = await fetch(`${BASE}${path}`, {
      next: { revalidate: 60 },
      headers: { accept: "application/json" },
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return (await response.json()) as T;
  } catch (error) {
    console.error(`[central] falha em ${path}:`, error instanceof Error ? error.message : error);
    return null;
  }
}

export const listNews = async (limit = 100) =>
  (await get<NewsSummary[]>(`/public/content/news?limit=${limit}`)) ?? [];
export const getNews = (slug: string) =>
  get<NewsDetail>(`/public/content/news/${encodeURIComponent(slug)}`);
export const getPage = (slug: string) =>
  get<PageDetail>(`/public/content/pages/${encodeURIComponent(slug)}`);
export const listContests = async (
  opts: { q?: string; status?: string; featured?: boolean } = {},
) => {
  const qs = new URLSearchParams();
  if (opts.q) qs.set("q", opts.q);
  if (opts.status) qs.set("status", opts.status);
  if (opts.featured) qs.set("featured", "1");
  const s = qs.toString();
  return (await get<ContestSummary[]>(`/public/contests${s ? `?${s}` : ""}`)) ?? [];
};
export const getContest = (slug: string) =>
  get<ContestDetail>(`/public/contests/${encodeURIComponent(slug)}`);

/* ─── Apresentação ──────────────────────────────────────────────── */
export function formatDate(
  iso: string | null | undefined,
  opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "2-digit", year: "numeric" },
) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  // Datas de cronograma chegam como meia-noite UTC: formatar em UTC evita "véspera" no Brasil.
  return d.toLocaleDateString("pt-BR", { timeZone: "UTC", ...opts });
}

/** Fase do certame derivada só de dados existentes (nunca de suposição). */
export function contestPhase(c: ContestSummary): {
  label: string;
  tone: "blue" | "green" | "neutral" | "red";
} {
  const today = new Date(new Date().toISOString().slice(0, 10));
  const closes = c.registrationClosesAt ? new Date(c.registrationClosesAt) : null;
  const opens = c.registrationOpensAt ? new Date(c.registrationOpensAt) : null;
  const exam = c.examDate ? new Date(c.examDate) : null;
  if (c.status === "SUSPENDED") return { label: "Suspenso", tone: "red" };
  if (c.status === "CLOSED") return { label: "Encerrado", tone: "neutral" };
  if (c.status === "ARCHIVED") return { label: "Arquivado", tone: "neutral" };
  if (opens && opens > today)
    return { label: `Inscrições a partir de ${formatDate(c.registrationOpensAt)}`, tone: "blue" };
  if (closes && closes >= today)
    return { label: `Inscrições até ${formatDate(c.registrationClosesAt)}`, tone: "green" };
  if (exam && exam >= today) return { label: `Prova em ${formatDate(c.examDate)}`, tone: "blue" };
  return { label: "Em andamento", tone: "blue" };
}
