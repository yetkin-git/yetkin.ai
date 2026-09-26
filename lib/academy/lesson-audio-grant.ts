/**
 * Ücretli ders sesi — kısa ömürlü HMAC izni.
 * Dosya `public/media/academy/audio` altında kalır; kenar izin yoksa 403 döner.
 * Sır cüzdan pasaportundan ayrıdır. İstemci bu modülü import etmez.
 */

import { isAcademyTtsCassetteRevoked } from "@/lib/academy/pilot-sku";

export const ACADEMY_AUDIO_PUBLIC_PREFIX = "/media/academy/audio/" as const;
export const ACADEMY_AUDIO_GRANT_QUERY = "g" as const;
/** Bir ders oturumu. Süre dolunca adres yeniden istenir. */
export const ACADEMY_AUDIO_GRANT_TTL_SEC = 4 * 60 * 60;

const GRANT_DOMAIN = "yetkin-rail.academy.audio-grant.v1" as const;
const SEED_MIN_LENGTH = 16;
const SEED_FALLBACK = "yetkin-rail.academy.audio-grant.mac.v1" as const;

export type AcademyAudioEdgeDecision = "allow" | "forbidden" | "revoked";

function resolveGrantSeed(env: Record<string, string | undefined>): string | null {
  const dedicated = env.ACADEMY_EXAM_SITTING_SECRET?.trim() ?? "";
  if (dedicated.length >= SEED_MIN_LENGTH) {
    return dedicated;
  }
  const jwt = env.SUPABASE_JWT_SECRET?.trim() ?? "";
  if (jwt.length >= SEED_MIN_LENGTH) {
    return jwt;
  }
  if (env.NODE_ENV !== "production" || env.VITEST === "true") {
    return SEED_FALLBACK;
  }
  return null;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function safeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false;
  }
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return diff === 0;
}

async function signGrantMessage(seed: string, message: string): Promise<string> {
  const encoded = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoded.encode(seed),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoded.encode(message));
  return bytesToBase64Url(new Uint8Array(signature));
}

function grantMessage(exp: number, pathname: string): string {
  return `${GRANT_DOMAIN}\n${exp}\n${pathname}`;
}

/** `01_office_ai-1.mp3` ve `01_office_ai-1.bed.mp3` aynı ders anahtarına iner. */
export function academyAudioLessonKeyFromPublicPath(pathname: string): string | null {
  const match = pathname.match(/^\/media\/academy\/audio\/[^/]+\/([^/]+)\.mp3$/u);
  if (!match?.[1] || match[1].includes("..")) {
    return null;
  }
  const file = match[1];
  return file.endsWith(".bed") ? file.slice(0, -".bed".length) : file;
}

export function isAcademyAudioPublicPath(pathname: string): boolean {
  return pathname.startsWith(ACADEMY_AUDIO_PUBLIC_PREFIX);
}

export async function verifyAcademyAudioGrant(
  pathname: string,
  token: string,
  nowMs: number = Date.now(),
  env: Record<string, string | undefined> = process.env,
): Promise<boolean> {
  const seed = resolveGrantSeed(env);
  if (!seed) {
    return false;
  }
  const dot = token.indexOf(".");
  if (dot <= 0) {
    return false;
  }
  const exp = Number(token.slice(0, dot));
  const signature = token.slice(dot + 1);
  if (!Number.isInteger(exp) || signature.length < 16) {
    return false;
  }
  const nowSec = Math.floor(nowMs / 1000);
  if (exp < nowSec || exp > nowSec + ACADEMY_AUDIO_GRANT_TTL_SEC + 30) {
    return false;
  }
  const expected = await signGrantMessage(seed, grantMessage(exp, pathname));
  return safeEqual(expected, signature);
}

/** Oynatıcı adresine `g` ekler. Sır yoksa null. */
export async function withAcademyAudioGrant(
  playbackSrc: string,
  nowMs: number = Date.now(),
  env: Record<string, string | undefined> = process.env,
): Promise<string | null> {
  const seed = resolveGrantSeed(env);
  if (!seed) {
    return null;
  }
  const url = new URL(playbackSrc, "https://yetkin.ai");
  if (!isAcademyAudioPublicPath(url.pathname)) {
    return null;
  }
  const exp = Math.floor(nowMs / 1000) + ACADEMY_AUDIO_GRANT_TTL_SEC;
  const signature = await signGrantMessage(seed, grantMessage(exp, url.pathname));
  url.searchParams.set(ACADEMY_AUDIO_GRANT_QUERY, `${exp}.${signature}`);
  const query = url.searchParams.toString();
  return query.length > 0 ? `${url.pathname}?${query}` : url.pathname;
}

export async function decideAcademyAudioPublicRequest(
  url: URL,
  nowMs: number = Date.now(),
  env: Record<string, string | undefined> = process.env,
): Promise<AcademyAudioEdgeDecision> {
  const lessonKey = academyAudioLessonKeyFromPublicPath(url.pathname);
  if (!lessonKey) {
    return "forbidden";
  }
  if (isAcademyTtsCassetteRevoked(lessonKey)) {
    return "revoked";
  }
  const token = url.searchParams.get(ACADEMY_AUDIO_GRANT_QUERY) ?? "";
  const allowed = await verifyAcademyAudioGrant(url.pathname, token, nowMs, env);
  return allowed ? "allow" : "forbidden";
}
