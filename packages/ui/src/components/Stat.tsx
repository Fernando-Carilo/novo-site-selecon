export interface StatProps {
  value: string;
  label: string;
  /** Texto curto de procedência (ex.: "desde 2016") — número sem contexto não vale nada. */
  caption?: string;
  tone?: "default" | "inverse";
}

export function Stat({ value, label, caption, tone = "default" }: StatProps) {
  const inverse = tone === "inverse";
  return (
    <div>
      <p
        className={`text-3xl font-bold tabular-nums tracking-tight sm:text-4xl ${
          inverse ? "text-white" : "text-navy-primary"
        }`}
      >
        {value}
      </p>
      <p
        className={`mt-1 text-sm font-semibold ${inverse ? "text-support-cyan" : "text-action-blue"}`}
      >
        {label}
      </p>
      {caption ? (
        <p className={`mt-1 text-sm ${inverse ? "text-white/70" : "text-text-secondary"}`}>
          {caption}
        </p>
      ) : null}
    </div>
  );
}
