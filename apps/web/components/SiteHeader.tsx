import Link from "next/link";

const TOP_LINKS = [
  { href: "/atendimento", label: "Atendimento" },
  { href: "/denuncias", label: "Canal de Denúncias" },
  { href: "/admin", label: "Área Administrativa" },
];

const NAV_ITEMS = [
  { href: "/concursos", label: "Concursos" },
  { href: "/institucional", label: "Institucional" },
  { href: "/sistema", label: "Sistema" },
  { href: "/arquitetura", label: "Arquitetura" },
  { href: "/noticias", label: "Publicações" },
  { href: "/contato", label: "Contato" },
];

export function SiteHeader() {
  return (
    <header>
      {/* Top bar */}
      <div className="bg-blue-950 text-white/80 text-xs">
        <div className="w-[min(1200px,calc(100%-40px))] mx-auto flex items-center justify-between py-2">
          <span className="hidden font-medium sm:inline">
            Instituto Nacional de Seleções e Concursos
          </span>
          <div className="flex items-center gap-4">
            {TOP_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors duration-fast hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <span className="hidden text-white/60 lg:inline">(61) 3030-4848</span>
          </div>
        </div>
      </div>

      {/* Main header — sticky + glass */}
      <div className="sticky top-0 z-50 glass border-b border-line/50">
        <div className="w-[min(1200px,calc(100%-40px))] mx-auto flex items-center justify-between py-3">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-green to-blue-700 text-sm font-black text-white">
              IS
            </div>
            <div className="hidden sm:block">
              <span className="block text-sm font-bold text-ink">Instituto Selecon</span>
              <span className="block text-[11px] text-muted">Portal Público + SaaS</span>
            </div>
          </Link>

          {/* Nav */}
          <nav aria-label="Navegação principal" className="hidden min-[1100px]:block">
            <ul className="flex items-center gap-6 text-sm font-medium text-ink">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="transition-colors duration-fast hover:text-green-700"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/admin/login"
              className="min-h-[44px] px-[18px] rounded-md font-extrabold text-sm inline-flex items-center text-ink border border-line hover:border-green/40 transition-all duration-base"
            >
              Login
            </Link>
            <Link
              href="/concursos"
              className="min-h-[44px] px-[18px] rounded-md font-extrabold text-sm inline-flex items-center bg-green text-white shadow-green hover:bg-green-700 transition-all duration-base"
            >
              Ver concursos
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
