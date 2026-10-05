import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy server-side para a API pública da Selecon Central (só rotas
 * públicas de denúncias). O navegador fala com o próprio portal; o portal
 * repassa à Central com o IP de origem, para rate limit e bloqueio
 * progressivo continuarem por denunciante. Nada é cacheado.
 */
const BASE = () =>
  (process.env.CENTRAL_SERVICOS_API_URL ?? process.env.CONTENT_API_URL ?? "")
    .trim()
    .replace(/\/+$/, "");
const TOKEN = () => (process.env.CENTRAL_SERVICOS_API_TOKEN ?? "").trim();
const ALLOWED = /^denuncias(\/[a-z-]+)*$/;

async function forward(req: NextRequest, path: string[]) {
  const base = BASE();
  const target = path.join("/");
  if (!base)
    return NextResponse.json(
      { error: "Canal de denúncias indisponível neste ambiente." },
      { status: 503 },
    );
  if (!ALLOWED.test(target))
    return NextResponse.json({ error: "Rota não permitida." }, { status: 404 });

  const headers: Record<string, string> = { accept: "application/json" };
  if (TOKEN()) headers.authorization = `Bearer ${TOKEN()}`;
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip");
  if (ip) headers["x-forwarded-for"] = ip;
  let body: string | undefined;
  if (req.method === "POST") {
    headers["content-type"] = "application/json";
    body = await req.text();
  }
  try {
    const upstream = await fetch(`${base}/public/${target}`, {
      method: req.method,
      headers,
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });
    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") ?? "application/json",
        "cache-control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível falar com o canal de denúncias. Tente novamente em instantes." },
      { status: 502 },
    );
  }
}

type Ctx = { params: Promise<{ path: string[] }> };
export async function GET(req: NextRequest, ctx: Ctx) {
  return forward(req, (await ctx.params).path);
}
export async function POST(req: NextRequest, ctx: Ctx) {
  return forward(req, (await ctx.params).path);
}
