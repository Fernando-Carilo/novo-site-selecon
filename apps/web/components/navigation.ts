export interface NavItem {
  href: string;
  label: string;
  description: string;
}

/**
 * Navegação principal orientada por tarefa (seção 9.1). Menu completo (O Instituto,
 * Notícias, Fale Conosco) chega nas Fases 2 e 5, quando essas páginas existirem de fato —
 * nenhum item aponta para uma rota inexistente (regra 3.11).
 */
export const NAV_ITEMS: readonly NavItem[] = [
  {
    href: "/concursos",
    label: "Concursos",
    description: "Editais, inscrições abertas e resultados",
  },
  {
    href: "/atendimento",
    label: "Atendimento",
    description: "Tire dúvidas e acompanhe protocolos",
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
