import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { STUDIO_SEN, studioGenerateCitizenError } from "@/archived/lib/copy/sen-voice/studio";
import { VERTICAL_ROOMS } from "@/lib/kernel/modules";
import { PayloadTooLargeError } from "@/lib/kernel/http/errors";
import { jsonFromUnknown } from "@/lib/kernel/http/json";
import { assertStudioImagePayloadCeiling, STUDIO_IMAGE_DATA_BASE64_MAX_CHARS } from "@/lib/studio/storage";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

const SIZ_LEAKS = [
  "bakiyeniz",
  "cüzdanınız",
  "taslağınız",
  "çıktınız",
  "talebinizi",
  "üretin",
  "yazın",
  "indirin",
  "seçin",
  "yapın",
  "düşülür",
];

const SEN_SURFACES = [
  "archived/app/studio/page.tsx",
  "archived/app/studio/loading.tsx",
  "archived/components/studio/generate-panel.tsx",
  "archived/components/studio/image-generate-panel.tsx",
  "archived/components/studio/token-balance.tsx",
  "archived/components/studio/media-draft-cards.tsx",
  "archived/components/studio/draft-history.tsx",
  "archived/components/studio/studio-workbench.tsx",
  "archived/components/studio/llm-debit-steps.tsx",
  "archived/lib/copy/sen-voice/studio.ts",
  "lib/kernel/modules.ts",
];

describe("Studio vatandaş yüzeyi, LLM Debit mührü ve SEN aksı", () => {
  it("oda loading.tsx iskeleti izomorftur (CLS)", () => {
    const files = ["archived/app/studio/loading.tsx", "archived/components/studio/studio-room-skeleton.tsx"];
    for (const file of files) {
      expect(existsSync(join(ROOT, file)), file).toBe(true);
    }
    const skeleton = readSrc("archived/components/studio/studio-room-skeleton.tsx");
    expect(skeleton).toContain("animate-pulse");
    expect(skeleton).toContain("variant");
    expect(skeleton).not.toContain("use client");
    expect(readSrc("archived/app/studio/loading.tsx")).toContain("StudioRoomSkeleton");
    expect(readSrc("archived/app/studio/loading.tsx")).not.toContain("use client");
  });

  it("/studio yüzeyleri siz kaçakları taşımaz; SEN_VOICE ve LLM Debit bağlar", () => {
    expect(STUDIO_SEN.catalog.description).toContain("bakiyeden transfer (LLM Debit)");
    expect(STUDIO_SEN.generate.debitHint).toBe("jeton bakiyeden düşer");
    expect(STUDIO_SEN.generate.download).toBe("Çıktıyı indir");
    expect(STUDIO_SEN.generate.ceiling).toBe("Sınır aşıldığında bakiyeden düşüm yapılmaz.");
    expect(STUDIO_SEN.drafts.liveSummary).toContain("jeton bakiyeden düşer");
    expect(STUDIO_SEN.wallet.preCheckUnbound).toContain("Üretim öncesi bakiye kontrol");

    expect(VERTICAL_ROOMS.find((room) => room.id === "studio")).toBeUndefined();

    for (const file of SEN_SURFACES) {
      const source = readSrc(file);
      for (const leak of SIZ_LEAKS) {
        expect(source, `${file} → ${leak}`).not.toContain(leak);
      }
    }
    expect(readSrc("archived/app/studio/page.tsx")).toContain("SEN_VOICE");
    expect(readSrc("archived/app/studio/page.tsx")).toContain("LlmDebitSteps");
    expect(readSrc("archived/app/studio/page.tsx")).toContain("StudioDebitProvider");
    expect(readSrc("archived/app/studio/page.tsx")).toContain("loadStudioCitizenDesk");
    expect(readSrc("archived/components/studio/generate-panel.tsx")).toContain("aria-live");
    expect(readSrc("archived/components/studio/generate-panel.tsx")).toContain("QuickTopUpModal");
    expect(readSrc("archived/components/studio/image-generate-panel.tsx")).toContain("aria-live");
    expect(readSrc("archived/components/studio/image-generate-panel.tsx")).toContain("generate.download");
    expect(readSrc("archived/components/studio/token-balance.tsx")).toContain("remaining");
    expect(readSrc("archived/lib/studio/engine.ts")).toContain("remainingMinor");
    expect(readSrc("archived/lib/studio/image-engine.ts")).toContain("remainingMinor");
    expect(readSrc("archived/app/api/studio/generate/route.ts")).toContain("remainingMinor");
    expect(readSrc("archived/app/api/studio/images/route.ts")).toContain("remainingMinor");
  });

  it("LLM Debit basamakları debit ≠ artifact ≠ tavan (413) dürüst yansır", async () => {
    const steps = STUDIO_SEN.debit.steps;
    expect(steps[0]?.label).toBe("Üretim anında bakiyeden transfer (LLM Debit)");
    expect(steps[1]?.label).toBe("Üretim kaydı (Artifact)");
    expect(steps[1]?.detail).toContain("kişisel kasada saklanır");
    expect(steps[2]?.label).toContain("413");
    expect(steps[2]?.detail).toContain("Sınır aşıldığında bakiyeden düşüm yapılmaz");

    expect(studioGenerateCitizenError(413)).toBe(STUDIO_SEN.generate.ceiling);
    expect(studioGenerateCitizenError(400, "Yetersiz bakiye.")).toBe(STUDIO_SEN.generate.insufficient);
    expect(studioGenerateCitizenError(400, "Studio görsel fiyatı katalogda yok.")).toBe(
      STUDIO_SEN.generate.catalogMissing,
    );
    expect(STUDIO_SEN.generate.catalogMissing).toContain("katalogda henüz yok");
    expect(studioGenerateCitizenError(400, STUDIO_SEN.generate.catalogMissing)).toBe(
      STUDIO_SEN.generate.catalogMissing,
    );

    const catalogFail = jsonFromUnknown(new Error(STUDIO_SEN.generate.catalogMissing), 400);
    expect(catalogFail.status).toBe(400);
    expect((await catalogFail.json()) as { ok: boolean; error: string }).toEqual({
      ok: false,
      error: STUDIO_SEN.generate.catalogMissing,
    });

    expect(() =>
      assertStudioImagePayloadCeiling("A".repeat(STUDIO_IMAGE_DATA_BASE64_MAX_CHARS + 1)),
    ).toThrow(PayloadTooLargeError);
    try {
      assertStudioImagePayloadCeiling("A".repeat(STUDIO_IMAGE_DATA_BASE64_MAX_CHARS + 1));
    } catch (error) {
      const response = jsonFromUnknown(error);
      expect(response.status).toBe(413);
    }
    expect(readSrc("archived/lib/studio/storage.ts")).toContain("Sınır aşıldığında bakiyeden düşüm yapılmaz");
  });
});
