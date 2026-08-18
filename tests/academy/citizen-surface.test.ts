import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { PRICE_LOCK_GRACE_MINUTES, PRICE_LOCK_GRACE_MS } from "@/lib/kernel/pricing/price-lock";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

const SIZ_LEAKS = [
  "Bakiyeniz",
  "cüzdanınız",
  "hesabınız",
  "Hesabınızda",
  "seçin",
  "onaylayın",
  "ödeyin",
  "yanıtlayın",
  "Geçtiniz",
  "yapın",
  "kullanabilirsiniz",
];

const SEN_SURFACES = [
  "app/academy/page.tsx",
  "app/academy/[slug]/page.tsx",
  "app/academy/certificates/page.tsx",
  "app/academy/dogrula/[hash]/page.tsx",
  "app/academy/[slug]/oyna/page.tsx",
  "app/(kernel)/cuzdan/page.tsx",
  "components/academy/exam-panel.tsx",
  "components/academy/curriculum-player.tsx",
  "components/academy/purchase-button.tsx",
  "components/academy/certificate-list.tsx",
  "components/academy/certificate-seal.tsx",
  "components/academy/settlement-steps.tsx",
  "lib/copy/sen-voice/academy.ts",
  "lib/copy/sen-voice/cuzdan.ts",
];

describe("akademi vatandaş yüzeyi ve SEN aksı", () => {
  it("oda loading.tsx iskeleti izomorftur (CLS)", () => {
    const files = [
      "app/academy/loading.tsx",
      "app/academy/[slug]/loading.tsx",
      "app/academy/certificates/loading.tsx",
      "app/academy/dogrula/[hash]/loading.tsx",
      "app/academy/[slug]/oyna/loading.tsx",
      "components/academy/academy-room-skeleton.tsx",
    ];
    for (const file of files) {
      expect(existsSync(join(ROOT, file)), file).toBe(true);
    }
    const skeleton = readSrc("components/academy/academy-room-skeleton.tsx");
    expect(skeleton).toContain("animate-pulse");
    expect(skeleton).toContain("variant");
    expect(skeleton).not.toContain("use client");
    expect(readSrc("app/academy/loading.tsx")).toContain("AcademyRoomSkeleton");
    expect(readSrc("app/academy/loading.tsx")).not.toContain("use client");
  });

  it("/academy ve /cuzdan siz kaçakları taşımaz; SEN_VOICE bağlar", () => {
    expect(SEN_VOICE.cuzdan.closedLoopBody).toContain("Bakiye hesapta güvende");
    expect(SEN_VOICE.cuzdan.closedLoopBody).not.toContain("Bakiyeniz");
    expect(SEN_VOICE.academy.catalog.description).toContain("Kursu seç");
    expect(SEN_VOICE.academy.exam.unanswered).toBe("Tüm soruları yanıtla.");
    expect(PRICE_LOCK_GRACE_MINUTES).toBe(15);
    expect(PRICE_LOCK_GRACE_MS).toBe(PRICE_LOCK_GRACE_MINUTES * 60 * 1000);

    for (const file of SEN_SURFACES) {
      const source = readSrc(file);
      for (const leak of SIZ_LEAKS) {
        expect(source, `${file} → ${leak}`).not.toContain(leak);
      }
    }
    expect(readSrc("app/academy/page.tsx")).toContain("SEN_VOICE");
    expect(readSrc("app/(kernel)/cuzdan/page.tsx")).toContain("SEN_VOICE");
    expect(readSrc("app/academy/[slug]/page.tsx")).toContain("PurchaseButton");
    expect(readSrc("app/academy/[slug]/page.tsx")).toContain("SettlementSteps");
    expect(readSrc("app/academy/[slug]/page.tsx")).toContain("ExamPanel");
    expect(readSrc("app/academy/[slug]/page.tsx")).toContain("/oyna");
    expect(readSrc("app/academy/[slug]/oyna/page.tsx")).toContain("requirePageSession");
    expect(readSrc("app/academy/[slug]/oyna/page.tsx")).toContain("CurriculumPlayer");
    expect(readSrc("app/academy/[slug]/oyna/page.tsx")).not.toContain("yetkin.ai");
    expect(readSrc("components/academy/curriculum-player.tsx")).toContain("aria-live");
    expect(readSrc("app/academy/dogrula/[hash]/page.tsx")).toContain("loadPublicCertificateByHash");
    expect(readSrc("components/academy/purchase-button.tsx")).toContain("aria-live");
    expect(readSrc("components/academy/purchase-button.tsx")).toContain("QuickTopUpModal");
    expect(readSrc("components/academy/exam-panel.tsx")).toContain("aria-live");
    expect(readSrc("components/academy/exam-panel.tsx")).toContain("examPassed");
  });

  it("doğrulama sayfası SHA256 mühür detayını kimlik sızdırmadan basar", () => {
    const page = readSrc("app/academy/dogrula/[hash]/page.tsx");
    expect(page).toContain("hashedFields");
    expect(page).toContain("curriculumSeal");
    expect(page).toContain("sealStatus");
    expect(page).toContain("copy.algorithm");
    expect(readSrc("lib/copy/sen-voice/academy.ts")).toContain('algorithm: "SHA256"');
    expect(page).not.toContain("userId");
    expect(page).not.toContain("view.userId");
    expect(readSrc("lib/academy/certificate-verify.ts")).toContain("userId / attemptId / purchaseId sızmaz");
    expect(readSrc("lib/academy/exam.ts")).toContain("yetkin-rail.academy.certificate.v2");
    expect(readSrc("lib/academy/exam.ts")).toContain("curriculumSeal");
    expect(readSrc("components/academy/certificate-list.tsx")).toContain("/academy/dogrula/");
  });
});
