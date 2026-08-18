import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PayloadTooLargeError } from "@/lib/kernel/http/errors";
import {
  STUDIO_ALLOWED_MIME_TYPES,
  STUDIO_IMAGE_DATA_BASE64_MAX_CHARS,
  STUDIO_IMAGE_DECODED_MAX_BYTES,
  STUDIO_STORAGE_BACKEND,
  STUDIO_STORAGE_BUCKET,
  assertStudioByteSize,
  assertStudioMimeType,
  assertStudioObjectOwnerPath,
  assertStudioStorageCorsHeaders,
  assertStudioStorageCorsRejectsForeignOrigin,
  STUDIO_STORAGE_CORS_FOREIGN_PROBE_ORIGIN,
  buildStudioObjectPath,
  createObjectStoreStudioAssetStorage,
} from "@/lib/studio/storage";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

const USER = "11111111-1111-4111-8111-111111111111";
const OTHER = "22222222-2222-4222-8222-222222222222";

describe("Studio depo sözleşmesi (T2-2)", () => {
  it("tavan, bucket, mime allowlist ve object-store fail-closed mühürler", async () => {
    expect(STUDIO_STORAGE_BACKEND).toBe("object-store");
    expect(STUDIO_STORAGE_BUCKET).toBe("studio-assets");
    expect(STUDIO_IMAGE_DATA_BASE64_MAX_CHARS).toBe(2_097_152);
    expect(STUDIO_IMAGE_DECODED_MAX_BYTES).toBe(1_572_864);
    expect(STUDIO_ALLOWED_MIME_TYPES).toEqual(["image/png", "image/jpeg", "image/webp"]);
    expect(assertStudioStorageCorsHeaders(
      { allowOrigin: "http://localhost:3000", allowMethods: "PUT" },
      "http://localhost:3000",
    ).origin).toBe("http://localhost:3000");
    expect(() =>
      assertStudioStorageCorsHeaders(
        { allowOrigin: "*", allowMethods: "PUT" },
        "http://localhost:3000",
      ),
    ).toThrow(/joker origin/i);
    expect(() =>
      assertStudioStorageCorsHeaders(
        { allowOrigin: "http://localhost:3000", allowMethods: "GET, PUT, DELETE" },
        "http://localhost:3000",
      ),
    ).toThrow(/yalnız PUT/);
    expect(() =>
      assertStudioStorageCorsRejectsForeignOrigin({ allowOrigin: "*" }),
    ).toThrow(/yetkisiz köke açık/);
    expect(() =>
      assertStudioStorageCorsRejectsForeignOrigin({
        allowOrigin: STUDIO_STORAGE_CORS_FOREIGN_PROBE_ORIGIN,
      }),
    ).toThrow(/yetkisiz kökü yansıtır/);
    expect(() =>
      assertStudioStorageCorsRejectsForeignOrigin({ allowOrigin: null }),
    ).not.toThrow();
    expect(() =>
      assertStudioStorageCorsRejectsForeignOrigin({ allowOrigin: "http://localhost:3000" }),
    ).not.toThrow();
    expect(assertStudioMimeType("image/png")).toBe("image/png");
    expect(assertStudioByteSize(1024)).toBe(1024);
    expect(() => assertStudioByteSize(STUDIO_IMAGE_DECODED_MAX_BYTES + 1)).toThrow(PayloadTooLargeError);
    expect(() => assertStudioMimeType("image/svg+xml")).toThrow(/kabul edilmez/);

    const path = buildStudioObjectPath(USER, "gen_1", "image/png");
    expect(path).toBe(`${USER}/gen_1.png`);
    expect(assertStudioObjectOwnerPath(USER, path)).toBe(path);
    expect(() => assertStudioObjectOwnerPath(OTHER, path)).toThrow(/kendi nesnesini/);
    expect(() => assertStudioObjectOwnerPath(USER, `${USER}/../secret.png`)).toThrow(/kendi nesnesini/);

    const store = createObjectStoreStudioAssetStorage();
    await expect(
      store.put({
        userId: USER,
        generationId: "gen_1",
        blob: { mimeType: "image/png", dataBase64: "abc" },
      }),
    ).rejects.toThrow(/nesne depo bağlı değil/);
  });

  it("şema ve tipler service_role olmadan imzalı PUT tarif eder; CHECK tavanı durur", () => {
    const storage = readSrc("lib/studio/storage.ts");
    const schema = readSrc("prisma/schema/studio.prisma");
    const sql = readSrc("prisma/migrations/20260815160000_studio_data_base64_max_chars/migration.sql");
    const ops = readSrc("scripts/ops-migrate.ts");
    const bucketSql = readSrc("supabase/storage/studio-assets.sql");

    expect(storage).toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(storage).toContain("StudioObjectStoreMetadata");
    expect(storage).toContain("StudioSignedUploadIntent");
    expect(schema).toContain(".system_docs/STORAGE_CONTRACT.md");
    expect(schema).toContain("storageKind");
    expect(schema).toContain("objectPath");
    expect(schema).toContain("byteSize");
    expect(sql).toContain("2097152");
    expect(ops).not.toContain("studio-assets");
    expect(ops).not.toContain("storage.objects");
    expect(bucketSql).toContain("(storage.foldername(name))[1] = auth.uid()::text");
    expect(bucketSql).toContain("NEXT_PUBLIC_APP_URL");
  });
});
