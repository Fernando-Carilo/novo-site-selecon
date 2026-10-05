#!/usr/bin/env node
/**
 * Validador de links do portal (critério 18.1: "sem links quebrados críticos").
 *
 * Uso: node scripts/check-links.mjs [baseUrl=http://localhost:3000] [--external]
 *
 * 1. Lê o sitemap.xml e percorre todas as páginas internas (mais as rotas descobertas nos
 *    `href` encontrados), verificando status HTTP e âncoras `#id` existentes no HTML de destino.
 * 2. Lista links externos únicos; com `--external`, testa cada um com HEAD/GET (pode falhar em
 *    ambientes sem saída para a internet — o relatório separa "bloqueado" de "quebrado").
 * Sai com código 1 se houver link interno quebrado ou âncora inexistente.
 */
const base = (process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : "http://localhost:3000").replace(/\/$/, "");
const checkExternal = process.argv.includes("--external");

const visited = new Map();
const queue = [];
const external = new Map();
const anchorsToCheck = [];

function enqueue(path, from) {
  if (visited.has(path)) return;
  visited.set(path, { from, status: null });
  queue.push(path);
}

async function fetchText(url) {
  const response = await fetch(url, { redirect: "manual", headers: { "User-Agent": "selecon-link-check" } });
  const body = response.headers.get("content-type")?.includes("text/html") ? await response.text() : "";
  return { status: response.status, body, location: response.headers.get("location") };
}

const sitemap = await fetch(`${base}/sitemap.xml`).then((r) => r.text());
for (const match of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const url = new URL(match[1]);
  enqueue(url.pathname + url.search, "sitemap");
}
enqueue("/", "root");

const hrefRegex = /href="([^"#]*)(#[^"]*)?"/g;
while (queue.length) {
  const path = queue.shift();
  const entry = visited.get(path);
  try {
    const { status, body, location } = await fetchText(`${base}${path}`);
    entry.status = status;
    entry.location = location;
    if (status >= 300 && status < 400 && location) {
      const next = location.startsWith("http") ? new URL(location) : new URL(location, base);
      if (next.origin === new URL(base).origin) enqueue(next.pathname + next.search, path);
      continue;
    }
    if (!body) continue;
    const ids = new Set([...body.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
    entry.ids = ids;
    for (const m of body.matchAll(hrefRegex)) {
      const [, raw, hash] = m;
      if (!raw && hash) {
        anchorsToCheck.push({ page: path, target: path, hash });
        continue;
      }
      if (raw.startsWith("mailto:") || raw.startsWith("tel:") || raw.startsWith("javascript:")) continue;
      if (raw.startsWith("http")) {
        const url = new URL(raw);
        if (url.origin === new URL(base).origin) {
          enqueue(url.pathname + url.search, path);
          if (hash) anchorsToCheck.push({ page: path, target: url.pathname, hash });
        } else {
          external.set(raw, path);
        }
        continue;
      }
      if (raw.startsWith("/")) {
        if (raw.startsWith("/_next/")) continue;
        enqueue(raw, path);
        if (hash) anchorsToCheck.push({ page: path, target: raw.split("?")[0], hash });
      }
    }
  } catch (error) {
    entry.status = `ERR ${error.message}`;
  }
}

const broken = [...visited.entries()].filter(([, v]) => typeof v.status !== "number" || v.status >= 400);
const missingAnchors = [];
for (const { page, target, hash } of anchorsToCheck) {
  const id = decodeURIComponent(hash.slice(1));
  if (!id) continue;
  const targetEntry = visited.get(target) ?? visited.get(`${target}/`);
  if (targetEntry?.ids && !targetEntry.ids.has(id)) missingAnchors.push({ page, target, hash });
}

console.log(`Páginas internas verificadas: ${visited.size}`);
console.log(`Links internos quebrados: ${broken.length}`);
for (const [path, v] of broken) console.log(`  ✗ ${path} → ${v.status} (de ${v.from})`);
console.log(`Âncoras inexistentes: ${missingAnchors.length}`);
for (const a of missingAnchors) console.log(`  ✗ ${a.page} → ${a.target}${a.hash}`);
console.log(`Links externos únicos: ${external.size}`);
for (const [url, from] of external) console.log(`  • ${url} (de ${from})`);

if (checkExternal) {
  let blocked = 0;
  let failed = 0;
  for (const [url] of external) {
    try {
      const r = await fetch(url, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(15000) });
      if (r.status >= 400) {
        failed += 1;
        console.log(`  ✗ externo ${url} → ${r.status}`);
      }
    } catch (error) {
      blocked += 1;
      console.log(`  ? externo ${url} → sem resposta (${error.message})`);
    }
  }
  console.log(`Externos com erro HTTP: ${failed}; sem resposta/bloqueados: ${blocked}`);
}

process.exit(broken.length || missingAnchors.length ? 1 : 0);
