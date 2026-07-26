import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { AdminDashboardStats } from "@selecon/contracts";
import { prisma } from "@selecon/db";
import { RequirePermission } from "../auth/require-permission.decorator.js";
import { loadApiEnv } from "../env.js";

/** Tickets abertos sem SLA por caso são considerados atrasados após esta janela — não há
 * política de SLA atribuída a tickets nesta fase (ver apps/api/src/tickets/tickets.service.ts),
 * então este é um limiar operacional razoável e documentado, não um valor inventado por caso. */
const DEFAULT_OVERDUE_HOURS = 48;

@ApiTags("admin-dashboard")
@Controller("admin/dashboard")
export class AdminDashboardController {
  @Get("stats")
  @RequirePermission("audit:read")
  async stats(): Promise<AdminDashboardStats> {
    const now = new Date();
    const overdueThreshold = new Date(now.getTime() - DEFAULT_OVERDUE_HOURS * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      activeContests,
      draftContests,
      closedContests,
      openTickets,
      overdueOpenTickets,
      recentlyClosedTickets,
      whistleblowingReceived,
      whistleblowingUnderAnalysis,
      activeCampaigns,
      campaignsPendingReview,
      pendingPages,
      pendingNews,
      recentAuditEvents,
    ] = await Promise.all([
      prisma.contest.count({ where: { status: "PUBLISHED" } }),
      prisma.contest.count({ where: { status: { in: ["DRAFT", "IN_REVIEW"] } } }),
      prisma.contest.count({ where: { status: { in: ["CLOSED", "ARCHIVED"] } } }),
      prisma.ticket.count({ where: { status: { in: ["NEW", "IN_PROGRESS", "REOPENED"] } } }),
      prisma.ticket.count({
        where: {
          status: { in: ["NEW", "IN_PROGRESS", "REOPENED"] },
          createdAt: { lt: overdueThreshold },
        },
      }),
      prisma.ticket.findMany({
        where: { closedAt: { not: null, gte: thirtyDaysAgo } },
        select: { createdAt: true, closedAt: true },
      }),
      prisma.whistleblowingCase.count({ where: { status: "RECEIVED" } }),
      prisma.whistleblowingCase.count({ where: { status: "UNDER_ANALYSIS" } }),
      prisma.campaign.count({ where: { status: { in: ["APPROVED", "ACTIVE"] } } }),
      prisma.campaign.count({
        where: { status: { in: ["PENDING_REVIEW", "PENDING_COMPLIANCE"] } },
      }),
      prisma.contentPage.count({ where: { status: { in: ["DRAFT", "IN_REVIEW"] } } }),
      prisma.newsPost.count({ where: { status: { in: ["DRAFT", "IN_REVIEW"] } } }),
      prisma.auditEvent.findMany({
        orderBy: { occurredAt: "desc" },
        take: 10,
        select: { id: true, action: true, resourceType: true, occurredAt: true, riskLevel: true },
      }),
    ]);

    const resolutionHours = recentlyClosedTickets.map(
      (t) => (t.closedAt!.getTime() - t.createdAt.getTime()) / (60 * 60 * 1000),
    );
    const averageResolutionHours =
      resolutionHours.length > 0
        ? resolutionHours.reduce((sum, h) => sum + h, 0) / resolutionHours.length
        : null;

    const env = loadApiEnv();
    const integrations = ["candidate", "email", "messaging", "storage"].map((name) => ({
      name,
      mode: env.INTEGRATIONS_MODE,
    }));

    return {
      contests: { active: activeContests, draft: draftContests, closed: closedContests },
      tickets: {
        open: openTickets,
        overdueOpen: overdueOpenTickets,
        averageResolutionHours,
      },
      whistleblowing: {
        received: whistleblowingReceived,
        underAnalysis: whistleblowingUnderAnalysis,
      },
      advertising: { activeCampaigns, pendingReview: campaignsPendingReview },
      content: { pendingPages, pendingNews },
      recentAuditEvents: recentAuditEvents.map((event) => ({
        id: event.id,
        action: event.action,
        resourceType: event.resourceType,
        occurredAt: event.occurredAt.toISOString(),
        riskLevel: event.riskLevel,
      })),
      integrations,
    };
  }
}
