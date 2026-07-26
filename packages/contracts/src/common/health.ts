import { z } from "zod";

export const healthStatusSchema = z.object({
  status: z.enum(["ok", "degraded", "down"]),
  detail: z.string().optional(),
  checkedAt: z.string().datetime(),
});

export type HealthStatus = z.infer<typeof healthStatusSchema>;
