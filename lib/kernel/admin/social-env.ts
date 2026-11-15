import "server-only";

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { sanitizeGeminiApiKey } from "@/lib/kernel/ai/providers/gemini";
import type { SocialKeyReport } from "@/lib/kernel/admin/social-desk";

/**
 * Sosyal anahtar adları. Kök `.env.local` ve `yetkin_muze/.env.local`.
 * Değer istemciye ve günlüğe yazılmaz. Müze dosyası yalnız boş process.env boşluğunu doldurur.
 */
export const SOCIAL_ENV_KEYS = [
  "LINKEDIN_CLIENT_ID",
  "LINKEDIN_CLIENT_SECRET",
  "LINKEDIN_ORGANIZATION_ID",
  "LINKEDIN_ACCESS_TOKEN",
  "X_API_KEY",
  "X_API_SECRET",
  "X_ACCESS_TOKEN",
  "X_ACCESS_TOKEN_SECRET",
  "X_BEARER_TOKEN",
  "META_ADS_ACCESS_TOKEN",
  "META_ADS_ACCOUNT_ID",
  "META_ADS_APP_ID",
  "META_APP_SECRET",
  "META_PAGE_ID",
  "META_PAGE_ACCESS_TOKEN",
  "META_INSTAGRAM_USER_ID",
] as const;

export type SocialEnvKey = (typeof SOCIAL_ENV_KEYS)[number];

export type SocialCredentials = {
  linkedinAccessToken: string | null;
  linkedinOrganizationId: string | null;
  xApiKey: string | null;
  xApiSecret: string | null;
  xAccessToken: string | null;
  xAccessTokenSecret: string | null;
  metaAdsAccessToken: string | null;
  metaAppSecret: string | null;
  metaPageId: string | null;
  metaPageAccessToken: string | null;
  metaInstagramUserId: string | null;
};

const TOKEN_MIN = 8;
const ID_MIN = 4;

let cachedFile: Record<string, string> | null = null;

export function parseSocialEnvText(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const rawLine of text.split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }
    const eq = line.indexOf("=");
    if (eq <= 0) {
      continue;
    }
    const key = line.slice(0, eq).trim();
    if (!(SOCIAL_ENV_KEYS as readonly string[]).includes(key)) {
      continue;
    }
    const value = unwrapEnvValue(line.slice(eq + 1).trim());
    if (value) {
      out[key] = value;
    }
  }
  return out;
}

export function mergeSocialEnv(
  processEnv: Record<string, string | undefined>,
  fileEnv: Record<string, string | undefined>,
): Record<SocialEnvKey, string | undefined> {
  const out = {} as Record<SocialEnvKey, string | undefined>;
  for (const key of SOCIAL_ENV_KEYS) {
    out[key] = unwrapEnvValue(processEnv[key]) ?? unwrapEnvValue(fileEnv[key]) ?? undefined;
  }
  return out;
}

export function loadMergedSocialEnv(): Record<SocialEnvKey, string | undefined> {
  return mergeSocialEnv(process.env, readMuzeSocialFile());
}

export function socialKeyReport(env: Record<string, string | undefined>): SocialKeyReport {
  return {
    linkedinMissing: missing(env, [
      ["LINKEDIN_ACCESS_TOKEN", TOKEN_MIN],
      ["LINKEDIN_ORGANIZATION_ID", ID_MIN],
    ]),
    xMissing: missing(env, [
      ["X_API_KEY", TOKEN_MIN],
      ["X_API_SECRET", TOKEN_MIN],
      ["X_ACCESS_TOKEN", TOKEN_MIN],
      ["X_ACCESS_TOKEN_SECRET", TOKEN_MIN],
    ]),
    facebookMissing: missing(env, [
      ["META_PAGE_ID", ID_MIN],
      ["META_PAGE_ACCESS_TOKEN", TOKEN_MIN],
    ]),
    instagramMissing: missing(env, [
      ["META_INSTAGRAM_USER_ID", ID_MIN],
      ["META_PAGE_ACCESS_TOKEN", TOKEN_MIN],
    ]),
    linkedinClientPresent: secretOf(env.LINKEDIN_CLIENT_ID, TOKEN_MIN) != null,
    xBearerPresent: secretOf(env.X_BEARER_TOKEN, TOKEN_MIN) != null,
    metaAdsPresent: secretOf(env.META_ADS_ACCESS_TOKEN, TOKEN_MIN) != null,
    geminiPresent: sanitizeGeminiApiKey(process.env.GEMINI_API_KEY) != null,
  };
}

export function readSocialCredentials(env: Record<string, string | undefined>): SocialCredentials {
  return {
    linkedinAccessToken: secretOf(env.LINKEDIN_ACCESS_TOKEN, TOKEN_MIN),
    linkedinOrganizationId: secretOf(env.LINKEDIN_ORGANIZATION_ID, ID_MIN),
    xApiKey: secretOf(env.X_API_KEY, TOKEN_MIN),
    xApiSecret: secretOf(env.X_API_SECRET, TOKEN_MIN),
    xAccessToken: secretOf(env.X_ACCESS_TOKEN, TOKEN_MIN),
    xAccessTokenSecret: secretOf(env.X_ACCESS_TOKEN_SECRET, TOKEN_MIN),
    metaAdsAccessToken: secretOf(env.META_ADS_ACCESS_TOKEN, TOKEN_MIN),
    metaAppSecret: secretOf(env.META_APP_SECRET, TOKEN_MIN),
    metaPageId: secretOf(env.META_PAGE_ID, ID_MIN),
    metaPageAccessToken: secretOf(env.META_PAGE_ACCESS_TOKEN, TOKEN_MIN),
    metaInstagramUserId: secretOf(env.META_INSTAGRAM_USER_ID, ID_MIN),
  };
}

function readMuzeSocialFile(): Record<string, string> {
  if (cachedFile) {
    return cachedFile;
  }
  const path = join(process.cwd(), "yetkin_muze", ".env.local");
  if (!existsSync(path)) {
    cachedFile = {};
    return cachedFile;
  }
  try {
    cachedFile = parseSocialEnvText(readFileSync(path, "utf8"));
  } catch {
    cachedFile = {};
  }
  return cachedFile;
}

function missing(env: Record<string, string | undefined>, keys: Array<[string, number]>): string[] {
  return keys.filter(([key, min]) => secretOf(env[key], min) == null).map(([key]) => key);
}

function secretOf(raw: string | undefined, min: number): string | null {
  const value = unwrapEnvValue(raw);
  if (!value || value.length < min) {
    return null;
  }
  return value;
}

function unwrapEnvValue(raw: string | undefined): string | null {
  if (raw == null) {
    return null;
  }
  let value = raw.replace(/^\uFEFF/u, "").replace(/\r/gu, "").trim();
  const quote = value[0];
  if ((quote === '"' || quote === "'") && value.length >= 2 && value.endsWith(quote)) {
    value = value.slice(1, -1).trim();
  }
  return value.length > 0 ? value : null;
}
