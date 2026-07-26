import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { generateTemporaryPassword, hashPassword, verifyPassword } from "@selecon/auth";
import { prisma } from "@selecon/db";
import { createLogger } from "@selecon/observability";
import type {
  AddWhistleblowingDecisionRequest,
  CreateWhistleblowingCaseRequest,
  WhistleblowingCaseDetail,
  WhistleblowingCasePublicView,
  WhistleblowingCaseStatus,
  WhistleblowingCaseSummary,
  WhistleblowingCredentials,
} from "@selecon/contracts";
import { generateProtocol } from "../common/generate-protocol.js";
import { toCaseDetail, toCaseSummary, toPublicView } from "./whistleblowing.mapper.js";

/**
 * Logger dedicado do domínio de denúncias — nunca deve logar conteúdo do caso
 * (regra 12.3: "não registre IP/identificadores além do estritamente necessário").
 * Mensagens abaixo só incluem protocolo/IDs, nunca descrição ou dados pessoais.
 */
const logger = createLogger("whistleblowing");

const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

const CASE_INCLUDE = { category: true, messages: true, decision: true } as const;

@Injectable()
export class WhistleblowingService {
  /**
   * Cria um caso. Protocolo e código são gerados por CSPRNG; o código nunca é
   * persistido em texto puro — apenas seu hash Argon2id (regra 12.3). O
   * chamador (controller) deve garantir que a resposta com as credenciais é
   * entregue uma única vez e nunca reenviada por e-mail em texto aberto.
   */
  async createCase(input: CreateWhistleblowingCaseRequest): Promise<WhistleblowingCredentials> {
    const category = await prisma.whistleblowingCategory.findUnique({
      where: { id: input.categoryId },
    });
    if (!category) {
      throw new BadRequestException("Categoria inválida");
    }

    const protocol = generateProtocol("DEN");
    const accessCode = generateTemporaryPassword();
    const codeHash = await hashPassword(accessCode);

    const caseRecord = await prisma.whistleblowingCase.create({
      data: {
        protocol,
        categoryId: input.categoryId,
        isAnonymous: input.isAnonymous,
        involvedPeopleDescription: input.involvedPeople,
        location: input.location,
        incidentDate: input.incidentDate ? new Date(input.incidentDate) : undefined,
        credential: { create: { codeHash } },
        messages: { create: { direction: "FROM_REPORTER", body: input.description } },
        statusHistory: {
          create: {
            toStatus: "RECEIVED",
            changedByUserId: "system",
            justification: "Caso recebido",
          },
        },
        ...(input.isAnonymous
          ? {}
          : {
              parties: {
                create: {
                  role: "WITNESS",
                  name: input.reporterName,
                  description: input.reporterEmail ? `Contato: ${input.reporterEmail}` : undefined,
                },
              },
            }),
      },
    });

    logger.info({ protocol: caseRecord.protocol }, "Novo caso de denúncia recebido");

    return { protocol, accessCode };
  }

  /**
   * Verifica protocolo + código. Mensagens de erro são sempre idênticas
   * (protocolo inexistente vs. código errado) para não permitir enumeração.
   * Comparação em tempo constante é feita dentro de verifyPassword (Argon2).
   */
  private async verifyCredential(protocol: string, accessCode: string) {
    const caseRecord = await prisma.whistleblowingCase.findUnique({
      where: { protocol },
      include: { credential: true },
    });

    const neutralError = () => new UnauthorizedException("Protocolo ou código inválidos");

    if (!caseRecord || !caseRecord.credential) {
      throw neutralError();
    }

    const credential = caseRecord.credential;
    if (credential.lockedUntil && credential.lockedUntil > new Date()) {
      throw neutralError();
    }

    const valid = await verifyPassword(credential.codeHash, accessCode);
    if (!valid) {
      const failedAttempts = credential.failedAttempts + 1;
      await prisma.whistleblowingCredential.update({
        where: { id: credential.id },
        data: {
          failedAttempts,
          lockedUntil:
            failedAttempts >= LOCKOUT_THRESHOLD
              ? new Date(Date.now() + LOCKOUT_DURATION_MS)
              : undefined,
        },
      });
      logger.info({ protocol }, "Tentativa de acesso com código inválido");
      throw neutralError();
    }

    if (credential.failedAttempts > 0) {
      await prisma.whistleblowingCredential.update({
        where: { id: credential.id },
        data: { failedAttempts: 0, lockedUntil: null },
      });
    }

    return caseRecord;
  }

  async lookupPublic(protocol: string, accessCode: string): Promise<WhistleblowingCasePublicView> {
    const caseRecord = await this.verifyCredential(protocol, accessCode);
    const withMessages = await prisma.whistleblowingCase.findUniqueOrThrow({
      where: { id: caseRecord.id },
      include: { messages: true },
    });
    return toPublicView(withMessages);
  }

  async addReporterMessage(
    protocol: string,
    accessCode: string,
    body: string,
  ): Promise<WhistleblowingCasePublicView> {
    const caseRecord = await this.verifyCredential(protocol, accessCode);
    await prisma.whistleblowingMessage.create({
      data: { caseId: caseRecord.id, direction: "FROM_REPORTER", body },
    });
    return this.lookupPublic(protocol, accessCode);
  }

  // --- Administração (acesso restrito por RBAC — INTEGRITY_*, ver ADR-0003) ---

  async listCasesAdmin(status?: WhistleblowingCaseStatus): Promise<WhistleblowingCaseSummary[]> {
    const cases = await prisma.whistleblowingCase.findMany({
      where: status ? { status } : undefined,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return cases.map(toCaseSummary);
  }

  /**
   * Toda visualização do detalhe de um caso exige justificativa e gera
   * `WhistleblowingAccessEvent` — trilha de acesso própria do domínio,
   * separada da auditoria geral (regra 12.3: "exija justificativa para
   * acesso interno", "registre CASE_ACCESSED").
   */
  async getCaseAdmin(
    id: string,
    actorUserId: string,
    justification: string,
  ): Promise<WhistleblowingCaseDetail> {
    const caseRecord = await prisma.whistleblowingCase.findUnique({
      where: { id },
      include: CASE_INCLUDE,
    });
    if (!caseRecord) {
      throw new NotFoundException("Caso não encontrado");
    }

    await prisma.whistleblowingAccessEvent.create({
      data: { caseId: id, accessedByUserId: actorUserId, justification, action: "VIEW" },
    });

    return toCaseDetail(caseRecord);
  }

  async updateStatus(
    id: string,
    status: WhistleblowingCaseStatus,
    justification: string,
    actorUserId: string,
  ): Promise<WhistleblowingCaseDetail> {
    const existing = await prisma.whistleblowingCase.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException("Caso não encontrado");
    }

    await prisma.whistleblowingCase.update({
      where: { id },
      data: { status, closedAt: status === "CLOSED" ? new Date() : undefined },
    });
    await prisma.whistleblowingStatusHistory.create({
      data: {
        caseId: id,
        fromStatus: existing.status,
        toStatus: status,
        changedByUserId: actorUserId,
        justification,
      },
    });

    return this.getCaseAdmin(id, actorUserId, justification);
  }

  async addInstitutionMessage(
    id: string,
    body: string,
    actorUserId: string,
    justification: string,
  ): Promise<WhistleblowingCaseDetail> {
    const existing = await prisma.whistleblowingCase.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException("Caso não encontrado");
    }
    await prisma.whistleblowingMessage.create({
      data: { caseId: id, direction: "FROM_INSTITUTION", body },
    });

    return this.getCaseAdmin(id, actorUserId, justification);
  }

  async assign(
    id: string,
    analystUserId: string,
    actorUserId: string,
  ): Promise<WhistleblowingCaseDetail> {
    const existing = await prisma.whistleblowingCase.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException("Caso não encontrado");
    }
    await prisma.whistleblowingAssignment.create({ data: { caseId: id, analystUserId } });

    return this.getCaseAdmin(id, actorUserId, `Atribuído ao analista ${analystUserId}`);
  }

  async addDecision(
    id: string,
    input: AddWhistleblowingDecisionRequest,
    actorUserId: string,
  ): Promise<WhistleblowingCaseDetail> {
    const existing = await prisma.whistleblowingCase.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException("Caso não encontrado");
    }

    await prisma.whistleblowingDecision.create({
      data: { caseId: id, summary: input.summary, decidedByUserId: actorUserId },
    });
    await prisma.whistleblowingCase.update({ where: { id }, data: { status: "DECIDED" } });

    return this.getCaseAdmin(id, actorUserId, "Decisão registrada");
  }
}
