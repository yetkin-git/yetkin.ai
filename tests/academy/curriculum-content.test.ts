import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ACADEMY_COURSE_SEEDS } from "@/lib/academy/seed";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import {
  ACADEMY_LESSON_ACT_HEADINGS,
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
import { ACADEMY_MENTOR_BRIDGES, ACADEMY_TERM } from "@/archived/lib/academy-studio/term-glossary";
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
  ACADEMY_INSTRUCTOR_ASK_REPLY,
  academyInstructorHonorific,
  academyInstructorDativeHonorific,
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
import { ACADEMY_PILOT_SKU_LESSON_COUNT, ACADEMY_PILOT_SKU_SLUG } from "@/lib/academy/pilot-sku";

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
  it("Amiral Ders ders metni vaka, parametre ve tavan taşır; mock cümle yok", { timeout: 20_000 }, () => {
    const keys = new Set<string>();
    expect(ACADEMY_COURSE_SEEDS).toHaveLength(4);
    expect(ACADEMY_COURSE_SEEDS[0]?.slug).toBe(PILOT);
    const lessons = curriculumForCourseSlug(PILOT);
    expect(lessons).toHaveLength(ACADEMY_PILOT_SKU_LESSON_COUNT);
    for (const lesson of lessons) {
      keys.add(lesson.key);
      expect(lesson.title.length, lesson.key).toBeGreaterThan(24);
      expect(lesson.body.length, lesson.key).toBeGreaterThan(900);
      expect(lesson.body.length, lesson.key).toBeLessThanOrEqual(ACADEMY_LESSON_LISTEN_MAX_CHARS);
      expect(lesson.body, lesson.key).toMatch(/Vaka:/);
      expect(academyLessonHasPedagogy(lesson.body), lesson.key).toBe(true);
      expect(lesson.body, lesson.key).toContain(ACADEMY_LESSON_ACT_HEADINGS.giris);
      expect(lesson.body, lesson.key).toContain(ACADEMY_LESSON_ACT_HEADINGS.syntax);
      expect(lesson.body, lesson.key).toContain(ACADEMY_LESSON_ACT_HEADINGS.mantik);
      expect(lesson.body, lesson.key).toContain(ACADEMY_LESSON_ACT_HEADINGS.uygulama);
      expect(lesson.body, lesson.key).toContain("```alistirma");
      expect(lesson.body, lesson.key).toMatch(/Bir sonraki bölümde seni |Sınavda seni /);
      const spoken = spokenAcademyLessonBody(lesson.body);
      expect(spoken.length, lesson.key).toBeGreaterThan(400);
      expect(spoken, lesson.key).toContain(ACADEMY_LESSON_ACT_HEADINGS.giris);
      expect(spoken, lesson.key).toContain(ACADEMY_LESSON_ACT_HEADINGS.syntax);
      expect(spoken, lesson.key).toContain(ACADEMY_LESSON_ACT_HEADINGS.mantik);
      expect(spoken, lesson.key).toContain(ACADEMY_LESSON_ACT_HEADINGS.uygulama);
      expect(spoken, lesson.key).not.toContain("Giriş. Problem.");
      expect(spoken, lesson.key).not.toContain("Gelişme. Uygulama.");
      expect(spoken, lesson.key).not.toContain("Sonuç. Toparlama.");
      expect(spoken, lesson.key).not.toContain("Giriş / Problem");
      expect(spoken, lesson.key).not.toContain("Gelişme / Uygulama");
      expect(spoken, lesson.key).not.toContain("Sonuç / Toparlama");
      for (const phrase of MOCK_PHRASES) {
        expect(lesson.title, `${lesson.key} title`).not.toContain(phrase);
        expect(lesson.body, `${lesson.key} body`).not.toContain(phrase);
      }
    }
    expect(keys.size).toBe(ACADEMY_PILOT_SKU_LESSON_COUNT);
  });

  it("tohum klasörü ve curriculum.ts mock başlık taşımaz", () => {
    const files = readdirSync(CURRICULA_DIR).filter((name) => name.endsWith(".ts"));
    expect(files.sort()).toEqual([
      "ai-temel.ts",
      "fullstack-temel.ts",
      "growth-draft.ts",
      "index.ts",
      "lesson-index.ts",
      "python-temel.ts",
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
  it("Amiral Ders mentor bağlacı ve Türkçe terim parantezi taşır", { timeout: 20_000 }, () => {
    const seenBridges = new Set<string>();
    for (const lesson of curriculumForCourseSlug(PILOT)) {
      const hits = ACADEMY_MENTOR_BRIDGES.filter((bridge) => lesson.body.includes(bridge));
      expect(hits.length, lesson.key).toBeGreaterThanOrEqual(2);
      for (const bridge of hits) {
        seenBridges.add(bridge);
      }
      expect(lesson.body, lesson.key).toMatch(/\([^)]{4,80}\)/u);
      const spoken = spokenAcademyLessonBody(lesson.body);
      expect(spoken, lesson.key).toMatch(/: /u);
    }
    expect(seenBridges.size).toBeGreaterThanOrEqual(2);
    expect(seenBridges.size).toBeLessThanOrEqual(ACADEMY_MENTOR_BRIDGES.length);
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
    expect(python).toContain("print");
    expect(python).toContain("interpreter");
  });
});

describe("03.21 eğitmen Maya ve doğaçlama anlatım", () => {
  it("Amiral Ders ansiklopedik kip taşımaz; doğaçlama bağlaç kümesi doludur", () => {
    const encyclopedic = /yapılmaktadır|olacaktır|edilmektedir|edilecektir/u;
    const seenBridges = new Set<string>();
    for (const lesson of curriculumForCourseSlug(PILOT)) {
      expect(lesson.body, lesson.key).not.toMatch(encyclopedic);
      const hits = ACADEMY_MENTOR_BRIDGES.filter((bridge) => lesson.body.includes(bridge));
      expect(hits.length, lesson.key).toBeGreaterThanOrEqual(2);
      for (const bridge of hits) {
        seenBridges.add(bridge);
      }
    }
    expect(seenBridges.size).toBeGreaterThanOrEqual(2);
  });
});

describe("03.22 tek ses tek isim", () => {
  it("beş TTS kodu beş Türkçe isme mühürlüdür; ikinci isim yok", () => {
    expect(ACADEMY_INSTRUCTOR_TTS_VOICES).toEqual([
      "Zephyr",
      "Kore",
      "Puck",
      "Fenrir",
      "Aoede",
    ]);
    expect(ACADEMY_TTS_VOICES).toEqual([
      "Zephyr",
      "Kore",
      "Puck",
      "Fenrir",
      "Aoede",
      "Charon",
      "Orus",
    ]);
    expect(ACADEMY_INSTRUCTORS_BY_VOICE.Zephyr.name).toBe("Deniz");
    expect(ACADEMY_INSTRUCTORS_BY_VOICE.Kore.name).toBe("Maya");
    expect(ACADEMY_INSTRUCTORS_BY_VOICE.Puck.name).toBe("Aras");
    expect(ACADEMY_INSTRUCTORS_BY_VOICE.Fenrir.name).toBe("Boran");
    expect(ACADEMY_INSTRUCTORS_BY_VOICE.Aoede.name).toBe("Selin");
    const names = ACADEMY_INSTRUCTOR_TTS_VOICES.map(
      (voice) => ACADEMY_INSTRUCTORS_BY_VOICE[voice].name,
    );
    expect(new Set(names).size).toBe(5);
    for (const voice of ACADEMY_INSTRUCTOR_TTS_VOICES) {
      expect(ACADEMY_INSTRUCTORS_BY_VOICE[voice].voice).toBe(voice);
    }
    const fingerprints = ACADEMY_CAST_REGISTRY.map((binding) =>
      JSON.stringify(binding.voiceFingerprint),
    );
    expect(new Set(fingerprints).size).toBe(ACADEMY_CAST_REGISTRY.length);
    expect(ACADEMY_TTS_VOICES).toContain(ACADEMY_ANNOUNCER.voice);
  });

  it("Amiral Ders dört bölümle açılır; stüdyo repliği gövdeye sızmaz", () => {
    expect(ACADEMY_COURSE_SEEDS).toHaveLength(4);
    expect(ACADEMY_MODERATOR.name).toBe("Koray");
    expect(ACADEMY_MODERATOR.voice).toBe("Charon");
    expect(ACADEMY_ANNOUNCER.voice).toBe("Orus");
    expect(ACADEMY_MODERATOR.role).toBe("Stüdyo Sunucusu / Moderatör");
    const instructor = academyInstructorBySlug(PILOT);
    expect(instructor.name).toBe("Maya");
    expect(instructor.voice).toBe("Kore");
    const lessons = curriculumForCourseSlug(PILOT);
    const first = lessons[0]!;
    const last = lessons[lessons.length - 1]!;
    expect(first.body).toContain(ACADEMY_LESSON_ACT_HEADINGS.giris);
    expect(first.body).toContain(ACADEMY_LESSON_ACT_HEADINGS.syntax);
    expect(first.body).not.toContain(ACADEMY_MODERATOR_OPEN_LEAD);
    expect(first.body).not.toContain(ACADEMY_INSTRUCTOR_HANDBACK_LEAD);
    expect(last.body).not.toContain(ACADEMY_MODERATOR_CLOSE_TAIL);
    expect(last.body).toContain("Sınavda seni");
    for (const lesson of lessons) {
      expect(lesson.body, lesson.key).not.toContain(ACADEMY_MODERATOR_OPEN_LEAD);
      expect(lesson.body, lesson.key).not.toContain(ACADEMY_MODERATOR_CLOSE_TAIL);
      expect(lesson.body, lesson.key).not.toContain(instructor.greetingLead);
      for (const other of Object.values(ACADEMY_INSTRUCTORS_BY_VOICE)) {
        if (other.name === instructor.name) {
          continue;
        }
        expect(lesson.body, lesson.key).not.toContain(`ben ${other.name}`);
      }
    }
  });
});

describe("03.26 dört bölüm ders akışı", () => {
  it("ilk ders Koray/Maya repliği taşımaz; dört bölüm ve 1:1 ses durur", () => {
    const instructor = academyInstructorBySlug(PILOT);
    const lessons = curriculumForCourseSlug(PILOT);
    const first = lessons[0]!;
    const last = lessons[lessons.length - 1]!;
    const seed = ACADEMY_COURSE_SEEDS[0]!;
    expect(first.body).not.toContain("Mikrofonu kendisine bırakıyorum...");
    expect(first.body).not.toContain("Teşekkürler Koray, herkese merhaba");
    expect(first.body).not.toContain("Sağ ol, hoş bulduk");
    expect(last.body).not.toContain(
      `${academyInstructorDativeHonorific(instructor)} bu anlatım için çok teşekkür ediyoruz`,
    );
    expect(last.body).not.toContain("mühürlü sertifikasyon");
    expect(first.body).toContain("print");
    expect(first.body).toContain(ACADEMY_LESSON_ACT_HEADINGS.giris);
    const spokenFirst = spokenAcademyLessonBody(first.body);
    expect(spokenFirst).toContain("print");
    expect(spokenFirst).not.toContain(ACADEMY_MODERATOR_OPEN_LEAD);
    const spokenLast = spokenAcademyLessonBody(last.body);
    expect(spokenLast).not.toContain(ACADEMY_MODERATOR_CLOSE_TAIL);
    expect(seed.slug).toBe(PILOT);
  });
});

describe("03.27 stüdyo ara soru gövdeye karışmaz", () => {
  it("Amiral Ders gövdesi Koray pası taşımaz; dört bölüm durur", () => {
    const instructor = academyInstructorBySlug(PILOT);
    const honorific = academyInstructorHonorific(instructor);
    const ask = academyModeratorAskForSlug(PILOT);
    for (const lesson of curriculumForCourseSlug(PILOT)) {
      expect(lesson.body, lesson.key).not.toContain(ask);
      expect(lesson.body, lesson.key).not.toContain(ACADEMY_INSTRUCTOR_ASK_REPLY);
      expect(lesson.body, lesson.key).not.toContain(academyModeratorVakaAskForSlug(PILOT));
      expect(lesson.body, lesson.key).not.toContain(academyModeratorParamsAskForSlug(PILOT));
      expect(lesson.body, lesson.key).toContain(ACADEMY_LESSON_ACT_HEADINGS.giris);
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
    expect(python).toContain("print");
    expect(python).toContain("Merhaba, Yetkin");
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

  it("Python Amiral Ders konuşulan gövdesinde kısaltmayı açılımıyla taşır", () => {
    const spoken = curriculumForCourseSlug(PILOT)
      .map((lesson) => spokenAcademyLessonBody(lesson.body))
      .join("\n");
    expect(spoken).toContain("Yapılandırılmış Sorgu Dili");
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
});
