import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ACADEMY_COURSE_SEEDS } from "@/lib/academy/seed";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { buildAcademyDialogueTimeline } from "@/lib/academy/dialogue-timeline";
import {
  ACADEMY_FIVE_ACT_HEADINGS,
  academyLessonHasFiveActPedagogy,
  academyLessonHasPedagogy,
  expandAcademySpokenAbbreviations,
  spokenAcademyLessonBody,
} from "@/lib/academy/lesson-body";
import {
  ACADEMY_COURSE_LEVELS,
  ACADEMY_COURSE_LEVEL_BY_SLUG,
  academyCourseLevelBySlug,
  isAcademyCourseLevel,
} from "@/lib/academy/course-level";
import { ACADEMY_LESSON_LISTEN_MAX_CHARS } from "@/archived/lib/academy-studio/lesson-listen";
import { ACADEMY_TERM } from "@/archived/lib/academy-studio/term-glossary";
import {
  ACADEMY_INSTRUCTORS_BY_VOICE,
  ACADEMY_INSTRUCTOR_TTS_VOICES,
  ACADEMY_INSTRUCTOR_HANDBACK_LEAD,
  ACADEMY_ANNOUNCER,
  ACADEMY_CAST_REGISTRY,
  ACADEMY_MODERATOR,
  ACADEMY_MODERATOR_CLOSE_TAIL,
  ACADEMY_MODERATOR_OPEN_LEAD,
  ACADEMY_TTS_VOICES,
  academyInstructorBySlug,
  academyModeratorForSlug,
  ACADEMY_INSTRUCTOR_ASK_REPLY,
  academyInstructorHonorific,
  academyInstructorDativeHonorific,
  ACADEMY_SECURITY_MODERATOR,
  ACADEMY_DIGITAL_SKILLS_MODERATOR,
} from "@/lib/academy/instructors";
import {
  academyModeratorAskForSlug,
  academyModeratorParamsAskForSlug,
  academyModeratorVakaAskForSlug,
  academyModeratorRecapForLesson,
} from "@/archived/lib/academy-studio/studio-cast";
import { ACADEMY_COMPASS_ANCHOR } from "@/archived/lib/academy-studio/field-voice";
import {
  ACADEMY_MODERATOR_SUMMARY_LEAD,
  ACADEMY_MODERATOR_SUMMARY_RECAP,
} from "@/archived/lib/academy-studio/mentor-voice";
import {
  ACADEMY_GROWTH_SKU_SLUGS,
  ACADEMY_PILOT_SKU_LESSON_COUNT,
  ACADEMY_PILOT_SKU_SLUG,
} from "@/lib/academy/pilot-sku";

const ROOT = process.cwd();
const CURRICULA_DIR = join(ROOT, "lib", "academy", "curricula");
const PILOT = ACADEMY_PILOT_SKU_SLUG;

const MOCK_PHRASES = [
  "Tutar nasıl tutulur",
  "Tek nakit defter",
  "CheckoutPriceLock on beş",
  "Fiyat kısa süre sabit kalır",
  "amountMinor",
];

const OPERATING_ROOM = /dilek cümlesi|kilitli paket|negatif kısıt|spec ihlali/iu;
const MECHANICAL_LOCK =
  /kilitlemiştik|kilitliyoruz|kilitliyorum|kilitleyeceğiz|kilitleyince|kilitleniyor|kilitlenir|kilitlersin|kilitleme\b|kilitli paket|nasıl kilitleniyor/iu;

describe("03.16 gerçek müfredat gövdesi", () => {
  it("Amiral Ders beş perde, DialogueTurn ve quiz taşır; mock cümle yok", { timeout: 20_000 }, () => {
    const keys = new Set<string>();
    expect(ACADEMY_COURSE_SEEDS.map((row) => row.slug)).toEqual([...ACADEMY_GROWTH_SKU_SLUGS]);
    expect(ACADEMY_COURSE_SEEDS[0]?.slug).toBe("ai-agent-temel");
    const lessons = curriculumForCourseSlug(PILOT);
    expect(lessons).toHaveLength(ACADEMY_PILOT_SKU_LESSON_COUNT);
    for (const lesson of lessons) {
      keys.add(lesson.key);
      expect(lesson.title.length, lesson.key).toBeGreaterThan(24);
      expect(lesson.body.length, lesson.key).toBeGreaterThan(900);
      expect(lesson.body.length, lesson.key).toBeLessThanOrEqual(ACADEMY_LESSON_LISTEN_MAX_CHARS);
      expect(lesson.body, lesson.key).not.toMatch(/Koray:/);
      expect(lesson.body, lesson.key).toContain("Hoş geldiniz. Bu bölümde");
      expect(academyLessonHasFiveActPedagogy(lesson.body), lesson.key).toBe(true);
      expect(academyLessonHasPedagogy(lesson.body), lesson.key).toBe(true);
      expect(lesson.body, lesson.key).toContain(ACADEMY_FIVE_ACT_HEADINGS.warmup);
      expect(lesson.body, lesson.key).toContain(ACADEMY_FIVE_ACT_HEADINGS.problem);
      expect(lesson.body, lesson.key).toContain(ACADEMY_FIVE_ACT_HEADINGS.development);
      expect(lesson.body, lesson.key).toContain(ACADEMY_FIVE_ACT_HEADINGS.conclusion);
      expect(lesson.body, lesson.key).toContain(ACADEMY_FIVE_ACT_HEADINGS.assessment);
      expect(lesson.body, lesson.key).toContain("```alistirma");
      expect(lesson.body, lesson.key).toMatch(/Bir sonraki bölümde seni |Sınavda seni /);
      const spoken = spokenAcademyLessonBody(lesson.body);
      expect(spoken.length, lesson.key).toBeGreaterThan(400);
      expect(spoken, lesson.key).toContain(ACADEMY_FIVE_ACT_HEADINGS.warmup);
      expect(spoken, lesson.key).not.toMatch(/\bKoray\b/);
      expect(spoken, lesson.key).toContain("Hoş geldiniz");
      expect(spoken, lesson.key).not.toContain("Giriş. Problem.");
      expect(spoken, lesson.key).not.toContain("Gelişme. Uygulama.");
      expect(spoken, lesson.key).not.toContain("Sonuç. Toparlama.");
      for (const phrase of MOCK_PHRASES) {
        expect(lesson.title, `${lesson.key} title`).not.toContain(phrase);
        expect(lesson.body, `${lesson.key} body`).not.toContain(phrase);
      }
    }
    expect(keys.size).toBe(ACADEMY_PILOT_SKU_LESSON_COUNT);
  });

  it("Python Orta beş perde, DialogueTurn ve quiz taşır", { timeout: 20_000 }, () => {
    const lessons = curriculumForCourseSlug("python-orta");
    expect(lessons).toHaveLength(6);
    for (const lesson of lessons) {
      expect(lesson.title.length, lesson.key).toBeGreaterThan(24);
      expect(lesson.body.length, lesson.key).toBeGreaterThan(900);
      expect(lesson.body.length, lesson.key).toBeLessThanOrEqual(ACADEMY_LESSON_LISTEN_MAX_CHARS);
      expect(lesson.body, lesson.key).not.toMatch(/Koray:/);
      expect(lesson.body, lesson.key).toContain("Hoş geldiniz. Bu bölümde");
      expect(academyLessonHasFiveActPedagogy(lesson.body), lesson.key).toBe(true);
      expect(lesson.body, lesson.key).toContain(ACADEMY_FIVE_ACT_HEADINGS.warmup);
      expect(lesson.body, lesson.key).toContain("```alistirma");
      expect(lesson.body, lesson.key).toMatch(/Bir sonraki bölümde seni |Sınavda seni /);
    }
    expect(lessons[lessons.length - 1]!.body).toContain("Sınavda seni");
  });

  it("Python İleri beş perde, DialogueTurn ve quiz taşır", { timeout: 20_000 }, () => {
    const lessons = curriculumForCourseSlug("python-ileri");
    expect(lessons).toHaveLength(6);
    for (const lesson of lessons) {
      expect(lesson.title.length, lesson.key).toBeGreaterThan(24);
      expect(lesson.body.length, lesson.key).toBeGreaterThan(900);
      expect(lesson.body.length, lesson.key).toBeLessThanOrEqual(ACADEMY_LESSON_LISTEN_MAX_CHARS);
      expect(lesson.body, lesson.key).not.toMatch(/Koray:/);
      expect(lesson.body, lesson.key).toContain("Hoş geldiniz. Bu bölümde");
      expect(academyLessonHasFiveActPedagogy(lesson.body), lesson.key).toBe(true);
      expect(lesson.body, lesson.key).toContain(ACADEMY_FIVE_ACT_HEADINGS.warmup);
      expect(lesson.body, lesson.key).toContain("```alistirma");
      expect(lesson.body, lesson.key).toMatch(/Bir sonraki bölümde seni |Sınavda seni /);
    }
    expect(lessons[lessons.length - 1]!.body).toContain("Sınavda seni");
  });

  it("AI Agent Temel beş perde, DialogueTurn ve quiz taşır", { timeout: 20_000 }, () => {
    const lessons = curriculumForCourseSlug("ai-agent-temel");
    expect(lessons).toHaveLength(6);
    for (const lesson of lessons) {
      expect(lesson.title.length, lesson.key).toBeGreaterThan(24);
      expect(lesson.body.length, lesson.key).toBeGreaterThan(900);
      expect(lesson.body.length, lesson.key).toBeLessThanOrEqual(ACADEMY_LESSON_LISTEN_MAX_CHARS);
      expect(lesson.body, lesson.key).not.toMatch(/Koray:/);
      if (lesson.key === "ai-agent-temel-2") {
        expect(lesson.body, lesson.key).toContain("Merhaba arkadaşlar, ben Maya");
        expect(lesson.body, lesson.key).toContain("Bu bölümde Prompt Mühendisliği");
      } else if (lesson.key === "ai-agent-temel-3") {
        expect(lesson.body, lesson.key).toContain("Merhaba arkadaşlar, ben Maya");
        expect(lesson.body, lesson.key).toContain("Bu bölümde Araç Kullanımı");
      } else if (lesson.key === "ai-agent-temel-4") {
        expect(lesson.body, lesson.key).toContain("Merhaba sevgili arkadaşlar, ben Maya");
        expect(lesson.body, lesson.key).toContain("Bu bölümde Hafıza Mimarisi");
      } else if (lesson.key === "ai-agent-temel-5") {
        expect(lesson.body, lesson.key).toContain("Selamlar arkadaşlar, ben Maya");
        expect(lesson.body, lesson.key).toContain("Bu bölümde, ajanın kendi kendine mantık yürütüp");
      } else if (lesson.key === "ai-agent-temel-6") {
        expect(lesson.body, lesson.key).toContain("Selamlar arkadaşlar, ben Maya");
        expect(lesson.body, lesson.key).toContain("Geldik Modül 1'in büyük finaline");
      } else {
        expect(lesson.body, lesson.key).toContain("Hoş geldiniz. Bu bölümde");
      }
      expect(academyLessonHasFiveActPedagogy(lesson.body), lesson.key).toBe(true);
      expect(lesson.body, lesson.key).toContain(ACADEMY_FIVE_ACT_HEADINGS.warmup);
      expect(lesson.body, lesson.key).toContain("```alistirma");
      if (
        lesson.key === "ai-agent-temel-3" ||
        lesson.key === "ai-agent-temel-4"
      ) {
        expect(lesson.body, lesson.key).toContain("Bir sonraki bölümde görüşmek üzere.");
      } else if (lesson.key === "ai-agent-temel-5") {
        expect(lesson.body, lesson.key).toContain("Sıradaki projede görüşmek üzere");
      } else if (lesson.key === "ai-agent-temel-6") {
        expect(lesson.body, lesson.key).toContain("Yapay Zeka Mimarı");
        expect(lesson.body, lesson.key).toContain("Kendinize çok iyi bakın");
      } else {
        expect(lesson.body, lesson.key).toMatch(/Bir sonraki bölümde seni |Sınavda seni /);
      }
    }
    expect(lessons[lessons.length - 1]!.body).toContain("Yapay Zeka Mimarı");
  });

  it("AI Agent Orta beş perde, DialogueTurn ve quiz taşır", { timeout: 20_000 }, () => {
    const lessons = curriculumForCourseSlug("ai-agent-orta");
    expect(lessons).toHaveLength(6);
    for (const lesson of lessons) {
      expect(lesson.title.length, lesson.key).toBeGreaterThan(24);
      expect(lesson.body.length, lesson.key).toBeGreaterThan(900);
      expect(lesson.body.length, lesson.key).toBeLessThanOrEqual(ACADEMY_LESSON_LISTEN_MAX_CHARS);
      expect(lesson.body, lesson.key).not.toMatch(/Koray:/);
      expect(lesson.body, lesson.key).toContain("Selamlar! Ben Maya");
      expect(lesson.body, lesson.key).not.toContain("Hoş geldiniz. Bu bölümde");
      expect(academyLessonHasFiveActPedagogy(lesson.body), lesson.key).toBe(true);
      expect(lesson.body, lesson.key).toContain(ACADEMY_FIVE_ACT_HEADINGS.warmup);
      expect(lesson.body, lesson.key).toContain("```alistirma");
      if (lesson.key === "ai-agent-orta-6") {
        expect(lesson.body, lesson.key).toContain("Yapay Zeka Mimarı");
        expect(lesson.body, lesson.key).toContain("Kendinize çok iyi bakın");
      } else {
        expect(lesson.body, lesson.key).toContain("Bir sonraki bölümde görüşmek üzere.");
      }
    }
    expect(lessons[3]!.title).toBe("Çoklu Ajan Mimarileri (Multi-Agent Workflows)");
    expect(lessons[3]!.body).toContain(
      "Selamlar! Ben Maya. Yapay Zeka Sistemleri Uzmanıyım ve orta seviye maratonumuzda işin en heyecan verici boyutuna adım atıyoruz.",
    );
    expect(lessons[3]!.body).toContain(
      "Yazılım dünyasında çoklu ajan kurgularken yapılan en büyük hata",
    );
    expect(lessons[3]!.body).toContain(
      "Ekrandaki kod bloğunda, endüstri standardı olan Supervisor Mimarisi",
    );
    expect(lessons[3]!.body).toContain(
      "Bu dersle birlikte kompleks iş süreçlerini",
    );
    expect(lessons[4]!.title).toBe("Hata Yönetimi ve Graceful Degradation");
    expect(lessons[4]!.body).toContain("Graceful Degradation");
    expect(lessons[lessons.length - 1]!.body).toContain("Yapay Zeka Mimarı");
  });

  it("AI Agent İleri beş perde, DialogueTurn ve quiz taşır", { timeout: 20_000 }, () => {
    const lessons = curriculumForCourseSlug("ai-agent-ileri");
    expect(lessons).toHaveLength(6);
    for (const lesson of lessons) {
      expect(lesson.title.length, lesson.key).toBeGreaterThan(24);
      expect(lesson.body.length, lesson.key).toBeGreaterThan(900);
      expect(lesson.body.length, lesson.key).toBeLessThanOrEqual(ACADEMY_LESSON_LISTEN_MAX_CHARS);
      expect(lesson.body, lesson.key).not.toMatch(/Koray:/);
      expect(lesson.body, lesson.key).toContain("Hoş geldiniz. Bu bölümde");
      expect(academyLessonHasFiveActPedagogy(lesson.body), lesson.key).toBe(true);
      expect(lesson.body, lesson.key).toContain(ACADEMY_FIVE_ACT_HEADINGS.warmup);
      expect(lesson.body, lesson.key).toContain("```alistirma");
      expect(lesson.body, lesson.key).toMatch(/Bir sonraki bölümde seni |Sınavda seni /);
    }
    expect(lessons[lessons.length - 1]!.body).toContain("Sınavda seni");
  });

  it("AI Agent 2. dersten itibaren bölüm tekrarı taşır; 4 dk+", {
    timeout: 20_000,
  }, () => {
    for (const slug of ["ai-agent-temel", "ai-agent-orta", "ai-agent-ileri"] as const) {
      const lessons = curriculumForCourseSlug(slug);
      expect(lessons).toHaveLength(6);
      for (const lesson of lessons) {
        const timeline = buildAcademyDialogueTimeline(lesson.body, slug);
        if (
          lesson.key === "ai-agent-temel-3" ||
          lesson.key === "ai-agent-temel-4" ||
          lesson.key === "ai-agent-temel-5"
        ) {
          expect(timeline.spokenDuration, lesson.key).toBeGreaterThanOrEqual(120);
        } else if (lesson.key === "ai-agent-temel-6") {
          expect(timeline.spokenDuration, lesson.key).toBeGreaterThanOrEqual(90);
        } else if (lesson.key.startsWith("ai-agent-orta-")) {
          expect(timeline.spokenDuration, lesson.key).toBeGreaterThanOrEqual(120);
        } else {
          expect(timeline.spokenDuration, lesson.key).toBeGreaterThanOrEqual(240);
        }
        expect(timeline.turns.some((turn) => turn.act === "warmup"), lesson.key).toBe(true);
        expect(timeline.turns.some((turn) => turn.act === "problem"), lesson.key).toBe(true);
        expect(timeline.turns.some((turn) => turn.act === "development"), lesson.key).toBe(true);
        expect(timeline.turns.some((turn) => turn.act === "conclusion"), lesson.key).toBe(true);
        expect(timeline.turns.every((turn) => !/Baraj 70/.test(turn.text)), lesson.key).toBe(true);
        if (lesson.key === "ai-agent-temel-1") {
          expect(lesson.body, lesson.key).toMatch(/şef/iu);
          expect(lesson.body, lesson.key).toMatch(/garson/iu);
          expect(lesson.body, lesson.key).toContain("ChatGPT");
          expect(lesson.body, lesson.key).toContain("Cursor");
          expect(lesson.body, lesson.key).toContain("Konuşan AI değil, Çalışan AI");
          expect(lesson.body, lesson.key).not.toMatch(/yani bu şu demek/iu);
          expect(lesson.body, lesson.key).not.toMatch(/\bvs\./iu);
          expect(lesson.title, lesson.key).toContain("veya");
        } else if (lesson.key === "ai-agent-temel-2") {
          expect(lesson.body, lesson.key).toMatch(/serbest metin/iu);
          expect(lesson.body, lesson.key).toMatch(/kutucuk/iu);
          expect(lesson.body, lesson.key).toMatch(/durum acil/iu);
          expect(lesson.body, lesson.key).toMatch(/durum normal/iu);
          expect(lesson.body, lesson.key).toMatch(/roman/iu);
          expect(lesson.body, lesson.key).toContain("şef-garson mantığını hatırlayalım");
          expect(lesson.body, lesson.key).toContain("onaylar ve geçer");
          expect(lesson.body, lesson.key).not.toMatch(/(?:^|[.!?]\s+)Geçer\./u);
          expect(lesson.body, lesson.key).not.toMatch(/Yeni kapı, dünün durduğu yerin üzerine konur/u);
          expect(lesson.body, lesson.key).not.toMatch(/Unutulan kapı bugün yalan doğurur/u);
          expect(lesson.body, lesson.key).not.toMatch(/e-fatura/iu);
          expect(lesson.body, lesson.key).not.toMatch(/kıdemli bir yazar/iu);
          expect(lesson.body, lesson.key).not.toMatch(/üç katman/iu);
          expect(lesson.body, lesson.key).toContain("ChatGPT");
          expect(lesson.body, lesson.key).toContain("Cursor");
          expect(lesson.body, lesson.key).not.toMatch(/yani bu şu demek/iu);
          expect(lesson.body, lesson.key).not.toMatch(/\bvs\./iu);
          expect(lesson.body, lesson.key).not.toMatch(/\bOutput\b/);
        } else if (lesson.key === "ai-agent-temel-3") {
          expect(lesson.body, lesson.key).toMatch(/halüsinasyon/iu);
          expect(lesson.body, lesson.key).toContain("hava_durumu_getir");
          expect(lesson.body, lesson.key).toContain("hesap_makinesi");
          expect(lesson.body, lesson.key).toContain("termometre");
          expect(lesson.body, lesson.key).toMatch(/tam eşleşme/iu);
          expect(lesson.body, lesson.key).toContain("Ekrandaki kod bloğunda gördüğünüz bu yapılar");
          expect(lesson.body, lesson.key).toContain("Kod bilmiyorsanız kesinlikle endişelenmeyin");
          expect(lesson.body, lesson.key).not.toContain("veya dünkü borsa");
          expect(lesson.body, lesson.key).not.toContain("Siz de inanırsınız");
          expect(lesson.body, lesson.key).not.toMatch(/Yeni kapı, dünün durduğu yerin üzerine konur/u);
          expect(lesson.body, lesson.key).not.toMatch(/Unutulan kapı bugün yalan doğurur/u);
          expect(lesson.body, lesson.key).not.toMatch(/yani bu şu demek/iu);
          expect(lesson.body, lesson.key).not.toMatch(/\bvs\./iu);
        } else if (lesson.key === "ai-agent-temel-4") {
          expect(lesson.body, lesson.key).toMatch(/balık hafıza/iu);
          expect(lesson.body, lesson.key).toContain("kisa_sureli_hafiza");
          expect(lesson.body, lesson.key).toContain("uzun_sureli_hafiza");
          expect(lesson.body, lesson.key).toContain("Context Window");
          expect(lesson.body, lesson.key).toContain("Vector Storage");
          expect(lesson.body, lesson.key).not.toMatch(/Yeni kapı, dünün durduğu yerin üzerine konur/u);
          expect(lesson.body, lesson.key).not.toMatch(/Unutulan kapı bugün yalan doğurur/u);
          expect(lesson.body, lesson.key).not.toMatch(/yani bu şu demek/iu);
          expect(lesson.body, lesson.key).not.toMatch(/\bvs\./iu);
        } else if (lesson.key === "ai-agent-temel-5") {
          expect(lesson.body, lesson.key).toContain("Düşün, Eyleme Geç ve Gözlemle");
          expect(lesson.body, lesson.key).toContain("depo_sorgula");
          expect(lesson.body, lesson.key).toContain("DUSUN (Thought)");
          expect(lesson.body, lesson.key).toContain("maksimum adım sınırı");
          expect(lesson.body, lesson.key).not.toMatch(/Yeni kapı, dünün durduğu yerin üzerine konur/u);
          expect(lesson.body, lesson.key).not.toMatch(/Unutulan kapı bugün yalan doğurur/u);
          expect(lesson.body, lesson.key).not.toMatch(/yani bu şu demek/iu);
          expect(lesson.body, lesson.key).not.toMatch(/\bvs\./iu);
        } else if (lesson.key === "ai-agent-temel-6") {
          expect(lesson.body, lesson.key).toContain("hava_durumu_getir");
          expect(lesson.body, lesson.key).toContain("not_kaydet");
          expect(lesson.body, lesson.key).toContain("notlar.txt");
          expect(lesson.body, lesson.key).toContain("ReAct");
          expect(lesson.body, lesson.key).toContain("Yapay Zeka Mimarı");
          expect(lesson.body, lesson.key).not.toMatch(/Yeni kapı, dünün durduğu yerin üzerine konur/u);
          expect(lesson.body, lesson.key).not.toMatch(/Unutulan kapı bugün yalan doğurur/u);
          expect(lesson.body, lesson.key).not.toMatch(/yani bu şu demek/iu);
          expect(lesson.body, lesson.key).not.toMatch(/\bvs\./iu);
        } else if (lesson.key.startsWith("ai-agent-orta-")) {
          expect(lesson.body, lesson.key).not.toMatch(/yani bu şu demek/iu);
        } else {
          expect(lesson.body, lesson.key).toMatch(/yani bu şu demek/iu);
        }
        if (lesson.key === "ai-agent-temel-2") {
          expect(lesson.body, lesson.key).toContain("Merhaba arkadaşlar, ben Maya");
          expect(lesson.body, lesson.key).toContain("Kontrol listesini birlikte işaretleyelim");
        } else if (lesson.key === "ai-agent-temel-3") {
          expect(lesson.body, lesson.key).toContain("Merhaba arkadaşlar, ben Maya");
          expect(lesson.body, lesson.key).toContain("Geçen bölümde ne kurgulamıştık");
        } else if (lesson.key === "ai-agent-temel-4") {
          expect(lesson.body, lesson.key).toContain("Merhaba sevgili arkadaşlar, ben Maya");
          expect(lesson.body, lesson.key).toContain("Önceki bölümde ne öğrenmiştik");
        } else if (lesson.key === "ai-agent-temel-5") {
          expect(lesson.body, lesson.key).toContain("Selamlar arkadaşlar, ben Maya");
          expect(lesson.body, lesson.key).toContain("Önceki bölümde ajanın unutkanlığını çözdük");
        } else if (lesson.key === "ai-agent-temel-6") {
          expect(lesson.body, lesson.key).toContain("Selamlar arkadaşlar, ben Maya");
          expect(lesson.body, lesson.key).toContain("Buraya kadar parça parça ne öğrendik");
        } else if (lesson.key.startsWith("ai-agent-orta-")) {
          expect(lesson.body, lesson.key).toContain("Selamlar! Ben Maya");
          expect(lesson.body, lesson.key).toContain("Yapay Zeka Sistemleri Uzmanıyım");
          expect(lesson.body, lesson.key).not.toContain("Hoş geldiniz. Bu bölümde");
          expect(lesson.body, lesson.key).not.toContain("Ne Öğrenmiştik?");
        } else if (lesson.order >= 2) {
          expect(lesson.body, lesson.key).toContain("Ne Öğrenmiştik?");
          expect(lesson.body, lesson.key).toContain("Bir önceki bölümde ne öğrendik?");
          expect(lesson.body, lesson.key).toContain("Kontrol listesini birlikte işaretleyelim.");
        } else {
          expect(lesson.body, lesson.key).not.toContain("Bir önceki bölümde ne öğrendik?");
          expect(lesson.body, lesson.key).toContain("Merhaba, ben Maya");
          expect(lesson.body, lesson.key).toContain("Yapay Zeka Sistemleri Uzmanıyım");
        }
        if (lesson.key.startsWith("ai-agent-orta-") && lesson.order < 6) {
          expect(lesson.body, lesson.key).toContain("Bir sonraki bölümde görüşmek üzere.");
        }
      }
    }
  });

  it("Full-Stack Temel beş perde, DialogueTurn ve quiz taşır", { timeout: 20_000 }, () => {
    const lessons = curriculumForCourseSlug("fullstack-temel");
    expect(lessons).toHaveLength(6);
    for (const lesson of lessons) {
      expect(lesson.title.length, lesson.key).toBeGreaterThan(24);
      expect(lesson.body.length, lesson.key).toBeGreaterThan(900);
      expect(lesson.body.length, lesson.key).toBeLessThanOrEqual(ACADEMY_LESSON_LISTEN_MAX_CHARS);
      expect(lesson.body, lesson.key).not.toMatch(/Koray:/);
      expect(lesson.body, lesson.key).toContain("Hoş geldiniz. Bu bölümde");
      expect(academyLessonHasFiveActPedagogy(lesson.body), lesson.key).toBe(true);
      expect(lesson.body, lesson.key).toContain(ACADEMY_FIVE_ACT_HEADINGS.warmup);
      expect(lesson.body, lesson.key).toContain("```alistirma");
      expect(lesson.body, lesson.key).toMatch(/Bir sonraki bölümde seni |Sınavda seni /);
    }
    expect(lessons[lessons.length - 1]!.body).toContain("Sınavda seni");
  });

  it("Full-Stack Orta beş perde, DialogueTurn ve quiz taşır", { timeout: 20_000 }, () => {
    const lessons = curriculumForCourseSlug("fullstack-orta");
    expect(lessons).toHaveLength(6);
    for (const lesson of lessons) {
      expect(lesson.title.length, lesson.key).toBeGreaterThan(24);
      expect(lesson.body.length, lesson.key).toBeGreaterThan(900);
      expect(lesson.body.length, lesson.key).toBeLessThanOrEqual(ACADEMY_LESSON_LISTEN_MAX_CHARS);
      expect(lesson.body, lesson.key).not.toMatch(/Koray:/);
      expect(lesson.body, lesson.key).toContain("Hoş geldiniz. Bu bölümde");
      expect(academyLessonHasFiveActPedagogy(lesson.body), lesson.key).toBe(true);
      expect(lesson.body, lesson.key).toContain(ACADEMY_FIVE_ACT_HEADINGS.warmup);
      expect(lesson.body, lesson.key).toContain("```alistirma");
      expect(lesson.body, lesson.key).toMatch(/Bir sonraki bölümde seni |Sınavda seni /);
    }
    expect(lessons[lessons.length - 1]!.body).toContain("Sınavda seni");
  });

  it("Full-Stack İleri beş perde, DialogueTurn ve quiz taşır", { timeout: 20_000 }, () => {
    const lessons = curriculumForCourseSlug("fullstack-ileri");
    expect(lessons).toHaveLength(6);
    for (const lesson of lessons) {
      expect(lesson.title.length, lesson.key).toBeGreaterThan(24);
      expect(lesson.body.length, lesson.key).toBeGreaterThan(900);
      expect(lesson.body.length, lesson.key).toBeLessThanOrEqual(ACADEMY_LESSON_LISTEN_MAX_CHARS);
      expect(lesson.body, lesson.key).not.toMatch(/Koray:/);
      expect(lesson.body, lesson.key).toContain("Hoş geldiniz. Bu bölümde");
      expect(academyLessonHasFiveActPedagogy(lesson.body), lesson.key).toBe(true);
      expect(lesson.body, lesson.key).toContain(ACADEMY_FIVE_ACT_HEADINGS.warmup);
      expect(lesson.body, lesson.key).toContain("```alistirma");
      expect(lesson.body, lesson.key).toMatch(/Bir sonraki bölümde seni |Sınavda seni /);
    }
    expect(lessons[lessons.length - 1]!.body).toContain("Sınavda seni");
  });

  it("Siber Güvenlik Temel beş perde, Can/Ece DialogueTurn ve quiz taşır", { timeout: 20_000 }, () => {
    const lessons = curriculumForCourseSlug("security-temel");
    expect(lessons).toHaveLength(6);
    for (const lesson of lessons) {
      expect(lesson.title.length, lesson.key).toBeGreaterThan(24);
      expect(lesson.body.length, lesson.key).toBeGreaterThan(900);
      expect(lesson.body.length, lesson.key).toBeLessThanOrEqual(ACADEMY_LESSON_LISTEN_MAX_CHARS);
      expect(lesson.body, lesson.key).not.toMatch(/Can:/);
      expect(lesson.body, lesson.key).toContain("Hoş geldiniz. Bu bölümde");
      expect(lesson.body, lesson.key).not.toMatch(/Koray:/);
      expect(lesson.body, lesson.key).not.toMatch(/Maya:/);
      expect(academyLessonHasFiveActPedagogy(lesson.body), lesson.key).toBe(true);
      expect(lesson.body, lesson.key).toContain(ACADEMY_FIVE_ACT_HEADINGS.warmup);
      expect(lesson.body, lesson.key).toContain("```alistirma");
      expect(lesson.body, lesson.key).toMatch(/Bir sonraki bölümde seni |Sınavda seni /);
    }
    expect(lessons[lessons.length - 1]!.body).toContain("Sınavda seni");
    expect(lessons[0]!.body).toContain("kale");
    expect(lessons[1]!.title).toMatch(/Wireshark/);
  });

  it("Siber Güvenlik Orta beş perde, Can/Ece DialogueTurn ve quiz taşır", { timeout: 20_000 }, () => {
    const lessons = curriculumForCourseSlug("security-orta");
    expect(lessons).toHaveLength(6);
    for (const lesson of lessons) {
      expect(lesson.title.length, lesson.key).toBeGreaterThan(24);
      expect(lesson.body.length, lesson.key).toBeGreaterThan(900);
      expect(lesson.body.length, lesson.key).toBeLessThanOrEqual(ACADEMY_LESSON_LISTEN_MAX_CHARS);
      expect(lesson.body, lesson.key).not.toMatch(/Can:/);
      expect(lesson.body, lesson.key).toContain("Hoş geldiniz. Bu bölümde");
      expect(lesson.body, lesson.key).not.toMatch(/Koray:/);
      expect(lesson.body, lesson.key).not.toMatch(/Maya:/);
      expect(academyLessonHasFiveActPedagogy(lesson.body), lesson.key).toBe(true);
      expect(lesson.body, lesson.key).toContain(ACADEMY_FIVE_ACT_HEADINGS.warmup);
      expect(lesson.body, lesson.key).toContain("```alistirma");
      expect(lesson.body, lesson.key).toMatch(/Bir sonraki bölümde seni |Sınavda seni /);
    }
    expect(lessons[lessons.length - 1]!.body).toContain("Sınavda seni");
    expect(lessons[0]!.body).toContain("müfettiş");
    expect(lessons[2]!.title).toMatch(/IDOR/);
  });

  it("Siber Güvenlik İleri beş perde, Can/Ece DialogueTurn ve quiz taşır", { timeout: 20_000 }, () => {
    const lessons = curriculumForCourseSlug("security-ileri");
    expect(lessons).toHaveLength(6);
    for (const lesson of lessons) {
      expect(lesson.title.length, lesson.key).toBeGreaterThan(24);
      expect(lesson.body.length, lesson.key).toBeGreaterThan(900);
      expect(lesson.body.length, lesson.key).toBeLessThanOrEqual(ACADEMY_LESSON_LISTEN_MAX_CHARS);
      expect(lesson.body, lesson.key).not.toMatch(/Can:/);
      expect(lesson.body, lesson.key).toContain("Hoş geldiniz. Bu bölümde");
      expect(lesson.body, lesson.key).not.toMatch(/Koray:/);
      expect(lesson.body, lesson.key).not.toMatch(/Maya:/);
      expect(academyLessonHasFiveActPedagogy(lesson.body), lesson.key).toBe(true);
      expect(lesson.body, lesson.key).toContain(ACADEMY_FIVE_ACT_HEADINGS.warmup);
      expect(lesson.body, lesson.key).toContain("```alistirma");
      expect(lesson.body, lesson.key).toMatch(/Bir sonraki bölümde seni |Sınavda seni /);
    }
    expect(lessons[lessons.length - 1]!.body).toContain("Sınavda seni");
    expect(lessons[0]!.body).toContain("damga");
    expect(lessons[4]!.title).toMatch(/Zero Trust|Sıfır Güven/);
  });

  it("Excel Masterclass beş perde, Tarık/Gözde DialogueTurn ve quiz taşır", { timeout: 20_000 }, () => {
    const lessons = curriculumForCourseSlug("excel-masterclass");
    expect(lessons).toHaveLength(6);
    for (const lesson of lessons) {
      expect(lesson.title.length, lesson.key).toBeGreaterThan(24);
      expect(lesson.body.length, lesson.key).toBeGreaterThan(900);
      expect(lesson.body.length, lesson.key).toBeLessThanOrEqual(ACADEMY_LESSON_LISTEN_MAX_CHARS);
      expect(lesson.body, lesson.key).not.toMatch(/Tarık:/);
      expect(lesson.body, lesson.key).toContain("Hoş geldiniz. Bu bölümde");
      expect(lesson.body, lesson.key).not.toMatch(/Koray:/);
      expect(lesson.body, lesson.key).not.toMatch(/Maya:/);
      expect(lesson.body, lesson.key).not.toMatch(/Can:/);
      expect(lesson.body, lesson.key).not.toMatch(/Ece:/);
      expect(academyLessonHasFiveActPedagogy(lesson.body), lesson.key).toBe(true);
      expect(lesson.body, lesson.key).toContain(ACADEMY_FIVE_ACT_HEADINGS.warmup);
      expect(lesson.body, lesson.key).toContain("```alistirma");
      expect(lesson.body, lesson.key).toMatch(/Bir sonraki bölümde seni |Sınavda seni /);
    }
    expect(lessons[lessons.length - 1]!.body).toContain("Sınavda seni");
    expect(lessons[0]!.body).toContain("defter");
    expect(lessons[1]!.title).toMatch(/XLOOKUP|ÇAPRAZARA/);
  });

  it("Google Ads Masterclass beş perde, Tarık/Gözde DialogueTurn ve quiz taşır", { timeout: 20_000 }, () => {
    const lessons = curriculumForCourseSlug("google-ads-masterclass");
    expect(lessons).toHaveLength(6);
    for (const lesson of lessons) {
      expect(lesson.title.length, lesson.key).toBeGreaterThan(24);
      expect(lesson.body.length, lesson.key).toBeGreaterThan(900);
      expect(lesson.body.length, lesson.key).toBeLessThanOrEqual(ACADEMY_LESSON_LISTEN_MAX_CHARS);
      expect(lesson.body, lesson.key).not.toMatch(/Tarık:/);
      expect(lesson.body, lesson.key).toContain("Hoş geldiniz. Bu bölümde");
      expect(lesson.body, lesson.key).not.toMatch(/Koray:/);
      expect(lesson.body, lesson.key).not.toMatch(/Maya:/);
      expect(lesson.body, lesson.key).not.toMatch(/Can:/);
      expect(lesson.body, lesson.key).not.toMatch(/Ece:/);
      expect(academyLessonHasFiveActPedagogy(lesson.body), lesson.key).toBe(true);
      expect(lesson.body, lesson.key).toContain(ACADEMY_FIVE_ACT_HEADINGS.warmup);
      expect(lesson.body, lesson.key).toContain("```alistirma");
      expect(lesson.body, lesson.key).toMatch(/Bir sonraki bölümde seni |Sınavda seni /);
    }
    expect(lessons[lessons.length - 1]!.body).toContain("Sınavda seni");
    expect(lessons[0]!.body).toContain("tabela");
    expect(lessons[3]!.title).toMatch(/GTM|Tag Manager|Dönüşüm/);
  });

  it("Meta Ads Masterclass beş perde, Tarık/Gözde DialogueTurn ve quiz taşır", { timeout: 20_000 }, () => {
    const lessons = curriculumForCourseSlug("meta-ads-masterclass");
    expect(lessons).toHaveLength(6);
    for (const lesson of lessons) {
      expect(lesson.title.length, lesson.key).toBeGreaterThan(24);
      expect(lesson.body.length, lesson.key).toBeGreaterThan(900);
      expect(lesson.body.length, lesson.key).toBeLessThanOrEqual(ACADEMY_LESSON_LISTEN_MAX_CHARS);
      expect(lesson.body, lesson.key).not.toMatch(/Tarık:/);
      expect(lesson.body, lesson.key).toContain("Hoş geldiniz. Bu bölümde");
      expect(lesson.body, lesson.key).not.toMatch(/Koray:/);
      expect(lesson.body, lesson.key).not.toMatch(/Maya:/);
      expect(lesson.body, lesson.key).not.toMatch(/Can:/);
      expect(lesson.body, lesson.key).not.toMatch(/Ece:/);
      expect(academyLessonHasFiveActPedagogy(lesson.body), lesson.key).toBe(true);
      expect(lesson.body, lesson.key).toContain(ACADEMY_FIVE_ACT_HEADINGS.warmup);
      expect(lesson.body, lesson.key).toContain("```alistirma");
      expect(lesson.body, lesson.key).toMatch(/Bir sonraki bölümde seni |Sınavda seni /);
    }
    expect(lessons[lessons.length - 1]!.body).toContain("Sınavda seni");
    expect(lessons[0]!.body).toContain("vitrin");
    expect(lessons[3]!.title).toMatch(/Piksel|CAPI|Pixel/);
  });

  it("E-Ticaret Masterclass beş perde, Tarık/Gözde DialogueTurn ve quiz taşır", { timeout: 20_000 }, () => {
    const lessons = curriculumForCourseSlug("eticaret-masterclass");
    expect(lessons).toHaveLength(6);
    for (const lesson of lessons) {
      expect(lesson.title.length, lesson.key).toBeGreaterThan(24);
      expect(lesson.body.length, lesson.key).toBeGreaterThan(900);
      expect(lesson.body.length, lesson.key).toBeLessThanOrEqual(ACADEMY_LESSON_LISTEN_MAX_CHARS);
      expect(lesson.body, lesson.key).not.toMatch(/Tarık:/);
      expect(lesson.body, lesson.key).toContain("Hoş geldiniz. Bu bölümde");
      expect(lesson.body, lesson.key).not.toMatch(/Koray:/);
      expect(lesson.body, lesson.key).not.toMatch(/Maya:/);
      expect(lesson.body, lesson.key).not.toMatch(/Can:/);
      expect(lesson.body, lesson.key).not.toMatch(/Ece:/);
      expect(academyLessonHasFiveActPedagogy(lesson.body), lesson.key).toBe(true);
      expect(lesson.body, lesson.key).toContain(ACADEMY_FIVE_ACT_HEADINGS.warmup);
      expect(lesson.body, lesson.key).toContain("```alistirma");
      expect(lesson.body, lesson.key).toMatch(/Bir sonraki bölümde seni |Sınavda seni /);
    }
    expect(lessons[lessons.length - 1]!.body).toContain("Sınavda seni");
    expect(lessons[0]!.body).toContain("tezgâh");
    expect(lessons[1]!.title).toMatch(/Trendyol|Hepsiburada|Mağaza/);
  });

  it("Canva Masterclass beş perde, Tarık/Gözde DialogueTurn ve quiz taşır", { timeout: 20_000 }, () => {
    const lessons = curriculumForCourseSlug("canva-masterclass");
    expect(lessons).toHaveLength(6);
    for (const lesson of lessons) {
      expect(lesson.title.length, lesson.key).toBeGreaterThan(24);
      expect(lesson.body.length, lesson.key).toBeGreaterThan(900);
      expect(lesson.body.length, lesson.key).toBeLessThanOrEqual(ACADEMY_LESSON_LISTEN_MAX_CHARS);
      expect(lesson.body, lesson.key).not.toMatch(/Tarık:/);
      expect(lesson.body, lesson.key).toContain("Hoş geldiniz. Bu bölümde");
      expect(lesson.body, lesson.key).not.toMatch(/Koray:/);
      expect(lesson.body, lesson.key).not.toMatch(/Maya:/);
      expect(lesson.body, lesson.key).not.toMatch(/Can:/);
      expect(lesson.body, lesson.key).not.toMatch(/Ece:/);
      expect(academyLessonHasFiveActPedagogy(lesson.body), lesson.key).toBe(true);
      expect(lesson.body, lesson.key).toContain(ACADEMY_FIVE_ACT_HEADINGS.warmup);
      expect(lesson.body, lesson.key).toContain("```alistirma");
      expect(lesson.body, lesson.key).toMatch(/Bir sonraki bölümde seni |Sınavda seni /);
    }
    expect(lessons[lessons.length - 1]!.body).toContain("Sınavda seni");
    expect(lessons[0]!.body).toContain("kalıp");
    expect(lessons[3]!.title).toMatch(/Magic|Yapay Zekâ|AI/);
  });

  it("LinkedIn Masterclass beş perde, Tarık/Gözde DialogueTurn ve quiz taşır", { timeout: 20_000 }, () => {
    const lessons = curriculumForCourseSlug("linkedin-masterclass");
    expect(lessons).toHaveLength(6);
    for (const lesson of lessons) {
      expect(lesson.title.length, lesson.key).toBeGreaterThan(24);
      expect(lesson.body.length, lesson.key).toBeGreaterThan(900);
      expect(lesson.body.length, lesson.key).toBeLessThanOrEqual(ACADEMY_LESSON_LISTEN_MAX_CHARS);
      expect(lesson.body, lesson.key).not.toMatch(/Tarık:/);
      expect(lesson.body, lesson.key).toContain("Hoş geldiniz. Bu bölümde");
      expect(lesson.body, lesson.key).not.toMatch(/Koray:/);
      expect(lesson.body, lesson.key).not.toMatch(/Maya:/);
      expect(lesson.body, lesson.key).not.toMatch(/Can:/);
      expect(lesson.body, lesson.key).not.toMatch(/Ece:/);
      expect(academyLessonHasFiveActPedagogy(lesson.body), lesson.key).toBe(true);
      expect(lesson.body, lesson.key).toContain(ACADEMY_FIVE_ACT_HEADINGS.warmup);
      expect(lesson.body, lesson.key).toContain("```alistirma");
      expect(lesson.body, lesson.key).toMatch(/Bir sonraki bölümde seni |Sınavda seni /);
    }
    expect(lessons[lessons.length - 1]!.body).toContain("Sınavda seni");
    expect(lessons[0]!.body).toContain("kartvizit");
    expect(lessons[2]!.title).toMatch(/Sales Navigator|ICP|Hedef Kitle/);
  });

  it("tohum klasörü ve curriculum.ts mock başlık taşımaz", () => {
    const files = readdirSync(CURRICULA_DIR).filter((name) => name.endsWith(".ts"));
    expect(files.sort()).toEqual([
      "ai-agent-ileri.ts",
      "ai-agent-orta.ts",
      "ai-agent-temel.ts",
      "ai-temel.ts",
      "canva-masterclass.ts",
      "eticaret-masterclass.ts",
      "excel-masterclass.ts",
      "fullstack-ileri.ts",
      "fullstack-orta.ts",
      "fullstack-temel.ts",
      "google-ads-masterclass.ts",
      "index.ts",
      "lesson-index.ts",
      "linkedin-masterclass.ts",
      "meta-ads-masterclass.ts",
      "python-ileri.ts",
      "python-orta.ts",
      "python-temel.ts",
      "security-ileri.ts",
      "security-orta.ts",
      "security-temel.ts",
      "types.ts",
      "ux-temel.ts",
    ]);
    for (const name of files) {
      const source = readFileSync(join(CURRICULA_DIR, name), "utf8");
      expect(source, name).not.toContain("Tutar nasıl tutulur");
      expect(source, name).not.toContain("Tek nakit defter");
    }
    const sealed = readFileSync(join(ROOT, "lib", "academy", "curriculum.ts"), "utf8");
    expect(sealed).toContain("CURRICULUM_DRAFTS_BY_SLUG");
    expect(sealed).toContain("LESSON_VISUALS");
    expect(sealed).toContain("composePedagogicalLessonBody");
    expect(sealed).not.toContain("@/lib/academy/real-world-pedagogy");
    expect(sealed).not.toContain("@/lib/academy/field-voice");
    expect(sealed).not.toContain("@/lib/academy/sealed-diagrams");
    expect(sealed).not.toContain("@/archived/lib/academy-studio/real-world-pedagogy");
    expect(sealed).not.toContain("@/archived/lib/academy-studio/field-voice");
    expect(sealed).not.toContain("@/archived/lib/academy-studio/sealed-diagrams");
    expect(sealed).not.toContain("Tutar nasıl tutulur");
  });
});

describe("03.19 seviye ve pedagoji", () => {
  it("seviye etiketi serbesttir; Amiral Ders Temel taşır", () => {
    expect(ACADEMY_COURSE_LEVELS).toEqual(["Temel", "Orta", "İleri"]);
    for (const row of ACADEMY_COURSE_SEEDS) {
      expect(isAcademyCourseLevel(row.level), row.slug).toBe(true);
      expect(row.level).toBe(
        ACADEMY_COURSE_LEVEL_BY_SLUG[row.slug as keyof typeof ACADEMY_COURSE_LEVEL_BY_SLUG],
      );
      expect(academyCourseLevelBySlug(row.slug)).toBe(row.level);
    }
    expect(academyCourseLevelBySlug(PILOT)).toBe("Temel");
    expect(readFileSync(join(ROOT, "lib", "academy", "course-level.ts"), "utf8")).toContain(
      "resolveAcademySeedMoney",
    );
    expect(readFileSync(join(ROOT, "lib", "academy", "schemas.ts"), "utf8")).toContain(
      "level: z.string().trim().min(1).max(64).optional()",
    );
  });
});

describe("03.20 insani diyalog ve terim parantezleri", () => {
  it("Amiral Ders Koray/Maya DialogueTurn ve Türkçe terim parantezi taşır", { timeout: 20_000 }, () => {
    for (const lesson of curriculumForCourseSlug(PILOT)) {
      expect(lesson.body, lesson.key).not.toMatch(/Koray:/);
      expect(lesson.body, lesson.key).toContain("Hoş geldiniz. Bu bölümde");
      expect(lesson.body, lesson.key).toMatch(/\([^)]{4,80}\)/u);
      const spoken = spokenAcademyLessonBody(lesson.body);
      expect(spoken, lesson.key).toMatch(/: /u);
    }
  });

  it("kanonik terimler parantezli Türkçe taşır; TTS uzman yönergesi durur", () => {
    expect(ACADEMY_TERM.RELEASE).toContain("Hak Devri");
    expect(ACADEMY_TERM.UNSET).toContain("Henüz Tanımlanmamış");
    expect(ACADEMY_TERM.DOD).toContain("Kabul Kriteri");
    expect(ACADEMY_TERM.FAIL_SAFE).toContain("Hata Anında Emniyet");
    for (const value of Object.values(ACADEMY_TERM)) {
      expect(value).toMatch(/^.+ \(.+\)$/u);
    }
    const listen = readFileSync(join(ROOT, "archived", "lib", "academy-studio", "lesson-listen.ts"), "utf8");
    expect(listen).toContain("nefes molası");
    expect(listen).toContain("samimi bir uzman");
    expect(listen).toContain("{instructorName}");
    expect(listen).toContain("çayını yudumlarken");
    expect(listen).toContain("üç noktalarda");
    const python = curriculumForCourseSlug(PILOT)
      .map((lesson) => lesson.body)
      .join("\n");
    expect(python).toContain("Fail-closed");
    expect(python).toContain("kargo");
  });
});

describe("03.21 eğitmen Maya ve doğaçlama anlatım", () => {
  it("Amiral Ders ansiklopedik kip taşımaz; DialogueTurn doludur", () => {
    const encyclopedic = /yapılmaktadır|olacaktır|edilmektedir|edilecektir/u;
    for (const lesson of curriculumForCourseSlug(PILOT)) {
      expect(lesson.body, lesson.key).not.toMatch(encyclopedic);
      expect(lesson.body, lesson.key).not.toMatch(/Koray:/);
      expect(lesson.body, lesson.key).toContain("Hoş geldiniz. Bu bölümde");
    }
  });
});

describe("03.22 tek ses tek isim", () => {
  it("altı TTS kodu yedi Türkçe isme mühürlüdür; ikinci isim yok", () => {
    expect(ACADEMY_INSTRUCTOR_TTS_VOICES).toEqual([
      "Zephyr",
      "Erinome",
      "Puck",
      "Fenrir",
      "Aoede",
      "Leda",
      "Callirrhoe",
    ]);
    expect(ACADEMY_TTS_VOICES).toEqual([
      "Zephyr",
      "Erinome",
      "Puck",
      "Fenrir",
      "Aoede",
      "Leda",
      "Callirrhoe",
      "Charon",
      "Enceladus",
      "Iapetus",
      "Orus",
    ]);
    expect(ACADEMY_INSTRUCTORS_BY_VOICE.Zephyr.name).toBe("Deniz");
    expect(ACADEMY_INSTRUCTORS_BY_VOICE.Erinome.name).toBe("Maya");
    expect(ACADEMY_INSTRUCTORS_BY_VOICE.Puck.name).toBe("Aras");
    expect(ACADEMY_INSTRUCTORS_BY_VOICE.Fenrir.name).toBe("Boran");
    expect(ACADEMY_INSTRUCTORS_BY_VOICE.Aoede.name).toBe("Selin");
    expect(ACADEMY_INSTRUCTORS_BY_VOICE.Leda.name).toBe("Ece");
    expect(ACADEMY_INSTRUCTORS_BY_VOICE.Callirrhoe.name).toBe("Gözde");
    const names = ACADEMY_INSTRUCTOR_TTS_VOICES.map(
      (voice) => ACADEMY_INSTRUCTORS_BY_VOICE[voice].name,
    );
    expect(new Set(names).size).toBe(7);
    for (const voice of ACADEMY_INSTRUCTOR_TTS_VOICES) {
      expect(ACADEMY_INSTRUCTORS_BY_VOICE[voice].voice).toBe(voice);
    }
    const fingerprints = ACADEMY_CAST_REGISTRY.map((binding) =>
      JSON.stringify(binding.voiceFingerprint),
    );
    expect(new Set(fingerprints).size).toBe(ACADEMY_CAST_REGISTRY.length);
    expect(ACADEMY_TTS_VOICES).toContain(ACADEMY_ANNOUNCER.voice);
  });

  it("Amiral Ders beş perdeyle açılır; stüdyo sarmalayıcı gövdeye sızmaz", () => {
    expect(ACADEMY_COURSE_SEEDS.map((row) => row.slug)).toEqual([...ACADEMY_GROWTH_SKU_SLUGS]);
    expect(ACADEMY_MODERATOR.name).toBe("Koray");
    expect(ACADEMY_MODERATOR.voice).toBe("Charon");
    expect(ACADEMY_SECURITY_MODERATOR.name).toBe("Can");
    expect(ACADEMY_SECURITY_MODERATOR.voice).toBe("Enceladus");
    expect(ACADEMY_SECURITY_MODERATOR.speechRate).toBe(1);
    expect(academyModeratorForSlug("security-temel").name).toBe("Can");
    expect(academyInstructorBySlug("security-temel").name).toBe("Ece");
    expect(academyInstructorBySlug("security-temel").voice).toBe("Leda");
    expect(academyModeratorForSlug("security-orta").name).toBe("Can");
    expect(academyInstructorBySlug("security-orta").name).toBe("Ece");
    expect(academyInstructorBySlug("security-orta").voice).toBe("Leda");
    expect(academyModeratorForSlug("security-ileri").name).toBe("Can");
    expect(academyInstructorBySlug("security-ileri").name).toBe("Ece");
    expect(academyInstructorBySlug("security-ileri").voice).toBe("Leda");
    expect(ACADEMY_DIGITAL_SKILLS_MODERATOR.name).toBe("Tarık");
    expect(ACADEMY_DIGITAL_SKILLS_MODERATOR.voice).toBe("Iapetus");
    expect(ACADEMY_DIGITAL_SKILLS_MODERATOR.speechRate).toBe(1);
    expect(academyModeratorForSlug("excel-masterclass").name).toBe("Tarık");
    expect(academyInstructorBySlug("excel-masterclass").name).toBe("Gözde");
    expect(academyInstructorBySlug("excel-masterclass").voice).toBe("Callirrhoe");
    expect(academyModeratorForSlug("google-ads-masterclass").name).toBe("Tarık");
    expect(academyInstructorBySlug("google-ads-masterclass").name).toBe("Gözde");
    expect(academyModeratorForSlug("meta-ads-masterclass").name).toBe("Tarık");
    expect(academyInstructorBySlug("meta-ads-masterclass").name).toBe("Gözde");
    expect(academyModeratorForSlug("eticaret-masterclass").name).toBe("Tarık");
    expect(academyInstructorBySlug("eticaret-masterclass").name).toBe("Gözde");
    expect(academyInstructorBySlug("eticaret-masterclass").voice).toBe("Callirrhoe");
    expect(academyModeratorForSlug("canva-masterclass").name).toBe("Tarık");
    expect(academyInstructorBySlug("canva-masterclass").name).toBe("Gözde");
    expect(academyModeratorForSlug("linkedin-masterclass").name).toBe("Tarık");
    expect(academyInstructorBySlug("linkedin-masterclass").name).toBe("Gözde");
    expect(ACADEMY_CAST_REGISTRY.find((row) => row.canonicalCharacterName === "Gözde")?.speechRate).toBe(
      0.93,
    );
    expect(ACADEMY_CAST_REGISTRY.find((row) => row.canonicalCharacterName === "Tarık")?.speechRate).toBe(
      1,
    );
    expect(ACADEMY_ANNOUNCER.voice).toBe("Orus");
    expect(ACADEMY_MODERATOR.role).toBe("Stüdyo Sunucusu / Moderatör");
    const instructor = academyInstructorBySlug(PILOT);
    expect(instructor.name).toBe("Maya");
    expect(instructor.voice).toBe("Erinome");
    expect(ACADEMY_CAST_REGISTRY.find((row) => row.canonicalCharacterName === "Maya")?.speechRate).toBe(
      0.93,
    );
    expect(ACADEMY_CAST_REGISTRY.find((row) => row.canonicalCharacterName === "Koray")?.speechRate).toBe(
      1,
    );
    expect(ACADEMY_CAST_REGISTRY.find((row) => row.canonicalCharacterName === "Ece")?.speechRate).toBe(
      0.93,
    );
    expect(ACADEMY_CAST_REGISTRY.find((row) => row.canonicalCharacterName === "Can")?.speechRate).toBe(
      1,
    );
    const lessons = curriculumForCourseSlug(PILOT);
    const first = lessons[0]!;
    const last = lessons[lessons.length - 1]!;
    expect(first.body).toContain(ACADEMY_FIVE_ACT_HEADINGS.warmup);
    expect(first.body).toContain(ACADEMY_FIVE_ACT_HEADINGS.problem);
    expect(first.body).not.toContain(ACADEMY_MODERATOR_OPEN_LEAD);
    expect(first.body).not.toContain(ACADEMY_INSTRUCTOR_HANDBACK_LEAD);
    expect(last.body).not.toContain(ACADEMY_MODERATOR_CLOSE_TAIL);
    expect(last.body).toContain("Sınavda seni");
    for (const lesson of lessons) {
      expect(lesson.body, lesson.key).not.toContain(ACADEMY_MODERATOR_OPEN_LEAD);
      expect(lesson.body, lesson.key).not.toContain(ACADEMY_MODERATOR_CLOSE_TAIL);
      if (lesson.order === 1) {
        expect(lesson.body, lesson.key).toContain(instructor.greetingLead);
        expect(lesson.body, lesson.key).toContain(instructor.bio);
      } else {
        expect(lesson.body, lesson.key).not.toContain(instructor.greetingLead);
      }
      for (const other of Object.values(ACADEMY_INSTRUCTORS_BY_VOICE)) {
        if (other.name === instructor.name) {
          continue;
        }
        expect(lesson.body, lesson.key).not.toContain(`ben ${other.name}`);
      }
    }
  });
});

describe("03.26 beş perde ders akışı", () => {
  it("ilk ders DialogueTurn taşır; stüdyo sarmalayıcı yok, 1:1 ses durur", () => {
    const instructor = academyInstructorBySlug(PILOT);
    const lessons = curriculumForCourseSlug(PILOT);
    const first = lessons[0]!;
    const last = lessons[lessons.length - 1]!;
    const seed = ACADEMY_COURSE_SEEDS.find((row) => row.slug === PILOT)!;
    expect(first.body).not.toContain("Mikrofonu kendisine bırakıyorum...");
    expect(first.body).not.toContain("Teşekkürler Koray, herkese merhaba");
    expect(first.body).not.toContain("Sağ ol, hoş bulduk");
    expect(last.body).not.toContain(
      `${academyInstructorDativeHonorific(instructor)} bu anlatım için çok teşekkür ediyoruz`,
    );
    expect(last.body).not.toContain("mühürlü sertifikasyon");
    expect(first.body).toContain("kargo");
    expect(first.body).toContain(ACADEMY_FIVE_ACT_HEADINGS.warmup);
    const spokenFirst = spokenAcademyLessonBody(first.body);
    expect(spokenFirst).toContain("kargo");
    expect(spokenFirst).not.toMatch(/\bKoray\b/);
    expect(spokenFirst).not.toContain(ACADEMY_MODERATOR_OPEN_LEAD);
    const spokenLast = spokenAcademyLessonBody(last.body);
    expect(spokenLast).not.toContain(ACADEMY_MODERATOR_CLOSE_TAIL);
    expect(seed.slug).toBe(PILOT);
  });
});

describe("03.27 stüdyo sarmalayıcı gövdeye karışmaz", () => {
  it("Amiral Ders gövdesi stüdyo pası taşımaz; beş perde ve DialogueTurn durur", () => {
    const instructor = academyInstructorBySlug(PILOT);
    const honorific = academyInstructorHonorific(instructor);
    const ask = academyModeratorAskForSlug(PILOT);
    for (const lesson of curriculumForCourseSlug(PILOT)) {
      expect(lesson.body, lesson.key).not.toContain(ask);
      expect(lesson.body, lesson.key).not.toContain(ACADEMY_INSTRUCTOR_ASK_REPLY);
      expect(lesson.body, lesson.key).not.toContain(academyModeratorVakaAskForSlug(PILOT));
      expect(lesson.body, lesson.key).not.toContain(academyModeratorParamsAskForSlug(PILOT));
      expect(lesson.body, lesson.key).toContain(ACADEMY_FIVE_ACT_HEADINGS.warmup);
      expect(lesson.body, lesson.key).not.toMatch(/Koray:/);
      expect(lesson.body, lesson.key).toContain("Hoş geldiniz. Bu bölümde");
      const spoken = spokenAcademyLessonBody(lesson.body);
      expect(spoken, lesson.key).not.toContain(expandAcademySpokenAbbreviations(ask));
      expect(spoken, lesson.key).not.toContain(ACADEMY_INSTRUCTOR_ASK_REPLY);
    }
    expect(honorific).toBe("Maya Hanım");
  });
});

describe("03.28 hedef kitle pusulası ve saha dili", () => {
  it("müfredat gövdesi pusula fabrikasını import etmez; iğne field-voice dosyasında durur", () => {
    const sealed = readFileSync(join(ROOT, "lib", "academy", "curriculum.ts"), "utf8");
    expect(sealed).not.toContain("@/lib/academy/field-voice");
    expect(sealed).not.toContain("@/archived/lib/academy-studio/field-voice");
    expect(sealed).not.toContain("academyAudienceCompassForLesson");
    expect(readFileSync(join(ROOT, "archived", "lib", "academy-studio", "field-voice.ts"), "utf8")).toContain(
      "ACADEMY_COMPASS_ANCHOR",
    );
    for (const lesson of curriculumForCourseSlug(PILOT)) {
      expect(lesson.body, lesson.key).not.toContain(ACADEMY_COMPASS_ANCHOR);
      expect(lesson.body, lesson.key).not.toMatch(OPERATING_ROOM);
      const spoken = spokenAcademyLessonBody(lesson.body);
      expect(spoken, lesson.key).not.toContain(ACADEMY_COMPASS_ANCHOR);
      expect(spoken, lesson.key).not.toMatch(OPERATING_ROOM);
    }
    expect(academyModeratorAskForSlug(PILOT)).toBe(
      "Maya Hanım, tırnaksız print yazınca ne kırılır ve nasıl düzeltirsin?",
    );
    expect(curriculumForCourseSlug(PILOT)[0]!.body).not.toContain(
      "tırnaksız print yazınca ne kırılır ve nasıl düzeltirsin?",
    );
  });

  it("tohum ve stüdyo kaynakları ameliyathane kalıbı taşımaz", () => {
    const files = readdirSync(CURRICULA_DIR).filter((name) => name.endsWith(".ts"));
    for (const name of files) {
      const source = readFileSync(join(CURRICULA_DIR, name), "utf8");
      expect(source, name).not.toMatch(OPERATING_ROOM);
    }
    expect(readFileSync(join(ROOT, "lib", "academy", "instructors.ts"), "utf8")).not.toMatch(
      OPERATING_ROOM,
    );
    expect(readFileSync(join(ROOT, "archived", "lib", "academy-studio", "field-voice.ts"), "utf8")).not.toMatch(
      OPERATING_ROOM,
    );
    expect(readFileSync(join(ROOT, "lib", "academy", "curriculum.ts"), "utf8")).not.toMatch(
      OPERATING_ROOM,
    );
    expect(readFileSync(join(ROOT, "lib", "academy", "lesson-practice.ts"), "utf8")).not.toMatch(
      OPERATING_ROOM,
    );
    expect(readFileSync(join(ROOT, "lib", "academy", "exam-pools.ts"), "utf8")).not.toMatch(
      OPERATING_ROOM,
    );
    expect(readFileSync(join(ROOT, "lib", "academy", "seed.ts"), "utf8")).not.toMatch(OPERATING_ROOM);
  });
});

describe("03.29 temel pedagoji ve Koray teyidi", () => {
  it("Amiral Ders sıfırdan tıklama ve tam Türkçe tarif taşır", () => {
    const python = curriculumForCourseSlug(PILOT)
      .map((lesson) => lesson.body)
      .join("\n");
    expect(python).toContain("kargo");
    expect(python).toContain("Fail-closed");
    expect(academyCourseLevelBySlug(PILOT)).toBe("Temel");
  });

  it("Koray özeti ders gövdesine sızmaz; honorifik yalnız stüdyo katmanında durur", () => {
    const instructor = academyInstructorBySlug(PILOT);
    const honorific = academyInstructorHonorific(instructor);
    const dative = academyInstructorDativeHonorific(instructor);
    const lessons = curriculumForCourseSlug(PILOT);
    expect(lessons[0]!.body).not.toContain(ACADEMY_MODERATOR_SUMMARY_LEAD);
    expect(lessons[0]!.body).not.toContain(`alanında uzman ${honorific}`);
    expect(lessons[lessons.length - 1]!.body).not.toContain(
      `${dative} bu anlatım için çok teşekkür ediyoruz`,
    );
    for (const lesson of lessons.slice(1)) {
      expect(lesson.body, lesson.key).not.toContain(ACADEMY_MODERATOR_SUMMARY_LEAD);
      expect(lesson.body, lesson.key).not.toContain(`Doğru mu anlıyorum ${honorific}?`);
      expect(lesson.body, lesson.key).not.toContain("Evet Koray Bey, doğru anlıyorsunuz");
    }
  });
});

describe("03.30 doğal dil temizliği", () => {
  it("Koray özeti doğal konuşma kalıbı taşır; kilitlemiştik yoktur", () => {
    expect(ACADEMY_MODERATOR_SUMMARY_RECAP).toBe("geçen bölümde şu konuyu detaylıca ele almıştık");
    const recap = academyModeratorRecapForLesson(PILOT, "python-temel-2");
    expect(recap).toContain(ACADEMY_MODERATOR_SUMMARY_LEAD);
    expect(recap).toContain("detaylıca ele almıştık");
    expect(recap).not.toContain("kilitlemiştik");
    expect(recap).toContain("Doğru mu anlıyorum Maya Hanım?");
    expect(recap).toContain("İçimden şunu geçirdim");
    const recapNext = academyModeratorRecapForLesson(PILOT, "python-temel-3");
    expect(recapNext).toContain("Kafamda oturdu");
    expect(recapNext).not.toBe(recap);
  });

  it("Python Amiral Ders konuşulan gövdesinde Fail-Closed ve kargo analojisi taşır", () => {
    const spoken = curriculumForCourseSlug(PILOT)
      .map((lesson) => spokenAcademyLessonBody(lesson.body))
      .join("\n");
    expect(spoken).toContain("Hata Anında Kapalı");
    expect(curriculumForCourseSlug(PILOT)[1]!.body).not.toContain("İçimden şunu geçirdim");
  });

  it("Amiral Ders konuşulan gövdesi mekanik kilitlemek taşımaz", () => {
    for (const lesson of curriculumForCourseSlug(PILOT)) {
      const spoken = spokenAcademyLessonBody(lesson.body);
      expect(spoken, lesson.key).not.toMatch(MECHANICAL_LOCK);
      expect(lesson.body, lesson.key).not.toMatch(MECHANICAL_LOCK);
    }
  });

  it("stüdyo ve tohum kaynakları kilitlemiştik / kilitliyoruz taşımaz", () => {
    const files = [
      "lib/academy/instructors.ts",
      "archived/lib/academy-studio/mentor-voice.ts",
      "archived/lib/academy-studio/field-voice.ts",
      "lib/academy/lesson-practice.ts",
      "lib/academy/exam-pools.ts",
      "lib/academy/curriculum.ts",
    ];
    for (const relative of files) {
      const source = readFileSync(join(ROOT, relative), "utf8");
      expect(source, relative).not.toMatch(MECHANICAL_LOCK);
    }
    const curricula = readdirSync(CURRICULA_DIR).filter((name) => name.endsWith(".ts"));
    for (const name of curricula) {
      const source = readFileSync(join(CURRICULA_DIR, name), "utf8");
      expect(source, name).not.toMatch(MECHANICAL_LOCK);
    }
  });

  it("18 diyalog SKU tek eğitmen 4 perde taşır; Koray/Maya tiyatrosu ve yasak benzetme yok", () => {
    const slugs = [
      "ai-agent-temel",
      "ai-agent-orta",
      "ai-agent-ileri",
      "python-temel",
      "python-orta",
      "python-ileri",
      "fullstack-temel",
      "fullstack-orta",
      "fullstack-ileri",
      "security-temel",
      "security-orta",
      "security-ileri",
      "excel-masterclass",
      "google-ads-masterclass",
      "meta-ads-masterclass",
      "eticaret-masterclass",
      "canva-masterclass",
      "linkedin-masterclass",
    ];
    for (const slug of slugs) {
      for (const lesson of curriculumForCourseSlug(slug)) {
        const spoken = spokenAcademyLessonBody(lesson.body);
        if (lesson.key === "ai-agent-temel-2") {
          expect(lesson.body, lesson.key).toContain("Merhaba arkadaşlar, ben Maya");
          expect(lesson.body, lesson.key).toContain("Bu bölümde Prompt Mühendisliği");
        } else if (lesson.key === "ai-agent-temel-3") {
          expect(lesson.body, lesson.key).toContain("Merhaba arkadaşlar, ben Maya");
          expect(lesson.body, lesson.key).toContain("Bu bölümde Araç Kullanımı");
        } else if (lesson.key === "ai-agent-temel-4") {
          expect(lesson.body, lesson.key).toContain("Merhaba sevgili arkadaşlar, ben Maya");
          expect(lesson.body, lesson.key).toContain("Bu bölümde Hafıza Mimarisi");
        } else if (lesson.key === "ai-agent-temel-5") {
          expect(lesson.body, lesson.key).toContain("Selamlar arkadaşlar, ben Maya");
          expect(lesson.body, lesson.key).toContain("Bu bölümde, ajanın kendi kendine mantık yürütüp");
        } else if (lesson.key === "ai-agent-temel-6") {
          expect(lesson.body, lesson.key).toContain("Selamlar arkadaşlar, ben Maya");
          expect(lesson.body, lesson.key).toContain("Geldik Modül 1'in büyük finaline");
        } else if (lesson.key.startsWith("ai-agent-orta-")) {
          expect(lesson.body, lesson.key).toContain("Selamlar! Ben Maya");
          expect(lesson.body, lesson.key).not.toContain("Hoş geldiniz. Bu bölümde");
        } else {
          expect(lesson.body, lesson.key).toContain("Hoş geldiniz. Bu bölümde");
        }
        if (lesson.key === "ai-agent-temel-3") {
          expect(lesson.body, lesson.key).toContain("halüsinasyon");
          expect(lesson.body, lesson.key).toContain("Ekrandaki kod bloğunda gördüğünüz bu yapılar");
        } else if (lesson.key === "ai-agent-temel-4") {
          expect(lesson.body, lesson.key).toContain("balık hafızalıdır");
          expect(lesson.body, lesson.key).toContain("Ekrandaki kod bloğunda gördüğünüz üzere");
        } else if (lesson.key === "ai-agent-temel-5") {
          expect(lesson.body, lesson.key).toContain("Düşün, Eyleme Geç ve Gözlemle");
          expect(lesson.body, lesson.key).toContain("Ekrandaki kod bloğunda gördüğünüz bu yapı");
        } else if (lesson.key === "ai-agent-temel-6") {
          expect(lesson.body, lesson.key).toContain("Ekrandaki kod bloğunda bu 5 dersin");
          expect(lesson.body, lesson.key).toContain("hava_durumu_getir");
        } else if (lesson.key.startsWith("ai-agent-orta-")) {
          expect(lesson.body, lesson.key).toContain("Ekrandaki kod bloğunda");
        } else {
          expect(lesson.body, lesson.key).toContain("Geleneksel yapılarda");
          expect(lesson.body, lesson.key).toContain("Ekrandaki kod bloğunda gördüğünüz üzere");
        }
        if (lesson.key === "ai-agent-temel-6" || lesson.key === "ai-agent-orta-6") {
          expect(lesson.body, lesson.key).toContain("Tebrikler!");
        } else {
          expect(lesson.body, lesson.key).toContain("Bu dersle");
        }
        expect(spoken, lesson.key).not.toMatch(/\bKoray\b/);
        expect(spoken, lesson.key).not.toMatch(/çağrı merkez|serbest şiir/iu);
        expect(spoken, lesson.key).not.toContain("Teşekkürler Koray");
        expect(spoken, lesson.key).not.toContain("Dışarı bakamıyor");
        expect(lesson.body, lesson.key).not.toMatch(/^Koray:/mu);
        expect(lesson.body, lesson.key).not.toMatch(/^Maya:/mu);
      }
    }
  });
});
