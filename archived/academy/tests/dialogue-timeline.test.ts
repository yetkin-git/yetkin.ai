import { describe, expect, it } from "vitest";
import { buildAcademyDialogueTimeline, academyDialogueSpeechRate } from "@/lib/academy/dialogue-timeline";
import { ACADEMY_INSTRUCTOR_SPEECH_RATE } from "@/lib/academy/instructors";
import {
  academyLessonAudioPlaybackSrc,
  academyLessonAudioPublicPath,
} from "@/lib/academy/lesson-audio";
import { ACADEMY_MEDIA_PUBLIC_ROOT } from "@/lib/academy/lesson-media";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";

/** parseDialogueLine: "Eğitmen: …" (markdown kalın değil). */
const SYNTHETIC = `
Eğitmen: Merhaba, bu sentetik bir diyalog satırıdır.

Ece: Devam edelim lütfen.

Eğitmen: Özet: örnek kapanış cümlesi.
`;

describe("akademi diyalog zaman çizelgesi", () => {
  it("konuşma hızı eğitmen için sabit kalır", () => {
    expect(academyDialogueSpeechRate("can", "sample-course")).toBe(ACADEMY_INSTRUCTOR_SPEECH_RATE);
    expect(academyDialogueSpeechRate("ece", "sample-course")).toBe(ACADEMY_INSTRUCTOR_SPEECH_RATE);
    expect(academyDialogueSpeechRate("gozde", "sample-course")).toBe(ACADEMY_INSTRUCTOR_SPEECH_RATE);
  });

  it("sentetik DialogueTurn akışı boş müfredattan bağımsız üretir", () => {
    expect(curriculumForCourseSlug("sample-course")).toEqual([]);
    const timeline = buildAcademyDialogueTimeline(SYNTHETIC, "sample-course");
    expect(timeline.turns.length).toBeGreaterThan(1);
    expect(timeline.turns.every((turn) => turn.text.trim().length > 0)).toBe(true);
  });

  it("ses yolu yardımcısı slug/ders anahtarını basar", () => {
    const publicPath = `${ACADEMY_MEDIA_PUBLIC_ROOT}/audio/sample-course/sample-course-1.mp3`;
    expect(academyLessonAudioPublicPath("sample-course", "sample-course-1")).toBe(publicPath);
    // Mühürsüz sentetik anahtar → ?v= yok
    expect(academyLessonAudioPlaybackSrc("sample-course", "sample-course-1")).toBe(publicPath);
  });
});
