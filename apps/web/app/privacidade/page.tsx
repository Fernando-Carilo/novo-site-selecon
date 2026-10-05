import Link from "next/link";
import type { Metadata } from "next";
import { Alert, Container, Icon } from "@selecon/ui";
import { PageHeader } from "@/components/PageHeader";
import { INSTITUTION } from "@/lib/content/data/institution";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Como o Instituto Selecon trata dados pessoais no portal: dados coletados em cada fluxo, finalidades, bases legais da LGPD, compartilhamento, retenção, direitos do titular, cookies e segurança.",
  alternates: { canonical: "/privacidade" },
};

const VERSION = "versão 1.0 — outubro de 2026";

const ON_THIS_PAGE = [
  { href: "#controlador", label: "Controlador" },
  { href: "#dados", label: "Dados tratados por fluxo" },
  { href: "#finalidades", label: "Finalidades e bases legais" },
  { href: "#compartilhamento", label: "Compartilhamento" },
  { href: "#retencao", label: "Retenção" },
  { href: "#direitos", label: "Direitos do titular" },
  { href: "#cookies", label: "Cookies" },
  { href: "#seguranca", label: "Segurança" },
  { href: "#denuncias", label: "Canal de denúncias" },
  { href: "#atualizacao", label: "Atualizações" },
];

const FLOWS: { flow: string; data: string; purpose: string; basis: string }[] = [
  {
    flow: "Busca e navegação em concursos e notícias",
    data: "Nenhum dado pessoal. Os termos de busca ficam apenas na URL do seu navegador.",
    purpose: "Exibir o catálogo, as páginas de edital e as publicações.",
    basis: "Não se aplica (não há tratamento de dados pessoais).",
  },
  {
    flow: "Alertas de editais",
    data: "E-mail e, se informados, estado e concurso de interesse; registro do consentimento e da data.",
    purpose: "Enviar avisos de publicação e retificação de editais.",
    basis:
      "Consentimento (art. 7º, I), revogável a qualquer momento pelo link de descadastro ou pelo Fale Conosco.",
  },
  {
    flow: "Fale Conosco e consulta de protocolo",
    data: "Nome, e-mail, telefone (opcional), assunto, mensagem e anexos. CPF apenas quando necessário para localizar a sua inscrição.",
    purpose: "Responder à solicitação, registrar o protocolo e manter o histórico do atendimento.",
    basis:
      "Execução de procedimento preliminar ou de contrato (art. 7º, V) e cumprimento de obrigação legal quando o atendimento decorre do edital (art. 7º, II).",
  },
  {
    flow: "Contato comercial (órgãos e instituições)",
    data: "Nome, cargo, órgão, e-mail e telefone do representante; descrição da demanda.",
    purpose: "Elaborar diagnóstico e proposta técnica e de preço.",
    basis: "Execução de procedimento preliminar ao contrato (art. 7º, V).",
  },
  {
    flow: "Inscrições e Área do Candidato",
    data: "Dados cadastrais, documentos e resultados exigidos pelo edital de cada certame.",
    purpose: "Executar o certame: inscrição, isenção, cotas, provas, recursos e resultados.",
    basis:
      "Cumprimento de obrigação legal e execução do edital (art. 7º, II e V). O tratamento ocorre nos sistemas de inscrição, conforme as regras de cada edital.",
  },
  {
    flow: "Segurança do portal",
    data: "Endereço IP, data e hora, agente do navegador e registros de erro, em logs técnicos.",
    purpose: "Prevenir fraudes e abusos, manter a disponibilidade e investigar incidentes.",
    basis:
      "Legítimo interesse (art. 7º, IX) e garantia da prevenção à fraude e à segurança (art. 11, II, g).",
  },
];

const RIGHTS = [
  "Confirmação da existência de tratamento e acesso aos dados.",
  "Correção de dados incompletos, inexatos ou desatualizados.",
  "Anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos.",
  "Portabilidade, observados os segredos comercial e industrial.",
  "Informação sobre compartilhamento com entes públicos e privados.",
  "Informação sobre a possibilidade de não consentir e suas consequências.",
  "Revogação do consentimento, quando essa for a base legal.",
  "Oposição a tratamento realizado com base em outra hipótese legal, em caso de descumprimento da LGPD.",
];

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Privacidade"
        title="Política de Privacidade"
        description="Como o Instituto Selecon trata dados pessoais neste portal e nos canais a ele ligados, em conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 — LGPD)."
        breadcrumbs={[{ label: "Início", href: "/" }, { label: "Política de Privacidade" }]}
      >
        <p className="text-text-secondary text-sm">
          Documento em vigor: <span className="text-text-primary font-medium">{VERSION}</span>
        </p>
      </PageHeader>

      <Container className="py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[14rem_1fr] lg:gap-14">
          <nav aria-label="Nesta página" className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-action-blue text-sm font-semibold uppercase tracking-wide">
              Nesta página
            </p>
            <ul className="lg:border-border mt-3 flex flex-wrap gap-2 lg:flex-col lg:gap-0 lg:border-l">
              {ON_THIS_PAGE.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="border-border bg-surface text-navy-primary hover:text-action-blue lg:hover:border-action-blue inline-flex min-h-11 items-center rounded-md border px-3 text-sm font-medium lg:-ml-px lg:w-full lg:rounded-none lg:border-0 lg:border-l-2 lg:border-transparent lg:bg-transparent"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="min-w-0 space-y-14">
            <section id="controlador" aria-labelledby="controlador-title" className="scroll-mt-24">
              <h2 id="controlador-title" className="text-navy-primary text-2xl font-bold">
                1. Controlador e Encarregado
              </h2>
              <dl className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="border-border bg-surface rounded-lg border p-5">
                  <dt className="text-text-secondary text-sm font-semibold uppercase tracking-wide">
                    Controlador
                  </dt>
                  <dd className="text-text-primary mt-1 text-base leading-relaxed">
                    {INSTITUTION.legalName}, CNPJ {INSTITUTION.cnpj},{" "}
                    {INSTITUTION.legalNature.toLowerCase()}, com sede na {INSTITUTION.address.full}.
                  </dd>
                </div>
                <div className="border-border bg-surface rounded-lg border p-5">
                  <dt className="text-text-secondary text-sm font-semibold uppercase tracking-wide">
                    Encarregado (DPO)
                  </dt>
                  <dd className="text-text-primary mt-1 text-base leading-relaxed">
                    O contato do Encarregado pelo Tratamento de Dados Pessoais é feito pelo{" "}
                    <Link
                      href="/fale-conosco"
                      className="text-action-blue font-medium underline underline-offset-4"
                    >
                      Fale Conosco
                    </Link>
                    , assunto &ldquo;Privacidade&rdquo;.
                  </dd>
                </div>
              </dl>
              <p className="text-text-primary mt-4 text-base leading-relaxed">
                Esta política vale para o portal www.selecon.org.br e para os formulários nele
                publicados. Os sistemas de inscrição e a Área do Candidato seguem, além desta
                política, as regras de cada edital.
              </p>
            </section>

            <section id="dados" aria-labelledby="dados-title" className="scroll-mt-24">
              <h2 id="dados-title" className="text-navy-primary text-2xl font-bold">
                2. Dados tratados em cada fluxo
              </h2>
              <p className="text-text-primary mt-3 text-base leading-relaxed">
                Coletamos apenas o necessário para cada finalidade. A tabela mostra, por fluxo do
                portal, quais dados são tratados, para quê e com qual base legal da LGPD.
              </p>
              <div className="border-border bg-surface mt-6 overflow-x-auto rounded-lg border">
                <table className="w-full min-w-[48rem] text-left text-sm">
                  <caption className="text-navy-primary px-4 py-3 text-left text-base font-bold">
                    Dados pessoais por fluxo, finalidade e base legal
                  </caption>
                  <thead className="border-border bg-background-light text-text-secondary border-y text-xs uppercase tracking-wide">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        Fluxo
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        Dados tratados
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        Finalidade
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        Base legal (LGPD)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-border divide-y align-top">
                    {FLOWS.map((row) => (
                      <tr key={row.flow}>
                        <th scope="row" className="text-navy-primary px-4 py-3 font-medium">
                          {row.flow}
                        </th>
                        <td className="text-text-primary px-4 py-3 leading-relaxed">{row.data}</td>
                        <td className="text-text-primary px-4 py-3 leading-relaxed">
                          {row.purpose}
                        </td>
                        <td className="text-text-secondary px-4 py-3 leading-relaxed">
                          {row.basis}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section id="finalidades" aria-labelledby="finalidades-title" className="scroll-mt-24">
              <h2 id="finalidades-title" className="text-navy-primary text-2xl font-bold">
                3. Finalidades e bases legais
              </h2>
              <div className="prose-selecon text-text-primary mt-3 max-w-3xl text-base">
                <p>
                  Os dados pessoais são tratados somente para as finalidades informadas no momento
                  da coleta:
                </p>
                <ul>
                  <li>
                    <strong>Consentimento</strong> — alertas de editais por e-mail. Você pode
                    revogá-lo a qualquer momento, sem prejuízo do tratamento feito até então.
                  </li>
                  <li>
                    <strong>Execução de procedimento preliminar ou de contrato</strong> —
                    atendimento pelo Fale Conosco, contato comercial e execução do certame previsto
                    em edital.
                  </li>
                  <li>
                    <strong>Cumprimento de obrigação legal ou regulatória</strong> — guarda de
                    registros exigidos pelo edital, pelo contrato com o órgão e pela legislação
                    aplicável a concursos públicos.
                  </li>
                  <li>
                    <strong>Legítimo interesse</strong> — segurança do portal, prevenção a fraudes e
                    proteção da integridade dos certames, sempre com o mínimo de dados e por tempo
                    limitado.
                  </li>
                </ul>
                <p>
                  Não usamos dados pessoais para publicidade comportamental, não vendemos dados e
                  não tomamos decisões automatizadas que afetem direitos do titular sem revisão
                  humana.
                </p>
              </div>
            </section>

            <section
              id="compartilhamento"
              aria-labelledby="compartilhamento-title"
              className="scroll-mt-24"
            >
              <h2 id="compartilhamento-title" className="text-navy-primary text-2xl font-bold">
                4. Compartilhamento
              </h2>
              <div className="prose-selecon text-text-primary mt-3 max-w-3xl text-base">
                <p>Os dados podem ser compartilhados apenas com:</p>
                <ul>
                  <li>
                    <strong>Órgãos e instituições contratantes</strong> — dados de inscrição e
                    resultados do certame, conforme o edital e o contrato, para homologação,
                    nomeação e convocação.
                  </li>
                  <li>
                    <strong>Operadores</strong> — provedores de pagamento (taxa de inscrição),
                    hospedagem, envio de e-mail e sistemas de inscrição e atendimento, que tratam
                    dados em nome do Instituto, sob contrato e com dever de sigilo.
                  </li>
                  <li>
                    <strong>Autoridades públicas</strong> — quando exigido por lei, ordem judicial
                    ou requisição de autoridade competente, inclusive em apuração de fraude.
                  </li>
                </ul>
                <p>
                  Resultados e listas de classificação são publicados conforme o edital, com os
                  dados mínimos necessários à transparência do certame.
                </p>
              </div>
            </section>

            <section id="retencao" aria-labelledby="retencao-title" className="scroll-mt-24">
              <h2 id="retencao-title" className="text-navy-primary text-2xl font-bold">
                5. Retenção
              </h2>
              <div className="prose-selecon text-text-primary mt-3 max-w-3xl text-base">
                <ul>
                  <li>
                    <strong>Alertas de editais</strong> — enquanto o consentimento estiver ativo; o
                    e-mail é eliminado após o descadastro.
                  </li>
                  <li>
                    <strong>Fale Conosco e contato comercial</strong> — pelo tempo necessário ao
                    atendimento e, depois, pelo prazo de guarda do histórico de atendimento exigido
                    para defesa de direitos.
                  </li>
                  <li>
                    <strong>Dados de inscrição e do certame</strong> — pelo prazo de validade do
                    concurso e pelos prazos legais de guarda aplicáveis ao órgão contratante e ao
                    Instituto.
                  </li>
                  <li>
                    <strong>Logs de segurança</strong> — pelo prazo mínimo previsto no Marco Civil
                    da Internet (Lei nº 12.965/2014) e pelo tempo necessário à apuração de
                    incidentes.
                  </li>
                </ul>
                <p>Ao fim do prazo, os dados são eliminados ou anonimizados.</p>
              </div>
            </section>

            <section id="direitos" aria-labelledby="direitos-title" className="scroll-mt-24">
              <h2 id="direitos-title" className="text-navy-primary text-2xl font-bold">
                6. Direitos do titular e como exercê-los
              </h2>
              <p className="text-text-primary mt-3 text-base leading-relaxed">
                Nos termos do art. 18 da LGPD, você pode solicitar, a qualquer momento:
              </p>
              <ul className="mt-4 grid gap-2 md:grid-cols-2">
                {RIGHTS.map((right) => (
                  <li
                    key={right}
                    className="border-border bg-surface text-text-primary flex gap-2 rounded-lg border p-3 text-sm leading-relaxed"
                  >
                    <Icon
                      name="check-circle"
                      size={18}
                      className="text-success-green mt-0.5 shrink-0"
                    />
                    {right}
                  </li>
                ))}
              </ul>
              <Alert
                tone="info"
                className="mt-6"
                icon={<Icon name="info" size={20} className="text-action-blue" />}
              >
                Para exercer qualquer direito, use o{" "}
                <Link
                  href="/fale-conosco"
                  className="text-action-blue font-medium underline underline-offset-4"
                >
                  Fale Conosco
                </Link>{" "}
                com o assunto &ldquo;Privacidade&rdquo;. O pedido recebe protocolo. Para proteger os
                seus dados, podemos pedir a confirmação da sua identidade antes de atender. Pedidos
                sobre dados de inscrição em um certame específico são respondidos de acordo com as
                regras do respectivo edital.
              </Alert>
            </section>

            <section id="cookies" aria-labelledby="cookies-title" className="scroll-mt-24">
              <h2 id="cookies-title" className="text-navy-primary text-2xl font-bold">
                7. Cookies
              </h2>
              <div className="prose-selecon text-text-primary mt-3 max-w-3xl text-base">
                <p>
                  Este portal usa apenas cookies e armazenamento local <strong>essenciais</strong>:
                  os necessários para manter a sessão, proteger formulários contra envios
                  automatizados e lembrar preferências de acessibilidade. Eles não identificam você
                  fora do portal.
                </p>
                <p>
                  <strong>Não usamos rastreadores de terceiros</strong>, cookies de publicidade nem
                  ferramentas de análise de audiência que compartilhem dados com outras empresas.
                  Por isso, não exibimos banner de consentimento de cookies.
                </p>
              </div>
            </section>

            <section id="seguranca" aria-labelledby="seguranca-title" className="scroll-mt-24">
              <h2 id="seguranca-title" className="text-navy-primary text-2xl font-bold">
                8. Segurança
              </h2>
              <div className="prose-selecon text-text-primary mt-3 max-w-3xl text-base">
                <p>
                  Adotamos medidas técnicas e administrativas para proteger os dados contra acessos
                  não autorizados e situações acidentais ou ilícitas: comunicação criptografada
                  (HTTPS), controle de acesso por perfil, registro de acessos a dados pessoais,
                  segregação entre sistemas, cópias de segurança e verificação de anexos enviados
                  por formulário.
                </p>
                <p>
                  Em caso de incidente de segurança que possa acarretar risco ou dano relevante aos
                  titulares, o Instituto comunicará a Autoridade Nacional de Proteção de Dados
                  (ANPD) e os titulares afetados, na forma da lei.
                </p>
              </div>
            </section>

            <section id="denuncias" aria-labelledby="denuncias-title" className="scroll-mt-24">
              <h2 id="denuncias-title" className="text-navy-primary text-2xl font-bold">
                9. Canal de denúncias
              </h2>
              <div className="prose-selecon text-text-primary mt-3 max-w-3xl text-base">
                <p>
                  Os relatos feitos ao <Link href="/integridade">canal de denúncias</Link> recebem
                  tratamento segregado: ficam em sistema próprio, separado do atendimento e dos
                  sistemas de inscrição, sem publicidade ou ferramentas de análise de audiência, e
                  são acessíveis apenas à equipe designada para a apuração. A identificação do
                  relator é opcional; quando informada, é protegida contra acesso de pessoas
                  envolvidas no fato relatado.
                </p>
              </div>
            </section>

            <section id="atualizacao" aria-labelledby="atualizacao-title" className="scroll-mt-24">
              <h2 id="atualizacao-title" className="text-navy-primary text-2xl font-bold">
                10. Atualizações desta política
              </h2>
              <div className="prose-selecon text-text-primary mt-3 max-w-3xl text-base">
                <p>
                  Esta política pode ser atualizada para refletir mudanças na legislação, nos
                  serviços ou nos sistemas do portal. A versão vigente é sempre a publicada nesta
                  página, com a identificação de versão e data. Mudanças relevantes são comunicadas
                  em destaque no portal.
                </p>
                <p>
                  <strong>Versão em vigor:</strong> {VERSION}.
                </p>
              </div>
            </section>
          </div>
        </div>
      </Container>
    </>
  );
}
