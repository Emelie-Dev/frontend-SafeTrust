import "server-only";
import { z } from "zod";

export const serverSchema = z.object({
  BACKEND_URL: z
    .string()
    .url()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  SKIP_AUTH_MIDDLEWARE: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true" && process.env.NODE_ENV !== "production"), // can never be on in prod
});

export const serverEnv = serverSchema.parse(process.env);
