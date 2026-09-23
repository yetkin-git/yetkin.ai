import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ACADEMY_OFFICE_AI_W1_COMPARE_AFTER_LABEL,
  ACADEMY_OFFICE_AI_W1_COMPARE_BEFORE_LABEL,
} from "@/lib/academy/lesson-beat-visual";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { loadAcademyCinemaCueSlides } from "@/lib/academy/cinema-cue-catalog";
import { loadAcademyLessonCues } from "@/lib/academy/lesson-cues";
import {
  ACADEMY_SPOKEN_SCRIPT_LESSON_KEYS,
  loadAcademySpokenScriptProse,
} from "@/lib/academy/spoken-scripts";

const ROOT = process.cwd();

const BANNED = [
  /Karar notu insanındır/u,
  /Rapor da imza istemez/u,
  /Sunum Fabrikası/iu,
  /ZAHMETLİ YOL/u,
  /YERİNDE ANALİZ/u,
  /Fark sihir değil/u,
  /iki kader/u,
  /Ataş konuşur/u,
  /Etiket yoksa taslak yalandır/u,
  /Taslak insan onayı olmadan gitmez/u,
] as const;

function read(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

function list(relative: string, suffix: string, prefix?: string): string[] {
  return readdirSync(join(ROOT, relative))
    .filter((name) => name.endsWith(suffix) && (!prefix || name.startsWith(prefix)))
    .map((name) => join(relative, name).replaceAll("\\", "/"));
}

describe("PEDAGOJI.md §A.2 / §E.2 — aforizma ve ajans sloganı yasağı", () => {
  it("anayasa A.2 ve E.2 aforizma / tekerleme yasağını kilitler", () => {
    const pedagogy = read(".system_docs/PEDAGOJI.md");
    expect(pedagogy).toContain("Eğitim dili aforizma, ajans sloganı veya tekerleme olamaz");
    expect(pedagogy).toContain("Karar notu insanındır");
    expect(pedagogy).toContain("Sunum fabrikası");
    expect(pedagogy).toContain(
      "Dil; bir öğretmenin öğrencisine doğrudan, sade ve eylem odaklı anlattığı duru Türkçe olmak zorundadır.",
    );
    expect(pedagogy).toContain("Tek Tek Kopyalama");
    expect(pedagogy).toContain("Tek Dosyayla Analiz");
    const a2 = pedagogy.slice(pedagogy.indexOf("### 2. Günlük Dil"), pedagogy.indexOf("### 3."));
    const e2 = pedagogy.slice(pedagogy.indexOf("### E.2"), pedagogy.indexOf("### E.3"));
    expect(a2).toContain("Aforizma / Ajans Sloganı Yasağı");
    expect(a2).toContain("Stüdyo dili öğrenci yüzeyine girmez");
    expect(e2).toContain("Aforizma / Ajans Sloganı");
  });

  it("konuşma metni, müfredat, cue, timings ve sinema kartı aforizma/slogan taşımaz", () => {
    const surfaces = [
      ...list("lib/academy/spoken-scripts", ".md", "01_office_ai"),
      ...list("lib/academy/curricula/office_ai", ".ts"),
      ...list("lib/academy/lesson-cues", ".json", "01_office_ai"),
      ...list("lib/academy/lesson-audio-timings", ".json", "01_office_ai"),
      ...list("lib/academy/lesson-exams", ".json", "01_office_ai"),
      "lib/academy/cinema-cue-catalog.ts",
      "lib/academy/lesson-beat-visual.ts",
      "lib/academy/word-workspace.ts",
      "components/academy/lesson-word-workspace.tsx",
      "scripts/render-academy-cinema-html.ts",
    ];
    for (const file of surfaces) {
      const source = read(file);
      for (const pattern of BANNED) {
        expect(source, `${file} → ${pattern}`).not.toMatch(pattern);
      }
    }
  });

  it("öğretmen cümlesi ve iş tanımı rozetleri Ders 8 yüzeyinde durur", () => {
    const prose = loadAcademySpokenScriptProse("01_office_ai-w1");
    expect(prose).toContain(
      "Çıkarılan özeti raporunda kullanırsın; son kontrolü ve kararı sen verirsin.",
    );
    expect(ACADEMY_OFFICE_AI_W1_COMPARE_BEFORE_LABEL).toBe("TEK TEK KOPYALAMA");
    expect(ACADEMY_OFFICE_AI_W1_COMPARE_AFTER_LABEL).toBe("TEK DOSYAYLA ANALİZ");
    const cues = loadAcademyLessonCues("01_office_ai-w1");
    expect(cues.map((cue) => cue.text)).toContain("TEK DOSYAYLA ANALİZ");
    expect(cues.map((cue) => cue.text)).not.toContain("YERİNDE ANALİZ");
    const slides = loadAcademyCinemaCueSlides("01_office_ai-w1");
    expect(slides.map((slide) => slide.headline)).toContain("TEK DOSYAYLA ANALİZ");
    expect(read("components/academy/lesson-word-workspace.tsx")).toContain("Tek Tek Kopyalama");
    const lesson3 = curriculumForCourseSlug("01_office_ai").find((row) => row.key === "01_office_ai-3");
    expect(lesson3?.title).toBe("Metinden Slayta: Sunum Hazırlama");
    expect(lesson3?.title).not.toMatch(/Sunum Fabrikası/u);
  });

  it("dokuz mühürlü dersin konuşma metni edebi aforizma taşımaz", () => {
    for (const key of ACADEMY_SPOKEN_SCRIPT_LESSON_KEYS) {
      const prose = loadAcademySpokenScriptProse(key);
      for (const pattern of BANNED) {
        expect(prose, `${key} → ${pattern}`).not.toMatch(pattern);
      }
    }
  });
});
