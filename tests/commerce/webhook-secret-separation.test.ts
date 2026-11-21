import { describe, expect, it } from "vitest";
import { collectChannelWebhookSecrets } from "@/lib/commerce/channel-webhook";

describe("kanal webhook sırrı", () => {
  it("şifreleme anahtarına düşmez ve boş sırrı reddeder", () => {
    const closed = collectChannelWebhookSecrets({
      env: {
        NODE_ENV: "test",
        COMMERCE_CREDENTIAL_ENCRYPTION_KEY: Buffer.alloc(32, 7).toString("base64"),
      },
      storeId: "store-1",
      ownerUserId: "owner-1",
      kind: "TRENDYOL",
      simOwner: "owner-1",
      apiKeySeal: "",
    });
    expect(closed.ok).toBe(true);
    if (closed.ok) {
      expect(closed.secrets).toEqual([]);
    }

    const named = collectChannelWebhookSecrets({
      env: { NODE_ENV: "test", COMMERCE_WEBHOOK_SECRET_TRENDYOL: "ty-secret" },
      storeId: "store-1",
      ownerUserId: "owner-1",
      kind: "TRENDYOL",
      simOwner: "owner-1",
      apiKeySeal: "",
    });
    expect(named).toEqual({ ok: true, secrets: ["ty-secret"] });
  });
});
