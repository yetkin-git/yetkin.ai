import { describe, expect, it } from "vitest";
import { ACADEMY_MODERATOR, ACADEMY_INSTRUCTORS_BY_VOICE } from "@/lib/academy/instructors";
import {
  ACADEMY_ANNOUNCER_PLAYBACK_RATE,
  ACADEMY_LESSON_LISTEN_PLAYBACK_RATE,
  ACADEMY_MODERATOR_PLAYBACK_RATE,
  academyAnnouncerLessonCue,
  academyInstructorCourtesyHandoff,
  academyLessonListenSpeechSlices,
  academyListenPlaybackRateForSpeaker,
  ensureAcademyInstructorCourtesyTurns,
  insertAcademyLessonTitleAfterCourtesy,
} from "@/archived/lib/academy-studio/lesson-listen";

describe("dersi dinle nezaket ve tempo mühürü", () => {
  it("moderatör sonrası eğitmen teşekkür/selam taşır; başlık nezaketten sonra gelir", () => {
    const courtesy = academyInstructorCourtesyHandoff(ACADEMY_MODERATOR.name);
    expect(courtesy).toContain(`Teşekkürler ${ACADEMY_MODERATOR.name}`);
    expect(courtesy).toContain("herkese merhaba");

    const ensured = ensureAcademyInstructorCourtesyTurns([
      { speaker: "moderator", text: "Mikrofonu devrediyorum..." },
      { speaker: "instructor", text: "Hak belirsizken kare basılmaz." },
    ]);
    expect(ensured[1]!.text.startsWith(courtesy)).toBe(true);
    expect(ensured[1]!.text).toContain("Hak belirsizken kare basılmaz.");

    const titled = insertAcademyLessonTitleAfterCourtesy(courtesy, "Tam Türkçe Tarif");
    expect(titled.indexOf("Teşekkürler")).toBe(0);
    expect(titled.indexOf("Tam Türkçe Tarif")).toBeGreaterThan(titled.indexOf("..."));
  });

  it("hazır nezaket varsa ikinci kez enjekte etmez", () => {
    const handback =
      "Teşekkürler Koray, herkese merhaba. Sağ ol, hoş bulduk. Masayı kurduk, doğrudan sahaya iniyoruz...";
    const ensured = ensureAcademyInstructorCourtesyTurns([
      { speaker: "moderator", text: "Mikrofonu kendisine bırakıyorum..." },
      { speaker: "instructor", text: `${handback} Sahada devam.` },
    ]);
    expect(ensured[1]!.text.startsWith("Teşekkürler Koray")).toBe(true);
    expect(ensured[1]!.text.match(/Teşekkürler Koray/gu)?.length).toBe(1);
  });

  it("senaryo dilimleri anons → moderatör → nezaketli eğitmen sırası taşır", () => {
    const instructor = ACADEMY_INSTRUCTORS_BY_VOICE.Zephyr;
    const body = [
      "Merhaba, yetkin.ai Akademi stüdyosundan selam. Bu yayın senin için. Bugün sahadaki başlığımız: Deneme. Yanımızda alanında uzman Deniz Bey. Mikrofonu kendisine bırakıyorum...",
      "Doğrudan üçüncü paragraf içeriği burada.",
    ].join(" ");
    const slices = academyLessonListenSpeechSlices("Deneme Dersi", body, instructor);
    expect(slices[0]!.speaker).toBe("announcer");
    expect(slices[0]!.text).toContain("Yetkin Akademi.");
    expect(slices[0]!.text).toContain("Deneme Dersi");
    const withCode = academyLessonListenSpeechSlices(
      "Kurulum ve ilk program",
      body,
      instructor,
      "sample-course",
    );
    expect(withCode[0]!.text).toBe(
      academyAnnouncerLessonCue("Kurulum ve ilk program", "sample-course"),
    );
    expect(withCode[0]!.text).toContain("Kurulum ve ilk program");
    // Boş katalogda bölüm kodu yoktur; anons yalnız başlık taşır.
    expect(academyAnnouncerLessonCue("Örnek Ders 1", "sample-course")).toBe(
      "Yetkin Akademi. Örnek Ders 1. Başlıyoruz.",
    );
    expect(academyAnnouncerLessonCue("Bilinmeyen ders", "flutter-temel")).toBe(
      "Yetkin Akademi. Bilinmeyen ders. Başlıyoruz.",
    );
    expect(slices.some((slice) => slice.speaker === "moderator")).toBe(true);
    const firstInstructor = slices.find((slice) => slice.speaker === "instructor");
    expect(firstInstructor).toBeTruthy();
    expect(firstInstructor!.text).toContain("Teşekkürler Koray");
    expect(firstInstructor!.text).toContain("herkese merhaba");
    expect(firstInstructor!.prompt).toBe(firstInstructor!.text);
    // NO META IN AUDIO: yönerge / anayasa ses metninde yok.
    expect(firstInstructor!.text).not.toContain("SESLENDİRİLECEK METİN");
    expect(firstInstructor!.text).not.toContain("le-le-me");
    expect(firstInstructor!.text).not.toContain("çayını yudumlarken");
    expect(firstInstructor!.instruction).toContain("çayını yudumlarken");
    expect(firstInstructor!.instruction).toContain("le-le-me");
  });

  it("rol temposu: moderatör 1, eğitmen 0.94, anons 0.96", () => {
    expect(ACADEMY_MODERATOR_PLAYBACK_RATE).toBe(1);
    expect(ACADEMY_LESSON_LISTEN_PLAYBACK_RATE).toBe(0.94);
    expect(ACADEMY_ANNOUNCER_PLAYBACK_RATE).toBe(0.96);
    expect(academyListenPlaybackRateForSpeaker("moderator")).toBe(1);
    expect(academyListenPlaybackRateForSpeaker("instructor")).toBe(0.94);
    expect(academyListenPlaybackRateForSpeaker("announcer")).toBe(0.96);
  });
});
