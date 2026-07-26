import { cookies } from "next/headers";
import type { CurrentUser } from "@selecon/contracts";

const API_INTERNAL_URL = process.env.API_INTERNAL_URL ?? "http://localhost:3001";

/** Lê a sessão atual no servidor, repassando o cookie recebido do navegador. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  if (!cookieHeader) return null;

  const response = await fetch(`${API_INTERNAL_URL}/auth/me`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });

  if (!response.ok) return null;
  return response.json() as Promise<CurrentUser>;
}
