import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type {
  AddInternalNoteRequest,
  AddTicketMessageRequest,
  AssignTicketRequest,
  CreateTicketRequest,
  TicketDetail,
  TicketPublicView,
  TicketStatus,
  TicketSummary,
} from "@selecon/contracts";
import { prisma } from "@selecon/db";
import { AuditService } from "../audit/audit.service.js";
import { generateProtocol } from "../common/generate-protocol.js";
import { toTicketDetail, toTicketPublicView, toTicketSummary } from "./tickets.mapper.js";

const DEFAULT_QUEUE_KEY = "atendimento-geral";

const TICKET_INCLUDE = {
  contact: true,
  conversations: { include: { messages: true } },
  internalNotes: true,
} as const;

@Injectable()
export class TicketsService {
  constructor(private readonly audit: AuditService) {}

  async create(input: CreateTicketRequest): Promise<{ protocol: string }> {
    const queue = await prisma.queue.upsert({
      where: { key: DEFAULT_QUEUE_KEY },
      update: {},
      create: { key: DEFAULT_QUEUE_KEY, name: "Atendimento Geral" },
    });

    const contact = await prisma.contact.create({
      data: { name: input.name, email: input.email, phone: input.phone },
    });

    const protocol = generateProtocol("AT");

    const ticket = await prisma.ticket.create({
      data: {
        protocol,
        contactId: contact.id,
        contestId: input.contestId,
        queueId: queue.id,
        channel: input.preferredChannel,
        status: "NEW",
        priority: "NORMAL",
        subject: input.subject,
        conversations: {
          create: {
            channel: input.preferredChannel,
            messages: { create: { direction: "INBOUND", body: input.description } },
          },
        },
      },
    });

    await this.audit.log({
      action: "TICKET_CREATED",
      resourceType: "ticket",
      resourceId: ticket.id,
      afterData: { protocol, channel: input.preferredChannel },
    });

    return { protocol };
  }

  async findPublicByProtocol(protocol: string): Promise<TicketPublicView> {
    const ticket = await prisma.ticket.findUnique({
      where: { protocol },
      include: { conversations: { include: { messages: true } } },
    });
    if (!ticket) {
      // Mensagem neutra — não revela se o protocolo existe ou não (regra 12.1).
      throw new NotFoundException("Protocolo não encontrado");
    }
    return toTicketPublicView(ticket);
  }

  async findAllAdmin(status?: TicketStatus): Promise<TicketSummary[]> {
    const tickets = await prisma.ticket.findMany({
      where: status ? { status } : undefined,
      include: { contact: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return tickets.map(toTicketSummary);
  }

  async findByIdAdmin(id: string): Promise<TicketDetail> {
    return toTicketDetail(await this.getOrThrow(id));
  }

  async assign(id: string, input: AssignTicketRequest, actorUserId: string): Promise<TicketDetail> {
    await this.getOrThrow(id);
    await prisma.ticket.update({
      where: { id },
      data: { assignedUserId: input.userId, status: "IN_PROGRESS" },
    });
    await prisma.assignment.create({
      data: { ticketId: id, userId: input.userId, assignedByUserId: actorUserId },
    });

    await this.audit.log({
      actorUserId,
      action: "TICKET_ASSIGNED",
      resourceType: "ticket",
      resourceId: id,
      afterData: { assignedUserId: input.userId },
    });

    return this.findByIdAdmin(id);
  }

  async addMessage(
    id: string,
    input: AddTicketMessageRequest,
    actorUserId: string,
  ): Promise<TicketDetail> {
    const ticket = await this.getOrThrow(id);
    const conversation = ticket.conversations[0];
    if (!conversation) {
      throw new BadRequestException("Ticket sem conversa associada");
    }

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        direction: "OUTBOUND",
        body: input.body,
        authorUserId: actorUserId,
      },
    });
    await prisma.ticket.update({ where: { id }, data: { status: "ANSWERED" } });

    await this.audit.log({
      actorUserId,
      action: "TICKET_RESPONDED",
      resourceType: "ticket",
      resourceId: id,
    });

    return this.findByIdAdmin(id);
  }

  async addInternalNote(
    id: string,
    input: AddInternalNoteRequest,
    actorUserId: string,
  ): Promise<TicketDetail> {
    await this.getOrThrow(id);
    await prisma.internalNote.create({
      data: { ticketId: id, body: input.body, authorUserId: actorUserId },
    });

    await this.audit.log({
      actorUserId,
      action: "TICKET_INTERNAL_NOTE_ADDED",
      resourceType: "ticket",
      resourceId: id,
    });

    return this.findByIdAdmin(id);
  }

  async close(id: string, actorUserId: string): Promise<TicketDetail> {
    await this.getOrThrow(id);
    await prisma.ticket.update({ where: { id }, data: { status: "CLOSED", closedAt: new Date() } });

    await this.audit.log({
      actorUserId,
      action: "TICKET_CLOSED",
      resourceType: "ticket",
      resourceId: id,
    });
    return this.findByIdAdmin(id);
  }

  async reopen(id: string, actorUserId: string): Promise<TicketDetail> {
    const existing = await this.getOrThrow(id);
    if (existing.status !== "CLOSED") {
      throw new BadRequestException("Somente tickets encerrados podem ser reabertos");
    }
    await prisma.ticket.update({
      where: { id },
      data: { status: "REOPENED", reopenedAt: new Date() },
    });

    await this.audit.log({
      actorUserId,
      action: "TICKET_REOPENED",
      resourceType: "ticket",
      resourceId: id,
    });
    return this.findByIdAdmin(id);
  }

  private async getOrThrow(id: string) {
    const ticket = await prisma.ticket.findUnique({ where: { id }, include: TICKET_INCLUDE });
    if (!ticket) {
      throw new NotFoundException("Ticket não encontrado");
    }
    return ticket;
  }
}
