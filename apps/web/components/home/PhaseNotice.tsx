import { ClipboardCheckIcon } from "@/components/icons";

/**
 * Aviso explícito de estágio do portal (regra 3.11: nada de funcionalidade simulada).
 * Substituir/remover quando os módulos das Fases 3–6 forem publicados.
 */
export function PhaseNotice() {
  return (
    <section aria-labelledby="phase-title" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <div className="border-border bg-surface flex flex-col gap-4 rounded-xl border border-dashed p-6 sm:flex-row sm:items-start sm:gap-5">
        <span className="bg-navy-primary/5 text-navy-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-lg">
          <ClipboardCheckIcon className="h-6 w-6" />
        </span>
        <div>
          <h2 id="phase-title" className="text-navy-primary text-base font-semibold">
            Portal em evolução — Fase 0 (fundação)
          </h2>
          <p className="text-text-secondary mt-1 max-w-3xl text-sm leading-relaxed">
            O catálogo de concursos, a área do candidato, o atendimento e o canal de denúncias serão
            liberados progressivamente nas próximas fases. Nenhuma funcionalidade é simulada: cada
            seção indica claramente o que já está disponível.
          </p>
        </div>
      </div>
    </section>
  );
}
