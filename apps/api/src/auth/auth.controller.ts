import { Body, Controller, Get, Post, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import type { FastifyReply } from "fastify";
import {
  changePasswordRequestSchema,
  loginRequestSchema,
  type ChangePasswordRequest,
  type CurrentUser,
  type LoginRequest,
} from "@selecon/contracts";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import { AuthService } from "./auth.service.js";
import { SESSION_COOKIE_NAME } from "./auth.constants.js";
import { CurrentUser as CurrentUserDecorator } from "./current-user.decorator.js";
import type { AuthenticatedUser } from "./authenticated-user.js";
import { Public } from "./public.decorator.js";

// Padrão de produção: 10 tentativas/minuto por IP (proteção contra força bruta,
// regra 12.1). Configurável só para permitir um limite mais alto em ambientes
// de teste (a suíte E2E de ponta a ponta autentica dezenas de vezes em poucos
// minutos, todas a partir do mesmo host) sem enfraquecer o padrão de produção.
const LOGIN_THROTTLE_LIMIT = Number(process.env.AUTH_LOGIN_RATE_LIMIT ?? 10);
const LOGIN_THROTTLE_TTL_MS = Number(process.env.AUTH_LOGIN_RATE_LIMIT_TTL_MS ?? 60_000);

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: LOGIN_THROTTLE_LIMIT, ttl: LOGIN_THROTTLE_TTL_MS } })
  @Post("login")
  async login(
    @Body(new ZodValidationPipe(loginRequestSchema)) body: LoginRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<{ mustChangePassword: boolean }> {
    const result = await this.authService.login(body.email, body.password);

    reply.setCookie(SESSION_COOKIE_NAME, result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: result.expiresAt,
    });

    return { mustChangePassword: result.mustChangePassword };
  }

  @Post("logout")
  async logout(
    @CurrentUserDecorator() user: AuthenticatedUser,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<{ ok: true }> {
    await this.authService.logout(user.sessionId, user.id);
    reply.clearCookie(SESSION_COOKIE_NAME, { path: "/" });
    return { ok: true };
  }

  @Get("me")
  me(@CurrentUserDecorator() user: AuthenticatedUser): CurrentUser {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      roles: user.roles,
      mustChangePassword: user.mustChangePassword,
    };
  }

  @Post("change-password")
  async changePassword(
    @Body(new ZodValidationPipe(changePasswordRequestSchema)) body: ChangePasswordRequest,
    @CurrentUserDecorator() user: AuthenticatedUser,
  ): Promise<{ ok: true }> {
    await this.authService.changePassword(user.id, body.currentPassword, body.newPassword);
    return { ok: true };
  }
}
