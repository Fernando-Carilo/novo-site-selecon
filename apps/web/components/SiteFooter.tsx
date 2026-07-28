import Link from "next/link";

const PORTAL_LINKS = [
  { href: "/concursos", label: "Concursos abertos" },
  { href: "/area-do-candidato", label: "Área do candidato" },
  { href: "/noticias", label: "Publicações" },
  { href: "/atendimento", label: "Atendimento" },
  { href: "/denuncias", label: "Canal de Denúncias" },
];

const SISTEMA_LINKS = [
  { href: "/sistema", label: "Módulos" },
  { href: "/arquitetura", label: "Arquitetura" },
  { href: "/sistema#seguranca", label: "Segurança" },
  { href: "/sistema#integracao", label: "Integrações" },
];

const SAAS_LINKS = [
  { href: "/contato", label: "Solicitar demo" },
  { href: "/institucional/sobre", label: "Sobre o Instituto" },
  { href: "/politica-de-privacidade", label: "Privacidade" },
  { href: "/termos-de-uso", label: "Termos de uso" },
];

const BADGES = ["Next.js 15", "React 19", "NestJS", "PostgreSQL", "AWS"];

export function SiteFooter() {
  return (
    <footer className="bg-blue-950 text-white/80">
      <div className="w-[min(1200px,calc(100%-40px))] mx-auto py-16">
        {/* Grid */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-green to-blue-700 text-xs font-black text-white">
                IS
              </div>
              <span className="text-sm font-bold text-white">Instituto Selecon</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              Instituto Nacional de Seleções e Concursos. Plataforma completa para gestão e
              execução de processos seletivos públicos.
            </p>
          </div>

          {/* Portal */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white/40">Portal</h3>
            <ul className="mt-3 space-y-2">
              {PORTAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors duration-fast hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sistema */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white/40">Sistema</h3>
            <ul className="mt-3 space-y-2">
              {SISTEMA_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors duration-fast hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* SaaS */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white/40">SaaS</h3>
            <ul className="mt-3 space-y-2">
              {SAAS_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors duration-fast hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white/40">Contato</h3>
            <address className="mt-3 space-y-2 text-sm not-italic">
              <p>contato@selecon.org.br</p>
              <p>(61) 3030-4848</p>
              <p className="text-white/50">Brasília — DF, Brasil</p>
            </address>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="w-[min(1200px,calc(100%-40px))] mx-auto flex flex-col items-center justify-between gap-4 py-5 sm:flex-row">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} Instituto Selecon. Todos os direitos reservados.
          </p>
          <div className="flex flex-wrap gap-2">
            {BADGES.map((badge) => (
              <span
                key={badge}
                className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/50"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
