import type { Contact, InternalNote, Message, Ticket } from "@selecon/db";
import type {
  TicketDetail,
  TicketMessageDto,
  TicketPublicView,
  TicketSummary,
} from "@selecon/contracts";

type TicketWithContact = Ticket & { contact: Contact };
type TicketWithRelations = TicketWithContact & {
  conversations: { messages: Message[] }[];
  internalNotes: InternalNote[];
};

function collectMessages(conversations: { messages: Message[] }[]): TicketMessageDto[] {
  return conversations
    .flatMap((conversation) => conversation.messages)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .map((message) => ({
      id: message.id,
      direction: message.direction,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
    }));
}

export function toTicketSummary(ticket: TicketWithContact): TicketSummary {
  return {
    id: ticket.id,
    protocol: ticket.protocol,
    subject: ticket.subject,
    status: ticket.status,
    priority: ticket.priority,
    channel: ticket.channel,
    contactName: ticket.contact.name,
    contactEmail: ticket.contact.email,
    assignedUserId: ticket.assignedUserId,
    createdAt: ticket.createdAt.toISOString(),
  };
}

export function toTicketDetail(ticket: TicketWithContact & TicketWithRelations): TicketDetail {
  return {
    ...toTicketSummary(ticket),
    description: collectMessages(ticket.conversations)[0]?.body ?? "",
    messages: collectMessages(ticket.conversations),
    internalNotes: ticket.internalNotes.map((note) => ({
      id: note.id,
      body: note.body,
      authorUserId: note.authorUserId,
      createdAt: note.createdAt.toISOString(),
    })),
  };
}

export function toTicketPublicView(
  ticket: Ticket & { conversations: { messages: Message[] }[] },
): TicketPublicView {
  return {
    protocol: ticket.protocol,
    subject: ticket.subject,
    status: ticket.status,
    createdAt: ticket.createdAt.toISOString(),
    messages: collectMessages(ticket.conversations),
  };
}
