import { Badge, Icon, type BadgeTone, type IconName } from "@selecon/ui";
import type { ContestMilestone } from "@/lib/content/types";
import { formatDate } from "@/lib/format";

interface ContestTimelineProps {
  timeline: ContestMilestone[];
}

interface MarkerStyle {
  icon: IconName;
  label: string;
  tone: BadgeTone;
  circle: string;
}

/** Estado de cada etapa: ícone + texto + cor — a cor nunca é a única informação. */
const MARKER: Record<ContestMilestone["status"], MarkerStyle> = {
  DONE: {
    icon: "check-circle",
    label: "Concluído",
    tone: "success",
    circle: "bg-success-green text-white",
  },
  CURRENT: {
    icon: "clock",
    label: "Em andamento",
    tone: "info",
    circle: "bg-action-blue text-white ring-4 ring-wash-blue",
  },
  UPCOMING: {
    icon: "calendar",
    label: "Previsto",
    tone: "neutral",
    circle: "border-2 border-border-strong bg-surface text-text-secondary",
  },
};

/**
 * Cronograma do certame (seção 9.4): lista ordenada com marcador visual e rótulo textual do
 * estado de cada etapa, período completo quando houver `dateEnd` e descrição opcional.
 */
export function ContestTimeline({ timeline }: ContestTimelineProps) {
  if (timeline.length === 0) {
    return (
      <p className="border-border-strong bg-surface text-text-secondary rounded-lg border border-dashed p-5 text-sm leading-relaxed">
        Cronograma será publicado com o edital. Ative os alertas deste concurso para ser avisado
        assim que as datas forem divulgadas.
      </p>
    );
  }

  return (
    <ol
      className="border-border relative ml-4 space-y-6 border-l-2 pl-8"
      aria-label="Etapas do cronograma"
    >
      {timeline.map((milestone) => {
        const marker = MARKER[milestone.status];
        return (
          <li key={milestone.id} className="relative">
            <span
              aria-hidden="true"
              className={`absolute -left-[calc(2rem+1.0625rem)] top-0 flex h-8 w-8 items-center justify-center rounded-full ${marker.circle}`}
            >
              <Icon name={marker.icon} size={16} />
            </span>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Badge tone={marker.tone} dot>
                {marker.label}
              </Badge>
              <p className="text-text-secondary text-sm font-semibold tabular-nums">
                <time dateTime={milestone.date}>{formatDate(milestone.date)}</time>
                {milestone.dateEnd ? (
                  <>
                    {" "}
                    a <time dateTime={milestone.dateEnd}>{formatDate(milestone.dateEnd)}</time>
                  </>
                ) : null}
              </p>
            </div>
            <h3 className="text-navy-primary mt-1.5 text-base font-bold">{milestone.label}</h3>
            {milestone.description ? (
              <p className="text-text-secondary mt-1 text-sm leading-relaxed">
                {milestone.description}
              </p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
