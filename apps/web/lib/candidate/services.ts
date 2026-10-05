import type { IconName } from "@selecon/ui";
import { INSTITUTION } from "@/lib/content/data/institution";

/**
 * Serviços da Área do candidato (seção 9.5). Nesta fase o portal não possui login próprio:
 * cada serviço é um link externo explícito para o sistema de inscrição que atende o certame
 * (adapter de link externo previsto na seção 11.4). Quando a API/SSO do provedor existir,
 * a lista permanece e apenas o destino dos links muda.
 */

export type CandidateSystemId = "GERAL" | "MT";

export interface CandidateSystem {
  id: CandidateSystemId;
  /** Âncora da seção na página /candidato. */
  anchor: string;
  title: string;
  description: string;
  /** Página inicial do sistema (cadastro/inscrição). */
  homeUrl: string;
  /** Painel do candidato após login. */
  panelUrl: string;
  hostLabel: string;
}

export const CANDIDATE_SYSTEMS: CandidateSystem[] = [
  {
    id: "GERAL",
    anchor: "sistema-geral",
    title: "Concursos do Rio de Janeiro e demais estados",
    description:
      "Certames de RJ, MG, MS, RR, MA, BA, SP, SE, SC e órgãos federais usam o sistema geral de inscrição do Instituto.",
    homeUrl: INSTITUTION.legacySystems.candidateRJ,
    panelUrl: INSTITUTION.legacySystems.candidateLogin,
    hostLabel: "selecon.selecao.net.br",
  },
  {
    id: "MT",
    anchor: "sistema-mt",
    title: "Concursos de Mato Grosso",
    description:
      "Concursos e processos seletivos de órgãos e prefeituras de Mato Grosso usam o sistema próprio de inscrição do estado.",
    homeUrl: INSTITUTION.legacySystems.candidateMT,
    panelUrl: INSTITUTION.legacySystems.candidateMT,
    hostLabel: "concursos.selecon.org.br",
  },
];

export interface CandidateService {
  key:
    | "LOGIN"
    | "INSCRICOES"
    | "PAGAMENTO"
    | "BOLETO"
    | "COMPROVANTE"
    | "CARTAO"
    | "RECURSOS"
    | "RESULTADOS"
    | "DOCUMENTOS";
  title: string;
  description: string;
  icon: IconName;
  /** `home` abre a página inicial do sistema; `panel` abre o painel (exige login). */
  target: "home" | "panel";
}

export const CANDIDATE_SERVICES: CandidateService[] = [
  {
    key: "LOGIN",
    title: "Login e cadastro",
    description:
      "Crie seu cadastro ou acesse o painel com CPF e senha. Recuperação de senha pelo e-mail cadastrado.",
    icon: "user",
    target: "home",
  },
  {
    key: "INSCRICOES",
    title: "Inscrições",
    description:
      "Inscreva-se nos concursos com inscrições abertas e consulte as inscrições já realizadas.",
    icon: "list-checks",
    target: "home",
  },
  {
    key: "PAGAMENTO",
    title: "Situação do pagamento",
    description:
      "Verifique se a taxa foi compensada ou se a isenção foi deferida para cada inscrição.",
    icon: "credit-card",
    target: "panel",
  },
  {
    key: "BOLETO",
    title: "2ª via do boleto",
    description: "Reimprima o boleto dentro do prazo de pagamento previsto no edital.",
    icon: "printer",
    target: "panel",
  },
  {
    key: "COMPROVANTE",
    title: "Comprovante de inscrição",
    description:
      "Baixe o comprovante com os dados da inscrição e a opção de cargo e cidade de prova.",
    icon: "file-text",
    target: "panel",
  },
  {
    key: "CARTAO",
    title: "Cartão de confirmação e local de prova",
    description:
      "Consulte local, sala, data e horário quando o cartão for liberado conforme o cronograma.",
    icon: "map-pin",
    target: "panel",
  },
  {
    key: "RECURSOS",
    title: "Recursos",
    description:
      "Interponha recursos contra gabarito, resultado ou indeferimento, no prazo do edital, e consulte as respostas.",
    icon: "scale",
    target: "panel",
  },
  {
    key: "RESULTADOS",
    title: "Resultados individuais",
    description: "Veja sua nota por etapa e a classificação após a publicação de cada resultado.",
    icon: "award",
    target: "panel",
  },
  {
    key: "DOCUMENTOS",
    title: "Documentos e notificações",
    description:
      "Envie documentos solicitados (isenção, cotas, títulos) e acompanhe as notificações do certame.",
    icon: "bell",
    target: "panel",
  },
];

export function serviceUrl(service: CandidateService, system: CandidateSystem): string {
  return service.target === "panel" ? system.panelUrl : system.homeUrl;
}
