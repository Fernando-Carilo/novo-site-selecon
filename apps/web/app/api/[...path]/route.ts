import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy server-to-server para apps/api. O navegador só fala com a origem de
 * apps/web (mesmo domínio/porta) — nunca chama a API diretamente — evitando
 * CORS e mantendo o cookie de sessão HttpOnly em uma única origem, conforme
 * exigido: "o frontend deve consumir a API pela mesma origem sempre que
 * possível". Repassa cookies e o cabeçalho Set-Cookie de volta ao navegador.
 */
const API_INTERNAL_URL = process.env.API_INTERNAL_URL ?? "http://localhost:3001/api";

async function proxy(request: NextRequest, path: string[]): Promise<NextResponse> {
  const targetUrl = new URL(`${API_INTERNAL_URL}/${path.join("/")}`);
  targetUrl.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");

  const hasBody = !["GET", "HEAD"].includes(request.method);

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: hasBody ? await request.arrayBuffer() : undefined,
    redirect: "manual",
  });

  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("transfer-encoding");

  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxy(request, (await params).path);
}
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxy(request, (await params).path);
}
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxy(request, (await params).path);
}
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxy(request, (await params).path);
}
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxy(request, (await params).path);
}
