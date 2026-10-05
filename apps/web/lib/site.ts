import { INSTITUTION } from "@/lib/content/data/institution";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.selecon.org.br";
export const SITE_NAME = "Instituto Selecon";
export const SITE_DESCRIPTION =
  "Instituto Nacional de Seleções e Concursos — concursos públicos, processos seletivos, área do candidato, atendimento e canal de integridade em um único portal.";

export interface NavItem {
  href: string;
  label: string;
  description?: string;
  children?: NavItem[];
}

/** Navegação orientada por tarefa (seção 9.1). Todo item aponta para uma rota existente. */
export const PRIMARY_NAV: NavItem[] = [
  { href: "/concursos", label: "Concursos", description: "Catálogo, inscrições abertas e páginas de edital" },
  {
    href: "/instituto",
    label: "O Instituto",
    description: "Quem somos, governança, equipe e estrutura",
    children: [
      { href: "/instituto", label: "Quem somos" },
      { href: "/instituto#governanca", label: "Governança e equipe" },
      { href: "/instituto#estrutura", label: "Estrutura e segurança" },
      { href: "/transparencia", label: "Transparência" },
      { href: "/imprensa", label: "Imprensa" },
      { href: "/trabalhe-conosco", label: "Trabalhe conosco" },
    ],
  },
  { href: "/servicos", label: "Serviços", description: "Soluções para órgãos públicos e instituições" },
  { href: "/atendimento", label: "Atendimento", description: "Dúvidas, protocolo e Fale Conosco" },
  { href: "/integridade", label: "Integridade", description: "Canal de denúncias sigiloso" },
  { href: "/noticias", label: "Notícias", description: "Publicações e comunicados" },
];

export const UTILITY_NAV: NavItem[] = [
  { href: "/acessibilidade", label: "Acessibilidade" },
  { href: "/transparencia", label: "Transparência" },
  { href: "/comercial", label: "Para órgãos públicos" },
  { href: "/fale-conosco", label: "Fale Conosco" },
];

export const CANDIDATE_CTA = { href: "/candidato", label: "Área do candidato" } as const;

export const FOOTER_COLUMNS: { title: string; links: NavItem[] }[] = [
  {
    title: "Concursos",
    links: [
      { href: "/concursos?status=ABERTOS", label: "Inscrições abertas" },
      { href: "/concursos?status=EM_ANDAMENTO", label: "Em andamento" },
      { href: "/concursos?status=ENCERRADO", label: "Encerrados" },
      { href: "/candidato", label: "Área do candidato" },
      { href: "/concursos#alertas", label: "Receber alertas de editais" },
    ],
  },
  {
    title: "O Instituto",
    links: [
      { href: "/instituto", label: "Quem somos" },
      { href: "/instituto#governanca", label: "Governança e equipe" },
      { href: "/servicos", label: "Serviços" },
      { href: "/comercial", label: "Solicite uma proposta" },
      { href: "/imprensa", label: "Imprensa" },
      { href: "/trabalhe-conosco", label: "Trabalhe conosco" },
    ],
  },
  {
    title: "Atendimento",
    links: [
      { href: "/atendimento", label: "Central de atendimento" },
      { href: "/fale-conosco", label: "Fale Conosco" },
      { href: "/atendimento#protocolo", label: "Consultar protocolo" },
      { href: "/atendimento#perguntas-frequentes", label: "Perguntas frequentes" },
      { href: "/integridade", label: "Canal de denúncias" },
    ],
  },
  {
    title: "Transparência",
    links: [
      { href: "/transparencia", label: "Transparência institucional" },
      { href: "/privacidade", label: "Política de privacidade" },
      { href: "/acessibilidade", label: "Acessibilidade" },
      { href: "/mapa-do-site", label: "Mapa do site" },
    ],
  },
];

export const CONTACT = INSTITUTION;
