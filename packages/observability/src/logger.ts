import pino from "pino";

const SENSITIVE_KEYS = [
  "password",
  "token",
  "accessToken",
  "refreshToken",
  "secret",
  "whistleblowingCode",
  "whistleblowingCredential",
  "cpf",
  "authorization",
];

/**
 * Logger estruturado (JSON) com redação de campos sensíveis por padrão — regra 12.1
 * ("logs sem senha, token, código de denúncia, corpo sensível ou documento"). Módulos que
 * lidam com o domínio de denúncias devem usar `createLogger("whistleblowing", ...)`, cujo
 * nível de redação é ainda mais restritivo (ver ADR-0003).
 */
export function createLogger(name: string, level: string = process.env.LOG_LEVEL ?? "info") {
  return pino({
    name,
    level,
    redact: {
      paths: SENSITIVE_KEYS.flatMap((key) => [key, `*.${key}`, `req.headers.${key}`]),
      censor: "[REDACTED]",
    },
    formatters: {
      level(label) {
        return { level: label };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  });
}

export type Logger = ReturnType<typeof createLogger>;
