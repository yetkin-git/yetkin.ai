import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PayloadTooLargeError, ServiceUnavailableError } from "@/lib/kernel/http/errors";
import { jsonFromUnknown } from "@/lib/kernel/http/json";
import {
  STUDIO_IMAGE_DATA_BASE64_MAX_CHARS,
  STUDIO_IMAGE_DECODED_MAX_BYTES,
  STUDIO_STORAGE_BACKEND,
  STUDIO_STORAGE_BUCKET,
  createObjectStoreStudioAssetStorage,
} from "@/lib/studio/storage";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("Studio imzalı yükleme yüzeyi (T2-2)", () => {
  it("sign-upload ve confirm session auth taşır; service_role yok", () => {
    const sign = readSrc("app/api/studio/storage/sign-upload/route.ts");
    const confirm = readSrc("app/api/studio/storage/confirm/route.ts");
    const images = readSrc("app/api/studio/images/route.ts");
    const citizen = readSrc("lib/studio/citizen-storage.ts");
    const signed = readSrc("lib/studio/signed-upload.ts");

    expect(sign).toContain('export const auth = "session" as const');
    expect(confirm).toContain('export const auth = "session" as const');
    expect(sign).toContain("requireCitizenAuth");
    expect(confirm).toContain("requireCitizenAuth");
    expect(sign).toContain("signStudioUpload");
    expect(confirm).toContain("confirmStudioUpload");
    expect(images).toContain("createObjectStoreStudioAssetStorage");
    expect(images).toContain("createCitizenStorageGateway");
    expect(citizen).toContain("createSignedUploadUrl");
    expect(citizen).toContain("Bearer");
    expect(citizen).toContain("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    expect(citizen).toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(citizen).not.toMatch(/createClient\([^)]*SERVICE_ROLE/);
    expect(signed).not.toContain("SERVICE_ROLE");
    expect(sign).not.toContain("SERVICE_ROLE");
    expect(confirm).not.toContain("SERVICE_ROLE");
  });

  it("Dashboard SQL bucket + RLS taşır; ops:migrate yedisine girmez", () => {
    const sqlPath = "supabase/storage/studio-assets.sql";
    expect(existsSync(join(ROOT, sqlPath))).toBe(true);
    const sql = readSrc(sqlPath);
    const ops = readSrc("scripts/ops-migrate.ts");
    const opsLib = readSrc("scripts/ops-migrate-lib.ts");
    const prismaSql = readSrc(
      "prisma/migrations/20260816010000_studio_digital_asset_object_store/migration.sql",
    );
    const ceiling = readSrc(
      "prisma/migrations/20260815160000_studio_data_base64_max_chars/migration.sql",
    );

    expect(sql).toContain("studio-assets");
    expect(sql).toContain("1572864");
    expect(sql).toContain("storage.objects");
    expect(sql).toContain("(storage.foldername(name))[1] = auth.uid()::text");
    expect(sql).toContain("TO authenticated");
    expect(sql).toContain("FOR SELECT");
    expect(sql).toContain("FOR INSERT");
    expect(sql).toContain("FOR UPDATE");
    expect(sql).toContain("DELETE yok");
    expect(sql).toContain("NEXT_PUBLIC_APP_URL");
    expect(sql).not.toContain("TO anon");
    expect(ops).not.toContain("studio-assets");
    expect(ops).not.toContain("storage.objects");
    expect(opsLib).toContain("EXPECTED_SQL");
    expect(opsLib.match(/20260814\d+_/g)?.length).toBeGreaterThanOrEqual(7);
    expect(prismaSql).toContain("storage_kind");
    expect(prismaSql).toContain("object_path");
    expect(prismaSql).toContain("byte_size");
    expect(prismaSql).toContain("1572864");
    expect(prismaSql).not.toContain("DROP COLUMN");
    expect(ceiling).toContain("2097152");
  });

  it("varsayılan taşıyıcı object-store; tavan ve 413 durur", async () => {
    expect(STUDIO_STORAGE_BACKEND).toBe("object-store");
    expect(STUDIO_STORAGE_BUCKET).toBe("studio-assets");
    expect(STUDIO_IMAGE_DATA_BASE64_MAX_CHARS).toBe(2_097_152);
    expect(STUDIO_IMAGE_DECODED_MAX_BYTES).toBe(1_572_864);

    const closed = createObjectStoreStudioAssetStorage();
    await expect(
      closed.put({
        userId: "11111111-1111-4111-8111-111111111111",
        generationId: "gen_1",
        blob: { mimeType: "image/png", dataBase64: "abc" },
      }),
    ).rejects.toThrow(ServiceUnavailableError);

    const tooLarge = jsonFromUnknown(
      new PayloadTooLargeError("Sınır aşıldığında bakiyeden düşüm yapılmaz. Studio görsel yükü tavanı aşıldı."),
    );
    expect(tooLarge.status).toBe(413);
    const unavailable = jsonFromUnknown(new ServiceUnavailableError("Studio nesne depo bağlı değil."));
    expect(unavailable.status).toBe(503);
  });

  it("Storage CORS yalnız NEXT_PUBLIC_APP_URL origin PUT; joker ve kenar CORS yok", () => {
    const sql = readSrc("supabase/storage/studio-assets.sql");
    const nextConfig = readSrc("next.config.ts");
    const proxy = readSrc("proxy.ts");
    const example = readSrc(".env.example");
    const envTs = readSrc("lib/kernel/env.ts");

    expect(sql).toContain("NEXT_PUBLIC_APP_URL");
    expect(sql).toContain("PUT");
    expect(sql).toContain("GET/HEAD/POST/PATCH/DELETE");
    expect(nextConfig).not.toContain("Access-Control-Allow-Origin");
    expect(proxy).not.toContain("Access-Control-Allow-Origin");
    expect(example).not.toMatch(/^API_CORS_ALLOWED_ORIGINS=/m);
    expect(example).toContain('NEXT_PUBLIC_APP_URL="http://localhost:3000"');
    expect(example).toContain("Methods = PUT");
    expect(example).toContain("ops:storage-cors");
    expect(example).toContain("ops:runtime-readiness");
    expect(envTs).toContain("NEXT_PUBLIC_APP_URL");
  });
});
