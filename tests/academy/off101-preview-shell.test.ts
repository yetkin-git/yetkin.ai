import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ACADEMY_OFFICE_AI_1_COPILOT_PROMPT } from "@/lib/academy/lesson-beat-visual";
import {
  academyFreePreviewPlayerPath,
  academyFreePreviewWarmupMp4,
} from "@/lib/academy/free-preview-shell";
import { officeAiStarterPackFiles, officeAiStarterPackZip } from "@/lib/academy/workfile-pack";
import { isAcademyFreePreviewPlayerPath } from "@/lib/kernel/security/edge-guard";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("OFF-101 ücretsiz vitrin kabuğu", () => {
  it("ilk ders oynatıcısı oturumsuzdur ve yerel MP4 posterin üstüne biner", () => {
    const playerPath = academyFreePreviewPlayerPath("01_office_ai");
    expect(playerPath).toBe("/academy/01_office_ai/oyna");
    expect(isAcademyFreePreviewPlayerPath(playerPath)).toBe(true);
    expect(academyFreePreviewWarmupMp4("01_office_ai")).toMatch(/01_office_ai-1-warmup\.mp4/);

    const page = readSrc("app/academy/[slug]/page.tsx");
    const stage = readSrc("components/academy/free-preview-stage.tsx");
    expect(page).toContain("FreePreviewStage");
    expect(page).toContain("academyFreePreviewWarmupMp4");
    expect(page).toContain("CourseDeliverables");
    expect(stage).toContain("<video");
    expect(stage).toContain("poster={poster ?? undefined}");
    expect(stage).not.toContain("<img");
    expect(ACADEMY_SEN.course.deliverablesTitle).toBe(
      "Eğitim Sonunda Elde Edeceğiniz Somut Çıktılar",
    );
    expect(ACADEMY_SEN.catalog.description).not.toMatch(/Video/i);
  });

  it("oturumsuz indirme kayıt penceresini açar; paket ilk ders zip’idir", () => {
    const player = readSrc("components/academy/curriculum-player.tsx");
    const button = readSrc("components/academy/workfile-download.tsx");
    const oyna = readSrc("app/academy/[slug]/oyna/page.tsx");
    expect(player).toContain("data-academy-workfile-slot");
    expect(player).toContain("viewerSignedIn");
    expect(oyna).toContain("workfileLoginHref");
    expect(oyna).toContain("requirePageSession");
    expect(button).toContain("data-academy-lead-capture");
    expect(button).toContain("if (!signedIn)");
    expect(ACADEMY_SEN.course.workfileCta).toBe("İndirilebilir Çalışma Dosyaları (.zip)");

    const files = officeAiStarterPackFiles();
    expect(files.map((file) => file.name)).toEqual([
      "excel-a1-kontrol.txt",
      "ilk-ders-istem.txt",
    ]);
    expect(files[1]?.body.trim()).toBe(ACADEMY_OFFICE_AI_1_COPILOT_PROMPT);
    const zip = officeAiStarterPackZip();
    expect(zip[0]).toBe(0x50);
    expect(zip[1]).toBe(0x4b);
    const text = new TextDecoder().decode(zip);
    expect(text).toContain("excel-a1-kontrol.txt");
    expect(text).toContain(ACADEMY_OFFICE_AI_1_COPILOT_PROMPT);
  });
});
