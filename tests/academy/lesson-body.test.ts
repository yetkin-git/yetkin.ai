import { describe, expect, it } from "vitest";
import { ACADEMY_COURSE_SEEDS } from "@/lib/academy/seed";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import {
  ACADEMY_LESSON_ACT_HEADINGS,
  ACADEMY_LESSON_SYNTAX_LEAD,
  academyLessonHasPedagogy,
  academyLessonHasPractice,
  classifyAcademyLessonChunk,
  cleanAcademySpokenTextForTts,
  composeCompactLessonBody,
  composePedagogicalLessonBody,
  composePracticalLessonBody,
  parseAcademyLessonActText,
  spokenAcademyLessonBody,
  spokenAcademyLessonSegment,
} from "@/lib/academy/lesson-body";
import { normalizeAcronyms } from "@/lib/academy/acronym-normalizer";
import { LESSON_PRACTICE } from "@/lib/academy/lesson-practice";
import { ACADEMY_LESSON_LISTEN_MAX_CHARS } from "@/archived/lib/academy-studio/lesson-listen";
import {
  ACADEMY_LESSON_ACT_SPOKEN_BRIDGES,
  spokenAcademyLessonActBridge,
} from "@/archived/lib/academy-studio/mentor-voice";

function expectNoSpokenActBridges(spoken: string) {
  for (const bridges of Object.values(ACADEMY_LESSON_ACT_SPOKEN_BRIDGES)) {
    for (const bridge of bridges) {
      expect(spoken).not.toContain(bridge);
    }
  }
}

describe("uygulamalı ders gövdesi", () => {
  it("parametre, adım ve kod çitini ayırır; TTS kod okumaz", () => {
    const body = composePracticalLessonBody("Tutar kuruş cinsinden yazılır.", {
      params: [{ label: "tutar", value: "kuruş" }],
      steps: ["Satır okunur.", "İkinci bakiye reddedilir."],
      code: { language: "json", source: '{ "amountMinor": 25000 }' },
    });
    expect(classifyAcademyLessonChunk("```params\ntutar | kuruş\n```").kind).toBe("params");
    expect(classifyAcademyLessonChunk("```adim\nSatır okunur.\n```").kind).toBe("steps");
    expect(classifyAcademyLessonChunk("```json\n{}\n```").kind).toBe("code");
    const spoken = spokenAcademyLessonBody(body);
    expect(spoken).toContain("Tutar kuruş cinsinden yazılır.");
    expect(spoken).toContain("tutar: kuruş.");
    expect(spoken).toContain("1. Satır okunur.");
    expect(spoken).not.toContain("Parametreler şöyle duruyor.");
    expect(spoken).not.toContain("Adımlar şöyle ilerliyor.");
    expect(spoken).not.toContain("```");
    expect(spoken).not.toContain("amountMinor");
    expect(academyLessonHasPractice(body)).toBe(true);
  });

  it("Masterclass kompakt gövde 5 perde istemez", () => {
    const body = composeCompactLessonBody(
      "Bu oturumda tek kavramı kapatırsın. İkinci celseye ihtiyaç yoktur.",
    );
    expect(academyLessonHasPedagogy(body)).toBe(false);
    expect(body).toContain("Bu oturumda tek kavramı kapatırsın.");
    expect(body).not.toContain("Isınma / Genel Kültür");
    expect(body).not.toContain(ACADEMY_LESSON_ACT_HEADINGS.giris);
  });

  it("dört bölüm başlığını gövdeye yazar; ekran ile ses birebir, kod okunmaz", () => {
    const body = composePedagogicalLessonBody(
      {
        intro: "Bu derste seninle tutarı çözeceğiz.",
        development: "Gel, kayda bakalım.\n\nVaka: iki ekran sapar.",
        conclusion: "Özetle tek satır durur.\n\nBir sonraki bölümde seni sabitleme bekliyor.",
        exercise: "İsteğe bağlı: 250,00 ₺ fiyatını kuruş tamsayı olarak yaz.",
      },
      {
        params: [{ label: "tutar", value: "kuruş" }],
        steps: ["Satır okunur.", "İkinci bakiye reddedilir."],
        code: { language: "json", source: '{ "amountMinor": 25000 }' },
      },
    );
    expect(academyLessonHasPedagogy(body)).toBe(true);
    expect(parseAcademyLessonActText(body.split("\n\n")[0]!).heading).toBe(ACADEMY_LESSON_ACT_HEADINGS.giris);
    expect(body).toContain(ACADEMY_LESSON_ACT_HEADINGS.syntax);
    expect(body).toContain(ACADEMY_LESSON_SYNTAX_LEAD);
    expect(body).toContain("```alistirma");
    const spoken = spokenAcademyLessonBody(body);
    expectNoSpokenActBridges(spoken);
    expect(spoken).toContain("Bu derste seninle tutarı çözeceğiz.");
    expect(spoken).toContain("tutar: kuruş.");
    expect(spoken).not.toContain("```");
    expect(spoken).not.toContain("amountMinor");
  });

  it("48 yayında derste pratik tohum ve ses tavanı durur", { timeout: 20_000 }, () => {
    const keys = new Set<string>();
    for (const row of ACADEMY_COURSE_SEEDS) {
      for (const lesson of curriculumForCourseSlug(row.slug)) {
        keys.add(lesson.key);
        expect(LESSON_PRACTICE[lesson.key], lesson.key).toBeTruthy();
        expect(academyLessonHasPractice(lesson.body), lesson.key).toBe(true);
        expect(academyLessonHasPedagogy(lesson.body), lesson.key).toBe(true);
        expect(lesson.body.length, lesson.key).toBeLessThanOrEqual(ACADEMY_LESSON_LISTEN_MAX_CHARS);
        const spoken = spokenAcademyLessonBody(lesson.body);
        expect(spoken.length, lesson.key).toBeGreaterThan(40);
        expect(spoken, lesson.key).not.toContain("```");
      }
    }
    expect(keys.size).toBe(48);
    for (const key of keys) {
      expect(LESSON_PRACTICE[key], key).toBeTruthy();
    }
    expect(Object.keys(LESSON_PRACTICE).length).toBe(48);
  });

  it("görsel bölüm başlığı ekranda ve seste aynı durur; köprü cümlesi eklenmez", () => {
    const text = `${ACADEMY_LESSON_ACT_HEADINGS.giris}\nBu derste seninle tutarı çözeceğiz.`;
    const parsed = parseAcademyLessonActText(text);
    expect(parsed.heading).toBe(ACADEMY_LESSON_ACT_HEADINGS.giris);
    expect(parsed.body).toBe("Bu derste seninle tutarı çözeceğiz.");
    const spoken = spokenAcademyLessonSegment({ kind: "text", text });
    expect(spoken.startsWith(ACADEMY_LESSON_ACT_HEADINGS.giris)).toBe(true);
    expect(spoken).toContain("Bu derste seninle tutarı çözeceğiz.");
    expectNoSpokenActBridges(spoken);
    expect(spokenAcademyLessonActBridge("giris", parsed.body)).toBe(
      spokenAcademyLessonActBridge("giris", parsed.body),
    );
    const girisHits = new Set<string>();
    for (let index = 0; index < 80; index += 1) {
      girisHits.add(spokenAcademyLessonActBridge("giris", `tuz-${index}`));
    }
    expect(girisHits.size).toBe(2);
    expect(girisHits.has(ACADEMY_LESSON_ACT_SPOKEN_BRIDGES.giris[0])).toBe(true);
    expect(girisHits.has(ACADEMY_LESSON_ACT_SPOKEN_BRIDGES.giris[1])).toBe(true);
  });
});

describe("TTS metin gümrüğü", () => {
  it("sistem/prompt/sahne talimatlarını konuşulan metinden siler", () => {
    const dirty =
      "Brief net olsun. (Maya yerine Maya Hanım de) [sistem: yavaş oku] Üretim durur.";
    const clean = cleanAcademySpokenTextForTts(dirty);
    expect(clean).toContain("Brief net olsun.");
    expect(clean).toContain("Üretim durur.");
    expect(clean).not.toContain("Maya yerine");
    expect(clean).not.toMatch(/sistem/i);
    expect(clean).not.toContain("yavaş oku");
  });

  it("YZ ve Y.Z. kısaltmalarını Yapay Zekâ olarak genişletir", () => {
    expect(cleanAcademySpokenTextForTts("YZ ile brief yaz.")).toBe("Yapay Zekâ ile brief yaz.");
    expect(cleanAcademySpokenTextForTts("Y.Z. modeli seç.")).toBe("Yapay Zekâ modeli seç.");
    expect(cleanAcademySpokenTextForTts("y.z. ve YZ birlikte")).toBe("Yapay Zekâ ve Yapay Zekâ birlikte");
  });

  it("normalizeAcronyms BEFORE TTS SSOT adıyla aynı açılımı basar", () => {
    expect(normalizeAcronyms("LLM ve RAG")).toBe(
      "Büyük Dil Modeli (LLM) ve Artırılmış Geri Çapraz Sorgulama (RAG)",
    );
    expect(normalizeAcronyms("DDD ve PII")).toBe(
      "Etki Alanı Odaklı Tasarım (Domain-Driven Design) ve Kişisel Gizli Veriler (PII)",
    );
  });

  it("teknik kısaltmaları pedagojik tam açılıma çevirir; parantezli biçimi bozmaz", () => {
    expect(cleanAcademySpokenTextForTts("LLM ile üret.")).toBe(
      "Büyük Dil Modeli (LLM) ile üret.",
    );
    expect(cleanAcademySpokenTextForTts("RAG ve vektör.")).toBe(
      "Artırılmış Geri Çapraz Sorgulama (RAG) ve vektör.",
    );
    expect(cleanAcademySpokenTextForTts("DDD ile modelle.")).toBe(
      "Etki Alanı Odaklı Tasarım (Domain-Driven Design) ile modelle.",
    );
    expect(cleanAcademySpokenTextForTts("PII sızmasın.")).toBe("Kişisel Gizli Veriler (PII) sızmasın.");
    expect(cleanAcademySpokenTextForTts("API kapısı.")).toBe(
      "Uygulama Programlama Arayüzü (API) kapısı.",
    );
    expect(cleanAcademySpokenTextForTts("PDF oku.")).toBe(
      "taşınabilir belge biçimi (PDF) oku.",
    );
    expect(cleanAcademySpokenTextForTts("Indexing ve Query Tuning.")).toBe(
      "dizinleme (Indexing) ve sorgu ayarı (Query Tuning).",
    );
    expect(cleanAcademySpokenTextForTts("dizinleme (Indexing) durur.")).toBe(
      "dizinleme (Indexing) durur.",
    );
    expect(cleanAcademySpokenTextForTts("ACID ve MVCC.")).toBe(
      "Atomiklik-Tutarlılık-İzolasyon-Dayanıklılık (ACID) ve Çok Sürümlü Eşzamanlılık Denetimi (MVCC).",
    );
    expect(cleanAcademySpokenTextForTts("Çok Sürümlü Eşzamanlılık Denetimi (MVCC).")).toBe(
      "Çok Sürümlü Eşzamanlılık Denetimi (MVCC).",
    );
    expect(cleanAcademySpokenTextForTts("ML modeli.")).toBe("Makine Öğrenmesi (ML) modeli.");
    expect(cleanAcademySpokenTextForTts("MLOps defteri.")).toBe(
      "Yapay Zekâ Model Operasyonları (MLOps) defteri.",
    );
    expect(cleanAcademySpokenTextForTts("EXPLAIN ve ER model.")).toBe(
      "sorgu planı dökümü (EXPLAIN) ve Varlık İlişki Modeli (ER) model.",
    );
    expect(cleanAcademySpokenTextForTts("Apache Kafka ve NoSQL.")).toBe(
      "Apache Kafka (dağıtık olay günlüğü) ve Yalnız Yapılandırılmış Sorgu Dili Değil (NoSQL).",
    );
    expect(cleanAcademySpokenTextForTts("SSH ile bağlan.")).toBe(
      "Güvenli Kabuk Protokolü (SSH) ile bağlan.",
    );
    expect(cleanAcademySpokenTextForTts("CI/CD borusu.")).toBe(
      "Sürekli Entegrasyon ve Sürekli Teslimat (CI/CD) borusu.",
    );
    expect(cleanAcademySpokenTextForTts("DTO ve SSOT.")).toBe(
      "Veri Transfer Nesnesi (DTO) ve Tek Gerçek Kaynak (SSOT).",
    );
    expect(cleanAcademySpokenTextForTts("App Store Connect ve Play Store.")).toBe(
      "Apple Uygulama Mağazası Bağlantısı (App Store Connect) ve Google Play Mağazası (Play Store).",
    );
    expect(cleanAcademySpokenTextForTts("Native köprü.")).toBe(
      "yerel platform (Native) köprü.",
    );
    expect(cleanAcademySpokenTextForTts("ISO 27001 kanıtı.")).toBe(
      "Uluslararası Standardizasyon Örgütü iki bin yedi yüz bir (ISO 27001) kanıtı.",
    );
    expect(cleanAcademySpokenTextForTts("DevSecOps kapısı.")).toBe(
      "Geliştirme-Güvenlik-İşletme (DevSecOps) kapısı.",
    );
    expect(cleanAcademySpokenTextForTts("KVKK envanteri.")).toBe(
      "Kişisel Verilerin Korunması Kanunu (KVKK) envanteri.",
    );
    expect(cleanAcademySpokenTextForTts("TCP/IP ve XSS.")).toBe(
      "İletim Kontrol Protokolü / İnternet Protokolü (TCP/IP) ve Siteler Arası Komut Çalıştırma (XSS).",
    );
    expect(cleanAcademySpokenTextForTts("OWASP Top 10 ve CSRF.")).toBe(
      "Açık Web Uygulaması Güvenlik Projesi Top 10 (OWASP Top 10) ve Siteler Arası İstek Sahteciliği (CSRF).",
    );
    expect(cleanAcademySpokenTextForTts("EVM ve dApp.")).toBe(
      "Ethereum Sanal Makinesi (EVM) ve Dağıtık Uygulama (dApp).",
    );
    expect(cleanAcademySpokenTextForTts("DeFi AMM ve CEI.")).toBe(
      "Centralize Olmayan Finans / Merkeziyetsiz Finans (DeFi) Otomatik Piyasa Yapıcı (AMM) ve Kontrol-Etki-Etkileşim (CEI).",
    );
    expect(cleanAcademySpokenTextForTts("ERC-20 ve ERC-721.")).toBe(
      "Ethereum Yorum Talebi yirmi (ERC-20) ve Ethereum Yorum Talebi yedi yüz yirmi bir (ERC-721).",
    );
    expect(cleanAcademySpokenTextForTts("Ethereum Sanal Makinesi (EVM) durur.")).toBe(
      "Ethereum Sanal Makinesi (EVM) durur.",
    );
    expect(cleanAcademySpokenTextForTts("UX ve UI.")).toBe(
      "Kullanıcı Deneyimi (UX) ve Kullanıcı Arayüzü (UI).",
    );
    expect(cleanAcademySpokenTextForTts("WCAG ve HTML.")).toBe(
      "Web İçeriği Erişilebilirlik Kılavuzu (WCAG) ve Hipermetin İşaretleme Dili (HTML).",
    );
    expect(cleanAcademySpokenTextForTts("CSS ve ARIA.")).toBe(
      "Basamaklı Stil Sayfaları (CSS) ve Erişilebilir Zengin İnternet Uygulamaları (ARIA).",
    );
    expect(cleanAcademySpokenTextForTts("SUS ve a11y.")).toBe(
      "Sistem Kullanılabilirlik Ölçeği (SUS) ve erişilebilirlik (a11y).",
    );
    expect(cleanAcademySpokenTextForTts("Design System ve Usability Testing.")).toBe(
      "Tasarım Sistemi (Design System) ve Kullanılabilirlik Testi (Usability Testing).",
    );
    expect(cleanAcademySpokenTextForTts("React ve Tailwind.")).toBe(
      "React (kullanıcı arayüzü kütüphanesi) ve Tailwind (yardımcı sınıf stil çerçevesi).",
    );
    expect(cleanAcademySpokenTextForTts("OKR ve KPI.")).toBe(
      "Hedefler ve Anahtar Sonuçlar (OKR) ve Temel Performans Göstergeleri (KPI).",
    );
    expect(cleanAcademySpokenTextForTts("JIRA ve WIP.")).toBe(
      "JIRA (iş takip panosu) ve Devam Eden İş (WIP).",
    );
    expect(cleanAcademySpokenTextForTts("A/B Testing ve User Story.")).toBe(
      "İkili Karşılaştırma Testi / AB Testi ve Kullanıcı Hikayesi (User Story).",
    );
    expect(cleanAcademySpokenTextForTts("Requirement Gathering durur.")).toBe(
      "Gereksinim Toplama (Requirement Gathering) durur.",
    );
    expect(cleanAcademySpokenTextForTts("JIRA (iş takip panosu) durur.")).toBe(
      "JIRA (iş takip panosu) durur.",
    );
    expect(cleanAcademySpokenTextForTts("Hedefler ve Anahtar Sonuçlar (OKR) durur.")).toBe(
      "Hedefler ve Anahtar Sonuçlar (OKR) durur.",
    );
    expect(cleanAcademySpokenTextForTts("SEO, CPC, CTR ve ROAS.")).toBe(
      "Arama Motoru Optimizasyonu (SEO), Tıklama Başına Maliyet (CPC), Tıklama Oranı (CTR) ve Reklam Harcamasının Geri Dönüşü (ROAS).",
    );
    expect(cleanAcademySpokenTextForTts("CTA, AVD, PDP ve COGS.")).toBe(
      "eyleme çağrı (CTA), ortalama izlenme süresi (AVD), Ürün Detay Sayfası (PDP) ve Satılan Malın Maliyeti (COGS).",
    );
    expect(cleanAcademySpokenTextForTts("Shorts, Reels ve Dropshipping.")).toBe(
      "Kısa Dikey Video (Shorts), Kısa Dikey Video (Reels) ve Doğrudan Sevkiyat / Stoksuz Satış (Dropshipping).",
    );
    expect(cleanAcademySpokenTextForTts("Fulfillment ve Capstone.")).toBe(
      "Sipariş Karşılama ve Depo Operasyonu (Fulfillment) ve Kapanış Çalışması (Capstone).",
    );
    expect(cleanAcademySpokenTextForTts("CPA, CVR ve CAC.")).toBe(
      "Edinme Başına Maliyet (CPA), Dönüşüm Oranı (CVR) ve Müşteri Edinim Maliyeti (CAC).",
    );
    expect(cleanAcademySpokenTextForTts("Meta Ads ve Google Ads.")).toBe(
      "Meta Reklamları (Meta Ads) ve Google Reklamları (Google Ads).",
    );
    expect(cleanAcademySpokenTextForTts("Meta Pixel ve Events Manager.")).toBe(
      "Meta Piksel (Meta Pixel) ve Olay Yöneticisi (Events Manager).",
    );
    expect(cleanAcademySpokenTextForTts("Quality Score ve Core Web Vitals.")).toBe(
      "Kalite Skoru (Quality Score) ve Temel Web Canlılıkları (Core Web Vitals).",
    );
    expect(cleanAcademySpokenTextForTts("Arama Motoru Optimizasyonu (SEO) durur.")).toBe(
      "Arama Motoru Optimizasyonu (SEO) durur.",
    );
    expect(cleanAcademySpokenTextForTts("Kullanıcı Deneyimi (UX) durur.")).toBe(
      "Kullanıcı Deneyimi (UX) durur.",
    );
    expect(cleanAcademySpokenTextForTts("durum yönetimi (State Management) durur.")).toBe(
      "durum yönetimi (State Management) durur.",
    );
    expect(cleanAcademySpokenTextForTts("İletim Kontrol Protokolü / İnternet Protokolü (TCP/IP) durur.")).toBe(
      "İletim Kontrol Protokolü / İnternet Protokolü (TCP/IP) durur.",
    );
    expect(cleanAcademySpokenTextForTts("IAM (Kimlik ve Erişim Yönetimi) durur.")).toBe(
      "IAM (Kimlik ve Erişim Yönetimi) durur.",
    );
    expect(cleanAcademySpokenTextForTts("DAX, ETL ve RLS.")).toBe(
      "Veri Çözümleme İfadeleri (DAX), Veri Dönüştürme ve Yükleme İşlemi (ETL) ve Satır Düzeyi Güvenlik (RLS).",
    );
    expect(cleanAcademySpokenTextForTts("ELT, DWH ve dbt.")).toBe(
      "Ayıkla-Yükle-Dönüştür (ELT), Veri Ambarı (DWH) ve Veri Dönüştürme Aracı (dbt).",
    );
    expect(cleanAcademySpokenTextForTts("Ayıkla-Dönüştür-Yükle (ETL) durur.")).toBe(
      "Ayıkla-Dönüştür-Yükle (ETL) durur.",
    );
    expect(cleanAcademySpokenTextForTts("Power BI ve Power Query.")).toBe(
      "Power BI (İş Zekâsı) ve Power Query (Veri Dönüştürme ve Yükleme İşlemi).",
    );
    expect(cleanAcademySpokenTextForTts("PivotTable ve Pivot.")).toBe(
      "Özet Tablo (PivotTable) ve Özet Tablo (Pivot).",
    );
    expect(cleanAcademySpokenTextForTts("Apps Script ve AppScript.")).toBe(
      "Uygulama Senaryosu (Apps Script) ve Uygulama Senaryosu (Apps Script).",
    );
    expect(cleanAcademySpokenTextForTts("ARRAYFORMULA ve QUERY.")).toBe(
      "dizi formülü (ARRAYFORMULA) ve sorgulama işlevi (QUERY).",
    );
    expect(cleanAcademySpokenTextForTts("NLP, SBI ve EQ.")).toBe(
      "Nöro-Dilsel Programlama (NLP), Durum-Davranış-Etki Geri Bildirimi (SBI) ve Duygusal Zekâ (EQ).",
    );
    expect(cleanAcademySpokenTextForTts("Eisenhower matrisi ve timeboxing.")).toBe(
      "Eisenhower Öncelik Matrisi ve zaman kutusu (timeboxing).",
    );
    expect(cleanAcademySpokenTextForTts("Kişisel OS ve Capstone.")).toBe(
      "Kişisel İşletim Sistemi (OS) ve Kapanış Çalışması (Capstone).",
    );
    expect(cleanAcademySpokenTextForTts("Nöro-Dilsel Programlama (NLP) durur.")).toBe(
      "Nöro-Dilsel Programlama (NLP) durur.",
    );
    expect(cleanAcademySpokenTextForTts("API (Uygulama Programlama Arayüzü) durur.")).toBe(
      "API (Uygulama Programlama Arayüzü) durur.",
    );
    expect(cleanAcademySpokenTextForTts("Büyük Dil Modeli (LLM) zaten açık.")).toBe(
      "Büyük Dil Modeli (LLM) zaten açık.",
    );
    expect(normalizeAcronyms("yonerge.pdf ve PDF oku.")).toBe(
      "yonerge.pdf ve taşınabilir belge biçimi (PDF) oku.",
    );
  });

  it("eski yönerge sarmalayıcısını ses metninden söker; yalnız transcript kalır", () => {
    const leaked =
      "çayını yudumlarken oku. le-le-me yasak.\n\nSESLENDİRİLECEK METİN:\nLLM ile brief yaz.";
    const clean = cleanAcademySpokenTextForTts(leaked);
    expect(clean).toBe("Büyük Dil Modeli (LLM) ile brief yaz.");
    expect(clean).not.toContain("SESLENDİRİLECEK");
    expect(clean).not.toContain("çayını yudumlarken");
    expect(clean).not.toContain("le-le-me");
  });
});
