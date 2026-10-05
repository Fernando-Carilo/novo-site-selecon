"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Icon, buttonClassNames } from "@selecon/ui";
import type { NavItem } from "@/lib/site";

interface MobileMenuProps {
  primary: NavItem[];
  utility: NavItem[];
  candidate: { href: string; label: string };
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Menu mobile acessível (seção 9.1): diálogo modal com foco preso, fechamento por `Esc`,
 * retorno do foco ao botão de abertura e bloqueio de rolagem do fundo.
 */
export function MobileMenu({ primary, utility, candidate }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusables = () => Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE));
    focusables()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, close]);

  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="text-navy-primary hover:bg-background-light inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold"
      >
        <Icon name="menu" size={22} />
        Menu
      </button>

      {open ? (
        <div className="fixed inset-0 z-50">
          <div className="bg-navy-primary/60 absolute inset-0" aria-hidden="true" onClick={close} />
          <div
            id="mobile-menu"
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="bg-surface shadow-high absolute inset-y-0 right-0 flex w-full max-w-sm flex-col overflow-y-auto"
          >
            <div className="border-border flex items-center justify-between border-b px-4 py-3">
              <p id={titleId} className="text-navy-primary text-base font-bold">
                Navegação
              </p>
              <button
                type="button"
                onClick={close}
                className="text-navy-primary hover:bg-background-light inline-flex min-h-11 min-w-11 items-center justify-center rounded-md"
              >
                <Icon name="x" size={22} label="Fechar menu" />
              </button>
            </div>
            <nav aria-label="Navegação principal (mobile)" className="px-2 py-3">
              <ul className="space-y-1">
                {primary.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={close}
                      className="text-navy-primary hover:bg-background-light block rounded-md px-3 py-3 text-base font-semibold"
                    >
                      {item.label}
                      {item.description ? (
                        <span className="text-text-secondary mt-0.5 block text-sm font-normal">
                          {item.description}
                        </span>
                      ) : null}
                    </Link>
                    {item.children ? (
                      <ul className="border-border mb-2 ml-3 border-l pl-3">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              onClick={close}
                              className="text-text-primary hover:bg-background-light block rounded-md px-3 py-2.5 text-sm"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
            </nav>
            <div className="px-4 py-3">
              <Link
                href={candidate.href}
                onClick={close}
                className={buttonClassNames("primary", "w-full")}
              >
                <Icon name="user" size={18} />
                {candidate.label}
              </Link>
            </div>
            <nav aria-label="Links úteis" className="border-border mt-auto border-t px-4 py-4">
              <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                {utility.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={close}
                      className="text-text-secondary hover:text-action-blue inline-block py-1 underline-offset-4 hover:underline"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      ) : null}
    </div>
  );
}
