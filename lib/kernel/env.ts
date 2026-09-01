import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  SITE_MAINTENANCE_FREEZE: z.string().optional(),
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
  CANONICAL_SUPER_ADMIN_EMAIL: z.string().optional(),
  ACADEMY_EXAM_SITTING_SECRET: z.string().optional(),
  PAYTR_ALLOW_MOCK_CHECKOUT: z.string().optional(),
  PAYTR_WEBHOOK_IP_ALLOWLIST: z.string().optional(),
  E2E_BASE_URL: z.string().optional(),
  E2E_T3_EMAIL: z.string().optional(),
  E2E_T3_PASSWORD: z.string().optional(),
  E2E_T4_WORKER_EMAIL: z.string().optional(),
  E2E_T4_WORKER_PASSWORD: z.string().optional(),
  E2E_T4_CLIENT_EMAIL: z.string().optional(),
  E2E_T4_CLIENT_PASSWORD: z.string().optional(),
  STAGING_APP_URL: z.string().optional(),
  NOTICE_SMTP_HOST: z.string().optional(),
  NOTICE_SMTP_PORT: z.string().optional(),
  NOTICE_SMTP_USER: z.string().optional(),
  NOTICE_SMTP_PASS: z.string().optional(),
  NOTICE_MAIL_FROM: z.string().optional(),
  RAIL_DRON_ORIGINS: z.string().optional(),
  TRUSTED_PROXY_HOPS: z.string().optional(),
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
