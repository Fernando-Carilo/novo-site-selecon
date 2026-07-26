/**
 * Seed de desenvolvimento — dados 100% fictícios, sem qualquer semelhança com pessoas,
 * concursos ou casos reais (regra 3.11 e seção 15.4 do prompt mestre). Nunca rodar contra
 * um banco de produção.
 */
import { PrismaClient } from "../generated/client/index.js";

const prisma = new PrismaClient();

async function main() {
  console.warn("Seeding banco de desenvolvimento com dados fictícios...");

  // --- Identidade ---
  const adminRole = await prisma.role.upsert({
    where: { key: "PORTAL_ADMIN" },
    update: {},
    create: { key: "PORTAL_ADMIN", description: "Administrador geral do portal (seed)" },
  });

  const contestEditorRole = await prisma.role.upsert({
    where: { key: "CONTEST_EDITOR" },
    update: {},
    create: { key: "CONTEST_EDITOR", description: "Editor de concursos (seed)" },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: "admin.demo@selecon.example" },
    update: {},
    create: {
      email: "admin.demo@selecon.example",
      displayName: "Administrador Demo",
      userRoles: {
        create: { roleId: adminRole.id, grantedByUserId: "seed-script" },
      },
    },
  });

  const editorUser = await prisma.user.upsert({
    where: { email: "editor.demo@selecon.example" },
    update: {},
    create: {
      email: "editor.demo@selecon.example",
      displayName: "Editor de Concursos Demo",
      userRoles: {
        create: { roleId: contestEditorRole.id, grantedByUserId: "seed-script" },
      },
    },
  });

  // --- Concursos ---
  const organization = await prisma.contestOrganization.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Órgão Fictício de Demonstração",
    },
  });

  const contest = await prisma.contest.upsert({
    where: { slug: "concurso-ficticio-demo-2026" },
    update: {},
    create: {
      slug: "concurso-ficticio-demo-2026",
      title: "Concurso Público Fictício de Demonstração 2026",
      organizationId: organization.id,
      status: "PUBLISHED",
      shortDescription: "Concurso fictício usado apenas para desenvolvimento e demonstração.",
      vacancies: 25,
      educationLevel: "Ensino Superior",
      registrationOpensAt: new Date("2026-08-01T00:00:00Z"),
      registrationClosesAt: new Date("2026-09-15T23:59:59Z"),
      examDate: new Date("2026-10-20T13:00:00Z"),
      createdByUserId: editorUser.id,
      publishedAt: new Date(),
    },
  });

  await prisma.contestFaq.createMany({
    data: [
      {
        contestId: contest.id,
        question: "Como faço minha inscrição? (exemplo fictício)",
        answer: "Este é um conteúdo de demonstração, sem valor oficial.",
        order: 1,
      },
    ],
    skipDuplicates: true,
  });

  // --- Atendimento ---
  const queue = await prisma.queue.upsert({
    where: { key: "atendimento-geral" },
    update: {},
    create: { key: "atendimento-geral", name: "Atendimento Geral (seed)" },
  });

  const contact = await prisma.contact.create({
    data: {
      name: "Cidadão Fictício de Teste",
      email: "cidadao.ficticio@example.com",
    },
  });

  await prisma.ticket.create({
    data: {
      protocol: `DEMO-${Date.now()}`,
      contactId: contact.id,
      queueId: queue.id,
      channel: "WEB",
      status: "NEW",
      priority: "NORMAL",
      subject: "Dúvida fictícia sobre o concurso de demonstração",
    },
  });

  // --- Denúncias (schema segregado) — totalmente fictício ---
  const category = await prisma.whistleblowingCategory.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000002",
      name: "Categoria fictícia de demonstração",
      description: "Usada apenas para popular o ambiente de desenvolvimento.",
    },
  });

  await prisma.whistleblowingCase.upsert({
    where: { protocol: "DENUNCIA-DEMO-0001" },
    update: {},
    create: {
      protocol: "DENUNCIA-DEMO-0001",
      categoryId: category.id,
      status: "RECEIVED",
      isAnonymous: true,
      credential: {
        create: {
          // Hash fictício — NUNCA um código real. Em produção, sempre Argon2id de um
          // código gerado por CSPRNG (ver docs/SECURITY_AND_PRIVACY.md).
          codeHash: "seed-fake-hash-do-not-use-in-production",
        },
      },
    },
  });

  // --- Feature flags ---
  await prisma.featureFlag.upsert({
    where: { key: "candidate-gateway-mock" },
    update: {},
    create: {
      key: "candidate-gateway-mock",
      enabled: true,
      description: "Usa CandidateMockProvider enquanto a integração real não existe",
    },
  });

  console.warn("Seed concluído.");
  console.warn(`Usuários criados: ${adminUser.email}, ${editorUser.email}`);
}

main()
  .catch((error) => {
    console.error("Falha ao rodar o seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
