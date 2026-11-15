import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { generateSocialPackage } from "@/lib/kernel/admin/social-generate";
import {
  mergeSocialEnv,
  parseSocialEnvText,
  readSocialCredentials,
  socialKeyReport,
} from "@/lib/kernel/admin/social-env";
import {
  buildOAuth1Authorization,
  publishSocialDraft,
  type SocialFetch,
} from "@/lib/kernel/admin/social-publish";
import {
  composeBrandPackage,
  composeSocialReply,
  SOCIAL_MODULES,
  socialConnectionCards,
  type SocialDraft,
} from "@/lib/kernel/admin/social-desk";
import { ROUTE_AUTH_MAP } from "@/lib/kernel/security/route-auth-map";
import { RLS_FORCE_TABLES } from "@/lib/kernel/security/rls-policy-registry";
import { WEB_ONLY_WRITE_ROUTES } from "@/lib/kernel/http/web-only-write-routes";
import type { SocialCredentials } from "@/lib/kernel/admin/social-env";

const TOKEN = "linkedin-token-value-123456";
const X_SECRET = "x-consumer-secret-value-xyz";

function emptyCreds(): SocialCredentials {
  return {
    linkedinAccessToken: null,
    linkedinOrganizationId: null,
    xApiKey: null,
    xApiSecret: null,
    xAccessToken: null,
    xAccessTokenSecret: null,
    metaAdsAccessToken: null,
    metaAppSecret: null,
    metaPageId: null,
    metaPageAccessToken: null,
    metaInstagramUserId: null,
  };
}

async function withGeminiKey(value: string | undefined, run: () => Promise<void>): Promise<void> {
  const previous = process.env.GEMINI_API_KEY;
  if (value === undefined) {
    delete process.env.GEMINI_API_KEY;
  } else {
    process.env.GEMINI_API_KEY = value;
  }
  try {
    await run();
  } finally {
    if (previous === undefined) {
      delete process.env.GEMINI_API_KEY;
    } else {
      process.env.GEMINI_API_KEY = previous;
    }
  }
}

describe("sosyal yayın masası", () => {
  it("her modül dört dürüst taslak üretir", () => {
    for (const socialModule of SOCIAL_MODULES) {
      const drafts = composeBrandPackage(socialModule);
      expect(drafts.map((draft) => draft.platform)).toEqual([
        "LINKEDIN",
        "INSTAGRAM",
        "FACEBOOK",
        "X",
      ]);
      for (const draft of drafts) {
        expect(draft.body).toContain(draft.targetUrl);
        expect(draft.body).not.toMatch(/kesin hibe|iş vaadi|garanti eder/i);
      }
    }
  });

  it("yorum taslağı fiyat uydurmaz ve sayfa linki taşır", () => {
    const reply = composeSocialReply({
      inbound: "Fiyatı ne kadar, hibe kesin mi?",
      module: "TUBITAK_1507",
    });
    expect(reply.draft).toContain("https://yetkin.ai/tezgah?tool=grant");
    expect(reply.draft).toContain("bu taslakta yoktur");
    expect(reply.draft).not.toMatch(/\d+\s*TL|kesin hibe/i);
  });

  it("anahtar değerini karta yazmaz", () => {
    const env = {
      LINKEDIN_ACCESS_TOKEN: TOKEN,
      LINKEDIN_ORGANIZATION_ID: "12345678",
      LINKEDIN_CLIENT_ID: "client-id-value-123",
    };
    const report = socialKeyReport(env);
    const cards = socialConnectionCards(report);
    expect(JSON.stringify(cards)).not.toContain(TOKEN);
    expect(cards.find((card) => card.id === "linkedin")?.state).toBe("connected");
    expect(cards.find((card) => card.id === "x")?.state).toBe("missing");
    expect(readSocialCredentials(env).linkedinAccessToken).toBe(TOKEN);
  });

  it("müze dosyası yalnız boş process anahtarını doldurur", () => {
    const parsed = parseSocialEnvText(
      '# yorum\nLINKEDIN_ACCESS_TOKEN="abc"\nX_API_KEY=\nX_API_SECRET=not-social-wait\n',
    );
    expect(parsed.LINKEDIN_ACCESS_TOKEN).toBe("abc");
    expect(parsed.X_API_KEY).toBeUndefined();
    const merged = mergeSocialEnv(
      { LINKEDIN_ACCESS_TOKEN: "from-process-token" },
      { LINKEDIN_ACCESS_TOKEN: "from-file-token", X_API_KEY: "file-x-key-value" },
    );
    expect(merged.LINKEDIN_ACCESS_TOKEN).toBe("from-process-token");
    expect(merged.X_API_KEY).toBe("file-x-key-value");
  });

  it("anahtar yokken ağa çıkmaz", async () => {
    let calls = 0;
    const fetchImpl: SocialFetch = async () => {
      calls += 1;
      return new Response("{}", { status: 500 });
    };
    const result = await publishSocialDraft(
      draftOf("LINKEDIN"),
      emptyCreds(),
      fetchImpl,
    );
    expect(result.ok).toBe(false);
    expect(result.attempted).toBe(false);
    expect(result.reason).toContain("Anahtar Eksik");
    expect(calls).toBe(0);
  });

  it("LinkedIn hata gövdesindeki jetonu gizler ve kimliksiz 201'i yayın saymaz", async () => {
    const creds = {
      ...emptyCreds(),
      linkedinAccessToken: TOKEN,
      linkedinOrganizationId: "12345678",
    };
    const denied = await publishSocialDraft(
      draftOf("LINKEDIN"),
      creds,
      async () => new Response(`{"message":"bad ${TOKEN}"}`, { status: 401 }),
    );
    expect(denied.ok).toBe(false);
    expect(denied.attempted).toBe(true);
    expect(denied.reason).not.toContain(TOKEN);
    expect(denied.reason).toContain("[gizli]");
    const nameless = await publishSocialDraft(
      draftOf("LINKEDIN"),
      creds,
      async () => new Response("", { status: 201 }),
    );
    expect(nameless.ok).toBe(false);
    expect(nameless.reason).toContain("kimlik");
    const posted = await publishSocialDraft(
      draftOf("LINKEDIN"),
      creds,
      async () => new Response("", { status: 201, headers: { "x-restli-id": "urn:li:share:1" } }),
    );
    expect(posted).toMatchObject({ ok: true, externalPostId: "urn:li:share:1" });
  });

  it("X imzası sırrı taşımaz ve kimlik dönerse yayını kabul eder", async () => {
    const header = buildOAuth1Authorization({
      method: "POST",
      url: "https://api.twitter.com/2/tweets",
      consumerKey: "consumer-key-value",
      consumerSecret: X_SECRET,
      token: "access-token-value",
      tokenSecret: "access-token-secret-value",
      nonce: "nonce",
      timestamp: "1700000000",
    });
    expect(header.startsWith("OAuth ")).toBe(true);
    expect(header).not.toContain(X_SECRET);
    expect(header).toContain("oauth_signature=");
    const creds = {
      ...emptyCreds(),
      xApiKey: "consumer-key-value",
      xApiSecret: X_SECRET,
      xAccessToken: "access-token-value",
      xAccessTokenSecret: "access-token-secret-value",
    };
    const result = await publishSocialDraft(
      { ...draftOf("X"), body: "Kısa not.\n---\nhttps://yetkin.ai/tezgah" },
      creds,
      async () => new Response(JSON.stringify({ data: { id: "99" } }), { status: 201 }),
    );
    expect(result.ok).toBe(true);
    expect(result.externalPostId).toBe("99,99");
  });

  it("Meta reklam anahtarı sayfa döndürmezse yayın yazılmaz", async () => {
    const creds = { ...emptyCreds(), metaAdsAccessToken: "meta-ads-token-value" };
    const result = await publishSocialDraft(
      draftOf("FACEBOOK"),
      creds,
      async () => new Response(JSON.stringify({ data: [] }), { status: 200 }),
    );
    expect(result.ok).toBe(false);
    expect(result.attempted).toBe(true);
    expect(result.reason).toContain("sayfa döndürmedi");
    expect(result.reason).not.toContain("meta-ads-token-value");
  });

  it("sayfa jetonu varsa Facebook kimliğini kaydeder", async () => {
    const creds = {
      ...emptyCreds(),
      metaPageId: "123456789",
      metaPageAccessToken: "page-token-value-123",
    };
    const result = await publishSocialDraft(
      draftOf("FACEBOOK"),
      creds,
      async () => new Response(JSON.stringify({ id: "123456789_1" }), { status: 200 }),
    );
    expect(result).toMatchObject({ ok: true, externalPostId: "123456789_1" });
  });

  it("Instagram görselsiz ağa çıkmaz", async () => {
    let calls = 0;
    const fetchImpl: SocialFetch = async () => {
      calls += 1;
      return new Response("{}", { status: 500 });
    };
    const result = await publishSocialDraft(
      draftOf("INSTAGRAM"),
      {
        ...emptyCreds(),
        metaPageId: "123456789",
        metaPageAccessToken: "page-token-value-123",
        metaInstagramUserId: "17890000000000000",
      },
      fetchImpl,
    );
    expect(result.attempted).toBe(false);
    expect(result.reason).toContain("görsel URL");
    expect(calls).toBe(0);
  });

  it("Gemini yoksa şablon, uyan modelde Gemini taslağı döner", async () => {
    await withGeminiKey(undefined, async () => {
      const pack = await generateSocialPackage({
        module: "AI_TEZGAH",
        userId: "11111111-1111-4111-8111-111111111111",
        invoke: async () => {
          throw new Error("çağrılmamalı");
        },
      });
      expect(pack.source).toBe("template");
      expect(pack.note).toContain("GEMINI_API_KEY");
    });
    await withGeminiKey("test-gemini-key-value", async () => {
      const good = composeBrandPackage("COMMERCE");
      const pack = await generateSocialPackage({
        module: "COMMERCE",
        userId: "11111111-1111-4111-8111-111111111111",
        invoke: async () => ({
          text: JSON.stringify({
            posts: good.map((draft) => ({
              platform: draft.platform,
              title: draft.title,
              body: draft.body,
              imagePrompt: draft.imagePrompt,
            })),
          }),
        }),
      });
      expect(pack.source).toBe("gemini");
      expect(pack.drafts).toHaveLength(4);
      const rejected = await generateSocialPackage({
        module: "COMMERCE",
        userId: "11111111-1111-4111-8111-111111111111",
        invoke: async () => ({ text: '{"posts":[]}' }),
      });
      expect(rejected.source).toBe("template");
    });
  });

  it("şema FORCE RLS ve admin uçları mühürlüdür", () => {
    const sql = readFileSync(
      join(process.cwd(), "prisma/migrations/20261115224500_social_post_queue/migration.sql"),
      "utf8",
    );
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("FORCE ROW LEVEL SECURITY");
    expect(sql).toContain("rls_deny_unscoped");
    expect(sql).toContain("USING (false)");
    expect(sql).not.toMatch(/FOR INSERT/);
    expect(sql).not.toMatch(/FOR UPDATE/);
    expect(sql).not.toMatch(/FOR DELETE/);
    expect(RLS_FORCE_TABLES).toContain("social_post_queue_items");
    expect(ROUTE_AUTH_MAP["/api/admin/social"]).toBe("admin");
    expect(ROUTE_AUTH_MAP["/api/admin/social/publish"]).toBe("admin");
    expect(ROUTE_AUTH_MAP["/api/admin/social/reply"]).toBe("admin");
    for (const path of ["/api/admin/social", "/api/admin/social/publish", "/api/admin/social/reply"]) {
      expect(WEB_ONLY_WRITE_ROUTES.some((row) => row.path === path && row.status === "admin")).toBe(true);
    }
  });
});

function draftOf(platform: SocialDraft["platform"]) {
  const draft = composeBrandPackage("AI_TEZGAH").find((item) => item.platform === platform);
  if (!draft) {
    throw new Error(platform);
  }
  return { ...draft, imageUrl: null as string | null };
}
