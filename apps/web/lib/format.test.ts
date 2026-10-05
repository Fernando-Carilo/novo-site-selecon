import { describe, expect, it } from "vitest";
import { daysUntil, formatCurrency, formatDate, formatDateRange, normalizeText } from "./format";

describe("format", () => {
  it("formata datas ISO no padrão brasileiro sem deslocar o dia", () => {
    expect(formatDate("2026-11-18")).toBe("18/11/2026");
    expect(formatDateRange("2026-09-28", "2026-11-18")).toBe("28/09/2026 a 18/11/2026");
    expect(formatDateRange(undefined, "2026-11-18")).toBe("até 18/11/2026");
  });

  it("formata moeda em centavos", () => {
    expect(formatCurrency(317296).replace(/ /g, " ")).toBe("R$ 3.172,96");
    expect(formatCurrency(null)).toBe("—");
  });

  it("calcula dias restantes", () => {
    expect(daysUntil("2026-11-18", new Date("2026-11-17T12:00:00-03:00"))).toBe(1);
    expect(daysUntil("2026-11-18", new Date("2026-11-19T12:00:00-03:00"))).toBe(-1);
  });

  it("normaliza acentos e caixa para busca", () => {
    expect(normalizeText("  Cuiabá — Câmara ")).toBe("cuiaba — camara");
  });
});
