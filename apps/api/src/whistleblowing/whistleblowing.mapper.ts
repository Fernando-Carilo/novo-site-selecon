import type {
  WhistleblowingCase,
  WhistleblowingCategory,
  WhistleblowingDecision,
  WhistleblowingMessage,
} from "@selecon/db";
import type {
  WhistleblowingCaseDetail,
  WhistleblowingCasePublicView,
  WhistleblowingCaseSummary,
  WhistleblowingMessageDto,
} from "@selecon/contracts";

type CaseWithCategory = WhistleblowingCase & { category: WhistleblowingCategory };
type CaseWithRelations = CaseWithCategory & {
  messages: WhistleblowingMessage[];
  decision: WhistleblowingDecision | null;
};

function toMessages(messages: WhistleblowingMessage[]): WhistleblowingMessageDto[] {
  return messages
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .map((message) => ({
      id: message.id,
      direction: message.direction,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
    }));
}

export function toCaseSummary(caseRecord: CaseWithCategory): WhistleblowingCaseSummary {
  return {
    id: caseRecord.id,
    protocol: caseRecord.protocol,
    status: caseRecord.status,
    riskLevel: caseRecord.riskLevel,
    isAnonymous: caseRecord.isAnonymous,
    categoryName: caseRecord.category.name,
    createdAt: caseRecord.createdAt.toISOString(),
  };
}

export function toCaseDetail(caseRecord: CaseWithRelations): WhistleblowingCaseDetail {
  return {
    ...toCaseSummary(caseRecord),
    description: toMessages(caseRecord.messages)[0]?.body ?? "",
    involvedPeople: caseRecord.involvedPeopleDescription,
    location: caseRecord.location,
    incidentDate: caseRecord.incidentDate?.toISOString() ?? null,
    messages: toMessages(caseRecord.messages),
    decision: caseRecord.decision
      ? {
          summary: caseRecord.decision.summary,
          decidedAt: caseRecord.decision.decidedAt.toISOString(),
        }
      : null,
  };
}

export function toPublicView(
  caseRecord: WhistleblowingCase & { messages: WhistleblowingMessage[] },
): WhistleblowingCasePublicView {
  return {
    protocol: caseRecord.protocol,
    status: caseRecord.status,
    createdAt: caseRecord.createdAt.toISOString(),
    messages: toMessages(caseRecord.messages),
  };
}
