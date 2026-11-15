import { createHmac, randomBytes } from "node:crypto";
import type { SocialPlatform } from "@/lib/kernel/admin/social-desk";
import { publishTextIssue, splitXFlood } from "@/lib/kernel/admin/social-desk";
import type { SocialCredentials } from "@/lib/kernel/admin/social-env";

const GRAPH = "https://graph.facebook.com/v21.0";
const LINKEDIN_POSTS = "https://api.linkedin.com/rest/posts";
const X_TWEETS = "https://api.twitter.com/2/tweets";

export type SocialFetch = typeof fetch;

export type SocialPublishInput = {
  platform: SocialPlatform;
  title: string;
  body: string;
  imageUrl: string | null;
  targetUrl: string;
};

export type SocialPublishOutcome = {
  ok: boolean;
  attempted: boolean;
  reason: string;
  externalPostId: string | null;
};

type MetaPage = {
  pageId: string;
  pageToken: string;
  igUserId: string | null;
};

export async function publishSocialDraft(
  draft: SocialPublishInput,
  creds: SocialCredentials,
  fetchImpl: SocialFetch = fetch,
): Promise<SocialPublishOutcome> {
  const issue = publishTextIssue(draft.platform, draft.body);
  if (issue) {
    return { ok: false, attempted: false, reason: issue, externalPostId: null };
  }
  if (draft.platform === "LINKEDIN") {
    return publishLinkedIn(draft, creds, fetchImpl);
  }
  if (draft.platform === "X") {
    return publishX(draft, creds, fetchImpl);
  }
  if (draft.platform === "INSTAGRAM" && !draft.imageUrl) {
    return {
      ok: false,
      attempted: false,
      reason: "Instagram görsel URL ister. Görselsiz paylaşım yazılmaz.",
      externalPostId: null,
    };
  }
  return publishMeta(draft, creds, fetchImpl);
}

export function buildOAuth1Authorization(input: {
  method: "POST";
  url: string;
  consumerKey: string;
  consumerSecret: string;
  token: string;
  tokenSecret: string;
  nonce?: string;
  timestamp?: string;
}): string {
  const nonce = input.nonce ?? randomBytes(16).toString("hex");
  const timestamp = input.timestamp ?? Math.floor(Date.now() / 1000).toString();
  const oauth: Record<string, string> = {
    oauth_consumer_key: input.consumerKey,
    oauth_nonce: nonce,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: timestamp,
    oauth_token: input.token,
    oauth_version: "1.0",
  };
  const paramString = Object.keys(oauth)
    .sort()
    .map((key) => `${rfc3986(key)}=${rfc3986(oauth[key]!)}`)
    .join("&");
  const base = `POST&${rfc3986(input.url)}&${rfc3986(paramString)}`;
  const signingKey = `${rfc3986(input.consumerSecret)}&${rfc3986(input.tokenSecret)}`;
  const signature = createHmac("sha1", signingKey).update(base).digest("base64");
  const header: Record<string, string> = { ...oauth, oauth_signature: signature };
  const rendered = Object.keys(header)
    .sort()
    .map((key) => `${rfc3986(key)}="${rfc3986(header[key]!)}"`)
    .join(", ");
  return `OAuth ${rendered}`;
}

async function publishLinkedIn(
  draft: SocialPublishInput,
  creds: SocialCredentials,
  fetchImpl: SocialFetch,
): Promise<SocialPublishOutcome> {
  const token = creds.linkedinAccessToken;
  const org = creds.linkedinOrganizationId;
  if (!token || !org) {
    return {
      ok: false,
      attempted: false,
      reason: "LinkedIn: Anahtar Eksik (LINKEDIN_ACCESS_TOKEN, LINKEDIN_ORGANIZATION_ID).",
      externalPostId: null,
    };
  }
  const author = org.startsWith("urn:li:") ? org : `urn:li:organization:${org}`;
  const payload: Record<string, unknown> = {
    author,
    commentary: draft.body,
    visibility: "PUBLIC",
    distribution: {
      feedDistribution: "MAIN_FEED",
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    lifecycleState: "PUBLISHED",
    isReshareDisabledByAuthor: false,
    content: {
      article: {
        source: draft.targetUrl,
        title: draft.title.slice(0, 200),
      },
    },
  };
  const response = await fetchImpl(LINKEDIN_POSTS, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
      "LinkedIn-Version": "202411",
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15_000),
  });
  const text = await response.text();
  const secrets = [token, org];
  if (!response.ok) {
    return {
      ok: false,
      attempted: true,
      reason: `LinkedIn ${response.status}: ${scrub(text || "Platform hata ayrıntısı vermedi.", secrets)}`,
      externalPostId: null,
    };
  }
  const headerId = response.headers.get("x-restli-id");
  const bodyId = readJsonId(text);
  const externalPostId = headerId || bodyId;
  if (!externalPostId) {
    return {
      ok: false,
      attempted: true,
      reason: "LinkedIn kimlik döndürmedi. Yayınlandı sayılmaz.",
      externalPostId: null,
    };
  }
  return { ok: true, attempted: true, reason: "", externalPostId };
}

async function publishX(
  draft: SocialPublishInput,
  creds: SocialCredentials,
  fetchImpl: SocialFetch,
): Promise<SocialPublishOutcome> {
  const key = creds.xApiKey;
  const secret = creds.xApiSecret;
  const token = creds.xAccessToken;
  const tokenSecret = creds.xAccessTokenSecret;
  if (!key || !secret || !token || !tokenSecret) {
    return {
      ok: false,
      attempted: false,
      reason: "X: Anahtar Eksik (X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET).",
      externalPostId: null,
    };
  }
  const secrets = [key, secret, token, tokenSecret];
  const ids: string[] = [];
  let previous: string | null = null;
  for (const text of splitXFlood(draft.body)) {
    const payload: Record<string, unknown> = { text };
    if (previous) {
      payload.reply = { in_reply_to_tweet_id: previous };
    }
    const response = await fetchImpl(X_TWEETS, {
      method: "POST",
      headers: {
        Authorization: buildOAuth1Authorization({
          method: "POST",
          url: X_TWEETS,
          consumerKey: key,
          consumerSecret: secret,
          token,
          tokenSecret,
        }),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15_000),
    });
    const raw = await response.text();
    if (!response.ok) {
      const reason = `X ${response.status}: ${scrub(raw || "Platform hata ayrıntısı vermedi.", secrets)}`;
      return {
        ok: false,
        attempted: true,
        reason: ids.length > 0 ? `X kısmi yayın (${ids.join(", ")}). ${reason}` : reason,
        externalPostId: ids[0] ?? null,
      };
    }
    const id = readDataId(raw);
    if (!id) {
      return {
        ok: false,
        attempted: true,
        reason: "X kimlik döndürmedi. Yayınlandı sayılmaz.",
        externalPostId: ids[0] ?? null,
      };
    }
    ids.push(id);
    previous = id;
  }
  return { ok: true, attempted: true, reason: "", externalPostId: ids.join(",").slice(0, 200) };
}

async function publishMeta(
  draft: SocialPublishInput,
  creds: SocialCredentials,
  fetchImpl: SocialFetch,
): Promise<SocialPublishOutcome> {
  const resolved = await resolveMetaPage(creds, fetchImpl);
  if (!resolved.ok) {
    return resolved.outcome;
  }
  const page = resolved.page;
  const secrets = [page.pageToken, creds.metaAdsAccessToken, creds.metaAppSecret].filter(
    (value): value is string => Boolean(value),
  );
  if (draft.platform === "FACEBOOK") {
    const response = await fetchImpl(`${GRAPH}/${encodeURIComponent(page.pageId)}/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: graphBody(
        { message: draft.body, link: draft.targetUrl },
        page.pageToken,
        creds.metaAppSecret,
      ),
      signal: AbortSignal.timeout(15_000),
    });
    const raw = await response.text();
    if (!response.ok) {
      return {
        ok: false,
        attempted: true,
        reason: `Facebook ${response.status}: ${scrub(raw || "Platform hata ayrıntısı vermedi.", secrets)}`,
        externalPostId: null,
      };
    }
    const id = readJsonId(raw);
    if (!id) {
      return {
        ok: false,
        attempted: true,
        reason: "Facebook kimlik döndürmedi. Yayınlandı sayılmaz.",
        externalPostId: null,
      };
    }
    return { ok: true, attempted: true, reason: "", externalPostId: id };
  }
  const igUserId = page.igUserId;
  if (!igUserId) {
    return {
      ok: false,
      attempted: true,
      reason: "Instagram işletme hesabı bulunamadı. META_INSTAGRAM_USER_ID yok.",
      externalPostId: null,
    };
  }
  if (!draft.imageUrl) {
    return {
      ok: false,
      attempted: true,
      reason: "Instagram görsel URL ister. Görselsiz paylaşım yazılmaz.",
      externalPostId: null,
    };
  }
  const container = await fetchImpl(`${GRAPH}/${encodeURIComponent(igUserId)}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: graphBody(
      { image_url: draft.imageUrl, caption: draft.body },
      page.pageToken,
      creds.metaAppSecret,
    ),
    signal: AbortSignal.timeout(15_000),
  });
  const containerRaw = await container.text();
  if (!container.ok) {
    return {
      ok: false,
      attempted: true,
      reason: `Instagram ${container.status}: ${scrub(containerRaw || "Kap oluşturulamadı.", secrets)}`,
      externalPostId: null,
    };
  }
  const creationId = readJsonId(containerRaw);
  if (!creationId) {
    return {
      ok: false,
      attempted: true,
      reason: "Instagram kap kimliği dönmedi. Yayınlandı sayılmaz.",
      externalPostId: null,
    };
  }
  const ready = await containerReady(creationId, page.pageToken, creds.metaAppSecret, fetchImpl);
  if (!ready.ok) {
    return { ok: false, attempted: true, reason: ready.reason, externalPostId: null };
  }
  const published = await fetchImpl(`${GRAPH}/${encodeURIComponent(igUserId)}/media_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: graphBody({ creation_id: creationId }, page.pageToken, creds.metaAppSecret),
    signal: AbortSignal.timeout(15_000),
  });
  const publishedRaw = await published.text();
  if (!published.ok) {
    return {
      ok: false,
      attempted: true,
      reason: `Instagram ${published.status}: ${scrub(publishedRaw || "Yayın kimliği dönmedi.", secrets)}`,
      externalPostId: null,
    };
  }
  const id = readJsonId(publishedRaw);
  if (!id) {
    return {
      ok: false,
      attempted: true,
      reason: "Instagram yayın kimliği dönmedi. Yayınlandı sayılmaz.",
      externalPostId: null,
    };
  }
  return { ok: true, attempted: true, reason: "", externalPostId: id };
}

async function resolveMetaPage(
  creds: SocialCredentials,
  fetchImpl: SocialFetch,
): Promise<{ ok: true; page: MetaPage } | { ok: false; outcome: SocialPublishOutcome }> {
  if (creds.metaPageId && creds.metaPageAccessToken) {
    return {
      ok: true,
      page: {
        pageId: creds.metaPageId,
        pageToken: creds.metaPageAccessToken,
        igUserId: creds.metaInstagramUserId,
      },
    };
  }
  if (!creds.metaAdsAccessToken) {
    return {
      ok: false,
      outcome: {
        ok: false,
        attempted: false,
        reason:
          "Meta: Anahtar Eksik (META_PAGE_ID, META_PAGE_ACCESS_TOKEN, META_INSTAGRAM_USER_ID). META_ADS_ACCESS_TOKEN de yok.",
        externalPostId: null,
      },
    };
  }
  const proof = creds.metaAppSecret
    ? `&appsecret_proof=${appSecretProof(creds.metaAppSecret, creds.metaAdsAccessToken)}`
    : "";
  const response = await fetchImpl(
    `${GRAPH}/me/accounts?fields=id,access_token,instagram_business_account{id}&limit=3${proof}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${creds.metaAdsAccessToken}` },
      signal: AbortSignal.timeout(15_000),
    },
  );
  const raw = await response.text();
  const secrets = [creds.metaAdsAccessToken, creds.metaAppSecret].filter((value): value is string => Boolean(value));
  if (!response.ok) {
    return {
      ok: false,
      outcome: {
        ok: false,
        attempted: true,
        reason: `Meta ${response.status}: ${scrub(raw || "Sayfa listesi alınamadı.", secrets)}`,
        externalPostId: null,
      },
    };
  }
  const page = readFirstPage(raw);
  if (!page) {
    return {
      ok: false,
      outcome: {
        ok: false,
        attempted: true,
        reason: "Meta reklam anahtarı sayfa döndürmedi. Organik yayın yazılmaz.",
        externalPostId: null,
      },
    };
  }
  secrets.push(page.pageToken);
  return {
    ok: true,
    page: {
      pageId: page.pageId,
      pageToken: page.pageToken,
      igUserId: creds.metaInstagramUserId ?? page.igUserId,
    },
  };
}

async function containerReady(
  creationId: string,
  token: string,
  appSecret: string | null,
  fetchImpl: SocialFetch,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const proof = appSecret ? `&appsecret_proof=${appSecretProof(appSecret, token)}` : "";
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetchImpl(
      `${GRAPH}/${encodeURIComponent(creationId)}?fields=status_code${proof}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(15_000),
      },
    );
    const raw = await response.text();
    if (!response.ok) {
      return { ok: false, reason: `Instagram kap durumu ${response.status}: ${scrub(raw, [token])}` };
    }
    const status = readStatusCode(raw);
    if (status === "FINISHED" || status === "PUBLISHED") {
      return { ok: true };
    }
    if (status === "ERROR" || status === "EXPIRED") {
      return { ok: false, reason: `Instagram kabı ${status}. Yayınlandı sayılmaz.` };
    }
  }
  return { ok: false, reason: "Instagram kabı hazır değil. Yayınlandı sayılmaz." };
}

function graphBody(fields: Record<string, string>, token: string, appSecret: string | null): string {
  const params = new URLSearchParams(fields);
  params.set("access_token", token);
  if (appSecret) {
    params.set("appsecret_proof", appSecretProof(appSecret, token));
  }
  return params.toString();
}

function appSecretProof(appSecret: string, token: string): string {
  return createHmac("sha256", appSecret).update(token).digest("hex");
}

function readJsonId(raw: string): string | null {
  try {
    const json = JSON.parse(raw) as { id?: unknown };
    return typeof json.id === "string" && json.id.trim() ? json.id.trim() : null;
  } catch {
    return null;
  }
}

function readDataId(raw: string): string | null {
  try {
    const json = JSON.parse(raw) as { data?: { id?: unknown } };
    const id = json.data?.id;
    return typeof id === "string" && id.trim() ? id.trim() : null;
  } catch {
    return null;
  }
}

function readStatusCode(raw: string): string | null {
  try {
    const json = JSON.parse(raw) as { status_code?: unknown };
    return typeof json.status_code === "string" ? json.status_code : null;
  } catch {
    return null;
  }
}

function readFirstPage(raw: string): { pageId: string; pageToken: string; igUserId: string | null } | null {
  try {
    const json = JSON.parse(raw) as {
      data?: Array<{
        id?: unknown;
        access_token?: unknown;
        instagram_business_account?: { id?: unknown };
      }>;
    };
    const first = json.data?.[0];
    if (!first || typeof first.id !== "string" || typeof first.access_token !== "string") {
      return null;
    }
    const ig = first.instagram_business_account?.id;
    return {
      pageId: first.id,
      pageToken: first.access_token,
      igUserId: typeof ig === "string" && ig ? ig : null,
    };
  } catch {
    return null;
  }
}

function scrub(raw: string, secrets: string[]): string {
  let text = raw.replace(/\s+/gu, " ").trim();
  for (const secret of secrets) {
    if (secret.length < 6) {
      continue;
    }
    text = text.split(secret).join("[gizli]");
    text = text.split(encodeURIComponent(secret)).join("[gizli]");
  }
  return text.slice(0, 420) || "Platform hata ayrıntısı vermedi.";
}

function rfc3986(value: string): string {
  return encodeURIComponent(value).replace(/[!'()*]/gu, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
}
