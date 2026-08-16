import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().optional(),
  DIRECT_URL: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().optional(),
  NEXT_PUBLIC_SETTLEMENT_CURRENCY: z.string().optional(),
  PAYTR_MERCHANT_ID: z.string().optional(),
  PAYTR_MERCHANT_KEY: z.string().optional(),
  PAYTR_MERCHANT_SALT: z.string().optional(),
  PAYTR_SANDBOX: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  AI_PLATFORM_DAILY_CAP_MINOR: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_JWT_SECRET: z.string().optional(),
  INNGEST_EVENT_KEY: z.string().optional(),
  INNGEST_SIGNING_KEY: z.string().optional(),
  PLATFORM_TREASURY_USER_ID: z.string().optional(),
  SHADOW_DATABASE_URL: z.string().optional(),
  DEVLABS_KEY_PEPPER: z.string().optional(),
  SUPER_ADMIN_USER_ID: z.string().optional(),
  PAYTR_ALLOW_MOCK_CHECKOUT: z.string().optional(),
  E2E_BASE_URL: z.string().optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

export function parseEnv(source: NodeJS.ProcessEnv = process.env): AppEnv {
  return envSchema.parse(source);
}

let cached: AppEnv | null = null;

export function getEnv(): AppEnv {
  cached ??= parseEnv();
  return cached;
}
