import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { SUPER_ADMIN_AUDIT_ACTIONS } from "@/lib/kernel/admin/audit-log";
import {
  classifyProductModel,
  fallbackProductModelCatalog,
} from "@/lib/kernel/ai/gemini-model-catalog";
import { AI_MODEL_ROLE_KEYS, ACADEMY_SEALED_MEDIA_MODEL } from "@/lib/kernel/ai/model-roles";
import {
  parseProductModelPatch,
  PRODUCT_MODEL_DEFAULTS,
  resolveProductModel,
  setProductModelReaderForTests,
  type ProductModelSettingRow,
} from "@/lib/kernel/ai/product-models";
import { RLS_FORCE_TABLES } from "@/lib/kernel/security/rls-policy-registry";
import { ROUTE_AUTH_MAP } from "@/lib/kernel/security/route-auth-map";
import { BadRequestError } from "@/lib/kernel/http/errors";

const ROOT = process.cwd();

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

function row(partial: Partial<ProductModelSettingRow> = {}): ProductModelSettingRow {
  return {
    textEasyModelId: null,
    textDeepModelId: null,
    imageEasyModelId: null,
    imageDeepModelId: null,
    voiceEasyModelId: null,
    voiceDeepModelId: null,
    updatedBy: null,
    updatedAt: null,
    ...partial,
  };
}

describe("ürün model yuvaları", () => {
  afterEach(() => {
    setProductModelReaderForTests(null);
  });

  it("satır yoksa, kolon boşsa ve okuma bozulursa kod varsayılanına düşer", async () => {
    setProductModelReaderForTests(async () => null);
    expect(await resolveProductModel("textEasy")).toBe(PRODUCT_MODEL_DEFAULTS.textEasy);
    expect(await resolveProductModel("textDeep")).toBe("gemini-4-hydrogen");

    setProductModelReaderForTests(async () => row({ textEasyModelId: "  models/gemini-3.8-flash  " }));
    expect(await resolveProductModel("textEasy")).toBe("gemini-3.8-flash");
    expect(await resolveProductModel("imageDeep")).toBe(PRODUCT_MODEL_DEFAULTS.imageDeep);

    setProductModelReaderForTests(async () => {
      throw new Error("db-down");
    });
    expect(await resolveProductModel("voiceDeep")).toBe(PRODUCT_MODEL_DEFAULTS.voiceDeep);
  });

  it("önbellek yazılana kadar eski satırı tutar", async () => {
    let current = row({ textDeepModelId: "gemini-3.1-pro-preview" });
    setProductModelReaderForTests(async () => current);
    expect(await resolveProductModel("textDeep")).toBe("gemini-3.1-pro-preview");
    current = row({ textDeepModelId: "gemini-4-hydrogen" });
    expect(await resolveProductModel("textDeep")).toBe("gemini-3.1-pro-preview");
    setProductModelReaderForTests(async () => current);
    expect(await resolveProductModel("textDeep")).toBe("gemini-4-hydrogen");
  });

  it("boş dize kod varsayılanına döner; güvensiz kimlik 400 yer", () => {
    expect(
      parseProductModelPatch({
        textEasyModelId: "",
        textDeepModelId: null,
        imageEasyModelId: " models/gemini-3.1-flash-lite-image ",
        imageDeepModelId: "gemini-3.1-flash-image",
        voiceEasyModelId: "gemini-3.8-flash-lite-tts",
        voiceDeepModelId: "gemini-3.8-flash-tts",
      }),
    ).toMatchObject({
      textEasy: null,
      textDeep: null,
      imageEasy: "gemini-3.1-flash-lite-image",
    });
    expect(() =>
      parseProductModelPatch({
        textEasyModelId: "gemini 3",
        textDeepModelId: null,
        imageEasyModelId: null,
        imageDeepModelId: null,
        voiceEasyModelId: null,
        voiceDeepModelId: null,
      }),
    ).toThrow(BadRequestError);
  });

  it("yedek liste altı varsayılanı taşır ve seçici türünü ayırır", () => {
    const ids = fallbackProductModelCatalog().map((model) => model.id);
    for (const id of Object.values(PRODUCT_MODEL_DEFAULTS)) {
      expect(ids).toContain(id);
    }
    expect(classifyProductModel("gemini-3.1-flash-image", ["generateContent"])).toBe("image");
    expect(classifyProductModel("gemini-3.8-flash-tts", ["generateContent"])).toBe("voice");
    expect(classifyProductModel("gemini-3.5-flash-lite", ["generateContent"])).toBe("text");
  });

  it("mühür tablosu ve rol tavanı yerinde kalır; metin çağrıları yuvayı okur", () => {
    expect(AI_MODEL_ROLE_KEYS).toHaveLength(8);
    expect(ACADEMY_SEALED_MEDIA_MODEL.IMAGE_GEN).toBe("gemini-3.1-flash-image");
    expect(ACADEMY_SEALED_MEDIA_MODEL.VOICE_TTS).toBe("gemini-3.8-flash-tts");
    expect(SUPER_ADMIN_AUDIT_ACTIONS).toContain("ai_model_bind");
    expect(ROUTE_AUTH_MAP["/api/admin/ai-models"]).toBe("admin");
    expect(RLS_FORCE_TABLES).toContain("ai_product_model_settings");

    const sql = read("prisma/migrations/20261120223000_ai_product_model_settings/migration.sql");
    expect(sql).toContain("rls_deny_unscoped");
    expect(sql).toContain("FORCE ROW LEVEL SECURITY");
    expect(sql).toContain("'ai_model_bind'");
    expect(sql).not.toMatch(/FOR INSERT|FOR UPDATE|FOR DELETE/);

    const gateway = read("lib/kernel/ai/llm-gateway.ts");
    expect(gateway).toContain("ACADEMY_SEALED_MEDIA_MODEL.IMAGE_GEN");
    expect(gateway).toContain("ACADEMY_SEALED_MEDIA_MODEL.VOICE_TTS");

    for (const file of [
      "lib/tezgah/engine.ts",
      "lib/tezgah/grant/engine.ts",
      "lib/tezgah/reklam/engine.ts",
      "lib/tezgah/pazaryeri/engine.ts",
      "lib/kernel/ai/form-coach.ts",
      "lib/kernel/ai/assistant-chat.ts",
      "lib/kernel/admin/social-generate.ts",
      "lib/commerce/os-service.ts",
    ]) {
      expect(read(file), file).toContain('resolveProductModel("textEasy")');
    }
    expect(read("lib/tezgah/tetkik/engine.ts")).toContain('resolveProductModel("textDeep")');
    expect(read("app/(kernel)/admin/page.tsx")).toContain("AdminAiModelDesk");
    expect(read("app/api/(kernel)/admin/ai-models/route.ts")).toContain("requireSuperAdmin");
  });
});
