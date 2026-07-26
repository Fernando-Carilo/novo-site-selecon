import { describe, expect, it } from "vitest";
import { getCorrelationId, withCorrelationId } from "./correlation.js";

describe("correlation id", () => {
  it("propaga o correlation id definido dentro do contexto", () => {
    withCorrelationId("fixed-id", () => {
      expect(getCorrelationId()).toBe("fixed-id");
    });
  });

  it("gera um id quando nenhum é fornecido", () => {
    withCorrelationId(undefined, () => {
      expect(getCorrelationId()).toBeTruthy();
    });
  });
});
