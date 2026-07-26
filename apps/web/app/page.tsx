import Link from "next/link";
import { buttonClassNames } from "@selecon/ui";
import { AdSlot } from "@/components/AdSlot";

const SHORTCUTS = [
  { href: "/concursos", label: "Encontrar concurso" },
  { href: "/area-do-candidato", label: "Área do candidato" },
  { href: "/denuncias", label: "Canal de denúncias" },
  { href: "/atendimento", label: "Atendimento" },
];

/**
 * Home — placeholder da Fase 0. A composição completa (busca, destaques, jornada do
 * candidato, campanhas, notícias) é da seção 9.2 e será construída na Fase 2, com
 * fidelidade ao protótipo visual quando `selecon-portal-v2.html` for fornecido
 * (ver docs/ASSUMPTIONS.md).
 */
export default function HomePage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-navy-primary max-w-2xl text-4xl font-bold">
        Portal Integrado do Instituto Selecon
      </h1>
      <p className="text-text-secondary mt-4 max-w-xl">
        Concursos, atendimento e canal de integridade em um único lugar. Este é o shell da Fase 0
        (fundação) — a experiência completa chega nas próximas fases.
      </p>
      <ul className="mt-8 flex flex-wrap gap-3">
        {SHORTCUTS.map((shortcut) => (
          <li key={shortcut.href}>
            <Link
              href={shortcut.href}
              className={buttonClassNames(shortcut.href === "/denuncias" ? "danger" : "primary")}
            >
              {shortcut.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-12 max-w-sm">
        <AdSlot placementKey="HOME_SIDEBAR" />
      </div>
    </section>
  );
}
