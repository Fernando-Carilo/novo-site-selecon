/**
 * Prepara credenciais determinísticas para a suíte E2E (Playwright, ver e2e/).
 * NUNCA rodar em produção — reescreve a senha dos usuários seed para um valor fixo e
 * conhecido, exclusivamente para tornar o E2E local reproduzível (seção 26 do prompt
 * mestre: "os testes devem ser reproduzíveis, não dependa de dados imprevisíveis").
 * As senhas geradas pelo seed normal (packages/db/prisma/seed.ts) são aleatórias e
 * mostradas uma única vez — inúteis para uma suíte automatizada que roda depois.
 */
import { hashPassword } from "@selecon/auth";
import { prisma } from "@selecon/db";

export const E2E_PASSWORD = "E2E-teste-local-2026!";

const E2E_ACCOUNTS = [
  "admin.demo@selecon.example",
  "conteudo.demo@selecon.example",
  "concursos.demo@selecon.example",
  "atendimento.demo@selecon.example",
  "integridade.demo@selecon.example",
  "integridade.admin.demo@selecon.example",
  "comercial.demo@selecon.example",
  "comercial.revisor.demo@selecon.example",
];

async function main() {
  const passwordHash = await hashPassword(E2E_PASSWORD);
  for (const email of E2E_ACCOUNTS) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.warn(`Aviso: usuário seed ${email} não encontrado — rode o seed principal primeiro.`);
      continue;
    }
    await prisma.user.update({
      where: { email },
      data: { passwordHash, mustChangePassword: false, status: "ACTIVE" },
    });
    console.warn(`Senha E2E definida para ${email}`);
  }
}

main()
  .catch((error) => {
    console.error("Falha ao preparar usuários E2E:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
