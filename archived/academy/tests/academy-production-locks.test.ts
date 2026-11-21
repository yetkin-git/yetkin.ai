import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readDoc(file: string): string {
  return readFileSync(join(ROOT, ".system_docs", file), "utf8");
}

describe("akademi üretim kilitleri", () => {
  it("stüdyo rejimi AKADEMI_URETIM_ANAYASASI.md evindedir", () => {
    const studio = readDoc("AKADEMI_URETIM_ANAYASASI.md");
    expect(studio).toContain("## Akademi TTS bağları");
    expect(studio).toContain("## B. GOOGLE AI STUDIO FABRİKASI VE ROL DAĞILIMI");
    expect(studio).toContain("lib/academy/production-standard.ts");
    expect(studio).toContain("ACADEMY_EXAM_PASS_SCORE");
    expect(studio).toContain("5 medya katmanı");
    expect(studio).toContain("assertAcademyProductionSeal");
    expect(studio).toContain("01_office_ai");
    expect(studio).toContain("1 Eğitim Kodu = 1 Ses");
    expect(studio).toContain("MUSIC_GEN");
    expect(studio).toContain("IMAGE_GEN");
    expect(studio).toContain("Veo 3.1 Lite");
    expect(studio).toContain("SIRA SENDE");
    expect(studio).toContain("`SIRA SİZDE` bu rozette durmaz");
    expect(studio).toContain("ACADEMY_SEALED_MEDIA_MODEL");
    expect(studio).toContain("ACADEMY_SEALED_MEDIA_MODEL.VOICE_TTS");
    expect(studio).toContain("yerel `-warmup.mp4`");
    expect(studio).toContain("ACADEMY_BED_BREATH_DB");
    expect(studio).toContain("lib/academy/lesson-bed-duck.ts");
    expect(studio).toContain("Jenerik logo plakası opsiyoneldir");
    expect(studio).toContain("1-2-3 iş özeti");
    expect(studio).toContain("**Altın Şablon görsel reji**");
    expect(studio).toContain("Ken Burns");
    expect(studio).toContain("### E.3 İşitsel Reji ve Outro Crescendo");
    expect(studio).toContain("### E.4 Bütçe Korumalı B-roll Mimarisi");
    expect(studio).toContain("Isınma / İş Problemi");
    expect(studio).toContain("Birinci Senaryo / Temel Yöntem");
    expect(studio).toContain("İkinci Senaryo / İstisna");
    expect(studio).toContain("Özet & Saha Görevi");
    expect(studio).toContain("İzleme anında harici üretici API çağrılmaz.");
    expect(studio).toContain("Temel");
    expect(studio).toContain("Orta");
    expect(studio).toContain("İleri");
    expect(studio).toContain("kadın veya erkek");
    expect(studio).toContain("Spoiler Yasağı");
    expect(studio).toContain("Ders adedi Pedagoji kotası değildir");
    expect(studio).toContain("TTS bütçe tavanı");
    expect(studio).toContain("bu paragraf o sayıları ikinci kez yazmaz");
    expect(studio).toContain("Masaüstü gerçek dışı vaat etmez");
    expect(studio).toContain("ÖNCE (DÜZENLEMESİZ)");
    expect(studio).toContain("SONRA (AI İLE)");
    expect(studio).toContain("Düzensiz Tablo");
    expect(studio).toContain("Çok Yakında / Hazırlanıyor");
    expect(studio).toContain(
      "Otomatik Veo 3.1 API video üretimi maliyet sızıntısı yarattığı için iptal edilmiştir.",
    );
    expect(studio).toContain("model-roles.ts");
    expect(studio).not.toContain("1 Maç = 1 Hakem");
    expect(studio).not.toContain("Video katmanı terk edilmiştir");
  });

  it("Anayasa B katmanı üretim ilkesini tutar; A katmanı gevşemez", () => {
    const constitution = readDoc("ANAYASA.md");
    expect(constitution).toContain("1 Eğitim Kodu = 1 Ses");
    expect(constitution).not.toContain("1 Maç = 1 Hakem");
    expect(constitution).not.toContain("1 Maç = MAX 100 Düdük");
    expect(constitution).not.toContain("FIFA Kokartlı Hakem");
    expect(constitution).not.toContain("1 Maç = En az 6 yarı");
    expect(constitution).not.toContain("1 Yarı = En az 5 dakika");
    expect(constitution).toContain("Gemini 2.5 ve alt modeller yasaktır");
    expect(constitution).toContain("5 medya katmanı zorunluluğu");
    expect(constitution).toContain("ACADEMY_SEALED_MEDIA_MODEL.VOICE_TTS");
    expect(constitution).not.toContain("Gemini 3.8 Flash TTS");
    expect(constitution).not.toContain("gemini-3.8-flash-tts");
    expect(constitution).not.toContain("atempo=0.93");
    expect(constitution).not.toContain("-22 dB");
    expect(constitution).toContain("academyCatalogPurchasable");
    expect(constitution).toContain("academyCourseProductionDiskSealed");
    expect(constitution).toContain("beş katmanın tamamı teyit edilmeden `--seal` basılamaz");
    expect(constitution).not.toContain("dört katmanlı eğitim videosudur");
    expect(constitution).not.toContain("eksikleri satışı tek başına kapatmaz");
    expect(constitution).toContain("ACADEMY_AI_LESSON_DURATION_MIN_MINUTES");
    expect(constitution).not.toContain("üst dakika veya üst ders tavanı yoktur");
    expect(constitution).toContain("ACADEMY_MATCH_WHISTLE_MAX");
    expect(constitution).toContain("lib/academy/tts-breath-chunks.ts");
    expect(constitution).not.toContain("kurs başına 100 istek");
    expect(constitution).not.toContain("10–12");
    expect(constitution).not.toContain("Yayın = makale + mühürlü karaoke");
    expect(constitution).toContain("sayılar ve müfredat koddadır");
    expect(constitution).toContain(
      "Süre bantları üretim standardıdır; müfredatın hakkını kesmek için gerekçe gösterilemez.",
    );
    expect(constitution).not.toContain("Mühürlü ders sayısı depo gerçeğidir: **5**");
    expect(constitution).not.toContain("PEDAGOJI.md` §F");
    expect(constitution).toContain("lib/academy/pilot-sku.ts");
    expect(constitution).toContain("lib/academy/curricula/lesson-index.ts");
    expect(constitution).not.toContain("docs/ops/DURUM.md");
    expect(constitution).not.toContain("docs/ops/akademi-bake-elkitabi.md");
    expect(constitution).toContain("Pragmatik Monolit + İnce Sözleşme Paketi + Tek Native İstemci");
    expect(constitution).toContain(
      "Otomatik Veo 3.1 API video üretimi maliyet sızıntısı yarattığı için iptal edilmiştir.",
    );
    expect(constitution).toContain("lib/academy/production-standard.ts");
    expect(constitution).toContain("A4 kanıt adresi canlıda 301 iner");
    expect(constitution).toContain("/vize/[hash]");
    expect(constitution).toContain("Rota açıktır; sol menü izin listesine bağlıdır.");
  });
});
