import Link from "next/link";
import { Icon, type IconName } from "@selecon/ui";
import type { ContestServiceLink } from "@/lib/content/types";

interface ContestServiceLinksProps {
  serviceLinks: ContestServiceLink[];
  /** Destaca o link de inscrição quando o período está aberto. */
  registrationOpen: boolean;
}

const SERVICE_ICON: Record<ContestServiceLink["key"], IconName> = {
  INSCRICAO: "list-checks",
  AREA_DO_CANDIDATO: "user",
  BOLETO: "credit-card",
  LOCAL_DE_PROVA: "map-pin",
  RECURSO: "file-text",
  RESULTADO: "award",
  LEGADO: "globe",
};

const LINK_BASE =
  "flex min-h-11 items-center gap-3 rounded-md border px-3 py-2 text-sm font-semibold transition-colors";
const LINK_DEFAULT = `${LINK_BASE} border-border bg-surface text-navy-primary hover:border-action-blue hover:bg-background-light hover:text-action-blue`;
const LINK_PRIMARY = `${LINK_BASE} border-action-blue bg-action-blue text-white hover:bg-action-blue-hover`;

/**
 * Serviços do candidato ligados ao certame (seção 9.4): inscrição, área do candidato, boleto,
 * local de prova, recursos e resultados — todos externos (sistema do candidato), sinalizados
 * como tal. Inclui sempre o caminho interno para a Área do Candidato do portal.
 */
export function ContestServiceLinks({ serviceLinks, registrationOpen }: ContestServiceLinksProps) {
  return (
    <div className="space-y-3">
      {serviceLinks.length === 0 ? (
        <p className="text-text-secondary text-sm leading-relaxed">
          Inscrição, boleto, local de prova, recursos e resultados ficam disponíveis aqui a partir
          da publicação do edital.
        </p>
      ) : (
        <ul className="space-y-2">
          {serviceLinks.map((link) => {
            const primary = link.key === "INSCRICAO" && registrationOpen;
            return (
              <li key={`${link.key}-${link.url}`}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={primary ? LINK_PRIMARY : LINK_DEFAULT}
                >
                  <Icon
                    name={SERVICE_ICON[link.key]}
                    size={18}
                    className={primary ? "text-white" : "text-action-blue"}
                  />
                  <span className="flex-1">{link.label}</span>
                  <Icon name="external-link" size={14} label="abre em nova aba" />
                </a>
              </li>
            );
          })}
        </ul>
      )}
      <Link
        href="/candidato"
        className="text-action-blue flex min-h-11 items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline"
      >
        <Icon name="info" size={16} />
        Como funciona a Área do Candidato
      </Link>
    </div>
  );
}
