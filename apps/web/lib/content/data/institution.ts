/**
 * Conteúdo institucional migrado do site atual (selecon.org.br — páginas "A Instituição",
 * "Apresentação", "Objetivo") e da apresentação institucional oficial do Instituto.
 * Dados de contato são os públicos (PABX, e-mails institucionais, endereço da sede).
 */

export const INSTITUTION = {
  name: "Instituto Selecon",
  legalName: "Instituto Nacional de Seleções e Concursos — SELECON",
  cnpj: "24.465.407/0001-52",
  legalNature: "Entidade privada sem fins lucrativos",
  registry:
    "Estatuto Social registrado no Cartório de Registro Civil das Pessoas Jurídicas do Município do Rio de Janeiro (matrícula nº 268357) e no Conselho Regional de Administração do Rio de Janeiro (CRA-RJ 90-10601).",
  foundedNote:
    "Criado com uma proposta inovadora na área de desenvolvimento institucional, por meio da prestação de serviços diferenciados em concursos públicos, processos seletivos, pesquisas e capacitação.",
  address: {
    street: "Rua do Senado, 229",
    district: "Centro",
    city: "Rio de Janeiro",
    uf: "RJ",
    zip: "20231-005",
    full: "Rua do Senado, 229 — Centro, Rio de Janeiro/RJ, CEP 20231-005",
  },
  phone: "(21) 2323-3180",
  phoneHref: "tel:+552123233180",
  emails: {
    faleConosco: "faleconosco@selecon.org.br",
    comercial: "comercial@selecon.org.br",
  },
  businessHours: "Segunda a sexta-feira, em dias úteis, em horário comercial.",
  siteUrl: "https://www.selecon.org.br",
  legacySystems: {
    candidateRJ: "https://selecon.selecao.net.br/",
    candidateMT: "https://concursos.selecon.org.br/",
    candidateLogin: "https://selecon.selecao.net.br/painel",
    whistleblowing: "https://denuncias.selecon.org.br/",
    service: "https://atendimento.selecon.org.br/",
    legacyPortal: "https://selecon.org.br/",
  },
  /** Perfis oficiais verificados publicamente (@institutoselecon). */
  social: {
    instagram: "https://www.instagram.com/institutoselecon/",
    facebook: "https://www.facebook.com/institutoselecon/",
  },
} as const;

export const MISSION = {
  mission:
    "Promover o desenvolvimento institucional por meio da realização de processos seletivos, pesquisas e capacitação em órgãos e entidades dos setores público e privado.",
  vision: "Ser referência nacional em gestão de processos seletivos e projetos correlatos.",
  values: [
    "Responsabilidade social",
    "Transparência",
    "Ética",
    "Isonomia",
    "Universalidade",
    "Excelência na prestação de serviços",
  ],
  objective:
    "Conduzir projetos com um elevado grau de planejamento, qualidade da equipe de profissionais atuantes, organização, seriedade, responsabilidade social e segurança, com vistas a selecionar os melhores candidatos e prestar serviços que contemplem as expectativas de órgãos públicos, empresas e instituições de ensino.",
  whoWeAre: [
    "O Instituto Selecon foi criado com uma proposta inovadora na área de desenvolvimento institucional, por meio da prestação de serviços diferenciados em concursos públicos, processos seletivos em geral, pesquisas e capacitação.",
    "Coordenado por profissionais experientes e com capacidade técnica comprovada, atua com eficiência e dinamismo para selecionar os melhores candidatos, que apresentem o perfil desejado para a ocupação de cargos, empregos e funções nos certames públicos e privados.",
    "Pela experiência de seus dirigentes, o Instituto sabe o quanto é estratégico e fundamental para a administração pública uma seleção adequada de seus futuros quadros. Por isso, cada projeto recebe uma estrutura de governança própria — pedagógica, técnica, jurídica, logística, gráfica e de tecnologia — mobilizada para executar o certame com eficiência, confiabilidade e transparência.",
  ],
  legalBasis:
    "O Instituto Selecon pode ser contratado por dispensa de licitação, conforme previsto na Lei Federal nº 14.133, de 1º de abril de 2021.",
} as const;

export interface KeyNumber {
  value: string;
  label: string;
  caption: string;
}

/** Números públicos — sempre com a procedência indicada no `caption`. */
export const KEY_NUMBERS: KeyNumber[] = [
  {
    value: "+1,8 milhão",
    label: "de candidatos inscritos",
    caption: "somatório dos certames conduzidos pelo Instituto",
  },
  {
    value: "276",
    label: "certames realizados",
    caption: "concursos, processos seletivos e seleções escolares",
  },
  { value: "210 mil", label: "inscritos em um único concurso", caption: "Polícia Penal de Minas Gerais (SEJUSP/MG)" },
  { value: "10", label: "estados atendidos", caption: "RJ, MT, MS, MG, RR, MA, BA, SP, SE e SC" },
];

export interface Capability {
  icon: "book-open" | "scale" | "printer" | "server" | "users" | "shield" | "headset" | "megaphone";
  title: string;
  description: string;
}

export const CAPABILITIES: Capability[] = [
  {
    icon: "book-open",
    title: "Coordenação pedagógica",
    description:
      "Banca de mestres e doutores, manual de elaboração de itens, dupla revisão, antiplágio e análise individualizada de recursos. Provas objetivas, discursivas, redação, títulos, TAF, psicotécnico, avaliação médica e investigação social.",
  },
  {
    icon: "scale",
    title: "Assessoria jurídica especializada",
    description:
      "Formulação de editais e atos complementares, prevenção de demandas e suporte a toda ação administrativa, do termo de referência à homologação.",
  },
  {
    icon: "printer",
    title: "Gráfica própria e logística monitorada",
    description:
      "Impressão em gráfica própria, acesso por biometria, câmeras em todas as instalações, malotes lacrados e numerados e monitoramento em tempo real até o destino final.",
  },
  {
    icon: "server",
    title: "Tecnologia da informação",
    description:
      "Inscrição on-line, acompanhamento por senha de cada fase, recursos e títulos on-line, correção de redações e classificação por média ponderada, com total transparência e segurança.",
  },
  {
    icon: "users",
    title: "Aplicação de provas e TAF",
    description:
      "Equipes treinadas no padrão Selecon; testes de aptidão física em locais de referência (CEFAN e EsEFEx no Rio de Janeiro), filmados inclusive por drones, com ambulância presente.",
  },
  {
    icon: "headset",
    title: "Atendimento ao candidato",
    description:
      "Call center com atendimento diferenciado, Fale Conosco com protocolo e canal de denúncias independente e sigiloso.",
  },
  {
    icon: "megaphone",
    title: "Divulgação e democratização",
    description:
      "Campanhas segmentadas em mídia impressa, digital, outdoor e busdoor, cadernos especiais e cartazes exclusivos para ampliar o alcance e a participação.",
  },
  {
    icon: "shield",
    title: "Governança por projeto",
    description:
      "Para cada certame é montada uma estrutura de governança — pedagógica, técnica, de comunicação, gráfica, logística, de TI e jurídica — adequada às necessidades do contratante.",
  },
];

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
}

/** Equipe de direção e coordenação — informações institucionais, sem contatos pessoais. */
export const LEADERSHIP: TeamMember[] = [
  {
    name: "Rogério Vianna Rangel",
    role: "Diretor Presidente",
    bio: "Jornalista especializado em concursos públicos e processos seletivos há mais de 20 anos. Foi diretor de redação de um dos principais jornais do país com linha editorial focada na área.",
  },
  {
    name: "Alexander dos Santos Carvalho",
    role: "Diretor Institucional e Responsável Técnico",
    bio: "Administrador de empresas com pós-graduação em Marketing. Responsável pelo relacionamento com o cliente e pelo entendimento de suas necessidades em todas as etapas do certame.",
  },
  {
    name: "Anna Luísa Perni da Cruz Cardoso",
    role: "Diretora de Concursos e Assuntos Jurídicos",
    bio: "Advogada especialista em processo civil (EMERJ), com especialização em gestão e administração pública. Foi Secretária Municipal de Administração e Procuradora-Geral da Câmara de São Gonçalo.",
  },
  {
    name: "Gilson Santos",
    role: "Diretor Administrativo e Coordenador de Infraestrutura e Logística",
    bio: "Administrador de empresas com pós-graduação em Gestão. Responsável pelo suporte a todas as áreas e pelas atividades inerentes à realização dos certames.",
  },
  {
    name: "Ivo da Costa do Rosário",
    role: "Coordenador Pedagógico",
    bio: "Doutor em Letras (UFF e UFRJ), professor adjunto da UFF e avaliador do SINAES/INEP. Responde pela banca, pelo padrão de elaboração e pela revisão final das provas.",
  },
  {
    name: "Rosângela Vianna Rangel",
    role: "Gerente de Logística e Planejamento",
    bio: "Dez anos de experiência em concursos. Responsável pela reserva de locais de prova, ensalamento e composição das equipes de aplicação.",
  },
  {
    name: "Helir Júnior",
    role: "Gerente Operacional de Concursos Públicos",
    bio: "Vinte anos de experiência: editais, cronogramas, inscrições, alocação de candidatos, aplicação de provas, TAF, classificação e homologação.",
  },
  {
    name: "Henrique Barbosa",
    role: "Assessor Operacional",
    bio: "Economista com 16 anos de experiência em planejamento e gestão operacional de concursos e processos seletivos.",
  },
  {
    name: "Fernando Carilo",
    role: "Gestor de Infraestrutura e Tecnologia",
    bio: "Formado em Redes de Computadores e Segurança da Informação, com pós-graduação em Gestão de Tecnologia.",
  },
  {
    name: "Andréa Antunes",
    role: "Assessora de Comunicação",
    bio: "Jornalista especializada em concursos públicos e gestão pública.",
  },
];

export interface TrackRecordItem {
  client: string;
  uf: string;
  kind: "Concurso público" | "Processo seletivo" | "Vestibular";
  registered: number;
}

/** Principais certames conduzidos, com o número oficial de inscritos (apresentação institucional). */
export const TRACK_RECORD: TrackRecordItem[] = [
  { client: "Polícia Penal de Minas Gerais — SEJUSP/MG", uf: "MG", kind: "Concurso público", registered: 210182 },
  { client: "Guarda Civil Municipal de Niterói", uf: "RJ", kind: "Concurso público", registered: 105000 },
  { client: "Guarda Civil Municipal de Niterói (2ª edição)", uf: "RJ", kind: "Concurso público", registered: 93168 },
  { client: "Processo Seletivo IBGE", uf: "Nacional", kind: "Processo seletivo", registered: 70649 },
  { client: "Secretaria de Estado de Educação de Mato Grosso", uf: "MT", kind: "Processo seletivo", registered: 70001 },
  { client: "Secretaria Municipal de Educação de Cuiabá", uf: "MT", kind: "Concurso público", registered: 69848 },
  { client: "Companhia Municipal de Limpeza Urbana de Niterói — CLIN", uf: "RJ", kind: "Concurso público", registered: 66712 },
  { client: "Polícia Militar do Estado de Sergipe", uf: "SE", kind: "Concurso público", registered: 61952 },
  { client: "Fundação de Apoio à Escola Técnica — FAETEC", uf: "RJ", kind: "Processo seletivo", registered: 60714 },
  { client: "Prefeitura Municipal de Primavera do Leste", uf: "MT", kind: "Concurso público", registered: 44600 },
  { client: "SECITECI — Ciência, Tecnologia e Inovação de MT", uf: "MT", kind: "Concurso público", registered: 43415 },
  { client: "Câmara Municipal de Cuiabá", uf: "MT", kind: "Concurso público", registered: 40472 },
  { client: "Vestibular CECIERJ", uf: "RJ", kind: "Vestibular", registered: 38336 },
  { client: "Secretaria Municipal de Saúde de Boa Vista", uf: "RR", kind: "Concurso público", registered: 37620 },
  { client: "Secretaria Municipal de Educação de São Gonçalo", uf: "RJ", kind: "Concurso público", registered: 37792 },
  { client: "Guarda Civil Municipal de São Luís", uf: "MA", kind: "Concurso público", registered: 32195 },
  { client: "Guarda Civil Municipal de São Gonçalo", uf: "RJ", kind: "Concurso público", registered: 30450 },
  { client: "Secretaria de Saúde de Campo Grande", uf: "MS", kind: "Concurso público", registered: 25429 },
  { client: "EMGEPRON — Empresa Gerencial de Projetos Navais", uf: "RJ", kind: "Concurso público", registered: 24466 },
  { client: "Prefeitura Municipal de Dourados", uf: "MS", kind: "Concurso público", registered: 21772 },
  { client: "Governo do Estado de Mato Grosso do Sul — FUNSAU", uf: "MS", kind: "Concurso público", registered: 19504 },
  { client: "CEFET/RJ — Processo seletivo", uf: "RJ", kind: "Processo seletivo", registered: 14686 },
  { client: "Guarda Civil Municipal de Boa Vista", uf: "RR", kind: "Concurso público", registered: 14730 },
  { client: "Instituto Federal do Rio de Janeiro — IFRJ", uf: "RJ", kind: "Processo seletivo", registered: 11495 },
];

/** Clientes e parceiros para o bloco de logotipos/nomes aprovados (sem imagens de terceiros). */
export const CLIENTS = [
  "Governo do Estado de Minas Gerais (SEJUSP)",
  "Governo do Estado de Mato Grosso (SEDUC, SECITECI, SEMA)",
  "Governo do Estado de Mato Grosso do Sul (FUNSAU, IAGRO)",
  "Governo do Estado de Sergipe (PMSE)",
  "Prefeitura de Niterói (GCM, CLIN, ION/EMUSA)",
  "Prefeitura de São Gonçalo",
  "Prefeitura de Cuiabá",
  "Prefeitura de Boa Vista",
  "Prefeitura de Campo Grande",
  "Prefeitura de Dourados",
  "Prefeitura de São Luís",
  "CEFET/RJ",
  "IFRJ",
  "FAETEC",
  "CECIERJ",
  "EMGEPRON",
  "IBGE",
  "CREA-RJ",
  "Câmara Municipal de Cuiabá",
  "Câmara Municipal de Campo Grande",
] as const;

export const RECOGNITIONS = [
  {
    title: "Moção de Aplausos — Câmara Municipal de Niterói",
    description:
      "Pela realização, com sucesso, do maior concurso da história da segurança pública da cidade, que atraiu mais de 90 mil candidatos.",
  },
  {
    title: "Moção de Aplausos — Assembleia Legislativa de Roraima",
    description:
      "Pela realização do processo seletivo simplificado da Secretaria do Trabalho e Bem-Estar Social (SETRABES).",
  },
] as const;
