import { Alert, Badge, Icon } from "@selecon/ui";
import { PUBLICATION_KIND_LABEL } from "@/lib/content/labels";
import type { ContestPublication, PublicationKind } from "@/lib/content/types";
import { formatDate } from "@/lib/format";

interface ContestPublicationsProps {
  publications: ContestPublication[];
}

const KIND_TONE: Partial<
  Record<PublicationKind, "info" | "warning" | "success" | "neutral" | "navy">
> = {
  EDITAL: "navy",
  RETIFICACAO: "warning",
  RESULTADO: "success",
  HOMOLOGACAO: "success",
  GABARITO: "info",
  CONVOCACAO: "info",
  COMUNICADO: "neutral",
  ANEXO: "neutral",
};

function isPdf(url: string): boolean {
  return /\.pdf($|[?#])/i.test(url);
}

/**
 * Editais, retificações, comunicados e resultados em ordem cronológica decrescente, com o
 * documento vigente sinalizado e o número da versão preservado (regra 9.4: uma retificação
 * cria nova versão; o documento anterior nunca é substituído silenciosamente).
 */
export function ContestPublications({ publications }: ContestPublicationsProps) {
  const sorted = [...publications].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  return (
    <div className="space-y-5">
      <Alert tone="info" title="Como funcionam as versões">
        Cada retificação gera uma nova versão do documento e o anterior é preservado nesta lista. O
        documento marcado como <strong>vigente</strong> é o que vale para o certame; leia também as
        retificações posteriores à sua inscrição.
      </Alert>

      {sorted.length === 0 ? (
        <p className="border-border-strong bg-surface text-text-secondary rounded-lg border border-dashed p-5 text-sm leading-relaxed">
          Nenhum documento publicado até o momento. O edital de abertura será o primeiro item desta
          lista; ative os alertas deste concurso para ser avisado na publicação.
        </p>
      ) : (
        <ol
          className="divide-border border-border bg-surface divide-y rounded-lg border"
          aria-label="Documentos publicados"
        >
          {sorted.map((publication) => {
            const external = publication.url && !isPdf(publication.url);
            return (
              <li
                key={publication.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={KIND_TONE[publication.kind] ?? "neutral"}>
                      {PUBLICATION_KIND_LABEL[publication.kind]}
                    </Badge>
                    {publication.current ? (
                      <Badge tone="success" dot>
                        Documento vigente
                      </Badge>
                    ) : null}
                    {publication.version ? (
                      <span className="text-text-secondary text-xs font-semibold uppercase tracking-wide">
                        Versão <span className="tabular-nums">{publication.version}</span>
                      </span>
                    ) : null}
                  </div>
                  <p className="text-navy-primary mt-2 text-base font-semibold">
                    {publication.title}
                  </p>
                  <p className="text-text-secondary mt-1 text-sm">
                    Publicado em{" "}
                    <time dateTime={publication.publishedAt} className="tabular-nums">
                      {formatDate(publication.publishedAt)}
                    </time>
                  </p>
                </div>
                {publication.url ? (
                  <a
                    href={publication.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-border-strong bg-surface text-navy-primary hover:border-action-blue hover:text-action-blue inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md border px-4 text-sm font-semibold transition-colors"
                  >
                    {external ? (
                      <Icon name="external-link" size={16} label="abre em nova aba" />
                    ) : (
                      <Icon name="download" size={16} />
                    )}
                    {external ? "Abrir documento" : "Baixar PDF"}
                    {external ? null : <span className="sr-only">(abre em nova aba)</span>}
                  </a>
                ) : (
                  <p className="text-text-secondary text-sm">
                    Documento disponível na Área do Candidato.
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
