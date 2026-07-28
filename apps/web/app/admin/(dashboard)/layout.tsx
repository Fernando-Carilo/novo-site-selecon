"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/concursos", label: "Concursos", icon: "📝" },
  { href: "/admin/atendimento", label: "Atendimento", icon: "🎧" },
  { href: "/admin/denuncias", label: "Denúncias", icon: "🔔" },
  { href: "/admin/financeiro", label: "Financeiro", icon: "💰" },
  { href: "/admin/logistica", label: "Logística", icon: "📦" },
  { href: "/admin/conteudo", label: "CMS", icon: "📄" },
  { href: "/admin/configuracoes", label: "Configurações", icon: "⚙️" },
];

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-blue-950 p-6 text-white transition-transform md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <Link href="/admin" className="text-lg font-extrabold text-white">
            Selecon Admin
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-white/70 hover:text-white md:hidden"
            aria-label="Fechar menu"
          >
            ✕
          </button>
        </div>

        <nav className="mt-8" aria-label="Navegação administrativa">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                    isActive(item.href)
                      ? "bg-white/10 font-semibold text-white"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span role="img" aria-hidden="true">
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="min-w-0 flex-1">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-line bg-white px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-ink md:hidden"
              aria-label="Abrir menu"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <p className="text-sm text-ink">
              <span className="font-semibold">Admin</span>{" "}
              <span className="text-muted">• Instituto Selecon</span>
            </p>
          </div>
          <button className="text-sm text-muted hover:text-ink transition-colors">
            Sair
          </button>
        </header>

        {/* Content */}
        <main id="main-content" className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
