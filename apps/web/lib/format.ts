const DATE_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "America/Sao_Paulo",
});

const LONG_DATE_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "America/Sao_Paulo",
});

const CURRENCY_FORMATTER = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const INTEGER_FORMATTER = new Intl.NumberFormat("pt-BR");

/** Converte "YYYY-MM-DD" em Date no meio-dia de Brasília (evita deslocamento de fuso). */
export function parseIsoDate(iso: string): Date {
  return new Date(`${iso}T12:00:00-03:00`);
}

export function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  return DATE_FORMATTER.format(parseIsoDate(iso));
}

export function formatLongDate(iso?: string | null): string {
  if (!iso) return "—";
  return LONG_DATE_FORMATTER.format(parseIsoDate(iso));
}

export function formatDateRange(start?: string, end?: string): string {
  if (start && end) return `${formatDate(start)} a ${formatDate(end)}`;
  if (start) return `a partir de ${formatDate(start)}`;
  if (end) return `até ${formatDate(end)}`;
  return "a definir";
}

export function formatCurrency(cents?: number | null): string {
  if (cents === null || cents === undefined) return "—";
  return CURRENCY_FORMATTER.format(cents / 100);
}

export function formatInteger(value?: number | null): string {
  if (value === null || value === undefined) return "—";
  return INTEGER_FORMATTER.format(value);
}

/** Dias restantes até uma data ISO, relativos a `now` (negativo = já passou). */
export function daysUntil(iso: string, now: Date = new Date()): number {
  const target = parseIsoDate(iso);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/** Remove acentos e baixa caixa — tolerância a acentos na busca (seção 9.2). */
export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}
