import { describe, expect, it } from "vitest";
import { resolveAcademyProgressGate } from "@/lib/academy/progress-gate";

/**
 * İlerleme Kapısı (Faz 3, Adım 2).
 * Kural: kayıp değil, kazanılmış mesafe. Sayı uydurulmaz; tamamlanan ders sunucudan gelir,
 * kalan ders müfredat uzunluğundan çıkarılır.
 */
describe("akademi ilerleme kapısı — kazanılmış mesafe", () => {
  const base = {
    courseSlug: "01_office_ai",
    courseTitle: "Ofiste Yapay Zekâ",
    totalLessonCount: 8,
    passScore: 70,
    freeLessonCount: 1,
  };

  it("hiç ders tamamlanmadıysa kapı görünmez — uydurma ilerleme basılmaz", () => {
    const gate = resolveAcademyProgressGate({ ...base, completedLessonKeys: [] });
    expect(gate.visible).toBe(false);
    expect(gate.completedCount).toBe(0);
    expect(gate.percent).toBe(0);
  });

  it("ücretsiz ders bitince kalan ders ve sertifika mesafesini söyler", () => {
    const gate = resolveAcademyProgressGate({
      ...base,
      completedLessonKeys: ["01_office_ai-1"],
    });
    expect(gate.visible).toBe(true);
    expect(gate.completedCount).toBe(1);
    expect(gate.remainingCount).toBe(7);
    expect(gate.lessonsToCertificate).toBe(7);
    expect(gate.percent).toBe(13); // 1/8 = 12,5 → 13
    expect(gate.copy.title).toBe("Bu dersi tamamladın.");
    expect(gate.copy.body).toContain("Ücretsiz açık ders bitti");
    expect(gate.copy.body).toContain("kalan 7 derse");
    expect(gate.copy.cta).toContain("7 ders");
    expect(gate.copy.remainingLabel).toBe("7 ders kaldı");
    expect(gate.copy.progressLabel).toBe("1 / 8 ders tamam");
  });

  it("birden çok ders tamamlandığında çoğul cümle ve doğru yüzde basılır", () => {
    const gate = resolveAcademyProgressGate({
      ...base,
      completedLessonKeys: ["01_office_ai-1", "01_office_ai-k1", "01_office_ai-2"],
    });
    expect(gate.completedCount).toBe(3);
    expect(gate.remainingCount).toBe(5);
    expect(gate.percent).toBe(38); // 3/8 = 37,5 → 38
    expect(gate.copy.title).toBe("3 dersi tamamladın.");
    // Ücretsiz kapı aşıldı: cümle "ücretsiz açık ders bitti" demez, yalın mesafeyi söyler.
    expect(gate.copy.body).not.toContain("Ücretsiz açık ders bitti");
    expect(gate.copy.body).toContain("kalan 5 derse");
  });

  it("müfredat bittiğinde kalan sıfırdır ve kapı kapanır (sertifika mesajı sınavda)", () => {
    const keys = ["1", "k1", "2", "3", "5", "g1", "w1", "6"].map((suffix) => `01_office_ai-${suffix}`);
    const gate = resolveAcademyProgressGate({ ...base, completedLessonKeys: keys });
    expect(gate.completedCount).toBe(8);
    expect(gate.remainingCount).toBe(0);
    expect(gate.percent).toBe(100);
    // Kalan ders yoksa satış kapısı basılmaz: sınav kapısı devralır.
    expect(gate.visible).toBe(false);
    expect(gate.copy.body).toContain("Testi 70+ ile geçince");
  });

  it("tekrarlanan ve boş anahtarlar sayıyı şişirmez", () => {
    const gate = resolveAcademyProgressGate({
      ...base,
      completedLessonKeys: ["01_office_ai-1", "01_office_ai-1", "  ", ""],
    });
    expect(gate.completedCount).toBe(1);
    expect(gate.remainingCount).toBe(7);
  });

  it("müfredat uzunluğu sıfırsa yüzde sıfır kalır; negatif kalan üretilmez", () => {
    const gate = resolveAcademyProgressGate({
      ...base,
      totalLessonCount: 0,
      completedLessonKeys: ["01_office_ai-1"],
    });
    expect(gate.totalCount).toBe(0);
    expect(gate.completedCount).toBe(0);
    expect(gate.remainingCount).toBe(0);
    expect(gate.percent).toBe(0);
    expect(gate.visible).toBe(false);
  });

  it("kapı metni defter jargonu taşımaz (A5 dürüst yüzey)", () => {
    const gate = resolveAcademyProgressGate({
      ...base,
      completedLessonKeys: ["01_office_ai-1"],
    });
    const text = JSON.stringify(gate.copy);
    expect(text).not.toMatch(/SETTLED|amountMinor|debit|escrow|CheckoutPriceLock/i);
  });
});
