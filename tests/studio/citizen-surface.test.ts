import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { VERTICAL_ROOMS } from "@/lib/kernel/modules";
import { studioGenerateCitizenError } from "@/lib/copy/sen-voice/studio";
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
  "app/studio/page.tsx",
  "app/studio/loading.tsx",
  "components/studio/generate-panel.tsx",
  "components/studio/image-generate-panel.tsx",
  "components/studio/token-balance.tsx",
  "components/studio/media-draft-cards.tsx",
  "components/studio/draft-history.tsx",
  "components/studio/studio-workbench.tsx",
  "components/studio/llm-debit-steps.tsx",
  "lib/copy/sen-voice/studio.ts",
  "lib/kernel/modules.ts",
];

describe("Studio vatandaş yüzeyi, LLM Debit mührü ve SEN aksı", () => {
  it("oda loading.tsx iskeleti izomorftur (CLS)", () => {
    const files = ["app/studio/loading.tsx", "components/studio/studio-room-skeleton.tsx"];
    for (const file of files) {
      expect(existsSync(join(ROOT, file)), file).toBe(true);
    }
    const skeleton = readSrc("components/studio/studio-room-skeleton.tsx");
    expect(skeleton).toContain("animate-pulse");
    expect(skeleton).toContain("variant");
    expect(skeleton).not.toContain("use client");
    expect(readSrc("app/studio/loading.tsx")).toContain("StudioRoomSkeleton");
    expect(readSrc("app/studio/loading.tsx")).not.toContain("use client");
  });

  it("/studio yüzeyleri siz kaçakları taşımaz; SEN_VOICE ve LLM Debit bağlar", () => {
    expect(SEN_VOICE.studio.catalog.description).toContain("bakiyeden transfer (LLM Debit)");
    expect(SEN_VOICE.studio.generate.debitHint).toBe("jeton bakiyeden düşer");
    expect(SEN_VOICE.studio.generate.download).toBe("Çıktıyı indir");
    expect(SEN_VOICE.studio.generate.ceiling).toBe("Sınır aşıldığında bakiyeden düşüm yapılmaz.");
    expect(SEN_VOICE.studio.drafts.liveSummary).toContain("jeton bakiyeden düşer");
    expect(SEN_VOICE.studio.wallet.preCheckUnbound).toContain("Üretim öncesi bakiye kontrol");

    const studio = VERTICAL_ROOMS.find((room) => room.id === "studio");
    expect(studio?.blurb).toContain("LLM Debit");
    expect(studio?.blurb).not.toContain("bakiyenizden");

    for (const file of SEN_SURFACES) {
      const source = readSrc(file);
      for (const leak of SIZ_LEAKS) {
        expect(source, `${file} → ${leak}`).not.toContain(leak);
      }
    }
    expect(readSrc("app/studio/page.tsx")).toContain("SEN_VOICE");
    expect(readSrc("app/studio/page.tsx")).toContain("LlmDebitSteps");
    expect(readSrc("app/studio/page.tsx")).toContain("StudioDebitProvider");
    expect(readSrc("app/studio/page.tsx")).toContain("loadStudioCitizenDesk");
    expect(readSrc("components/studio/generate-panel.tsx")).toContain("aria-live");
    expect(readSrc("components/studio/generate-panel.tsx")).toContain("QuickTopUpModal");
    expect(readSrc("components/studio/image-generate-panel.tsx")).toContain("aria-live");
    expect(readSrc("components/studio/image-generate-panel.tsx")).toContain("generate.download");
    expect(readSrc("components/studio/token-balance.tsx")).toContain("remaining");
    expect(readSrc("lib/studio/engine.ts")).toContain("remainingMinor");
    expect(readSrc("lib/studio/image-engine.ts")).toContain("remainingMinor");
    expect(readSrc("app/api/studio/generate/route.ts")).toContain("remainingMinor");
    expect(readSrc("app/api/studio/images/route.ts")).toContain("remainingMinor");
  });

  it("LLM Debit basamakları debit ≠ artifact ≠ tavan (413) dürüst yansır", async () => {
    const steps = SEN_VOICE.studio.debit.steps;
    expect(steps[0]?.label).toBe("Üretim anında bakiyeden transfer (LLM Debit)");
    expect(steps[1]?.label).toBe("Üretim kaydı (Artifact)");
    expect(steps[1]?.detail).toContain("kişisel kasada saklanır");
    expect(steps[2]?.label).toContain("413");
    expect(steps[2]?.detail).toContain("Sınır aşıldığında bakiyeden düşüm yapılmaz");

    expect(studioGenerateCitizenError(413)).toBe(SEN_VOICE.studio.generate.ceiling);
    expect(studioGenerateCitizenError(400, "Yetersiz bakiye.")).toBe(SEN_VOICE.studio.generate.insufficient);
    expect(studioGenerateCitizenError(400, "Studio görsel fiyatı katalogda yok.")).toBe(
      SEN_VOICE.studio.generate.catalogMissing,
    );
    expect(SEN_VOICE.studio.generate.catalogMissing).toContain("katalogda henüz yok");
    expect(studioGenerateCitizenError(400, SEN_VOICE.studio.generate.catalogMissing)).toBe(
      SEN_VOICE.studio.generate.catalogMissing,
    );

    const catalogFail = jsonFromUnknown(new Error(SEN_VOICE.studio.generate.catalogMissing), 400);
    expect(catalogFail.status).toBe(400);
    expect((await catalogFail.json()) as { ok: boolean; error: string }).toEqual({
      ok: false,
      error: SEN_VOICE.studio.generate.catalogMissing,
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
    expect(readSrc("lib/studio/storage.ts")).toContain("Sınır aşıldığında bakiyeden düşüm yapılmaz");
  });
});
