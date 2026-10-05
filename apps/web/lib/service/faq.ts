/**
 * Base pública de perguntas frequentes do atendimento ao candidato (seção 9.6).
 * Respostas genéricas e corretas para qualquer certame: remetem sempre ao edital vigente e à
 * Área do Candidato. Nenhum prazo, valor ou regra específica é inventado aqui — isso é do edital.
 * Dados puros (sem `server-only`) para poderem ser sugeridos no formulário client do Fale Conosco.
 */

export type FaqGroupId =
  | "inscricao"
  | "isencao"
  | "pagamento"
  | "cartao"
  | "dia-da-prova"
  | "gabarito-recursos"
  | "resultados"
  | "cotas"
  | "dados"
  | "banca";

export interface FaqLink {
  href: string;
  label: string;
  external?: boolean;
}

export interface FaqItem {
  id: string;
  group: FaqGroupId;
  question: string;
  /** Parágrafos da resposta. */
  answer: string[];
  links?: FaqLink[];
  /** Perguntas mais acessadas aparecem em atalhos e na Área do Candidato. */
  popular?: boolean;
}

export interface FaqGroup {
  id: FaqGroupId;
  title: string;
  description: string;
}

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: "inscricao",
    title: "Inscrição e taxa",
    description: "Como se inscrever, prazos e valor da taxa.",
  },
  { id: "isencao", title: "Isenção da taxa", description: "Quem tem direito e como pedir." },
  {
    id: "pagamento",
    title: "Pagamento e 2ª via do boleto",
    description: "Boleto, confirmação e pendências.",
  },
  {
    id: "cartao",
    title: "Cartão de confirmação e local de prova",
    description: "Onde consultar e o que fazer em caso de erro.",
  },
  { id: "dia-da-prova", title: "Dia da prova", description: "Documento, horário e materiais." },
  {
    id: "gabarito-recursos",
    title: "Gabarito e recursos",
    description: "Divulgação, prazos e como recorrer.",
  },
  {
    id: "resultados",
    title: "Resultados e classificação",
    description: "Notas, listas e homologação.",
  },
  {
    id: "cotas",
    title: "Vagas reservadas (PcD e pessoas negras)",
    description: "Como concorrer e comprovar.",
  },
  { id: "dados", title: "Dados cadastrais e acesso", description: "Correção de dados e senha." },
  {
    id: "banca",
    title: "Trabalhe conosco e banca",
    description: "Cadastro de fiscais, docentes e equipe.",
  },
];

const CANDIDATE_LINK: FaqLink = { href: "/candidato", label: "Ir para a Área do candidato" };
const CONTESTS_LINK: FaqLink = { href: "/concursos", label: "Ver página do edital no catálogo" };

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "faq-inscricao-como",
    group: "inscricao",
    question: "Como faço a minha inscrição?",
    answer: [
      "A inscrição é feita exclusivamente pela internet, no sistema de inscrição indicado na página do edital, dentro do período previsto no cronograma. Leia o edital na íntegra antes de se inscrever: ele define cargos, requisitos, taxa, etapas e regras de desempate.",
      "Após preencher o formulário, confira os dados, gere o boleto (ou solicite isenção, se tiver direito) e guarde o comprovante. A inscrição só é confirmada após a compensação do pagamento ou o deferimento da isenção.",
    ],
    links: [CANDIDATE_LINK, CONTESTS_LINK],
    popular: true,
  },
  {
    id: "faq-inscricao-mais-de-um-cargo",
    group: "inscricao",
    question: "Posso me inscrever em mais de um cargo?",
    answer: [
      "Depende do edital. Em geral é permitido quando as provas dos cargos escolhidos ocorrem em turnos ou datas diferentes; cada inscrição exige o pagamento da respectiva taxa. Verifique no edital o item sobre inscrições e o cronograma de provas antes de decidir.",
    ],
    links: [CONTESTS_LINK],
  },
  {
    id: "faq-inscricao-prazo",
    group: "inscricao",
    question: "Perdi o prazo de inscrição. Ainda posso participar?",
    answer: [
      "Não. O período de inscrição é definido no edital e vale igualmente para todos os candidatos, por isonomia. Só há nova oportunidade se o órgão publicar uma retificação reabrindo o prazo — acompanhe as publicações da página do concurso ou assine os alertas de editais.",
    ],
    links: [{ href: "/concursos#alertas", label: "Receber alertas de editais" }],
  },
  {
    id: "faq-isencao-direito",
    group: "isencao",
    question: "Quem tem direito à isenção da taxa de inscrição?",
    answer: [
      "As hipóteses de isenção são definidas pelo edital de cada certame e pela legislação do ente contratante. As mais comuns são a inscrição no Cadastro Único (CadÚnico) para famílias de baixa renda e a condição de doador de medula óssea; alguns editais preveem outras situações.",
      "O pedido é feito pelo sistema de inscrição, no período próprio do cronograma, com envio da documentação exigida. Pedidos fora do prazo ou sem os documentos indicados são indeferidos.",
    ],
    links: [CONTESTS_LINK],
    popular: true,
  },
  {
    id: "faq-isencao-resultado",
    group: "isencao",
    question: "Como acompanho o resultado do meu pedido de isenção?",
    answer: [
      "O resultado dos pedidos é publicado na página do concurso, na data prevista no cronograma, e também pode ser consultado na Área do Candidato. Se o pedido for indeferido, o edital prevê prazo para recurso e, mantido o indeferimento, o candidato pode efetuar o pagamento da taxa dentro do prazo para continuar inscrito.",
    ],
    links: [CANDIDATE_LINK],
  },
  {
    id: "faq-pagamento-segunda-via",
    group: "pagamento",
    question: "Como emito a 2ª via do boleto?",
    answer: [
      "Acesse a Área do Candidato com seu login, localize a inscrição e use a opção de reimpressão do boleto. A 2ª via só pode ser paga até a data-limite de pagamento prevista no edital; após essa data o sistema não gera novos boletos.",
      "O Instituto não envia boletos por e-mail, WhatsApp ou redes sociais, e não há cobrança de taxas além do boleto oficial gerado pelo sistema de inscrição.",
    ],
    links: [CANDIDATE_LINK],
    popular: true,
  },
  {
    id: "faq-pagamento-pendente",
    group: "pagamento",
    question: "Paguei o boleto, mas a inscrição ainda aparece como pendente. O que fazer?",
    answer: [
      "A confirmação depende da compensação bancária, que não é imediata e pode levar alguns dias úteis. Verifique primeiro na Área do Candidato. Se, após esse prazo, a situação continuar pendente, abra um chamado no Fale Conosco informando o concurso, o número da inscrição e anexando o comprovante de pagamento quando solicitado.",
    ],
    links: [
      CANDIDATE_LINK,
      { href: "/fale-conosco?assunto=inscricao", label: "Abrir chamado no Fale Conosco" },
    ],
  },
  {
    id: "faq-cartao-local",
    group: "cartao",
    question: "Onde consulto meu local de prova?",
    answer: [
      "O cartão de confirmação de inscrição (CCI), com local, sala, data e horário da prova, é disponibilizado na Área do Candidato na data prevista no cronograma do edital. Imprima ou salve o cartão e confira o endereço com antecedência.",
      "Não há envio de cartão pelos Correios. Comunicados sobre a liberação do cartão são publicados na página do concurso.",
    ],
    links: [CANDIDATE_LINK],
    popular: true,
  },
  {
    id: "faq-cartao-erro",
    group: "cartao",
    question: "Há erro no meu cartão de confirmação. Como corrigir?",
    answer: [
      "Erros em nome, documento ou data de nascimento podem ser corrigidos na Área do Candidato ou, conforme o edital, no dia da prova, por formulário próprio junto ao fiscal de sala. Divergências em cargo, cidade de prova ou condição especial de atendimento devem ser comunicadas pelo Fale Conosco dentro do prazo previsto no edital para correção do cartão.",
    ],
    links: [{ href: "/fale-conosco?assunto=cartao", label: "Comunicar erro pelo Fale Conosco" }],
  },
  {
    id: "faq-prova-documento",
    group: "dia-da-prova",
    question: "Que documento devo apresentar no dia da prova?",
    answer: [
      "Documento oficial de identificação original, com foto e dentro da validade — por exemplo, carteira de identidade (RG), CNH, carteira de trabalho, passaporte ou identidade profissional. O edital lista os documentos aceitos e informa se documentos digitais (como RG e CNH em aplicativos oficiais) são admitidos.",
      "Documento com foto que não permita a identificação, cópias (mesmo autenticadas), protocolos e boletins de ocorrência não são aceitos, salvo disposição expressa do edital.",
    ],
    popular: true,
  },
  {
    id: "faq-prova-horario-materiais",
    group: "dia-da-prova",
    question: "A que horas devo chegar e o que posso levar?",
    answer: [
      "Os portões fecham no horário indicado no cartão de confirmação e no edital, considerando o horário oficial de Brasília; não há tolerância após o fechamento. Chegue com antecedência e localize a sala antes do horário.",
      "Leve o documento de identificação, o cartão de confirmação e caneta esferográfica de tinta azul ou preta, fabricada em material transparente. Aparelhos eletrônicos devem ficar desligados e guardados conforme a orientação dos fiscais, nos termos do edital.",
    ],
  },
  {
    id: "faq-gabarito-recurso",
    group: "gabarito-recursos",
    question: "Quando o gabarito é divulgado e como interponho recurso?",
    answer: [
      "O gabarito preliminar é publicado na página do concurso na data prevista no cronograma. O recurso contra questões ou contra o gabarito é feito exclusivamente pela Área do Candidato, dentro do prazo do edital, com fundamentação por questão. Recursos enviados por e-mail, Fale Conosco ou fora do prazo não são conhecidos.",
      "Após a análise da banca, são publicados o gabarito definitivo e as respostas aos recursos, individualmente consultáveis na Área do Candidato.",
    ],
    links: [CANDIDATE_LINK],
    popular: true,
  },
  {
    id: "faq-resultados-nota",
    group: "resultados",
    question: "Como consulto minha nota e classificação?",
    answer: [
      "A nota individual e a classificação ficam disponíveis na Área do Candidato após a publicação do resultado. As listas de classificação (ampla concorrência e vagas reservadas) são publicadas na página do concurso, na forma prevista no edital, e a homologação é ato do órgão contratante.",
    ],
    links: [CANDIDATE_LINK],
  },
  {
    id: "faq-cotas-como",
    group: "cotas",
    question: "Como concorro às vagas reservadas para pessoas com deficiência ou pessoas negras?",
    answer: [
      "A opção é feita no ato da inscrição, com envio da documentação exigida pelo edital no prazo do cronograma (laudo médico para PcD; autodeclaração para pessoas negras, sujeita a procedimento de heteroidentificação quando previsto). Quem opta por vaga reservada concorre também à ampla concorrência.",
      "Candidatos com deficiência ou que necessitem de atendimento especial (prova ampliada, ledor, tempo adicional, lactante, entre outros) devem solicitar a condição na inscrição, conforme o edital.",
    ],
    links: [CONTESTS_LINK],
  },
  {
    id: "faq-dados-corrigir",
    group: "dados",
    question: "Como corrijo meus dados cadastrais (nome, e-mail, endereço)?",
    answer: [
      "Dados de contato (e-mail, telefone e endereço) podem ser atualizados na Área do Candidato. Nome, CPF e data de nascimento seguem a regra do edital: em geral a correção é feita pelo próprio sistema até o fim das inscrições ou, depois, por solicitação ao Fale Conosco com documento comprobatório.",
      "O portal não armazena senhas em texto aberto e a equipe de atendimento nunca solicita sua senha.",
    ],
    links: [
      CANDIDATE_LINK,
      { href: "/fale-conosco?assunto=dados", label: "Solicitar correção pelo Fale Conosco" },
    ],
  },
  {
    id: "faq-dados-senha",
    group: "dados",
    question: "Esqueci minha senha de acesso. Como recupero?",
    answer: [
      "Use a opção de recuperação de senha na tela de login do sistema de inscrição do seu concurso (sistema geral ou sistema de Mato Grosso). O link de redefinição é enviado ao e-mail cadastrado. Se não tiver mais acesso a esse e-mail, abra um chamado no Fale Conosco informando o concurso e o número da inscrição.",
    ],
    links: [CANDIDATE_LINK],
  },
  {
    id: "faq-banca-trabalhe",
    group: "banca",
    question: "Quero trabalhar na aplicação de provas ou na banca. Como faço?",
    answer: [
      "O Instituto mantém cadastro de fiscais, coordenadores de local, docentes elaboradores e revisores. O cadastro é feito pela página Trabalhe conosco, e a convocação ocorre conforme a demanda de cada certame e a região da prova. Não há cobrança de qualquer valor para cadastro ou participação nas equipes.",
    ],
    links: [{ href: "/trabalhe-conosco", label: "Ir para Trabalhe conosco" }],
  },
];

export function getFaqGroup(id: FaqGroupId): FaqGroup {
  const group = FAQ_GROUPS.find((g) => g.id === id);
  if (!group) throw new Error(`Grupo de FAQ desconhecido: ${id}`);
  return group;
}

export function listFaqByGroup(group: FaqGroupId): FaqItem[] {
  return FAQ_ITEMS.filter((item) => item.group === group);
}

export function listPopularFaq(limit = 5): FaqItem[] {
  return FAQ_ITEMS.filter((item) => item.popular).slice(0, limit);
}

/** Assuntos do Fale Conosco — cada um aponta para o grupo de FAQ sugerido antes do envio. */
export type ContactSubjectId =
  | "INSCRICAO"
  | "ISENCAO"
  | "CARTAO"
  | "GABARITO_RECURSOS"
  | "RESULTADO"
  | "DADOS"
  | "TRABALHE_CONOSCO"
  | "IMPRENSA"
  | "PRIVACIDADE"
  | "ACESSIBILIDADE"
  | "COMERCIAL"
  | "OUTRO";

export interface ContactSubject {
  id: ContactSubjectId;
  /** Valor aceito no query param `assunto` (ex.: /fale-conosco?assunto=privacidade). */
  param: string;
  label: string;
  faqGroup?: FaqGroupId;
}

export const CONTACT_SUBJECTS: ContactSubject[] = [
  { id: "INSCRICAO", param: "inscricao", label: "Inscrição e pagamento", faqGroup: "inscricao" },
  { id: "ISENCAO", param: "isencao", label: "Isenção de taxa", faqGroup: "isencao" },
  {
    id: "CARTAO",
    param: "cartao",
    label: "Cartão de confirmação e local de prova",
    faqGroup: "cartao",
  },
  {
    id: "GABARITO_RECURSOS",
    param: "recursos",
    label: "Gabarito e recursos",
    faqGroup: "gabarito-recursos",
  },
  {
    id: "RESULTADO",
    param: "resultado",
    label: "Resultado e classificação",
    faqGroup: "resultados",
  },
  { id: "DADOS", param: "dados", label: "Dados cadastrais e acesso", faqGroup: "dados" },
  {
    id: "TRABALHE_CONOSCO",
    param: "trabalhe-conosco",
    label: "Trabalhe conosco",
    faqGroup: "banca",
  },
  { id: "IMPRENSA", param: "imprensa", label: "Imprensa" },
  { id: "PRIVACIDADE", param: "privacidade", label: "Privacidade (LGPD)" },
  { id: "ACESSIBILIDADE", param: "acessibilidade", label: "Acessibilidade" },
  { id: "COMERCIAL", param: "comercial", label: "Comercial (proposta para órgãos e instituições)" },
  { id: "OUTRO", param: "outro", label: "Outro assunto" },
];

export function findContactSubject(idOrParam?: string | null): ContactSubject | undefined {
  if (!idOrParam) return undefined;
  return CONTACT_SUBJECTS.find((s) => s.id === idOrParam || s.param === idOrParam);
}

/** Até `limit` perguntas relacionadas ao assunto (grupo do assunto primeiro, depois populares). */
export function suggestFaqForSubject(subject?: ContactSubjectId, limit = 3): FaqItem[] {
  const group = CONTACT_SUBJECTS.find((s) => s.id === subject)?.faqGroup;
  const related = group ? listFaqByGroup(group) : [];
  const popular = listPopularFaq(limit).filter((item) => !related.includes(item));
  return related.concat(popular).slice(0, limit);
}
