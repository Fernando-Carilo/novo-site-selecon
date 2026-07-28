"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/concursos", label: "Concursos", icon: "📋" },
  { href: "/admin/atendimento", label: "Atendimento", icon: "💬" },
  { href: "/admin/denuncias", label: "Denúncias", icon: "🔒" },
  { href: "/admin/financeiro", label: "Financeiro", icon: "💰" },
  { href: "/admin/logistica", label: "Logística", icon: "🚚" },
  { href: "/admin/cms", label: "CMS", icon: "📝" },
  { href: "/admin/configuracoes", label: "Configurações", icon: "⚙️" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-blue-950">
        <div className="flex h-16 items-center gap-2 border-b border-white/10 px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-green to-blue-700 text-xs font-black text-white">IS</div>
          <span className="text-sm font-bold text-white">Selecon Admin</span>
        </div>
        <nav className="flex-1 overflow-y-auto p-3" aria-label="Menu administrativo">
          <ul className="space-y-1">
            {NAV.map((item) => {
              const active = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link href={item.href} className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all ${active ? "bg-white/10 font-bold text-white" : "text-white/70 hover:bg-white/5 hover:text-white"}`}>
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-white/10 p-4">
          <p className="text-xs text-white/50">Administrador</p>
          <Link href="/admin/login" className="mt-1 block text-xs text-white/70 hover:text-white">Sair</Link>
        </div>
      </aside>

      {/* Main */}
      <div className="ml-64 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-line bg-white px-6">
          <h1 className="text-sm font-bold text-ink">Área Administrativa</h1>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
