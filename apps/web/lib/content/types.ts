/**
 * Modelo de conteúdo público do portal. É a forma que as páginas consomem — independente
 * de a origem ser o dataset estático migrado do site legado (`data/`) ou a Central de
 * Serviços Selecon (`CentralContentProvider`). Mantém paridade com os contratos em
 * `@selecon/contracts` (`central/publications.ts`), que são a fonte de verdade do contrato.
 */

export type ContestKind =
  | "CONCURSO_PUBLICO"
  | "PROCESSO_SELETIVO"
  | "PROCESSO_SELETIVO_SIMPLIFICADO"
  | "SELECAO_ESCOLAR"
  | "VESTIBULAR";

/** Situação pública do certame — estado de domínio, não string solta (regra 6.3). */
export type ContestPublicStatus =
  "PREVISTO" | "INSCRICOES_ABERTAS" | "EM_ANDAMENTO" | "HOMOLOGADO" | "ENCERRADO" | "SUSPENSO";

export type ContestArea =
  | "SEGURANCA"
  | "SAUDE"
  | "EDUCACAO"
  | "ADMINISTRACAO"
  | "ENGENHARIA"
  | "LEGISLATIVO"
  | "TECNICO"
  | "JURIDICO";

export type EducationLevel = "FUNDAMENTAL" | "MEDIO" | "TECNICO" | "SUPERIOR";

export type UF =
  | "AC"
  | "AL"
  | "AP"
  | "AM"
  | "BA"
  | "CE"
  | "DF"
  | "ES"
  | "GO"
  | "MA"
  | "MT"
  | "MS"
  | "MG"
  | "PA"
  | "PB"
  | "PR"
  | "PE"
  | "PI"
  | "RJ"
  | "RN"
  | "RS"
  | "RO"
  | "RR"
  | "SC"
  | "SP"
  | "SE"
  | "TO";

export interface ContestOrganization {
  name: string;
  shortName: string;
  city: string;
  uf: UF;
  sphere: "MUNICIPAL" | "ESTADUAL" | "FEDERAL" | "AUTARQUIA" | "EMPRESA_PUBLICA" | "CONSORCIO";
}

export type PublicationKind =
  | "EDITAL"
  | "RETIFICACAO"
  | "COMUNICADO"
  | "CONVOCACAO"
  | "RESULTADO"
  | "GABARITO"
  | "HOMOLOGACAO"
  | "ANEXO";

export interface ContestPublication {
  id: string;
  kind: PublicationKind;
  title: string;
  /** ISO date (YYYY-MM-DD). */
  publishedAt: string;
  /** URL do documento (no legado, PDF em selecon.org.br/wp-content; na Central, URL assinada). */
  url?: string;
  /** Indica o documento vigente (regra 9.4: o oficial nunca é substituído silenciosamente). */
  current?: boolean;
  version?: number;
}

export interface ContestMilestone {
  id: string;
  label: string;
  /** ISO date; `dateEnd` para períodos (ex.: inscrições). */
  date: string;
  dateEnd?: string;
  status: "DONE" | "CURRENT" | "UPCOMING";
  description?: string;
}

export interface ContestPosition {
  title: string;
  vacancies: number | null;
  reserve?: number | null;
  level: EducationLevel;
  salaryCents?: number | null;
  requirements?: string;
}

export interface ContestFaq {
  question: string;
  answer: string;
}

export interface ContestServiceLink {
  key:
    | "INSCRICAO"
    | "AREA_DO_CANDIDATO"
    | "BOLETO"
    | "LOCAL_DE_PROVA"
    | "RECURSO"
    | "RESULTADO"
    | "LEGADO";
  label: string;
  url: string;
  external: true;
}

export interface ContestCover {
  /** Área temática que define a arte vetorial de capa (sempre nítida, sem download externo). */
  area: ContestArea;
  /** Foto oficial em alta resolução (>= 1600px), quando fornecida pela Central de Serviços. */
  imageUrl?: string;
  imageAlt?: string;
}

export interface Contest {
  slug: string;
  title: string;
  editalNumber: string;
  kind: ContestKind;
  status: ContestPublicStatus;
  organization: ContestOrganization;
  area: ContestArea;
  summary: string;
  /** Destaques curtos para cards e hero (máx. 4). */
  highlights: string[];
  educationLevels: EducationLevel[];
  vacancies: number | null;
  reserveVacancies?: number | null;
  salaryMaxCents?: number | null;
  feeCents?: number[];
  registration: { opensAt?: string; closesAt?: string };
  examDate?: string;
  positions: ContestPosition[];
  timeline: ContestMilestone[];
  publications: ContestPublication[];
  faqs: ContestFaq[];
  serviceLinks: ContestServiceLink[];
  cover: ContestCover;
  /** URL da página no site legado (preservada para redirects 301 na migração). */
  legacyUrl?: string;
  featured?: boolean;
  /** Contagem oficial de inscritos quando divulgada. */
  registeredCandidates?: number;
  updatedAt: string;
  /** Aditivos da Central: ordem na home, SEO, vídeo, tags e seções da página (nulo = padrão). */
  homeOrder?: number;
  seo?: { title?: string; description?: string };
  videoUrl?: string;
  tags?: string[];
  pageSections?: { key: PageSectionKey; enabled: boolean; order: number }[];
}

export type PageSectionKey =
  | "resumo"
  | "numeros"
  | "video"
  | "cronograma"
  | "cargos"
  | "publicacoes"
  | "perguntas"
  | "contato"
  | "relacionados";
export const DEFAULT_PAGE_SECTIONS: { key: PageSectionKey; enabled: boolean; order: number }[] = (
  [
    "resumo",
    "numeros",
    "video",
    "cronograma",
    "cargos",
    "publicacoes",
    "perguntas",
    "contato",
    "relacionados",
  ] as PageSectionKey[]
).map((key, order) => ({ key, enabled: true, order }));

export interface NewsPost {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  category: "CONCURSOS" | "INSTITUCIONAL" | "RESULTADOS" | "COMUNICADOS";
  body: string[];
  contestSlug?: string;
  author: string;
  /** Imagem de capa em alta resolução (quando fornecida pela Central). */
  imageUrl?: string;
  imageAlt?: string;
  /** Aditivos da Central (05/10). */
  homeOrder?: number;
  tags?: string[];
  readingMinutes?: number;
  imageCredit?: string;
}

export interface ServiceLine {
  slug: string;
  title: string;
  shortTitle: string;
  icon: "landmark" | "users" | "graduation-cap" | "book-open" | "bar-chart" | "server";
  summary: string;
  description: string[];
  deliverables: string[];
  /** Exemplos de certames reais já conduzidos nessa linha. */
  cases: string[];
}

export interface ContestCatalogFilters {
  q?: string;
  status?: ContestPublicStatus | "ABERTOS" | "TODOS";
  uf?: UF;
  area?: ContestArea;
  level?: EducationLevel;
  kind?: ContestKind;
  sort?: "relevancia" | "inscricoes" | "atualizacao";
  page?: number;
}

export interface ContestCatalogResult {
  items: Contest[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  facets: {
    ufs: { value: UF; count: number }[];
    areas: { value: ContestArea; count: number }[];
    statuses: { value: ContestPublicStatus; count: number }[];
  };
}
