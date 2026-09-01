import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ACADEMY_SPEECH_ACRONYM_EXPANSIONS } from "@/lib/academy/acronym-normalizer";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import {
  ACADEMY_PEDAGOGY_CULTURAL_ANALOGY_CANON,
  ACADEMY_PEDAGOGY_CULTURAL_ANALOGY_RULES,
  ACADEMY_PEDAGOGY_DOCTRINE_SUMMARY,
  ACADEMY_PEDAGOGY_REFRAME,
} from "@/archived/lib/academy-studio/pedagogy-doctrine";
import { ACADEMY_COURSE_SEEDS } from "@/lib/academy/seed";
import { ACADEMY_GROWTH_SKU_SLUGS } from "@/lib/academy/pilot-sku";
import {
  ACADEMY_LESSON_LISTEN_TTS_INSTRUCTION,
  ACADEMY_TTS_NO_LETTER_SPELLING_RULE,
} from "@/archived/lib/academy-studio/lesson-listen";
import { spokenAcademyLessonBody } from "@/lib/academy/lesson-body";

const ROOT = process.cwd();

const ARTIFICIAL_OPENING =
  /(?:^|[.!?]\s+|\n+)(?:Şey|Eeee|Bakın(?:\s+burası\s+ilginç)?|Yani|Aslında|Iııı)(?:\.{3}|…)/u;
const ARTIFICIAL_FILLER_SENTENCES = [
  "Şey gibi düşün bunu",
  "Ne demek istediğimi anladın değil mi?",
  "Buna dikkat ettin mi hiç?",
] as const;

describe("kültürel analoji ve yerel benzetme doktrini", () => {
  it("Super Admin pencere kenarı kanonunu mühürler; katalog SKU bağlayıcıdır", { timeout: 20_000 }, () => {
    expect(ACADEMY_PEDAGOGY_CULTURAL_ANALOGY_RULES).toHaveLength(3);
    expect(ACADEMY_PEDAGOGY_CULTURAL_ANALOGY_RULES[0]).toMatch(/Türk kültüründe/u);
    expect(ACADEMY_PEDAGOGY_CULTURAL_ANALOGY_RULES[1]).toMatch(/pencere kenarı/u);
    expect(ACADEMY_PEDAGOGY_CULTURAL_ANALOGY_RULES[2]).toMatch(/katalog SKU/u);
    expect(ACADEMY_PEDAGOGY_CULTURAL_ANALOGY_CANON).toBe(
      "Bize yan yana iki bilet ver ama ikisi de pencere kenarı olsun",
    );
    expect(ACADEMY_PEDAGOGY_DOCTRINE_SUMMARY).toMatch(/kültürel|yerel analoji/u);
    expect(ACADEMY_PEDAGOGY_DOCTRINE_SUMMARY).toMatch(/pencere kenarı/u);
    expect(ACADEMY_PEDAGOGY_REFRAME).toContain("Bunu günlük hayattan bir örnekle ele alırsak...");

    const doctrine = readFileSync(join(ROOT, "archived", "lib", "academy-studio", "pedagogy-doctrine.ts"), "utf8");
    expect(doctrine).toContain("KÜLTÜREL ANALOJİ VE YEREL BENZETME");
    expect(doctrine).toContain("pencere kenarı");

    expect(existsSync(join(ROOT, ".system_docs", "PEDAGOJI.md"))).toBe(true);

    expect(ACADEMY_LESSON_LISTEN_TTS_INSTRUCTION).toMatch(/kültürel analoji/u);
    expect(ACADEMY_LESSON_LISTEN_TTS_INSTRUCTION).toContain(ACADEMY_TTS_NO_LETTER_SPELLING_RULE);
    expect(ACADEMY_TTS_NO_LETTER_SPELLING_RULE).toMatch(/le-le-me/u);
    expect(ACADEMY_TTS_NO_LETTER_SPELLING_RULE).toMatch(/el-el-em/u);
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.LLM).toBe("Büyük Dil Modeli (LLM)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.ReAct).toBe("Akıl Yürüt ve Eyleme Geç (ReAct)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.RAG).toBe(
      "Artırılmış Geri Çapraz Sorgulama (RAG)",
    );
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.LangGraph).toBe(
      "grafik ajan çizelgesi (LangGraph)",
    );
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.StateGraph).toBe("Durum Grafiği (StateGraph)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.FastAPI).toBe(
      "Hızlı Uygulama Programlama Arayüzü (FastAPI)",
    );
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.Guardrails).toBe(
      "Güvenlik korkuluğu (Guardrails)",
    );
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.HITL).toBe("İnsan Döngüde (HITL)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.VectorDB).toBe("vektör veritabanı (VectorDB)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.DDD).toBe(
      "Etki Alanı Odaklı Tasarım (Domain-Driven Design)",
    );
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.PII).toBe("Kişisel Gizli Veriler (PII)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.API).toBe("Uygulama Programlama Arayüzü (API)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.SQL).toBe("Yapılandırılmış Sorgu Dili (SQL)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.ACID).toBe(
      "Atomiklik-Tutarlılık-İzolasyon-Dayanıklılık (ACID)",
    );
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.MVCC).toBe(
      "Çok Sürümlü Eşzamanlılık Denetimi (MVCC)",
    );
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.NoSQL).toBe(
      "Yalnız Yapılandırılmış Sorgu Dili Değil (NoSQL)",
    );
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.HTTP).toBe("Hipermetin Aktarım Protokolü (HTTP)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.JSON).toBe("JavaScript Nesne Gösterimi (JSON)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.CSV).toBe("Virgülle Ayrılmış Değerler (CSV)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.REST).toBe("Temsili Durum Transferi (REST)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.PDF).toBe("taşınabilir belge biçimi (PDF)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.OWASP).toBe(
      "Açık Web Uygulaması Güvenlik Projesi (OWASP)",
    );
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.XSS).toBe(
      "Siteler Arası Komut Çalıştırma (XSS)",
    );
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.CSRF).toBe(
      "Siteler Arası İstek Sahteciliği (CSRF)",
    );
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.SSH).toBe("Güvenli Kabuk Protokolü (SSH)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.IAM).toBe("Kimlik ve Erişim Yönetimi (IAM)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.AWS).toBe("Amazon Web Servisleri (AWS)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.VPC).toBe("Sanallaştırılmış Özel Ağ (VPC)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.EC2).toBe("Esnek Bilgi İşlem Bulutu (EC2)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.S3).toBe("Basit Depolama Servisi (S3)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.KVKK).toBe(
      "Kişisel Verilerin Korunması Kanunu (KVKK)",
    );
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.CI).toBe("Sürekli Entegrasyon (CI)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.OTA).toBe("Havadan Güncelleme (OTA)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.DTO).toBe("Veri Transfer Nesnesi (DTO)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.SSOT).toBe("Tek Gerçek Kaynak (SSOT)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.EVM).toBe("Ethereum Sanal Makinesi (EVM)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.dApp).toBe("Dağıtık Uygulama (dApp)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.DeFi).toBe(
      "Centralize Olmayan Finans / Merkeziyetsiz Finans (DeFi)",
    );
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.AMM).toBe("Otomatik Piyasa Yapıcı (AMM)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.CEI).toBe("Kontrol-Etki-Etkileşim (CEI)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.NFT).toBe("değiştirilemez jeton (NFT)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.UX).toBe("Kullanıcı Deneyimi (UX)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.UI).toBe("Kullanıcı Arayüzü (UI)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.WCAG).toBe(
      "Web İçeriği Erişilebilirlik Kılavuzu (WCAG)",
    );
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.HTML).toBe("Hipermetin İşaretleme Dili (HTML)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.JSX).toBe("JavaScript XML (JSX)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.CSS).toBe("Basamaklı Stil Sayfaları (CSS)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.DOM).toBe("Belge Nesne Modeli (DOM)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.ARIA).toBe(
      "Erişilebilir Zengin İnternet Uygulamaları (ARIA)",
    );
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.SUS).toBe("Sistem Kullanılabilirlik Ölçeği (SUS)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.SEO).toBe("Arama Motoru Optimizasyonu (SEO)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.ROAS).toBe(
      "Reklam Harcamasının Geri Dönüşü (ROAS)",
    );
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.CPC).toBe("Tıklama Başına Maliyet (CPC)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.CTR).toBe("Tıklama Oranı (CTR)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.CPA).toBe("Edinme Başına Maliyet (CPA)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.CVR).toBe("Dönüşüm Oranı (CVR)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.CAC).toBe("Müşteri Edinim Maliyeti (CAC)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.SERP).toBe(
      "Arama Motoru Sonuç Sayfası (SERP)",
    );
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.IAP).toBe("Uygulama İçi Satın Alma (IAP)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.FPS).toBe("Saniye Başına Kare Sayısı (FPS)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.SDK).toBe("Yazılım Geliştirme Kiti (SDK)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.RAM).toBe("Rastgele Erişim Belleği (RAM)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.GIL).toBe("Küresel Yorumlayıcı Kilidi (GIL)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.RPS).toBe("Saniye Başına İstek Sayısı (RPS)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.CAP).toBe(
      "Tutarlılık-Erişilebilirlik-Bölünme Toleransı (CAP)",
    );
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.p95).toBe("yüzde doksan beş (p95)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.p99).toBe("yüzde doksan dokuz (p99)");
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.RSC).toBe(
      "React Sunucu Bileşenleri (RSC)",
    );
    expect(ACADEMY_SPEECH_ACRONYM_EXPANSIONS.Redis).toBe(
      "bellek içi sözlük (Redis)",
    );

    const gateway = readFileSync(join(ROOT, "lib", "kernel", "ai", "llm-gateway.ts"), "utf8");
    expect(gateway).toContain("VOICE_TTS_NO_LETTER_SPELLING_RULE");
    expect(gateway).toContain("sealVoiceTtsPedagogyPrompt");
    expect(gateway).toContain(ACADEMY_TTS_NO_LETTER_SPELLING_RULE);
    // Pedagoji mührü text'e değil instruction kanalına basılır.
    expect(gateway).toContain("sealVoiceTtsPedagogyPrompt(input.instruction)");
    expect(gateway).not.toContain("sealVoiceTtsPedagogyPrompt(trimmed)");

    const generateSpeechRoute = readFileSync(
      join(ROOT, "app", "api", "academy", "generateSpeech", "route.ts"),
      "utf8",
    );
    expect(generateSpeechRoute).toContain("ACADEMY_STUDIO_GONE");
    expect(generateSpeechRoute).toContain("410");
    expect(generateSpeechRoute).not.toContain("loadAcademyLessonListenAudio");

    const python1 = curriculumForCourseSlug("python-temel")[0]!;
    expect(python1.body).toContain("kargo");
    expect(python1.body).toMatch(/Koray:/);
    expect(python1.body).toMatch(/Maya:/);

    expect(ACADEMY_COURSE_SEEDS.map((row) => row.slug)).toEqual([...ACADEMY_GROWTH_SKU_SLUGS]);
    for (const row of ACADEMY_COURSE_SEEDS) {
      const lessons = curriculumForCourseSlug(row.slug);
      const bodies = lessons.map((lesson) => lesson.body).join("\n");
      if (row.slug === "python-temel") {
        expect(bodies, row.slug).toContain("kargo");
        expect(bodies, row.slug).toMatch(/Koray:/);
      } else if (row.slug === "python-orta") {
        expect(bodies, row.slug).toContain("fırın");
        expect(bodies, row.slug).toMatch(/Koray:/);
        expect(bodies, row.slug).toMatch(/Maya:/);
      } else if (row.slug === "python-ileri") {
        expect(bodies, row.slug).toContain("gişe");
        expect(bodies, row.slug).toMatch(/Koray:/);
        expect(bodies, row.slug).toMatch(/Maya:/);
      } else if (row.slug === "ai-agent-temel") {
        expect(bodies, row.slug).toContain("klavye");
        expect(bodies, row.slug).toMatch(/Koray:/);
        expect(bodies, row.slug).toMatch(/Maya:/);
      } else if (row.slug === "ai-agent-orta") {
        expect(bodies, row.slug).toContain("kütüphaneci");
        expect(bodies, row.slug).toMatch(/Koray:/);
        expect(bodies, row.slug).toMatch(/Maya:/);
      } else if (row.slug === "ai-agent-ileri") {
        expect(bodies, row.slug).toContain("makas");
        expect(bodies, row.slug).toMatch(/Koray:/);
        expect(bodies, row.slug).toMatch(/Maya:/);
      } else if (row.slug === "fullstack-temel") {
        expect(bodies, row.slug).toContain("bina");
        expect(bodies, row.slug).toMatch(/Koray:/);
        expect(bodies, row.slug).toMatch(/Maya:/);
      } else if (row.slug === "fullstack-orta") {
        expect(bodies, row.slug).toContain("şantiye");
        expect(bodies, row.slug).toMatch(/Koray:/);
        expect(bodies, row.slug).toMatch(/Maya:/);
      } else if (row.slug === "fullstack-ileri") {
        expect(bodies, row.slug).toContain("fabrika");
        expect(bodies, row.slug).toMatch(/Koray:/);
        expect(bodies, row.slug).toMatch(/Maya:/);
      } else if (row.slug === "security-temel") {
        expect(bodies, row.slug).toContain("kale");
        expect(bodies, row.slug).toMatch(/Can:/);
        expect(bodies, row.slug).toMatch(/Ece:/);
      } else if (row.slug === "security-orta") {
        expect(bodies, row.slug).toContain("müfettiş");
        expect(bodies, row.slug).toMatch(/Can:/);
        expect(bodies, row.slug).toMatch(/Ece:/);
      } else if (row.slug === "security-ileri") {
        expect(bodies, row.slug).toContain("damga");
        expect(bodies, row.slug).toMatch(/Can:/);
        expect(bodies, row.slug).toMatch(/Ece:/);
      } else if (row.slug === "excel-masterclass") {
        expect(bodies, row.slug).toContain("defter");
        expect(bodies, row.slug).toMatch(/Tarık:/);
        expect(bodies, row.slug).toMatch(/Gözde:/);
      } else if (row.slug === "google-ads-masterclass") {
        expect(bodies, row.slug).toContain("tabela");
        expect(bodies, row.slug).toMatch(/Tarık:/);
        expect(bodies, row.slug).toMatch(/Gözde:/);
      } else if (row.slug === "meta-ads-masterclass") {
        expect(bodies, row.slug).toContain("vitrin");
        expect(bodies, row.slug).toMatch(/Tarık:/);
        expect(bodies, row.slug).toMatch(/Gözde:/);
      } else if (row.slug === "eticaret-masterclass") {
        expect(bodies, row.slug).toContain("tezgâh");
        expect(bodies, row.slug).toMatch(/Tarık:/);
        expect(bodies, row.slug).toMatch(/Gözde:/);
      } else if (row.slug === "canva-masterclass") {
        expect(bodies, row.slug).toContain("kalıp");
        expect(bodies, row.slug).toMatch(/Tarık:/);
        expect(bodies, row.slug).toMatch(/Gözde:/);
      } else if (row.slug === "linkedin-masterclass") {
        expect(bodies, row.slug).toContain("kartvizit");
        expect(bodies, row.slug).toMatch(/Tarık:/);
        expect(bodies, row.slug).toMatch(/Gözde:/);
      } else {
        expect(bodies, row.slug).toContain("Bunu günlük hayattan bir örnekle ele alırsak...");
      }
      for (const lesson of lessons) {
        const spoken = spokenAcademyLessonBody(lesson.body);
        expect(lesson.body, `${lesson.key}:visual`).not.toMatch(ARTIFICIAL_OPENING);
        expect(spoken, `${lesson.key}:spoken`).not.toMatch(ARTIFICIAL_OPENING);
        for (const filler of ARTIFICIAL_FILLER_SENTENCES) {
          expect(lesson.body, `${lesson.key}:visual:${filler}`).not.toContain(filler);
          expect(spoken, `${lesson.key}:spoken:${filler}`).not.toContain(filler);
        }
      }
    }
    expect(bodiesFor("python-temel")).toContain("kargo");
  });
});

function bodiesFor(slug: string): string {
  return curriculumForCourseSlug(slug)
    .map((lesson) => lesson.body)
    .join("\n");
}
