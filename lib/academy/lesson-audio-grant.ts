/**
 * Ücretli ders sesi — kısa ömürlü izin.
 * `ACADEMY_MEDIA_READ=local`: dosya sitede kalır, kenar `g` imzası ister.
 * `ACADEMY_MEDIA_READ=storage`: satın alma veya ücretsiz önizleme doğrulandıktan sonra
 * özel `academy-sealed` kovasının 4 saatlik adresi döner.
 * Üretimde anahtar boşsa kova okunur. Yayın MP3 sitede değil, kovadadır.
 * Geliştirme ve testte boş anahtar site yolunda kalır.
 * Kenar bu adresi üretmez.
 * Sır cüzdan pasaportundan ayrıdır. İstemci bu modülü import etmez.
 * Servis anahtarı bu dosyada durmaz.
 */

import { isAcademyTtsCassetteRevoked } from "@/lib/academy/pilot-sku";

export const ACADEMY_AUDIO_PUBLIC_PREFIX = "/media/academy/audio/" as const;
export const ACADEMY_AUDIO_GRANT_QUERY = "g" as const;
/** Bir ders oturumu. Süre dolunca adres yeniden istenir. */
export const ACADEMY_AUDIO_GRANT_TTL_SEC = 4 * 60 * 60;
/** Özel yayın kovası. Herkese açık okuma kapalıdır. */
export const ACADEMY_SEALED_STORAGE_BUCKET = "academy-sealed" as const;
/** Eski herkese açık kova. Bu işe yazılmaz. */
export const ACADEMY_LEGACY_PUBLIC_AUDIO_BUCKET = "lesson-audios" as const;
/** En büyük konuşma 38,4 MB. Tavan ona pay bırakır. */
export const ACADEMY_SEALED_OBJECT_MAX_BYTES = 50 * 1024 * 1024;

const SEALED_OBJECT_PATH_RE = /^[a-z0-9_]+\/[a-z0-9_-]+(?:\/v[1-9]\d*)?\.(?:bed\.)?mp3$/u;

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

export type AcademyMediaRead = "local" | "storage";

/**
 * Açık `storage` kovayı okur. Açık `local` site yolunda kalır.
 * Üretimde boş anahtar kovayı okur. Geliştirme, test ve tanınmayan değer site yolunda kalır.
 */
export function resolveAcademyMediaRead(
  env: Record<string, string | undefined>,
): AcademyMediaRead {
  const raw = env.ACADEMY_MEDIA_READ?.trim().toLowerCase() ?? "";
  if (raw === "storage") {
    return "storage";
  }
  if (raw === "local") {
    return "local";
  }
  if (raw.length === 0 && env.NODE_ENV === "production") {
    return "storage";
  }
  return "local";
}

export function assertAcademySealedBucket(bucket: string): void {
  const name = bucket.trim();
  if (name === ACADEMY_LEGACY_PUBLIC_AUDIO_BUCKET || name !== ACADEMY_SEALED_STORAGE_BUCKET) {
    throw new Error("Ses yalnız özel academy-sealed kovasına gider. lesson-audios kovasına yazılmaz.");
  }
}

export function isAcademySealedObjectPath(objectPath: string): boolean {
  return SEALED_OBJECT_PATH_RE.test(objectPath);
}

/**
 * Site yolundaki `?v=` damgası nesne yoluna yazılır.
 * `.../ders.mp3?v=697` → `slug/ders/v697.mp3`. Fon yatağı `v697.bed.mp3` olur.
 * WAV ve media-bake reddedilir.
 */
export function academySealedObjectPathFromPlayback(playbackSrc: string): string | null {
  if (playbackSrc.includes("media-bake") || playbackSrc.includes("..")) {
    return null;
  }
  let url: URL;
  try {
    url = new URL(playbackSrc, "https://yetkin.ai");
  } catch {
    return null;
  }
  if (url.pathname.includes("..") || url.pathname.endsWith(".wav")) {
    return null;
  }
  if (!isAcademyAudioPublicPath(url.pathname)) {
    return null;
  }
  const rest = url.pathname.slice(ACADEMY_AUDIO_PUBLIC_PREFIX.length);
  const slash = rest.indexOf("/");
  if (slash <= 0 || rest.includes("/", slash + 1)) {
    return null;
  }
  const slug = rest.slice(0, slash);
  const file = rest.slice(slash + 1);
  if (!/^[a-z0-9_]+$/u.test(slug) || file.includes("/") || file.includes("..")) {
    return null;
  }
  const bed = file.endsWith(".bed.mp3");
  const stem = bed ? file.slice(0, -".bed.mp3".length) : file.endsWith(".mp3") ? file.slice(0, -".mp3".length) : "";
  if (!stem || !/^[a-z0-9_-]+$/u.test(stem)) {
    return null;
  }
  const versionRaw = url.searchParams.get("v");
  let version: string | null = null;
  if (versionRaw) {
    if (!/^[1-9]\d*$/u.test(versionRaw)) {
      return null;
    }
    version = versionRaw;
  }
  const suffix = bed ? ".bed.mp3" : ".mp3";
  const objectPath = version ? `${slug}/${stem}/v${version}${suffix}` : `${slug}/${stem}${suffix}`;
  return isAcademySealedObjectPath(objectPath) ? objectPath : null;
}

export type AcademyStorageSigner = (
  objectPath: string,
  ttlSec: number,
  env: Record<string, string | undefined>,
) => Promise<string | null>;

let registeredStorageSigner: AcademyStorageSigner | null = null;

/** Sunucu modülü kaydeder. Kenar bu kaydı çağırmaz. Test `null` ile temizler. */
export function registerAcademyStorageSigner(signer: AcademyStorageSigner | null): void {
  registeredStorageSigner = signer;
}

function sealedSignedUrlMatches(signed: string, objectPath: string): boolean {
  let url: URL;
  try {
    url = new URL(signed);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") {
    return false;
  }
  let path: string;
  try {
    path = decodeURIComponent(url.pathname);
  } catch {
    return false;
  }
  if (path.includes(ACADEMY_LEGACY_PUBLIC_AUDIO_BUCKET) || path.includes("media-bake") || path.includes("..")) {
    return false;
  }
  const marker = `/object/sign/${ACADEMY_SEALED_STORAGE_BUCKET}/`;
  const at = path.indexOf(marker);
  if (at < 0) {
    return false;
  }
  return path.slice(at + marker.length) === objectPath;
}

async function issueAcademyStoragePlayback(
  playbackSrc: string,
  env: Record<string, string | undefined>,
  storageSigner: AcademyStorageSigner | null,
): Promise<string | null> {
  const objectPath = academySealedObjectPathFromPlayback(playbackSrc);
  if (!objectPath) {
    return null;
  }
  if (!storageSigner) {
    return null;
  }
  let signed: string | null;
  try {
    signed = await storageSigner(objectPath, ACADEMY_AUDIO_GRANT_TTL_SEC, env);
  } catch {
    return null;
  }
  if (!signed || !sealedSignedUrlMatches(signed, objectPath)) {
    return null;
  }
  return signed;
}

/**
 * Oynatıcı adresi.
 * `local`: site yoluna `g` ekler. Sır yoksa null.
 * `storage`: kova adresi. İmza yoksa null; başka dersin sesi konmaz.
 */
export async function withAcademyAudioGrant(
  playbackSrc: string,
  nowMs: number = Date.now(),
  env: Record<string, string | undefined> = process.env,
  storageSigner?: AcademyStorageSigner,
): Promise<string | null> {
  if (resolveAcademyMediaRead(env) === "storage") {
    const signer = storageSigner ?? registeredStorageSigner;
    return issueAcademyStoragePlayback(playbackSrc, env, signer);
  }
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
