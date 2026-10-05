import Link from "next/link";
import type { Metadata } from "next";
import {
  Alert,
  Card,
  Container,
  Icon,
  SectionHeading,
  buttonClassNames,
  type IconName,
} from "@selecon/ui";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Acessibilidade",
  description:
    "Declaração de acessibilidade do portal do Instituto Selecon: compromisso com a WCAG 2.2 nível AA, recursos disponíveis, navegação por teclado, compatibilidade com leitores de tela e VLibras, e como reportar barreiras.",
  alternates: { canonical: "/acessibilidade" },
};

const FEATURES: { title: string; description: string; icon: IconName }[] = [
  {
    title: "Navegação por teclado",
    description:
      "Todos os menus, links, botões, formulários e acordeões funcionam com Tab, Shift+Tab, Enter, Espaço e Esc.",
    icon: "list-checks",
  },
  {
    title: "Link para pular ao conteúdo",
    description:
      "O primeiro Tab em qualquer página revela o link “Pular para o conteúdo principal”, que leva direto ao conteúdo.",
    icon: "arrow-right",
  },
  {
    title: "Foco visível",
    description:
      "O elemento em foco recebe um contorno espesso e contrastante, que nunca é removido.",
    icon: "search",
  },
  {
    title: "Contraste",
    description:
      "Textos e componentes atendem às razões de contraste mínimas da WCAG 2.2 AA; nenhuma informação é transmitida apenas por cor.",
    icon: "shield",
  },
  {
    title: "Textos alternativos",
    description:
      "Imagens relevantes têm descrição; ícones decorativos ficam ocultos de leitores de tela e ícones com significado têm rótulo.",
    icon: "file-text",
  },
  {
    title: "Formulários acessíveis",
    description:
      "Cada campo tem rótulo visível; dicas e mensagens de erro são associadas ao campo e anunciadas pelo leitor de tela.",
    icon: "check-circle",
  },
  {
    title: "Redução de movimento",
    description:
      "Se o sistema estiver configurado para reduzir movimento, transições e rolagem suave são desativadas.",
    icon: "clock",
  },
  {
    title: "Leitores de tela",
    description:
      "HTML semântico, regiões nomeadas, hierarquia de títulos e tabelas com cabeçalhos e legendas, compatíveis com NVDA, JAWS, VoiceOver e TalkBack.",
    icon: "headset",
  },
  {
    title: "VLibras",
    description:
      "O portal é compatível com o VLibras (tradução para Libras). O recurso é habilitado por configuração, sem interferir na navegação de quem não o usa.",
    icon: "accessibility",
  },
  {
    title: "Zoom e telas pequenas",
    description:
      "O conteúdo se reorganiza em telas a partir de 360 px e em zoom de 200%, sem rolagem horizontal nem perda de função.",
    icon: "globe",
  },
];

const SHORTCUTS: { keys: string; action: string }[] = [
  { keys: "Tab / Shift + Tab", action: "Avança ou volta entre links, botões e campos." },
  { keys: "Enter ou Espaço", action: "Ativa o link, botão ou acordeão em foco." },
  { keys: "Esc", action: "Fecha o menu de navegação em telas pequenas." },
  { keys: "Setas", action: "Navegam entre opções em listas de seleção e no menu do navegador." },
  {
    keys: "Ctrl + (ou Cmd +) / Ctrl − (ou Cmd −)",
    action: "Aumenta ou diminui o zoom do navegador; o portal suporta até 200%.",
  },
];

export default function AccessibilityPage() {
  return (
    <>
      <PageHeader
        eyebrow="Acessibilidade"
        title="Declaração de acessibilidade"
        description="O Instituto Selecon se compromete a garantir que este portal possa ser usado por todas as pessoas, inclusive com deficiência, seguindo as Diretrizes de Acessibilidade para Conteúdo Web (WCAG) 2.2, nível AA."
        breadcrumbs={[{ label: "Início", href: "/" }, { label: "Acessibilidade" }]}
      />

      <Container className="py-10 sm:py-14">
        <div className="space-y-16">
          <section aria-labelledby="compromisso-title">
            <SectionHeading id="compromisso-title" eyebrow="Compromisso" title="Padrões adotados" />
            <div className="prose-selecon text-text-primary mt-4 max-w-3xl text-base">
              <p>
                O portal é desenvolvido e revisado com base na <strong>WCAG 2.2, nível AA</strong>,
                e usa como referência complementar o{" "}
                <strong>Modelo de Acessibilidade em Governo Eletrônico (e-MAG)</strong>, de modo a
                atender também às práticas esperadas de serviços voltados a candidatos de concursos
                públicos.
              </p>
              <p>
                A acessibilidade é verificada em cada nova página com testes automatizados e
                verificação manual por teclado e leitor de tela. Quando encontramos uma barreira,
                ela é corrigida como defeito, não como melhoria opcional.
              </p>
            </div>
          </section>

          <section aria-labelledby="recursos-title">
            <SectionHeading id="recursos-title" eyebrow="Recursos" title="O que o portal oferece" />
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <li
                  key={feature.title}
                  className="border-border bg-surface flex gap-4 rounded-lg border p-5"
                >
                  <span className="bg-wash-blue text-action-blue flex h-11 w-11 shrink-0 items-center justify-center rounded-lg">
                    <Icon name={feature.icon} size={22} />
                  </span>
                  <div>
                    <h3 className="text-navy-primary text-base font-bold">{feature.title}</h3>
                    <p className="text-text-secondary mt-1 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="atalhos-title">
            <SectionHeading
              id="atalhos-title"
              eyebrow="Teclado"
              title="Atalhos e navegação por teclado"
              description="O portal não redefine atalhos do navegador nem do leitor de tela; usa apenas as teclas padrão, para não conflitar com tecnologias assistivas."
            />
            <div className="border-border bg-surface mt-6 overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[32rem] text-left text-sm">
                <caption className="text-navy-primary px-4 py-3 text-left text-base font-bold">
                  Teclas e ações disponíveis no portal
                </caption>
                <thead className="border-border bg-background-light text-text-secondary border-y text-xs uppercase tracking-wide">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Tecla
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Ação
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {SHORTCUTS.map((shortcut) => (
                    <tr key={shortcut.keys}>
                      <th scope="row" className="text-navy-primary px-4 py-3 font-medium">
                        <kbd className="border-border-strong bg-background-light rounded border px-1.5 py-0.5 font-sans text-sm">
                          {shortcut.keys}
                        </kbd>
                      </th>
                      <td className="text-text-primary px-4 py-3">{shortcut.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section aria-labelledby="documentos-title">
            <SectionHeading
              id="documentos-title"
              eyebrow="Documentos"
              title="Editais e documentos em PDF"
            />
            <div className="prose-selecon text-text-primary mt-4 max-w-3xl text-base">
              <p>
                Editais, retificações e resultados são publicados pelos órgãos contratantes e pelo
                Instituto como documentos oficiais, geralmente em PDF. As páginas de cada concurso
                apresentam as informações essenciais — cronograma, cargos, vagas, taxas e situação —
                em HTML acessível, de modo que o candidato não dependa do PDF para as decisões
                principais. Se um documento oficial estiver inacessível para você, solicite o
                conteúdo em formato alternativo pelo Fale Conosco.
              </p>
            </div>
          </section>

          <section aria-labelledby="reportar-title">
            <Card padding="lg" className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
              <div>
                <p className="text-action-blue text-sm font-semibold uppercase tracking-wide">
                  Encontrou uma barreira?
                </p>
                <h2 id="reportar-title" className="text-navy-primary mt-1 text-2xl font-bold">
                  Reporte pelo Fale Conosco
                </h2>
                <p className="text-text-secondary mt-2 text-base leading-relaxed">
                  Use o assunto <strong>Acessibilidade</strong> e informe a página, o que tentou
                  fazer, o navegador e a tecnologia assistiva usada (se houver). O relato recebe
                  protocolo e é tratado como defeito prioritário.
                </p>
              </div>
              <div className="flex flex-col gap-3 lg:items-end">
                <Link
                  href="/fale-conosco?assunto=acessibilidade"
                  className={buttonClassNames("primary", "", "lg")}
                >
                  Reportar barreira
                  <Icon name="arrow-right" size={18} />
                </Link>
              </div>
            </Card>
            <Alert
              tone="info"
              className="mt-6"
              icon={<Icon name="info" size={20} className="text-action-blue" />}
            >
              Esta declaração é revisada a cada versão relevante do portal. Partes de sistemas
              legados (inscrição e atendimento em endereços próprios) estão sendo integradas
              progressivamente e podem ainda não atender integralmente aos critérios acima; se
              encontrar dificuldade neles, o Fale Conosco oferece caminho alternativo para a mesma
              solicitação.
            </Alert>
          </section>
        </div>
      </Container>
    </>
  );
}
