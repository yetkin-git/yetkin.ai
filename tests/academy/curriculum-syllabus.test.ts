import { describe, expect, it } from "vitest";
import { curriculumSyllabusForCourseSlug } from "@/lib/academy/curriculum-syllabus";
import {
  academyLessonContentKind,
  academyLessonDurationMin,
  academyLessonKindLabel,
  academyMediaDurationMin,
  academyProgressPercent,
} from "@/lib/academy/lesson-meta";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";

describe("akademi müfredat özeti — modül, tür, süre", () => {
  it("yüzdeyi 0–100 aralığında basar", () => {
    expect(academyProgressPercent(0, 12)).toBe(0);
    expect(academyProgressPercent(6, 12)).toBe(50);
    expect(academyProgressPercent(12, 12)).toBe(100);
    expect(academyProgressPercent(3, 0)).toBe(0);
  });

  it("mikro-video varsa Video, diyalog/WAV varsa Ses, yoksa Doküman", () => {
    expect(academyLessonContentKind({ microVideos: [{ durationSec: 6 }] })).toBe("video");
    expect(academyLessonContentKind({ microVideos: [] })).toBe("document");
    expect(
      academyLessonContentKind({
        key: "ai-agent-temel-1",
        courseSlug: "ai-agent-temel",
        microVideos: [{ durationSec: 7 }],
      }),
    ).toBe("audio");
    expect(
      academyLessonContentKind({
        body: "Eğitmen: Araç yoksa durursun.\n\nEğitmen: Fail-closed kapısı uydurmaz.",
        microVideos: [{ durationSec: 6 }],
      }),
    ).toBe("audio");
  });

  it("ses süresi WAV veya konuşma saatinden dakikaya iner; 5 dk taban basmaz", () => {
    expect(
      academyLessonDurationMin({
        key: "ai-agent-temel-1",
        courseSlug: "ai-agent-temel",
        body: "Eğitmen: Kısa tur.",
        microVideos: [{ durationSec: 7 }],
      }),
    ).toBe(2);
    expect(
      academyMediaDurationMin(140),
    ).toBe(2);
    expect(academyMediaDurationMin(0)).toBe(0);
    const minutes = academyLessonDurationMin({
      body: Array.from({ length: 320 }, () => "kelime").join(" "),
      microVideos: [{ durationSec: 8 }],
    });
    expect(minutes).toBeGreaterThanOrEqual(4);
    expect(minutes).toBeLessThanOrEqual(25);
  });

  it("ai-agent-temel 2 modül / 6 ders ve AI Agent raf başlığı üretir", () => {
    const syllabus = curriculumSyllabusForCourseSlug("ai-agent-temel");
    expect(syllabus.lessonCount).toBe(6);
    expect(syllabus.modules).toHaveLength(2);
    expect(syllabus.modules[0]?.title).toBe("Ajan, tarif ve araç");
    expect(syllabus.modules[1]?.title).toBe("Hafıza, ReAct ve kapanış ajanı");
    expect(syllabus.modules[0]?.lessons).toHaveLength(4);
    expect(syllabus.durationMin).toBeGreaterThan(0);
    expect(syllabus.lessons.every((lesson) => lesson.kind === "audio")).toBe(true);
    expect(syllabus.lessons.every((lesson) => lesson.durationMin >= 1)).toBe(true);
    expect(ACADEMY_SEN.outline.kindAudio).toBe("Ses");
    expect(academyLessonKindLabel("audio", ACADEMY_SEN.outline)).toBe("Ses");
    expect(academyLessonKindLabel("video", ACADEMY_SEN.outline)).toBe("Video");
  });

  it("ai-agent-orta 2 modül / 6 ders ve RAG raf başlığı üretir", () => {
    const syllabus = curriculumSyllabusForCourseSlug("ai-agent-orta");
    expect(syllabus.lessonCount).toBe(6);
    expect(syllabus.modules).toHaveLength(2);
    expect(syllabus.modules[0]?.title).toBe("RAG, gömme ve vektör sorgu");
    expect(syllabus.modules[1]?.title).toBe("Çoklu ajan, durum, onay ve kapanış");
    expect(syllabus.modules[0]?.lessons).toHaveLength(4);
    expect(syllabus.durationMin).toBeGreaterThan(0);
  });

  it("ai-agent-ileri 2 modül / 6 ders ve İleri raf başlığı üretir", () => {
    const syllabus = curriculumSyllabusForCourseSlug("ai-agent-ileri");
    expect(syllabus.lessonCount).toBe(6);
    expect(syllabus.modules).toHaveLength(2);
    expect(syllabus.modules[0]?.title).toBe("Graf, onarım, korkuluk ve eval");
    expect(syllabus.modules[1]?.title).toBe("Üretim kuyruğu ve kapanış odası");
    expect(syllabus.modules[0]?.lessons).toHaveLength(4);
    expect(syllabus.durationMin).toBeGreaterThan(0);
  });

  it("python-temel 2 modül / 6 ders ve süre üretir", () => {
    const syllabus = curriculumSyllabusForCourseSlug("python-temel");
    expect(syllabus.lessonCount).toBe(6);
    expect(syllabus.modules).toHaveLength(2);
    expect(syllabus.modules[0]?.title).toBe("Değişken, tip ve karar");
    expect(syllabus.modules[0]?.lessons).toHaveLength(4);
    expect(syllabus.durationMin).toBeGreaterThan(0);
    expect(syllabus.lessons.every((lesson) => lesson.kind === "audio")).toBe(true);
    expect(syllabus.lessons.every((lesson) => lesson.durationMin >= 1)).toBe(true);
  });

  it("python-orta 2 modül / 6 ders ve Orta etiketi üretir", () => {
    const syllabus = curriculumSyllabusForCourseSlug("python-orta");
    expect(syllabus.lessonCount).toBe(6);
    expect(syllabus.modules).toHaveLength(2);
    expect(syllabus.modules[0]?.title).toBe("Sınıf, miras ve kapsül");
    expect(syllabus.modules[0]?.lessons).toHaveLength(4);
    expect(syllabus.durationMin).toBeGreaterThan(0);
  });

  it("python-ileri 2 modül / 6 ders ve İleri etiketi üretir", () => {
    const syllabus = curriculumSyllabusForCourseSlug("python-ileri");
    expect(syllabus.lessonCount).toBe(6);
    expect(syllabus.modules).toHaveLength(2);
    expect(syllabus.modules[0]?.title).toBe("Decorator, üreteç ve asenkron çekirdek");
    expect(syllabus.modules[0]?.lessons).toHaveLength(4);
    expect(syllabus.durationMin).toBeGreaterThan(0);
  });

  it("fullstack-temel 2 modül / 6 ders ve Web raf başlığı üretir", () => {
    const syllabus = curriculumSyllabusForCourseSlug("fullstack-temel");
    expect(syllabus.lessonCount).toBe(6);
    expect(syllabus.modules).toHaveLength(2);
    expect(syllabus.modules[0]?.title).toBe("HTTP, semantik iskelet, JavaScript ve fetch");
    expect(syllabus.modules[1]?.title).toBe("TypeScript sözleşmesi ve kapanış projesi");
    expect(syllabus.modules[0]?.lessons).toHaveLength(4);
    expect(syllabus.durationMin).toBeGreaterThan(0);
  });

  it("fullstack-orta 2 modül / 6 ders ve Orta raf başlığı üretir", () => {
    const syllabus = curriculumSyllabusForCourseSlug("fullstack-orta");
    expect(syllabus.lessonCount).toBe(6);
    expect(syllabus.modules).toHaveLength(2);
    expect(syllabus.modules[0]?.title).toBe("React bileşen, durum, Express ve Prisma");
    expect(syllabus.modules[1]?.title).toBe("JWT kimlik ve görev takip kapanışı");
    expect(syllabus.modules[0]?.lessons).toHaveLength(4);
    expect(syllabus.durationMin).toBeGreaterThan(0);
  });

  it("fullstack-ileri 2 modül / 6 ders ve İleri raf başlığı üretir", () => {
    const syllabus = curriculumSyllabusForCourseSlug("fullstack-ileri");
    expect(syllabus.lessonCount).toBe(6);
    expect(syllabus.modules).toHaveLength(2);
    expect(syllabus.modules[0]?.title).toBe("App Router, RSC, mikroservis ve Redis");
    expect(syllabus.modules[1]?.title).toBe("Docker, CI/CD ve kapanış servisi");
    expect(syllabus.modules[0]?.lessons).toHaveLength(4);
    expect(syllabus.durationMin).toBeGreaterThan(0);
  });

  it("security-temel 2 modül / 6 ders ve Siber Güvenlik raf başlığı üretir", () => {
    const syllabus = curriculumSyllabusForCourseSlug("security-temel");
    expect(syllabus.lessonCount).toBe(6);
    expect(syllabus.modules).toHaveLength(2);
    expect(syllabus.modules[0]?.title).toBe("CIA üçlüsü, ağ kapısı, OWASP ve kimlik");
    expect(syllabus.modules[1]?.title).toBe("Güvenlik duvarı, etik ve kapatma projesi");
    expect(syllabus.modules[0]?.lessons).toHaveLength(4);
    expect(syllabus.durationMin).toBeGreaterThan(0);
  });

  it("security-orta 2 modül / 6 ders ve Orta raf başlığı üretir", () => {
    const syllabus = curriculumSyllabusForCourseSlug("security-orta");
    expect(syllabus.lessonCount).toBe(6);
    expect(syllabus.modules).toHaveLength(2);
    expect(syllabus.modules[0]?.title).toBe("Keşif, lab ağ envanteri, IDOR ve SSRF");
    expect(syllabus.modules[1]?.title).toBe("OAuth2/JWT, SAST ve kapatma projesi");
    expect(syllabus.modules[0]?.lessons).toHaveLength(4);
    expect(syllabus.durationMin).toBeGreaterThan(0);
  });

  it("security-ileri 2 modül / 6 ders ve İleri raf başlığı üretir", () => {
    const syllabus = curriculumSyllabusForCourseSlug("security-ileri");
    expect(syllabus.lessonCount).toBe(6);
    expect(syllabus.modules).toHaveLength(2);
    expect(syllabus.modules[0]?.title).toBe("DevSecOps, IAM/KMS, olay müdahalesi ve SIEM");
    expect(syllabus.modules[1]?.title).toBe("Sıfır Güven ve kapatma senaryosu");
    expect(syllabus.modules[0]?.lessons).toHaveLength(4);
    expect(syllabus.durationMin).toBeGreaterThan(0);
  });

  it("excel-masterclass 2 modül / 6 ders ve Tekil Masterclass raf başlığı üretir", () => {
    const syllabus = curriculumSyllabusForCourseSlug("excel-masterclass");
    expect(syllabus.lessonCount).toBe(6);
    expect(syllabus.modules).toHaveLength(2);
    expect(syllabus.modules[0]?.title).toBe("Hücre, arama, özet ve temizlik");
    expect(syllabus.modules[1]?.title).toBe("Otomasyon ve satış dashboard kapanışı");
    expect(syllabus.modules[0]?.lessons).toHaveLength(4);
    expect(syllabus.durationMin).toBeGreaterThan(0);
  });

  it("google-ads-masterclass 2 modül / 6 ders ve Tekil Masterclass raf başlığı üretir", () => {
    const syllabus = curriculumSyllabusForCourseSlug("google-ads-masterclass");
    expect(syllabus.lessonCount).toBe(6);
    expect(syllabus.modules).toHaveLength(2);
    expect(syllabus.modules[0]?.title).toBe("Hesap, eşleme, ağ ve GTM dönüşüm");
    expect(syllabus.modules[1]?.title).toBe("Kalite puanı ve kampanya kapanışı");
    expect(syllabus.modules[0]?.lessons).toHaveLength(4);
    expect(syllabus.durationMin).toBeGreaterThan(0);
  });

  it("meta-ads-masterclass 2 modül / 6 ders ve Tekil Masterclass raf başlığı üretir", () => {
    const syllabus = curriculumSyllabusForCourseSlug("meta-ads-masterclass");
    expect(syllabus.lessonCount).toBe(6);
    expect(syllabus.modules).toHaveLength(2);
    expect(syllabus.modules[0]?.title).toBe("Suite, kitle, format ve piksel/CAPI");
    expect(syllabus.modules[1]?.title).toBe("CBO/ABO, ROAS ve huni kapanışı");
    expect(syllabus.modules[0]?.lessons).toHaveLength(4);
    expect(syllabus.durationMin).toBeGreaterThan(0);
  });

  it("eticaret-masterclass 2 modül / 6 ders ve Tekil Masterclass raf başlığı üretir", () => {
    const syllabus = curriculumSyllabusForCourseSlug("eticaret-masterclass");
    expect(syllabus.lessonCount).toBe(6);
    expect(syllabus.modules).toHaveLength(2);
    expect(syllabus.modules[0]?.title).toBe("Tezgâh, mağaza, liste ve stok senkronu");
    expect(syllabus.modules[1]?.title).toBe("Kargo/iade ve vitrin kapanışı");
    expect(syllabus.modules[0]?.lessons).toHaveLength(4);
    expect(syllabus.durationMin).toBeGreaterThan(0);
  });

  it("canva-masterclass 2 modül / 6 ders ve Tekil Masterclass raf başlığı üretir", () => {
    const syllabus = curriculumSyllabusForCourseSlug("canva-masterclass");
    expect(syllabus.lessonCount).toBe(6);
    expect(syllabus.modules).toHaveLength(2);
    expect(syllabus.modules[0]?.title).toBe("Kalıp, kare, kâğıt ve Magic disiplini");
    expect(syllabus.modules[1]?.title).toBe("Teslim formatı ve paket kapanışı");
    expect(syllabus.modules[0]?.lessons).toHaveLength(4);
    expect(syllabus.durationMin).toBeGreaterThan(0);
  });

  it("linkedin-masterclass 2 modül / 6 ders ve Tekil Masterclass raf başlığı üretir", () => {
    const syllabus = curriculumSyllabusForCourseSlug("linkedin-masterclass");
    expect(syllabus.lessonCount).toBe(6);
    expect(syllabus.modules).toHaveLength(2);
    expect(syllabus.modules[0]?.title).toBe("Profil, içerik, ICP ve outreach");
    expect(syllabus.modules[1]?.title).toBe("Konumlandırma ve pipeline kapanışı");
    expect(syllabus.modules[0]?.lessons).toHaveLength(4);
    expect(syllabus.durationMin).toBeGreaterThan(0);
  });
});
