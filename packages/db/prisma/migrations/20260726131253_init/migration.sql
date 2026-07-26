-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "advertising";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "content";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "contests";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "governance";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "identity";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "service";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "whistleblowing";

-- CreateEnum
CREATE TYPE "identity"."UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "identity"."IdentityProvider" AS ENUM ('AZURE_AD', 'LOCAL_DEV');

-- CreateEnum
CREATE TYPE "identity"."LoginResult" AS ENUM ('SUCCESS', 'FAILURE');

-- CreateEnum
CREATE TYPE "identity"."AccessReviewDecision" AS ENUM ('CONFIRMED', 'REVOKED');

-- CreateEnum
CREATE TYPE "identity"."ScopeType" AS ENUM ('CONTEST', 'QUEUE', 'UNIT', 'MODULE');

-- CreateEnum
CREATE TYPE "content"."ContentStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'PUBLISHED', 'UNPUBLISHED');

-- CreateEnum
CREATE TYPE "contests"."ContestStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'SCHEDULED', 'PUBLISHED', 'SUSPENDED', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "contests"."DocumentKind" AS ENUM ('EDITAL', 'ANEXO', 'RETIFICACAO', 'COMUNICADO');

-- CreateEnum
CREATE TYPE "contests"."AntivirusStatus" AS ENUM ('PENDING', 'CLEAN', 'INFECTED');

-- CreateEnum
CREATE TYPE "contests"."SubscriptionChannel" AS ENUM ('EMAIL', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "service"."TicketChannel" AS ENUM ('WEB', 'EMAIL', 'WHATSAPP', 'CHAT');

-- CreateEnum
CREATE TYPE "service"."TicketStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'ANSWERED', 'CLOSED', 'REOPENED');

-- CreateEnum
CREATE TYPE "service"."TicketPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "service"."MessageDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "service"."SlaEventKind" AS ENUM ('FIRST_RESPONSE_DUE', 'RESOLUTION_DUE', 'BREACHED', 'MET');

-- CreateEnum
CREATE TYPE "service"."KnowledgeStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "service"."IntegrationDeliveryProvider" AS ENUM ('GRAPH', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "service"."IntegrationDeliveryStatus" AS ENUM ('PENDING', 'DELIVERED', 'FAILED');

-- CreateEnum
CREATE TYPE "whistleblowing"."WhistleblowingCaseStatus" AS ENUM ('RECEIVED', 'TRIAGE', 'UNDER_ANALYSIS', 'AWAITING_INFO', 'DECIDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "whistleblowing"."WhistleblowingRiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "whistleblowing"."WhistleblowingPartyRole" AS ENUM ('REPORTED', 'WITNESS', 'VICTIM');

-- CreateEnum
CREATE TYPE "whistleblowing"."WhistleblowingMessageDirection" AS ENUM ('FROM_REPORTER', 'FROM_INSTITUTION');

-- CreateEnum
CREATE TYPE "whistleblowing"."WhistleblowingAccessAction" AS ENUM ('VIEW', 'EXPORT');

-- CreateEnum
CREATE TYPE "advertising"."CampaignStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'PENDING_COMPLIANCE', 'APPROVED', 'ACTIVE', 'PAUSED', 'FINISHED', 'REJECTED');

-- CreateEnum
CREATE TYPE "advertising"."CreativeFormat" AS ENUM ('DESKTOP', 'MOBILE');

-- CreateEnum
CREATE TYPE "advertising"."BillingStatus" AS ENUM ('PENDING', 'INVOICED', 'PAID');

-- CreateEnum
CREATE TYPE "advertising"."BrandSafetyRuleKind" AS ENUM ('BLOCK_CATEGORY', 'BLOCK_URL');

-- CreateEnum
CREATE TYPE "governance"."AuditResult" AS ENUM ('SUCCESS', 'FAILURE');

-- CreateEnum
CREATE TYPE "governance"."IntegrationEventStatus" AS ENUM ('PENDING', 'PROCESSED', 'FAILED', 'DEAD_LETTERED');

-- CreateEnum
CREATE TYPE "governance"."BackgroundJobStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "governance"."DataSubjectRequestKind" AS ENUM ('ACCESS', 'CORRECTION', 'DELETION', 'PORTABILITY');

-- CreateEnum
CREATE TYPE "governance"."DataSubjectRequestStatus" AS ENUM ('RECEIVED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED');

-- CreateEnum
CREATE TYPE "governance"."IncidentSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "governance"."IncidentStatus" AS ENUM ('OPEN', 'MITIGATED', 'RESOLVED');

-- CreateTable
CREATE TABLE "identity"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "status" "identity"."UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deactivatedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity"."IdentityProviderAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "identity"."IdentityProvider" NOT NULL,
    "externalId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdentityProviderAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity"."Role" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity"."Permission" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity"."RolePermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity"."UserRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "grantedByUserId" TEXT NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity"."ScopeAssignment" (
    "id" TEXT NOT NULL,
    "userRoleId" TEXT NOT NULL,
    "scopeType" "identity"."ScopeType" NOT NULL,
    "scopeValue" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScopeAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity"."AccessReview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decision" "identity"."AccessReviewDecision" NOT NULL,
    "notes" TEXT,

    CONSTRAINT "AccessReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity"."PrivilegedAccessGrant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "grantedByUserId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "breakGlass" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrivilegedAccessGrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity"."Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "ipHash" TEXT,
    "userAgentSummary" TEXT,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity"."LoginEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "result" "identity"."LoginResult" NOT NULL,
    "mfaUsed" BOOLEAN NOT NULL DEFAULT false,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipHash" TEXT,
    "correlationId" TEXT,

    CONSTRAINT "LoginEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content"."ContentPage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "content"."ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "ContentPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content"."ContentRevision" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "body" JSONB NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedByUserId" TEXT,
    "approvedAt" TIMESTAMP(3),

    CONSTRAINT "ContentRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content"."NewsPost" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "categoryId" TEXT,
    "status" "content"."ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "body" JSONB NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "reviewerUserId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content"."Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content"."MediaAsset" (
    "id" TEXT NOT NULL,
    "objectKey" TEXT NOT NULL,
    "altText" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "uploadedByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content"."Menu" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content"."MenuItem" (
    "id" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "parentId" TEXT,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content"."Redirect" (
    "id" TEXT NOT NULL,
    "fromPath" TEXT NOT NULL,
    "toPath" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL DEFAULT 301,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Redirect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content"."SeoMetadata" (
    "id" TEXT NOT NULL,
    "contentPageId" TEXT,
    "newsPostId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "canonicalUrl" TEXT,
    "ogImageUrl" TEXT,

    CONSTRAINT "SeoMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content"."Partner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoObjectKey" TEXT,
    "url" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content"."Testimonial" (
    "id" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content"."InstitutionalContact" (
    "id" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,

    CONSTRAINT "InstitutionalContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contests"."ContestOrganization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cnpj" TEXT,

    CONSTRAINT "ContestOrganization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contests"."Contest" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "status" "contests"."ContestStatus" NOT NULL DEFAULT 'DRAFT',
    "shortDescription" TEXT NOT NULL,
    "vacancies" INTEGER,
    "educationLevel" TEXT,
    "registrationOpensAt" TIMESTAMP(3),
    "registrationClosesAt" TIMESTAMP(3),
    "examDate" TIMESTAMP(3),
    "feeAmountCents" INTEGER,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "Contest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contests"."ContestStage" (
    "id" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ContestStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contests"."ContestMilestone" (
    "id" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "stageId" TEXT,
    "label" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,

    CONSTRAINT "ContestMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contests"."ContestPosition" (
    "id" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "vacancies" INTEGER NOT NULL,
    "requirements" TEXT NOT NULL,
    "salaryCents" INTEGER,

    CONSTRAINT "ContestPosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contests"."ContestLocation" (
    "id" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "address" TEXT,

    CONSTRAINT "ContestLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contests"."ContestDocument" (
    "id" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "kind" "contests"."DocumentKind" NOT NULL,
    "currentVersionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContestDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contests"."DocumentVersion" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "objectKey" TEXT NOT NULL,
    "checksumSha256" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "antivirusStatus" "contests"."AntivirusStatus" NOT NULL DEFAULT 'PENDING',
    "authorUserId" TEXT NOT NULL,
    "approverUserId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "supersededAt" TIMESTAMP(3),

    CONSTRAINT "DocumentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contests"."ContestAnnouncement" (
    "id" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContestAnnouncement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contests"."ContestFaq" (
    "id" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ContestFaq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contests"."ContestServiceLink" (
    "id" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "healthStatus" TEXT,
    "lastCheckedAt" TIMESTAMP(3),

    CONSTRAINT "ContestServiceLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contests"."CandidateProviderConfig" (
    "id" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "providerKey" TEXT NOT NULL,
    "signInUrlOverride" TEXT,
    "registrationUrlOverride" TEXT,

    CONSTRAINT "CandidateProviderConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contests"."ContestSubscription" (
    "id" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "channel" "contests"."SubscriptionChannel" NOT NULL,
    "consentGivenAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContestSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contests"."ContestPublicationApproval" (
    "id" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "approverUserId" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3),
    "decidedAt" TIMESTAMP(3),

    CONSTRAINT "ContestPublicationApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service"."Contact" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "cpfHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service"."Queue" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service"."SlaPolicy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "firstResponseMinutes" INTEGER NOT NULL,
    "resolutionMinutes" INTEGER NOT NULL,

    CONSTRAINT "SlaPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service"."Ticket" (
    "id" TEXT NOT NULL,
    "protocol" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "contestId" TEXT,
    "queueId" TEXT NOT NULL,
    "channel" "service"."TicketChannel" NOT NULL,
    "status" "service"."TicketStatus" NOT NULL DEFAULT 'NEW',
    "priority" "service"."TicketPriority" NOT NULL DEFAULT 'NORMAL',
    "subject" TEXT NOT NULL,
    "slaPolicyId" TEXT,
    "assignedUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "reopenedAt" TIMESTAMP(3),

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service"."Conversation" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "channel" "service"."TicketChannel" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service"."Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "direction" "service"."MessageDirection" NOT NULL,
    "body" TEXT NOT NULL,
    "authorUserId" TEXT,
    "providerMessageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service"."Assignment" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedByUserId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "releasedAt" TIMESTAMP(3),
    "justification" TEXT,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service"."SlaEvent" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "kind" "service"."SlaEventKind" NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SlaEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service"."InternalNote" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InternalNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service"."Attachment" (
    "id" TEXT NOT NULL,
    "messageId" TEXT,
    "ticketId" TEXT,
    "objectKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service"."Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service"."ContactReason" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ContactReason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service"."KnowledgeArticle" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "service"."KnowledgeStatus" NOT NULL DEFAULT 'DRAFT',
    "body" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "approverUserId" TEXT,
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service"."KnowledgeRevision" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "editedByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KnowledgeRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service"."ResponseTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ResponseTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service"."AutomationRule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "triggerType" TEXT NOT NULL,
    "action" JSONB NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AutomationRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service"."SatisfactionSurvey" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "comment" TEXT,
    "respondedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SatisfactionSurvey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service"."IntegrationDelivery" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT,
    "provider" "service"."IntegrationDeliveryProvider" NOT NULL,
    "providerMessageId" TEXT NOT NULL,
    "direction" "service"."MessageDirection" NOT NULL,
    "status" "service"."IntegrationDeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" TIMESTAMP(3),
    "deadLetteredAt" TIMESTAMP(3),

    CONSTRAINT "IntegrationDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whistleblowing"."WhistleblowingCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "WhistleblowingCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whistleblowing"."WhistleblowingCase" (
    "id" TEXT NOT NULL,
    "protocol" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "status" "whistleblowing"."WhistleblowingCaseStatus" NOT NULL DEFAULT 'RECEIVED',
    "riskLevel" "whistleblowing"."WhistleblowingRiskLevel",
    "isAnonymous" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "WhistleblowingCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whistleblowing"."WhistleblowingCredential" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "algorithm" TEXT NOT NULL DEFAULT 'argon2id',
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhistleblowingCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whistleblowing"."WhistleblowingParty" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "role" "whistleblowing"."WhistleblowingPartyRole" NOT NULL,
    "name" TEXT,
    "description" TEXT,

    CONSTRAINT "WhistleblowingParty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whistleblowing"."WhistleblowingMessage" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "direction" "whistleblowing"."WhistleblowingMessageDirection" NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhistleblowingMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whistleblowing"."WhistleblowingEvidence" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "objectKey" TEXT NOT NULL,
    "checksumSha256" TEXT NOT NULL,
    "chainOfCustodyNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhistleblowingEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whistleblowing"."WhistleblowingAssignment" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "analystUserId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "restrictedAccess" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "WhistleblowingAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whistleblowing"."WhistleblowingStatusHistory" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "fromStatus" "whistleblowing"."WhistleblowingCaseStatus",
    "toStatus" "whistleblowing"."WhistleblowingCaseStatus" NOT NULL,
    "changedByUserId" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "justification" TEXT,

    CONSTRAINT "WhistleblowingStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whistleblowing"."WhistleblowingDecision" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "decidedByUserId" TEXT NOT NULL,
    "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedByUserId" TEXT,

    CONSTRAINT "WhistleblowingDecision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whistleblowing"."WhistleblowingAccessEvent" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "accessedByUserId" TEXT NOT NULL,
    "justification" TEXT NOT NULL,
    "accessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" "whistleblowing"."WhistleblowingAccessAction" NOT NULL,

    CONSTRAINT "WhistleblowingAccessEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whistleblowing"."WhistleblowingRetentionPolicy" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT,
    "retentionDays" INTEGER NOT NULL,
    "description" TEXT,

    CONSTRAINT "WhistleblowingRetentionPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advertising"."Advertiser" (
    "id" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "taxId" TEXT,

    CONSTRAINT "Advertiser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advertising"."AdvertisingContract" (
    "id" TEXT NOT NULL,
    "advertiserId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "terms" TEXT,

    CONSTRAINT "AdvertisingContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advertising"."Campaign" (
    "id" TEXT NOT NULL,
    "advertiserId" TEXT NOT NULL,
    "contractId" TEXT,
    "name" TEXT NOT NULL,
    "status" "advertising"."CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advertising"."Creative" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "format" "advertising"."CreativeFormat" NOT NULL,
    "objectKey" TEXT NOT NULL,
    "destinationUrl" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Creative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advertising"."Placement" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "page" TEXT NOT NULL,

    CONSTRAINT "Placement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advertising"."CampaignPlacement" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "placementId" TEXT NOT NULL,

    CONSTRAINT "CampaignPlacement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advertising"."CampaignSchedule" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "frequencyCapId" TEXT,

    CONSTRAINT "CampaignSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advertising"."CampaignApproval" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "reviewerUserId" TEXT NOT NULL,
    "complianceUserId" TEXT,
    "decidedAt" TIMESTAMP(3),
    "approved" BOOLEAN,

    CONSTRAINT "CampaignApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advertising"."FrequencyCap" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "maxImpressionsPerUser" INTEGER NOT NULL,
    "perPeriodHours" INTEGER NOT NULL,

    CONSTRAINT "FrequencyCap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advertising"."ImpressionAggregate" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ImpressionAggregate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advertising"."ClickAggregate" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ClickAggregate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advertising"."BillingRecord" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "status" "advertising"."BillingStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "BillingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advertising"."BrandSafetyRule" (
    "id" TEXT NOT NULL,
    "kind" "advertising"."BrandSafetyRuleKind" NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "BrandSafetyRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "governance"."AuditEvent" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "actorRole" TEXT,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT,
    "beforeData" JSONB,
    "afterData" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "correlationId" TEXT,
    "result" "governance"."AuditResult" NOT NULL DEFAULT 'SUCCESS',
    "riskLevel" TEXT,
    "justification" TEXT,
    "ipHash" TEXT,
    "userAgentSummary" TEXT,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "governance"."IntegrationEvent" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payloadHash" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "status" "governance"."IntegrationEventStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "IntegrationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "governance"."OutboxEvent" (
    "id" TEXT NOT NULL,
    "aggregateType" TEXT NOT NULL,
    "aggregateId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "OutboxEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "governance"."BackgroundJob" (
    "id" TEXT NOT NULL,
    "queueName" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "status" "governance"."BackgroundJobStatus" NOT NULL DEFAULT 'QUEUED',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "BackgroundJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "governance"."FeatureFlag" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,

    CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "governance"."SystemSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "governance"."DataRetentionExecution" (
    "id" TEXT NOT NULL,
    "policyName" TEXT NOT NULL,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordsAffected" INTEGER NOT NULL,

    CONSTRAINT "DataRetentionExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "governance"."DataSubjectRequest" (
    "id" TEXT NOT NULL,
    "requesterEmail" TEXT NOT NULL,
    "kind" "governance"."DataSubjectRequestKind" NOT NULL,
    "status" "governance"."DataSubjectRequestStatus" NOT NULL DEFAULT 'RECEIVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "DataSubjectRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "governance"."Incident" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "severity" "governance"."IncidentSeverity" NOT NULL,
    "status" "governance"."IncidentStatus" NOT NULL DEFAULT 'OPEN',
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "identity"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "IdentityProviderAccount_provider_externalId_key" ON "identity"."IdentityProviderAccount"("provider", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_key_key" ON "identity"."Role"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_key_key" ON "identity"."Permission"("key");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_key" ON "identity"."RolePermission"("roleId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentPage_slug_key" ON "content"."ContentPage"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "NewsPost_slug_key" ON "content"."NewsPost"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "content"."Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Menu_key_key" ON "content"."Menu"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Redirect_fromPath_key" ON "content"."Redirect"("fromPath");

-- CreateIndex
CREATE UNIQUE INDEX "SeoMetadata_contentPageId_key" ON "content"."SeoMetadata"("contentPageId");

-- CreateIndex
CREATE UNIQUE INDEX "SeoMetadata_newsPostId_key" ON "content"."SeoMetadata"("newsPostId");

-- CreateIndex
CREATE UNIQUE INDEX "Contest_slug_key" ON "contests"."Contest"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ContestDocument_currentVersionId_key" ON "contests"."ContestDocument"("currentVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentVersion_documentId_versionNumber_key" ON "contests"."DocumentVersion"("documentId", "versionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateProviderConfig_contestId_key" ON "contests"."CandidateProviderConfig"("contestId");

-- CreateIndex
CREATE UNIQUE INDEX "Queue_key_key" ON "service"."Queue"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_protocol_key" ON "service"."Ticket"("protocol");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "service"."Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ContactReason_name_key" ON "service"."ContactReason"("name");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeArticle_slug_key" ON "service"."KnowledgeArticle"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SatisfactionSurvey_ticketId_key" ON "service"."SatisfactionSurvey"("ticketId");

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationDelivery_provider_providerMessageId_key" ON "service"."IntegrationDelivery"("provider", "providerMessageId");

-- CreateIndex
CREATE UNIQUE INDEX "WhistleblowingCase_protocol_key" ON "whistleblowing"."WhistleblowingCase"("protocol");

-- CreateIndex
CREATE UNIQUE INDEX "WhistleblowingCredential_caseId_key" ON "whistleblowing"."WhistleblowingCredential"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "WhistleblowingDecision_caseId_key" ON "whistleblowing"."WhistleblowingDecision"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "WhistleblowingRetentionPolicy_categoryId_key" ON "whistleblowing"."WhistleblowingRetentionPolicy"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Placement_key_key" ON "advertising"."Placement"("key");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignPlacement_campaignId_placementId_key" ON "advertising"."CampaignPlacement"("campaignId", "placementId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignSchedule_campaignId_key" ON "advertising"."CampaignSchedule"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignApproval_campaignId_key" ON "advertising"."CampaignApproval"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "ImpressionAggregate_campaignId_date_key" ON "advertising"."ImpressionAggregate"("campaignId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "ClickAggregate_campaignId_date_key" ON "advertising"."ClickAggregate"("campaignId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureFlag_key_key" ON "governance"."FeatureFlag"("key");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "governance"."SystemSetting"("key");

-- AddForeignKey
ALTER TABLE "identity"."IdentityProviderAccount" ADD CONSTRAINT "IdentityProviderAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "identity"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity"."RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "identity"."Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity"."RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "identity"."Permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity"."UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "identity"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity"."UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "identity"."Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity"."ScopeAssignment" ADD CONSTRAINT "ScopeAssignment_userRoleId_fkey" FOREIGN KEY ("userRoleId") REFERENCES "identity"."UserRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity"."PrivilegedAccessGrant" ADD CONSTRAINT "PrivilegedAccessGrant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "identity"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "identity"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity"."LoginEvent" ADD CONSTRAINT "LoginEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "identity"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content"."ContentRevision" ADD CONSTRAINT "ContentRevision_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "content"."ContentPage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content"."NewsPost" ADD CONSTRAINT "NewsPost_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "content"."Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content"."MenuItem" ADD CONSTRAINT "MenuItem_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "content"."Menu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content"."MenuItem" ADD CONSTRAINT "MenuItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "content"."MenuItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content"."SeoMetadata" ADD CONSTRAINT "SeoMetadata_contentPageId_fkey" FOREIGN KEY ("contentPageId") REFERENCES "content"."ContentPage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content"."SeoMetadata" ADD CONSTRAINT "SeoMetadata_newsPostId_fkey" FOREIGN KEY ("newsPostId") REFERENCES "content"."NewsPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contests"."Contest" ADD CONSTRAINT "Contest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "contests"."ContestOrganization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contests"."ContestStage" ADD CONSTRAINT "ContestStage_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "contests"."Contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contests"."ContestMilestone" ADD CONSTRAINT "ContestMilestone_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "contests"."Contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contests"."ContestMilestone" ADD CONSTRAINT "ContestMilestone_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "contests"."ContestStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contests"."ContestPosition" ADD CONSTRAINT "ContestPosition_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "contests"."Contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contests"."ContestLocation" ADD CONSTRAINT "ContestLocation_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "contests"."Contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contests"."ContestDocument" ADD CONSTRAINT "ContestDocument_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "contests"."Contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contests"."DocumentVersion" ADD CONSTRAINT "DocumentVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "contests"."ContestDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contests"."ContestAnnouncement" ADD CONSTRAINT "ContestAnnouncement_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "contests"."Contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contests"."ContestFaq" ADD CONSTRAINT "ContestFaq_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "contests"."Contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contests"."ContestServiceLink" ADD CONSTRAINT "ContestServiceLink_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "contests"."Contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contests"."CandidateProviderConfig" ADD CONSTRAINT "CandidateProviderConfig_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "contests"."Contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contests"."ContestSubscription" ADD CONSTRAINT "ContestSubscription_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "contests"."Contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contests"."ContestPublicationApproval" ADD CONSTRAINT "ContestPublicationApproval_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "contests"."Contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service"."Ticket" ADD CONSTRAINT "Ticket_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "service"."Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service"."Ticket" ADD CONSTRAINT "Ticket_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES "service"."Queue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service"."Ticket" ADD CONSTRAINT "Ticket_slaPolicyId_fkey" FOREIGN KEY ("slaPolicyId") REFERENCES "service"."SlaPolicy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service"."Conversation" ADD CONSTRAINT "Conversation_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "service"."Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service"."Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "service"."Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service"."Assignment" ADD CONSTRAINT "Assignment_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "service"."Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service"."SlaEvent" ADD CONSTRAINT "SlaEvent_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "service"."Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service"."InternalNote" ADD CONSTRAINT "InternalNote_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "service"."Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service"."Attachment" ADD CONSTRAINT "Attachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "service"."Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service"."Attachment" ADD CONSTRAINT "Attachment_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "service"."Ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service"."KnowledgeRevision" ADD CONSTRAINT "KnowledgeRevision_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "service"."KnowledgeArticle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service"."SatisfactionSurvey" ADD CONSTRAINT "SatisfactionSurvey_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "service"."Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service"."IntegrationDelivery" ADD CONSTRAINT "IntegrationDelivery_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "service"."Ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whistleblowing"."WhistleblowingCase" ADD CONSTRAINT "WhistleblowingCase_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "whistleblowing"."WhistleblowingCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whistleblowing"."WhistleblowingCredential" ADD CONSTRAINT "WhistleblowingCredential_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "whistleblowing"."WhistleblowingCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whistleblowing"."WhistleblowingParty" ADD CONSTRAINT "WhistleblowingParty_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "whistleblowing"."WhistleblowingCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whistleblowing"."WhistleblowingMessage" ADD CONSTRAINT "WhistleblowingMessage_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "whistleblowing"."WhistleblowingCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whistleblowing"."WhistleblowingEvidence" ADD CONSTRAINT "WhistleblowingEvidence_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "whistleblowing"."WhistleblowingCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whistleblowing"."WhistleblowingAssignment" ADD CONSTRAINT "WhistleblowingAssignment_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "whistleblowing"."WhistleblowingCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whistleblowing"."WhistleblowingStatusHistory" ADD CONSTRAINT "WhistleblowingStatusHistory_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "whistleblowing"."WhistleblowingCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whistleblowing"."WhistleblowingDecision" ADD CONSTRAINT "WhistleblowingDecision_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "whistleblowing"."WhistleblowingCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whistleblowing"."WhistleblowingAccessEvent" ADD CONSTRAINT "WhistleblowingAccessEvent_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "whistleblowing"."WhistleblowingCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whistleblowing"."WhistleblowingRetentionPolicy" ADD CONSTRAINT "WhistleblowingRetentionPolicy_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "whistleblowing"."WhistleblowingCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertising"."AdvertisingContract" ADD CONSTRAINT "AdvertisingContract_advertiserId_fkey" FOREIGN KEY ("advertiserId") REFERENCES "advertising"."Advertiser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertising"."Campaign" ADD CONSTRAINT "Campaign_advertiserId_fkey" FOREIGN KEY ("advertiserId") REFERENCES "advertising"."Advertiser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertising"."Campaign" ADD CONSTRAINT "Campaign_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "advertising"."AdvertisingContract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertising"."Creative" ADD CONSTRAINT "Creative_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "advertising"."Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertising"."CampaignPlacement" ADD CONSTRAINT "CampaignPlacement_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "advertising"."Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertising"."CampaignPlacement" ADD CONSTRAINT "CampaignPlacement_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "advertising"."Placement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertising"."CampaignSchedule" ADD CONSTRAINT "CampaignSchedule_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "advertising"."Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertising"."CampaignSchedule" ADD CONSTRAINT "CampaignSchedule_frequencyCapId_fkey" FOREIGN KEY ("frequencyCapId") REFERENCES "advertising"."FrequencyCap"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertising"."CampaignApproval" ADD CONSTRAINT "CampaignApproval_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "advertising"."Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertising"."ImpressionAggregate" ADD CONSTRAINT "ImpressionAggregate_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "advertising"."Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertising"."ClickAggregate" ADD CONSTRAINT "ClickAggregate_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "advertising"."Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertising"."BillingRecord" ADD CONSTRAINT "BillingRecord_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "advertising"."AdvertisingContract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
