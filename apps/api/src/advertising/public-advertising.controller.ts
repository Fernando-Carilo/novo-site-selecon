import { Controller, Get, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import type { AdServeResponse } from "@selecon/contracts";
import { Public } from "../auth/public.decorator.js";
import { AdvertisingService } from "./advertising.service.js";

@ApiTags("public-advertising")
@Controller("public/ads")
@Public()
export class PublicAdvertisingController {
  constructor(private readonly advertising: AdvertisingService) {}

  @Get("placements/:key")
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  async serve(@Param("key") key: string): Promise<AdServeResponse | null> {
    return this.advertising.serve(key);
  }

  @Post("creatives/:id/click")
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  async click(@Param("id") id: string): Promise<{ destinationUrl: string }> {
    return this.advertising.recordClick(id);
  }
}
