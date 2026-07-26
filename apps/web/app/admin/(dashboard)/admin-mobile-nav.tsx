"use client";

import Link from "next/link";
import { useState } from "react";

export function AdminMobileNav({ items }: { items: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="admin-mobile-nav-menu"
        className="focus-visible:ring-support-cyan rounded-md p-2 text-white focus-visible:outline-none focus-visible:ring-[3px]"
      >
        <span className="sr-only">{open ? "Fechar menu" : "Abrir menu"}</span>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          {open ? (
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M4 6h16M4 12h16M4 18h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          )}
        </svg>
      </button>

      {open && (
        <nav
          id="admin-mobile-nav-menu"
          aria-label="Navegação administrativa (mobile)"
          className="bg-navy-primary absolute inset-x-0 top-full z-10 border-t border-white/10 p-4"
        >
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="focus-visible:ring-support-cyan block rounded-md px-3 py-2 text-sm text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-[3px]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
