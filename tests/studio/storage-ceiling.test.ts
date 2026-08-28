import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PayloadTooLargeError } from "@/lib/kernel/http/errors";
import {
  assertStudioImagePayloadCeiling,
  createInlineStudioAssetStorage,
  STUDIO_IMAGE_DATA_BASE64_MAX_CHARS,
  STUDIO_STORAGE_BACKEND,
} from "@/lib/studio/storage";

const ROOT = process.cwd();

describe("Studio Base64 tavanı ve depolama arayüzü", () => {
  it("tavanı aşan Base64 413 fırlatır; inline backend nesne depo get'i kapatır", async () => {
    expect(STUDIO_STORAGE_BACKEND).toBe("object-store");
    expect(STUDIO_IMAGE_DATA_BASE64_MAX_CHARS).toBe(2_097_152);
    expect(assertStudioImagePayloadCeiling("abc")).toBe("abc");
    expect(() =>
      assertStudioImagePayloadCeiling("A".repeat(STUDIO_IMAGE_DATA_BASE64_MAX_CHARS + 1)),
    ).toThrow(PayloadTooLargeError);

    const storage = createInlineStudioAssetStorage();
    await expect(
      storage.get({
        kind: "object-store",
        bucket: "studio-assets",
        path: "u1/g1.png",
        mimeType: "image/png",
        byteSize: 12,
        contentHash: "abc",
      }),
    ).rejects.toThrow(/inline taşıyıcı nesne depo okumaz/);
  });

  it("Prisma CHECK migrasyonu tavan sabitiyle aynı sayıyı taşır", () => {
    const sql = readFileSync(
      join(ROOT, "prisma/migrations/20260815160000_studio_data_base64_max_chars/migration.sql"),
      "utf8",
    );
    const schema = readFileSync(join(ROOT, "prisma/schema/studio.prisma"), "utf8");
    const storage = readFileSync(join(ROOT, "archived/lib/studio/storage.ts"), "utf8");
    expect(sql).toContain(String(STUDIO_IMAGE_DATA_BASE64_MAX_CHARS));
    expect(sql).toContain("studio_digital_assets_data_base64_max_chars");
    expect(schema).toContain("2097152");
    expect(storage).toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(storage).toContain("object-store");
  });
});
