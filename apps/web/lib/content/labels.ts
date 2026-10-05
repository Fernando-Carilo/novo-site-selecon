import type {
  ContestArea,
  ContestKind,
  ContestPublicStatus,
  EducationLevel,
  PublicationKind,
  UF,
} from "./types";

export const CONTEST_STATUS_LABEL: Record<ContestPublicStatus, string> = {
  PREVISTO: "Edital previsto",
  INSCRICOES_ABERTAS: "Inscrições abertas",
  EM_ANDAMENTO: "Em andamento",
  HOMOLOGADO: "Homologado",
  ENCERRADO: "Encerrado",
  SUSPENSO: "Suspenso",
};

export const CONTEST_STATUS_TONE: Record<
  ContestPublicStatus,
  "open" | "info" | "success" | "neutral" | "warning" | "danger"
> = {
  PREVISTO: "warning",
  INSCRICOES_ABERTAS: "open",
  EM_ANDAMENTO: "info",
  HOMOLOGADO: "success",
  ENCERRADO: "neutral",
  SUSPENSO: "danger",
};

export const CONTEST_KIND_LABEL: Record<ContestKind, string> = {
  CONCURSO_PUBLICO: "Concurso público",
  PROCESSO_SELETIVO: "Processo seletivo",
  PROCESSO_SELETIVO_SIMPLIFICADO: "Processo seletivo simplificado",
  SELECAO_ESCOLAR: "Seleção para cursos técnicos",
  VESTIBULAR: "Vestibular",
};

export const CONTEST_AREA_LABEL: Record<ContestArea, string> = {
  SEGURANCA: "Segurança pública",
  SAUDE: "Saúde",
  EDUCACAO: "Educação",
  ADMINISTRACAO: "Administração e gestão",
  ENGENHARIA: "Engenharia e indústria",
  LEGISLATIVO: "Poder Legislativo",
  TECNICO: "Ensino técnico",
  JURIDICO: "Jurídico e controle",
};

export const EDUCATION_LEVEL_LABEL: Record<EducationLevel, string> = {
  FUNDAMENTAL: "Fundamental",
  MEDIO: "Médio",
  TECNICO: "Técnico",
  SUPERIOR: "Superior",
};

export const PUBLICATION_KIND_LABEL: Record<PublicationKind, string> = {
  EDITAL: "Edital",
  RETIFICACAO: "Retificação",
  COMUNICADO: "Comunicado",
  CONVOCACAO: "Convocação",
  RESULTADO: "Resultado",
  GABARITO: "Gabarito",
  HOMOLOGACAO: "Homologação",
  ANEXO: "Anexo",
};

export const UF_LABEL: Record<UF, string> = {
  AC: "Acre",
  AL: "Alagoas",
  AP: "Amapá",
  AM: "Amazonas",
  BA: "Bahia",
  CE: "Ceará",
  DF: "Distrito Federal",
  ES: "Espírito Santo",
  GO: "Goiás",
  MA: "Maranhão",
  MT: "Mato Grosso",
  MS: "Mato Grosso do Sul",
  MG: "Minas Gerais",
  PA: "Pará",
  PB: "Paraíba",
  PR: "Paraná",
  PE: "Pernambuco",
  PI: "Piauí",
  RJ: "Rio de Janeiro",
  RN: "Rio Grande do Norte",
  RS: "Rio Grande do Sul",
  RO: "Rondônia",
  RR: "Roraima",
  SC: "Santa Catarina",
  SP: "São Paulo",
  SE: "Sergipe",
  TO: "Tocantins",
};
