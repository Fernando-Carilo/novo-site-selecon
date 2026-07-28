"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const inputCls = "mt-1 w-full rounded-md border border-line px-3 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-green focus:outline-none focus:ring-1 focus:ring-green";

  return (
    <div className="flex min-h-screen items-center justify-center bg-soft p-4">
      <div className="w-full max-w-sm rounded-lg border border-line bg-white p-8 shadow-md">
        <div className="flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-green to-blue-700 text-sm font-black text-white">IS</div>
          <span className="text-lg font-bold text-ink">Selecon Admin</span>
        </div>
        <p className="mt-4 text-center text-xs text-muted">Acesse a área administrativa do Instituto Selecon</p>

        <form className="mt-8 space-y-4" onSubmit={(e) => { e.preventDefault(); window.location.href = "/admin"; }}>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted">E-mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="admin@selecon.org.br" required />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted">Senha</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="••••••••" required />
          </div>
          <button type="submit" className="w-full min-h-[44px] rounded-md font-extrabold text-sm inline-flex items-center justify-center bg-green text-white shadow-green hover:bg-green-700 transition-all duration-base">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
