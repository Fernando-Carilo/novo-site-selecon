import Link from "next/link";
import { Container, Icon, buttonClassNames } from "@selecon/ui";
import { PageHeader } from "@/components/PageHeader";
import { catalogHref } from "@/lib/contests/search-params";

/** 404 contextual do catálogo: explica o que pode ter acontecido e devolve o candidato ao caminho certo. */
export default function ContestNotFound() {
  return (
    <>
      <PageHeader
        eyebrow="Concursos"
        title="Concurso não encontrado"
        description="O endereço pode estar incompleto, o concurso pode ter mudado de nome ou a página ainda não foi migrada para este portal."
        breadcrumbs={[
          { label: "Início", href: "/" },
          { label: "Concursos", href: "/concursos" },
          { label: "Não encontrado" },
        ]}
      />
      <Container className="py-10">
        <div className="max-w-2xl">
          <h2 className="text-navy-primary text-xl font-bold">O que você pode fazer</h2>
          <ul className="text-text-primary mt-4 space-y-3 text-sm leading-relaxed">
            <li className="flex gap-3">
              <Icon name="search" size={18} className="text-action-blue mt-0.5 shrink-0" />
              Pesquise pelo nome do órgão, da cidade ou do cargo no catálogo — a busca ignora
              acentos e aceita siglas.
            </li>
            <li className="flex gap-3">
              <Icon name="bell" size={18} className="text-action-blue mt-0.5 shrink-0" />
              Ative alertas para ser avisado quando um novo edital for publicado.
            </li>
            <li className="flex gap-3">
              <Icon name="headset" size={18} className="text-action-blue mt-0.5 shrink-0" />
              Se você chegou aqui por um link oficial, informe o endereço pelo Fale Conosco para que
              a equipe corrija o redirecionamento.
            </li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/concursos" className={buttonClassNames("primary")}>
              Ir para o catálogo
            </Link>
            <Link
              href={catalogHref({}, { status: "ABERTOS" })}
              className={buttonClassNames("secondary")}
            >
              Ver inscrições abertas
            </Link>
            <Link href="/fale-conosco" className={buttonClassNames("secondary")}>
              Fale Conosco
            </Link>
          </div>
        </div>
      </Container>
    </>
  );
}
