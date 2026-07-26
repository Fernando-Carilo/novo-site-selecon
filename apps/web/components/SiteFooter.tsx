import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/institucional/sobre", label: "Sobre o Instituto" },
  { href: "/politica-de-privacidade", label: "Política de Privacidade" },
  { href: "/termos-de-uso", label: "Termos de Uso" },
];

export function SiteFooter() {
  return (
    <footer className="border-border bg-navy-primary border-t text-white">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm">
        <p className="font-semibold">Instituto Selecon</p>
        <p className="mt-2 max-w-2xl text-white/80">
          Concursos, atendimento, canal de integridade e conteúdo institucional em um único lugar.
        </p>
        <nav aria-label="Links institucionais" className="mt-4">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="focus-visible:ring-support-cyan rounded text-white/80 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-[3px]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
