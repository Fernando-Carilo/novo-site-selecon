import { describe, expect, it } from "vitest";
import { CONTESTS } from "./data/contests";
import { StaticContentProvider } from "./static-provider";

const provider = new StaticContentProvider();

describe("StaticContentProvider", () => {
  it("lista inscrições abertas antes dos demais", async () => {
    const result = await provider.listContests({ status: "TODOS" });
    expect(result.total).toBe(CONTESTS.length);
    expect(result.items[0]?.status).toBe("INSCRICOES_ABERTAS");
  });

  it("filtra por situação, UF e escolaridade com contagens coerentes", async () => {
    const abertos = await provider.listContests({ status: "ABERTOS" });
    expect(abertos.items.every((c) => c.status === "INSCRICOES_ABERTAS")).toBe(true);
    const mt = await provider.listContests({ uf: "MT" });
    expect(mt.items.every((c) => c.organization.uf === "MT")).toBe(true);
    expect(mt.total).toBe(CONTESTS.filter((c) => c.organization.uf === "MT").length);
    const superior = await provider.listContests({ level: "SUPERIOR", status: "TODOS" });
    expect(superior.items.every((c) => c.educationLevels.includes("SUPERIOR"))).toBe(true);
  });

  it("busca tolera acentos e sinônimos básicos", async () => {
    const semAcento = await provider.listContests({ q: "sao goncalo" });
    expect(semAcento.items.some((c) => c.slug === "guarda-municipal-sao-goncalo-2026")).toBe(true);
    const sigla = await provider.listContests({ q: "gcm niteroi" });
    expect(sigla.items.some((c) => c.slug === "guarda-civil-municipal-niteroi")).toBe(true);
    const edital = await provider.listContests({ q: "001/2026/PMA" });
    expect(edital.items[0]?.slug).toBe("aracas-ba-2026");
  });

  it("pagina sem perder itens", async () => {
    const page1 = await provider.listContests({ status: "TODOS", page: 1 });
    const page2 = await provider.listContests({ status: "TODOS", page: 2 });
    const slugs = new Set([...page1.items, ...page2.items].map((c) => c.slug));
    expect(slugs.size).toBe(page1.items.length + page2.items.length);
    expect(page1.totalPages).toBe(Math.ceil(CONTESTS.length / page1.pageSize));
  });

  it("publicações recentes vêm em ordem decrescente de data", async () => {
    const publications = await provider.getRecentPublications(5);
    const dates = publications.map((p) => p.publishedAt);
    expect([...dates].sort((a, b) => b.localeCompare(a))).toEqual(dates);
  });

  it("dataset tem slugs únicos, capas e links externos válidos", () => {
    const slugs = CONTESTS.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const contest of CONTESTS) {
      expect(contest.highlights.length).toBeLessThanOrEqual(4);
      for (const link of contest.serviceLinks) expect(link.url).toMatch(/^https:\/\//);
      for (const publication of contest.publications) {
        if (publication.url) expect(publication.url).toMatch(/^https:\/\//);
      }
    }
  });
});
