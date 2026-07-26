import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type {
  ContestCatalogFilters,
  ContestDetail,
  ContestSummary,
  CreateContestFaqRequest,
  CreateContestPositionRequest,
  CreateContestRequest,
  UpdateContestRequest,
} from "@selecon/contracts";
import { prisma, type ContestStatus } from "@selecon/db";
import { AuditService } from "../audit/audit.service.js";
import { toContestDetail, toContestSummary } from "./contests.mapper.js";

const CONTEST_INCLUDE = { organization: true, faqs: true, positions: true } as const;

/** Estados em que o concurso é visível ao público — DRAFT/IN_REVIEW/SCHEDULED/ARCHIVED nunca são. */
const PUBLIC_VISIBLE_STATUSES: ContestStatus[] = ["PUBLISHED", "SUSPENDED", "CLOSED"];

/** Estados em que os campos principais do concurso ainda podem ser editados livremente. */
const EDITABLE_STATUSES: ContestStatus[] = ["DRAFT", "IN_REVIEW"];

@Injectable()
export class ContestsService {
  constructor(private readonly audit: AuditService) {}

  async createDraft(input: CreateContestRequest, actorUserId: string): Promise<ContestDetail> {
    const existingSlug = await prisma.contest.findUnique({ where: { slug: input.slug } });
    if (existingSlug) {
      throw new ConflictException("Já existe um concurso com este slug");
    }

    const contest = await prisma.contest.create({
      data: {
        title: input.title,
        slug: input.slug,
        organizationId: input.organizationId,
        shortDescription: input.shortDescription,
        vacancies: input.vacancies,
        educationLevel: input.educationLevel,
        registrationOpensAt: input.registrationOpensAt
          ? new Date(input.registrationOpensAt)
          : undefined,
        registrationClosesAt: input.registrationClosesAt
          ? new Date(input.registrationClosesAt)
          : undefined,
        examDate: input.examDate ? new Date(input.examDate) : undefined,
        feeAmountCents: input.feeAmountCents,
        createdByUserId: actorUserId,
        status: "DRAFT",
      },
      include: CONTEST_INCLUDE,
    });

    await this.audit.log({
      actorUserId,
      action: "CONTEST_CREATED",
      resourceType: "contest",
      resourceId: contest.id,
      afterData: { title: contest.title, slug: contest.slug, status: contest.status },
    });

    return toContestDetail(contest);
  }

  async update(
    id: string,
    input: UpdateContestRequest,
    actorUserId: string,
  ): Promise<ContestDetail> {
    const existing = await this.getOrThrow(id);
    if (!EDITABLE_STATUSES.includes(existing.status)) {
      throw new BadRequestException(
        "Concursos publicados não podem ser editados diretamente — use retificação (versão futura) ou suspenda antes de editar",
      );
    }

    const contest = await prisma.contest.update({
      where: { id },
      data: {
        title: input.title,
        organizationId: input.organizationId,
        shortDescription: input.shortDescription,
        vacancies: input.vacancies,
        educationLevel: input.educationLevel,
        registrationOpensAt: input.registrationOpensAt
          ? new Date(input.registrationOpensAt)
          : undefined,
        registrationClosesAt: input.registrationClosesAt
          ? new Date(input.registrationClosesAt)
          : undefined,
        examDate: input.examDate ? new Date(input.examDate) : undefined,
        feeAmountCents: input.feeAmountCents,
      },
      include: CONTEST_INCLUDE,
    });

    await this.audit.log({
      actorUserId,
      action: "CONTEST_UPDATED",
      resourceType: "contest",
      resourceId: id,
      beforeData: { title: existing.title, shortDescription: existing.shortDescription },
      afterData: { title: contest.title, shortDescription: contest.shortDescription },
    });

    return toContestDetail(contest);
  }

  async submitForReview(id: string, actorUserId: string): Promise<ContestDetail> {
    const existing = await this.getOrThrow(id);
    if (existing.status !== "DRAFT") {
      throw new BadRequestException("Somente rascunhos podem ser enviados para revisão");
    }

    const contest = await prisma.contest.update({
      where: { id },
      data: { status: "IN_REVIEW" },
      include: CONTEST_INCLUDE,
    });

    await this.audit.log({
      actorUserId,
      action: "CONTEST_SUBMITTED_FOR_REVIEW",
      resourceType: "contest",
      resourceId: id,
    });

    return toContestDetail(contest);
  }

  /**
   * Publica o concurso. Regra crítica (seção 9.4): autor e aprovador devem ser
   * pessoas diferentes. `scheduledFor` no futuro deixa o concurso como SCHEDULED
   * até um job do worker (Fase 8+) promover para PUBLISHED — nesta fase, apenas
   * publicação imediata é suportada de ponta a ponta.
   */
  async publish(id: string, approverUserId: string): Promise<ContestDetail> {
    const existing = await this.getOrThrow(id);

    if (existing.status === "PUBLISHED") {
      throw new BadRequestException("Concurso já está publicado");
    }
    if (!["DRAFT", "IN_REVIEW"].includes(existing.status)) {
      throw new BadRequestException("Concurso não está em um estado publicável");
    }
    if (existing.createdByUserId === approverUserId) {
      throw new ForbiddenException(
        "O aprovador deve ser um usuário diferente do autor do concurso (separação de funções)",
      );
    }

    const now = new Date();
    const contest = await prisma.contest.update({
      where: { id },
      data: { status: "PUBLISHED", publishedAt: now },
      include: CONTEST_INCLUDE,
    });

    await prisma.contestPublicationApproval.create({
      data: {
        contestId: id,
        authorUserId: existing.createdByUserId,
        approverUserId,
        decidedAt: now,
      },
    });

    await this.audit.log({
      actorUserId: approverUserId,
      action: "CONTEST_PUBLISHED",
      resourceType: "contest",
      resourceId: id,
      afterData: { authorUserId: existing.createdByUserId, approverUserId },
      riskLevel: "high",
    });

    return toContestDetail(contest);
  }

  async suspend(id: string, actorUserId: string, justification?: string): Promise<ContestDetail> {
    const existing = await this.getOrThrow(id);
    if (existing.status !== "PUBLISHED") {
      throw new BadRequestException("Somente concursos publicados podem ser suspensos");
    }

    const contest = await prisma.contest.update({
      where: { id },
      data: { status: "SUSPENDED" },
      include: CONTEST_INCLUDE,
    });

    await this.audit.log({
      actorUserId,
      action: "CONTEST_SUSPENDED",
      resourceType: "contest",
      resourceId: id,
      justification,
      riskLevel: "high",
    });

    return toContestDetail(contest);
  }

  async close(id: string, actorUserId: string): Promise<ContestDetail> {
    const existing = await this.getOrThrow(id);
    if (!["PUBLISHED", "SUSPENDED"].includes(existing.status)) {
      throw new BadRequestException(
        "Concurso precisa estar publicado ou suspenso para ser encerrado",
      );
    }

    const contest = await prisma.contest.update({
      where: { id },
      data: { status: "CLOSED" },
      include: CONTEST_INCLUDE,
    });

    await this.audit.log({
      actorUserId,
      action: "CONTEST_CLOSED",
      resourceType: "contest",
      resourceId: id,
    });

    return toContestDetail(contest);
  }

  async archive(id: string, actorUserId: string): Promise<ContestDetail> {
    const existing = await this.getOrThrow(id);
    if (existing.status !== "CLOSED") {
      throw new BadRequestException("Somente concursos encerrados podem ser arquivados");
    }

    const contest = await prisma.contest.update({
      where: { id },
      data: { status: "ARCHIVED" },
      include: CONTEST_INCLUDE,
    });

    await this.audit.log({
      actorUserId,
      action: "CONTEST_ARCHIVED",
      resourceType: "contest",
      resourceId: id,
    });

    return toContestDetail(contest);
  }

  async addFaq(
    contestId: string,
    input: CreateContestFaqRequest,
    actorUserId: string,
  ): Promise<ContestDetail> {
    await this.getOrThrow(contestId);
    await prisma.contestFaq.create({
      data: { contestId, question: input.question, answer: input.answer, order: input.order },
    });

    await this.audit.log({
      actorUserId,
      action: "CONTEST_FAQ_ADDED",
      resourceType: "contest",
      resourceId: contestId,
    });

    return this.findByIdAdmin(contestId);
  }

  async addPosition(
    contestId: string,
    input: CreateContestPositionRequest,
    actorUserId: string,
  ): Promise<ContestDetail> {
    await this.getOrThrow(contestId);
    await prisma.contestPosition.create({
      data: {
        contestId,
        title: input.title,
        vacancies: input.vacancies,
        requirements: input.requirements,
        salaryCents: input.salaryCents,
      },
    });

    await this.audit.log({
      actorUserId,
      action: "CONTEST_POSITION_ADDED",
      resourceType: "contest",
      resourceId: contestId,
    });

    return this.findByIdAdmin(contestId);
  }

  async findAllAdmin(status?: ContestStatus): Promise<ContestSummary[]> {
    const contests = await prisma.contest.findMany({
      where: status ? { status } : undefined,
      include: { organization: true },
      orderBy: { updatedAt: "desc" },
      take: 100,
    });
    return contests.map(toContestSummary);
  }

  async findByIdAdmin(id: string): Promise<ContestDetail> {
    return toContestDetail(await this.getOrThrow(id));
  }

  async findPublicCatalog(filters: ContestCatalogFilters): Promise<ContestSummary[]> {
    const contests = await prisma.contest.findMany({
      where: {
        status: filters.status ?? { in: PUBLIC_VISIBLE_STATUSES },
        educationLevel: filters.educationLevel ? { equals: filters.educationLevel } : undefined,
        organization: filters.organization
          ? { name: { contains: filters.organization, mode: "insensitive" } }
          : undefined,
        locations:
          filters.state || filters.city
            ? { some: { state: filters.state, city: filters.city } }
            : undefined,
        title: filters.query ? { contains: filters.query, mode: "insensitive" } : undefined,
        registrationOpensAt: filters.onlyOpenRegistrations ? { lte: new Date() } : undefined,
        registrationClosesAt: filters.onlyOpenRegistrations ? { gte: new Date() } : undefined,
      },
      include: { organization: true },
      orderBy:
        filters.sort === "opening"
          ? { registrationOpensAt: "desc" }
          : filters.sort === "updated"
            ? { updatedAt: "desc" }
            : { publishedAt: "desc" },
      take: 50,
    });
    return contests.map(toContestSummary);
  }

  async findPublicBySlug(slug: string): Promise<ContestDetail> {
    const contest = await prisma.contest.findUnique({
      where: { slug },
      include: CONTEST_INCLUDE,
    });
    if (!contest || !PUBLIC_VISIBLE_STATUSES.includes(contest.status)) {
      throw new NotFoundException("Concurso não encontrado");
    }
    return toContestDetail(contest);
  }

  private async getOrThrow(id: string) {
    const contest = await prisma.contest.findUnique({ where: { id }, include: CONTEST_INCLUDE });
    if (!contest) {
      throw new NotFoundException("Concurso não encontrado");
    }
    return contest;
  }
}
