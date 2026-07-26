/**
 * Seed de desenvolvimento — dados 100% fictícios, sem qualquer semelhança com pessoas,
 * concursos ou casos reais (regra 3.11 e seção 15.4 do prompt mestre). Nunca rodar contra
 * um banco de produção.
 *
 * Usuários criados exigem troca de senha no primeiro login (mustChangePassword=true).
 * As senhas geradas são impressas uma única vez no console — não ficam em nenhum
 * arquivo do repositório (regra 27 do prompt mestre de infraestrutura).
 */
import { generateTemporaryPassword, hashPassword } from "@selecon/auth";
import { PrismaClient } from "../generated/client/index.js";

const prisma = new PrismaClient();

const ROLES = [
  { key: "PORTAL_ADMIN", description: "Administrador geral do portal" },
  { key: "CONTENT_ADMIN", description: "Administrador de conteúdo institucional" },
  { key: "CONTEST_ADMIN", description: "Administrador de concursos" },
  { key: "CONTEST_EDITOR", description: "Editor de concursos" },
  { key: "SERVICE_SUPERVISOR", description: "Supervisor de atendimento" },
  { key: "SERVICE_AGENT", description: "Atendente" },
  { key: "INTEGRITY_ADMIN", description: "Administrador do canal de integridade/denúncias" },
  { key: "INTEGRITY_ANALYST", description: "Analista de integridade" },
  { key: "ADVERTISING_ADMIN", description: "Administrador de anúncios e campanhas" },
  { key: "AUDITOR", description: "Auditor (somente leitura da trilha de auditoria)" },
  { key: "READ_ONLY", description: "Consulta (somente leitura)" },
] as const;

interface SeedUserSpec {
  email: string;
  displayName: string;
  roleKey: (typeof ROLES)[number]["key"];
}

const SEED_USERS: SeedUserSpec[] = [
  {
    email: "admin.demo@selecon.example",
    displayName: "Administrador Demo",
    roleKey: "PORTAL_ADMIN",
  },
  {
    email: "conteudo.demo@selecon.example",
    displayName: "Editor de Conteúdo Demo",
    roleKey: "CONTENT_ADMIN",
  },
  {
    email: "concursos.demo@selecon.example",
    displayName: "Editor de Concursos Demo",
    roleKey: "CONTEST_EDITOR",
  },
  {
    email: "atendimento.demo@selecon.example",
    displayName: "Atendente Demo",
    roleKey: "SERVICE_AGENT",
  },
  {
    email: "supervisor.demo@selecon.example",
    displayName: "Supervisor de Atendimento Demo",
    roleKey: "SERVICE_SUPERVISOR",
  },
  {
    email: "integridade.demo@selecon.example",
    displayName: "Analista de Integridade Demo",
    roleKey: "INTEGRITY_ANALYST",
  },
  {
    email: "integridade.admin.demo@selecon.example",
    displayName: "Administrador de Integridade Demo",
    roleKey: "INTEGRITY_ADMIN",
  },
  {
    email: "comercial.demo@selecon.example",
    displayName: "Administrador Comercial Demo",
    roleKey: "ADVERTISING_ADMIN",
  },
  { email: "auditor.demo@selecon.example", displayName: "Auditor Demo", roleKey: "AUDITOR" },
  {
    email: "consulta.demo@selecon.example",
    displayName: "Usuário de Consulta Demo",
    roleKey: "READ_ONLY",
  },
];

async function main() {
  console.warn("Seeding banco de desenvolvimento com dados fictícios...");

  const roleByKey = new Map<string, { id: string }>();
  for (const role of ROLES) {
    const created = await prisma.role.upsert({
      where: { key: role.key },
      update: {},
      create: role,
    });
    roleByKey.set(role.key, created);
  }

  const credentials: { email: string; password: string }[] = [];
  const userByEmail = new Map<string, { id: string }>();

  for (const spec of SEED_USERS) {
    const existing = await prisma.user.findUnique({ where: { email: spec.email } });
    if (existing) {
      userByEmail.set(spec.email, existing);
      continue;
    }

    const password = generateTemporaryPassword();
    const passwordHash = await hashPassword(password);
    const role = roleByKey.get(spec.roleKey);
    if (!role) throw new Error(`Papel não encontrado no seed: ${spec.roleKey}`);

    const user = await prisma.user.create({
      data: {
        email: spec.email,
        displayName: spec.displayName,
        passwordHash,
        mustChangePassword: true,
        userRoles: {
          create: { roleId: role.id, grantedByUserId: "seed-script" },
        },
      },
    });
    userByEmail.set(spec.email, user);
    credentials.push({ email: spec.email, password });
  }

  const editorUser = userByEmail.get("concursos.demo@selecon.example")!;

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
  if (credentials.length > 0) {
    console.warn("");
    console.warn("=== CREDENCIAIS DE DEV GERADAS (exibidas uma única vez) ===");
    for (const cred of credentials) {
      console.warn(`  ${cred.email} / ${cred.password}`);
    }
    console.warn("Troca de senha obrigatória no primeiro login.");
    console.warn("=============================================================");
  } else {
    console.warn("Usuários já existiam — nenhuma credencial nova foi gerada.");
  }
}

main()
  .catch((error) => {
    console.error("Falha ao rodar o seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
