/**
 * Redirects 301 das URLs do site atual (WordPress, selecon.org.br) para as rotas do novo
 * portal — preservação de SEO e de links já publicados (seções 13.1 e 14.2 do prompt mestre).
 * Mantenha em sincronia com `lib/content/data/contests.ts` (campo `legacyUrl`) e com
 * `docs/migration/content-inventory.csv`.
 */
export const legacyRedirects = [
  // Institucional
  { source: "/a-instituicao", destination: "/instituto", permanent: true },
  { source: "/apresentacao", destination: "/instituto", permanent: true },
  { source: "/objetivo", destination: "/instituto", permanent: true },
  { source: "/contato", destination: "/comercial", permanent: true },
  { source: "/fale-conosco-2", destination: "/fale-conosco", permanent: true },
  // Concursos (slugs do WordPress → slugs do novo catálogo)
  {
    source: "/concursos/edital-001-2026-gm-nivel_ii-pmsg-2026",
    destination: "/concursos/guarda-municipal-sao-goncalo-2026",
    permanent: true,
  },
  {
    source: "/concursos/sejuspmg",
    destination: "/concursos/sejusp-mg-policia-penal",
    permanent: true,
  },
  {
    source: "/concursos/edital-no-01-2026-emgepron",
    destination: "/concursos/emgepron-2026",
    permanent: true,
  },
  {
    source: "/concursos/edital-001-2026-pmba",
    destination: "/concursos/aracas-ba-2026",
    permanent: true,
  },
  {
    source: "/concursos/concurso-guarda-civil-municipal-de-niteroi-rj",
    destination: "/concursos/guarda-civil-municipal-niteroi",
    permanent: true,
  },
  {
    source: "/concursos/edital-01-2025-pmbg",
    destination: "/concursos/barra-do-garcas-2025",
    permanent: true,
  },
  {
    source: "/concursos/edital-01-2025-ion-emusa",
    destination: "/concursos/ion-niteroi-2025",
    permanent: true,
  },
  {
    source: "/concursos/edital-001-2025-cides",
    destination: "/concursos/cides-vrc-2025",
    permanent: true,
  },
  {
    source: "/concursos/edital-12-2025-seciteci-mt",
    destination: "/concursos/seciteci-mt-2025",
    permanent: true,
  },
  {
    source: "/concursos/edital-01-2025-tapurah",
    destination: "/concursos/tapurah-2025",
    permanent: true,
  },
  {
    source: "/concursos/edital-01-2025-nobres",
    destination: "/concursos/nobres-2025",
    permanent: true,
  },
  {
    source: "/concursos/edital-008-2025-gs-seduc-mt",
    destination: "/concursos/seduc-mt-apoio-educacao-especial-2025",
    permanent: true,
  },
  {
    source: "/concursos/edital-no-05-2025-gs-sme-cad",
    destination: "/concursos/sme-cuiaba-05-2025",
    permanent: true,
  },
  {
    source: "/concursos/edital-04-2025-cefet-subs-2025",
    destination: "/concursos/cefet-rj-subsequente-2025",
    permanent: true,
  },
  {
    source: "/concursos/edital-05-2025-cefet-conc-2025",
    destination: "/concursos/cefet-rj-subsequente-2025",
    permanent: true,
  },
  {
    source: "/concursos/edital-002-pmbv",
    destination: "/concursos/boa-vista-rr-pmbv-002",
    permanent: true,
  },
  {
    source: "/concursos/001-2022-gmma",
    destination: "/concursos/guarda-municipal-sao-luis-2022",
    permanent: true,
  },
  { source: "/concursos/ifrj-tae-2022", destination: "/concursos/ifrj-tae-2022", permanent: true },
  // Rotas internas antigas do protótipo
  { source: "/denuncias", destination: "/integridade", permanent: true },
];
