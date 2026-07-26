import { prisma } from "@selecon/db";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AuditService } from "../audit/audit.service.js";
import { ContestsService } from "./contests.service.js";

/** Integração real contra Postgres local — cria e remove seus próprios dados fictícios. */
describe("ContestsService (integração real com Postgres)", () => {
  const service = new ContestsService(new AuditService());
  const suffix = Date.now();
  let organizationId: string;
  let authorUserId: string;
  let approverUserId: string;
  const createdContestIds: string[] = [];

  beforeAll(async () => {
    const organization = await prisma.contestOrganization.create({
      data: { name: `Órgão de Teste ${suffix}` },
    });
    organizationId = organization.id;

    const author = await prisma.user.create({
      data: { email: `autor-${suffix}@selecon.example`, displayName: "Autor Teste" },
    });
    authorUserId = author.id;

    const approver = await prisma.user.create({
      data: { email: `aprovador-${suffix}@selecon.example`, displayName: "Aprovador Teste" },
    });
    approverUserId = approver.id;
  });

  afterAll(async () => {
    await prisma.contestPublicationApproval.deleteMany({
      where: { contestId: { in: createdContestIds } },
    });
    await prisma.contestFaq.deleteMany({ where: { contestId: { in: createdContestIds } } });
    await prisma.contestPosition.deleteMany({ where: { contestId: { in: createdContestIds } } });
    await prisma.contest.deleteMany({ where: { id: { in: createdContestIds } } });
    await prisma.contestOrganization.delete({ where: { id: organizationId } });
    await prisma.user.deleteMany({ where: { id: { in: [authorUserId, approverUserId] } } });
    await prisma.$disconnect();
  });

  async function createDraft(slugSuffix: string) {
    const contest = await service.createDraft(
      {
        title: `Concurso ${slugSuffix}`,
        slug: `concurso-teste-${suffix}-${slugSuffix}`,
        organizationId,
        shortDescription: "Descrição de teste",
      },
      authorUserId,
    );
    createdContestIds.push(contest.id);
    return contest;
  }

  it("cria um concurso em DRAFT e não o expõe publicamente", async () => {
    const contest = await createDraft("draft");
    expect(contest.status).toBe("DRAFT");
    await expect(service.findPublicBySlug(contest.slug)).rejects.toThrow();
  });

  it("rejeita publicação quando autor e aprovador são o mesmo usuário", async () => {
    const contest = await createDraft("mesmo-autor");
    await expect(service.publish(contest.id, authorUserId)).rejects.toThrow(/separação de funções/);
  });

  it("publica com sucesso quando aprovador é diferente do autor, e o concurso passa a ser público", async () => {
    const contest = await createDraft("publicavel");
    const published = await service.publish(contest.id, approverUserId);
    expect(published.status).toBe("PUBLISHED");

    const publicView = await service.findPublicBySlug(contest.slug);
    expect(publicView.id).toBe(contest.id);

    const approval = await prisma.contestPublicationApproval.findFirst({
      where: { contestId: contest.id },
    });
    expect(approval?.authorUserId).toBe(authorUserId);
    expect(approval?.approverUserId).toBe(approverUserId);
  });

  it("rejeita publicação duplicada de um concurso já publicado", async () => {
    const contest = await createDraft("duplo-publish");
    await service.publish(contest.id, approverUserId);
    await expect(service.publish(contest.id, approverUserId)).rejects.toThrow();
  });

  it("segue o ciclo de vida completo: publish -> suspend -> close -> archive, saindo do público ao arquivar", async () => {
    const contest = await createDraft("ciclo-completo");
    await service.publish(contest.id, approverUserId);
    await service.suspend(contest.id, approverUserId, "motivo de teste");
    const closed = await service.close(contest.id, approverUserId);
    expect(closed.status).toBe("CLOSED");
    const archived = await service.archive(contest.id, approverUserId);
    expect(archived.status).toBe("ARCHIVED");

    await expect(service.findPublicBySlug(contest.slug)).rejects.toThrow();
  });

  it("rejeita edição de campos principais após publicação", async () => {
    const contest = await createDraft("sem-edicao-pos-publish");
    await service.publish(contest.id, approverUserId);
    await expect(
      service.update(contest.id, { title: "Novo título" }, authorUserId),
    ).rejects.toThrow();
  });

  it("registra evento de auditoria para criação e publicação", async () => {
    const contest = await createDraft("auditoria");
    await service.publish(contest.id, approverUserId);

    const events = await prisma.auditEvent.findMany({
      where: { resourceType: "contest", resourceId: contest.id },
    });
    const actions = events.map((event) => event.action);
    expect(actions).toContain("CONTEST_CREATED");
    expect(actions).toContain("CONTEST_PUBLISHED");
  });
});
