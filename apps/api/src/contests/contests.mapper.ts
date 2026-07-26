import type { Contest, ContestFaq, ContestOrganization, ContestPosition } from "@selecon/db";
import type { ContestDetail, ContestSummary } from "@selecon/contracts";

type ContestWithOrg = Contest & { organization: ContestOrganization };
type ContestWithRelations = ContestWithOrg & { faqs: ContestFaq[]; positions: ContestPosition[] };

export function toContestSummary(contest: ContestWithOrg): ContestSummary {
  return {
    id: contest.id,
    slug: contest.slug,
    title: contest.title,
    organization: contest.organization.name,
    status: contest.status,
    shortDescription: contest.shortDescription,
    vacancies: contest.vacancies,
    educationLevel: contest.educationLevel,
    registrationOpensAt: contest.registrationOpensAt?.toISOString() ?? null,
    registrationClosesAt: contest.registrationClosesAt?.toISOString() ?? null,
    updatedAt: contest.updatedAt.toISOString(),
  };
}

export function toContestDetail(contest: ContestWithRelations): ContestDetail {
  return {
    ...toContestSummary(contest),
    organizationId: contest.organizationId,
    examDate: contest.examDate?.toISOString() ?? null,
    feeAmountCents: contest.feeAmountCents,
    createdByUserId: contest.createdByUserId,
    publishedAt: contest.publishedAt?.toISOString() ?? null,
    createdAt: contest.createdAt.toISOString(),
    faqs: contest.faqs
      .sort((a, b) => a.order - b.order)
      .map((faq) => ({ id: faq.id, question: faq.question, answer: faq.answer, order: faq.order })),
    positions: contest.positions.map((position) => ({
      id: position.id,
      title: position.title,
      vacancies: position.vacancies,
      requirements: position.requirements,
      salaryCents: position.salaryCents,
    })),
  };
}
