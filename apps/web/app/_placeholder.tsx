interface PlaceholderPageProps {
  title: string;
  description: string;
}

/**
 * Página placeholder explícita — evita links quebrados (404) enquanto o módulo real
 * não é implementado (Fases 3, 4, 5 e 6). Nunca finge funcionalidade que não existe.
 */
export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-action-blue text-sm font-semibold uppercase tracking-wide">
        Em construção
      </p>
      <h1 className="text-navy-primary mt-2 text-3xl font-bold">{title}</h1>
      <p className="text-text-secondary mt-4">{description}</p>
    </section>
  );
}
