export interface NavItem {
  href: string;
  label: string;
  description: string;
}

/**
 * Navegação principal orientada por tarefa (seção 9.1). Só rotas que existem de fato:
 * concursos e notícias vêm da Selecon Central; atendimento e integridade apontam para os
 * canais reais (regra 3.11 — nada de funcionalidade simulada).
 */
export const NAV_ITEMS: readonly NavItem[] = [
  {
    href: "/concursos",
    label: "Concursos",
    description: "Editais, inscrições abertas e resultados",
  },
  {
    href: "/noticias",
    label: "Notícias",
    description: "Comunicados oficiais dos concursos",
  },
  {
    href: "/atendimento",
    label: "Atendimento",
    description: "Tire dúvidas pelo chat, WhatsApp ou e-mail",
  },
  {
    href: "/denuncias",
    label: "Integridade",
    description: "Canal de denúncias sigiloso",
  },
] as const;

export const CANDIDATE_AREA: NavItem = {
  href: "/candidato",
  label: "Área do candidato",
  description: "Inscrições, comprovantes e resultados",
};
