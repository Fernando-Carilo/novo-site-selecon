import { prisma } from "@selecon/db";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { WhistleblowingService } from "./whistleblowing.service.js";

describe("WhistleblowingService (integração real com Postgres)", () => {
  const service = new WhistleblowingService();
  const suffix = Date.now();
  let categoryId: string;
  const createdCaseIds: string[] = [];

  beforeAll(async () => {
    const category = await prisma.whistleblowingCategory.create({
      data: { name: `Categoria de teste ${suffix}` },
    });
    categoryId = category.id;
  });

  afterAll(async () => {
    await prisma.whistleblowingAccessEvent.deleteMany({
      where: { caseId: { in: createdCaseIds } },
    });
    await prisma.whistleblowingDecision.deleteMany({ where: { caseId: { in: createdCaseIds } } });
    await prisma.whistleblowingStatusHistory.deleteMany({
      where: { caseId: { in: createdCaseIds } },
    });
    await prisma.whistleblowingMessage.deleteMany({ where: { caseId: { in: createdCaseIds } } });
    await prisma.whistleblowingCredential.deleteMany({ where: { caseId: { in: createdCaseIds } } });
    await prisma.whistleblowingCase.deleteMany({ where: { id: { in: createdCaseIds } } });
    await prisma.whistleblowingCategory.delete({ where: { id: categoryId } });
    await prisma.$disconnect();
  });

  async function createCase() {
    const result = await service.createCase({
      isAnonymous: true,
      categoryId,
      description: "Descrição de teste com conteúdo fictício suficientemente longo.",
    });
    const record = await prisma.whistleblowingCase.findUniqueOrThrow({
      where: { protocol: result.protocol },
    });
    createdCaseIds.push(record.id);
    return { ...result, id: record.id };
  }

  it("nunca persiste o código de acesso em texto puro", async () => {
    const { id, accessCode } = await createCase();
    const credential = await prisma.whistleblowingCredential.findUniqueOrThrow({
      where: { caseId: id },
    });
    expect(credential.codeHash).not.toContain(accessCode);
    expect(credential.codeHash).toMatch(/^\$argon2id\$/);
  });

  it("consulta pública funciona com credenciais corretas", async () => {
    const { protocol, accessCode } = await createCase();
    const view = await service.lookupPublic(protocol, accessCode);
    expect(view.status).toBe("RECEIVED");
    expect(view.messages).toHaveLength(1);
  });

  it("rejeita com a mesma mensagem para código errado e protocolo inexistente", async () => {
    const { protocol } = await createCase();

    let wrongCodeMessage = "";
    try {
      await service.lookupPublic(protocol, "codigo-completamente-errado");
    } catch (error) {
      wrongCodeMessage = (error as Error).message;
    }

    let missingProtocolMessage = "";
    try {
      await service.lookupPublic("DEN-NAO-EXISTE-000000", "qualquer-codigo");
    } catch (error) {
      missingProtocolMessage = (error as Error).message;
    }

    // A propriedade de segurança é a IGUALDADE das mensagens (nenhuma delas revela
    // qual dos dois casos ocorreu) — não a ausência de palavras específicas.
    expect(wrongCodeMessage).toBe(missingProtocolMessage);
    expect(wrongCodeMessage.length).toBeGreaterThan(0);
  });

  it("bloqueia após 5 tentativas com código errado, mesmo com o código correto na 6ª tentativa", async () => {
    const { protocol, accessCode } = await createCase();

    for (let i = 0; i < 5; i += 1) {
      await expect(service.lookupPublic(protocol, `errado-${i}`)).rejects.toThrow();
    }

    await expect(service.lookupPublic(protocol, accessCode)).rejects.toThrow();
  });

  it("getCaseAdmin registra WhistleblowingAccessEvent (trilha própria do domínio)", async () => {
    const { id } = await createCase();
    await service.getCaseAdmin(id, "analista-teste", "Verificação de rotina do caso");

    const events = await prisma.whistleblowingAccessEvent.findMany({ where: { caseId: id } });
    expect(events).toHaveLength(1);
    expect(events[0]?.action).toBe("VIEW");
    expect(events[0]?.justification).toContain("Verificação");
  });

  it("addDecision marca o caso como DECIDED", async () => {
    const { id } = await createCase();
    const detail = await service.addDecision(
      id,
      { summary: "Decisão final de teste" },
      "aprovador-teste",
    );
    expect(detail.status).toBe("DECIDED");
    expect(detail.decision?.summary).toBe("Decisão final de teste");
  });
});
