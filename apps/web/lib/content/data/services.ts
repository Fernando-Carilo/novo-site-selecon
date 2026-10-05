import type { ServiceLine } from "../types";

/** Linhas de serviço do Instituto — base das páginas /servicos e do formulário comercial. */
export const SERVICES: ServiceLine[] = [
  {
    slug: "concursos-publicos",
    title: "Concursos públicos",
    shortTitle: "Concursos públicos",
    icon: "landmark",
    summary:
      "Planejamento e execução completa de concursos para provimento de cargos efetivos em órgãos municipais, estaduais e federais, de dezenas a centenas de milhares de candidatos.",
    description: [
      "Do termo de referência à homologação, o Instituto assume o certame com uma estrutura de governança própria: coordenação pedagógica, assessoria jurídica, comunicação, operação gráfica, logística, tecnologia e atendimento ao candidato.",
      "Cada etapa — edital, inscrições, isenções, cotas, provas objetivas e discursivas, títulos, TAF, avaliação psicológica, investigação social, recursos, resultados e curso de formação — é executada e documentada com rastreabilidade.",
    ],
    deliverables: [
      "Elaboração e revisão do edital em conjunto com a comissão",
      "Inscrições on-line com pagamento, isenção e atendimento",
      "Banca de mestres e doutores com questões inéditas e antiplágio",
      "Impressão em gráfica própria e logística de malotes lacrados",
      "Aplicação de provas com equipes treinadas no padrão Selecon",
      "Recursos on-line com resposta individualizada",
      "Resultados, classificação e relatório final para homologação",
    ],
    cases: [
      "Polícia Penal de Minas Gerais — 210 mil inscritos",
      "Guarda Civil Municipal de Niterói — 105 mil inscritos",
      "Polícia Militar de Sergipe — 62 mil inscritos",
      "Câmara Municipal de Cuiabá — 40 mil inscritos",
    ],
  },
  {
    slug: "processos-seletivos",
    title: "Processos seletivos e seleções simplificadas",
    shortTitle: "Processos seletivos",
    icon: "users",
    summary:
      "Seleções para contratação temporária, cadastro de reserva e empregos públicos, com prazos curtos e a mesma segurança jurídica dos concursos.",
    description: [
      "Processos seletivos simplificados exigem velocidade sem abrir mão da isonomia. O Instituto estrutura seleções por prova objetiva, avaliação curricular, análise de títulos ou combinação de etapas, conforme a necessidade do órgão.",
      "A experiência inclui secretarias estaduais de educação e saúde, prefeituras, consórcios intermunicipais, empresas públicas e organizações sociais.",
    ],
    deliverables: [
      "Modelagem da seleção (prova, títulos, experiência ou mista)",
      "Edital e cronograma enxutos, com segurança jurídica",
      "Inscrições e envio de documentos on-line",
      "Avaliação curricular com critérios objetivos e auditáveis",
      "Resultados por classificação e relatórios de contratação",
    ],
    cases: [
      "Secretaria de Estado de Educação de Mato Grosso — 70 mil inscritos",
      "IBGE — 70,6 mil inscritos",
      "Secretaria Municipal de Educação de Cuiabá — nove seleções",
      "SECITECI/MT — professores e técnicos da educação profissional",
    ],
  },
  {
    slug: "selecoes-escolares-e-vestibulares",
    title: "Seleções escolares e vestibulares",
    shortTitle: "Seleções escolares",
    icon: "graduation-cap",
    summary:
      "Processos seletivos para ingresso em cursos técnicos, ensino médio integrado e graduação, com logística dimensionada para o público estudantil.",
    description: [
      "Seleções escolares têm público, linguagem e logística próprios: candidatos menores de idade, responsáveis legais, cotas educacionais e matrícula em múltiplas unidades.",
      "O Instituto conduz seleções para o CEFET/RJ, a FAETEC e o vestibular do CECIERJ, com provas objetivas e redação adequadas a cada nível.",
    ],
    deliverables: [
      "Edital com cotas educacionais e regras de matrícula",
      "Inscrição com responsável legal e isenções",
      "Provas objetivas e redação por nível de ensino",
      "Resultado por unidade/curso e listas de chamada",
    ],
    cases: [
      "CEFET/RJ — cursos técnicos integrados, subsequentes e concomitantes",
      "FAETEC — três processos seletivos (mais de 129 mil inscritos)",
      "Vestibular CECIERJ — 38 mil inscritos",
    ],
  },
  {
    slug: "capacitacao-e-cursos-de-formacao",
    title: "Capacitação e cursos de formação",
    shortTitle: "Capacitação",
    icon: "book-open",
    summary:
      "Cursos de formação de aprovados, treinamentos de equipes e programas de capacitação para servidores, com auditório próprio e corpo docente qualificado.",
    description: [
      "Cursos de formação técnico-profissional são etapa de muitos concursos de segurança pública. O Instituto planeja, executa e avalia esses cursos, além de programas de capacitação de servidores nas áreas técnico-administrativas.",
      "A sede no Rio de Janeiro conta com auditório para cursos, treinamentos e seminários.",
    ],
    deliverables: [
      "Projeto pedagógico e cronograma do curso",
      "Corpo docente e material didático",
      "Avaliação, frequência e certificação",
      "Treinamento de fiscais e equipes de aplicação",
    ],
    cases: ["Curso de Formação Técnico-Profissional — Polícia Penal de Minas Gerais"],
  },
  {
    slug: "pesquisas-e-avaliacoes",
    title: "Pesquisas e avaliações institucionais",
    shortTitle: "Pesquisas",
    icon: "bar-chart",
    summary:
      "Pesquisas de opinião, avaliações institucionais e diagnósticos para apoiar decisões de gestão em órgãos e entidades.",
    description: [
      "A finalidade estatutária do Instituto inclui pesquisas e capacitação. Projetos de pesquisa seguem metodologia definida com o contratante, com instrumentos validados e relatórios analíticos.",
    ],
    deliverables: [
      "Desenho metodológico e amostral",
      "Instrumentos e coleta (presencial ou digital)",
      "Tratamento de dados e relatório analítico",
    ],
    cases: ["Projetos sob demanda — consulte a área comercial"],
  },
  {
    slug: "tecnologia-e-seguranca",
    title: "Tecnologia e segurança do certame",
    shortTitle: "Tecnologia e segurança",
    icon: "server",
    summary:
      "Sistemas de inscrição e gestão de candidatos, controle de acesso por biometria, monitoramento por câmeras e cadeia de custódia das provas.",
    description: [
      "A tecnologia está presente em toda a dinâmica dos certames: inscrição, pagamento, isenção, cartão de confirmação, recursos e títulos on-line, correção de redações e classificação por média ponderada.",
      "A segurança física inclui gráfica própria monitorada, acesso por biometria a todos os setores, malotes com lacres numerados e acompanhamento em tempo real do material até o destino.",
    ],
    deliverables: [
      "Sistema de inscrições e Área do Candidato",
      "Gráfica própria com cadeia de custódia documentada",
      "Monitoramento de TAF com filmagem e drones",
      "Trilhas de auditoria de todas as etapas",
    ],
    cases: ["Aplicado em todos os certames conduzidos pelo Instituto"],
  },
];
