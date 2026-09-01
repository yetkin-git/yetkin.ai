/**
 * Tohum müfredat — CMS yok. Gövde yalnız SETTLED satın alma sonrası API/sayfada açılır.
 * Müze `[slug]/curriculum` kopyalanmaz. Ders metinleri `lib/academy/curricula/`.
 * Pedagoji / pusula / diyagram fabrikası bu dosyadan import edilmez.
 */

import { CURRICULUM_DRAFTS_BY_SLUG, type AcademyLessonDraft } from "@/lib/academy/curricula";
import { computeAcademyCurriculumSeal } from "@/lib/academy/exam";
import {
  composeCompactLessonBody,
  composeFiveActDialogueLessonBody,
  composePedagogicalLessonBody,
} from "@/lib/academy/lesson-body";
import {
  attachAcademyLessonVisuals,
  type AcademyLessonMediaFields,
  type AcademyLessonVisualCopy,
} from "@/lib/academy/lesson-media";
import { LESSON_PRACTICE } from "@/lib/academy/lesson-practice";
import { ACADEMY_GROWTH_LESSON_VISUALS } from "@/lib/academy/growth-visuals";

export type AcademyLessonSeed = {
  key: string;
  order: number;
  title: string;
  body: string;
} & AcademyLessonMediaFields;

/** Vitrin özeti — gövde yok. SETTLED kilidi yalnız body için durur. */
export type AcademyCurriculumOutlineItem = {
  order: number;
  title: string;
};

const LESSON_VISUALS: Record<string, AcademyLessonVisualCopy> = {
  "ai-agent-temel-1": {
    diagramKey: "agt-llm-vs-agent",
    diagramTitle: "LLM ve ajan",
    diagramCaption: "Konuşmak iş bitirmek değildir.",
    videoTitle: "Araç yoksa sus",
    videoCaption: "Uydurma derece yok.",
    durationSec: 7,
  },
  "ai-agent-temel-2": {
    diagramKey: "agt-json-schema",
    diagramTitle: "JSON kapısı",
    diagramCaption: "Parse edilmezse araç yok.",
    videoTitle: "Şema alanları",
    videoCaption: "Neredeyse JSON fiş değil.",
    durationSec: 6,
  },
  "ai-agent-temel-3": {
    diagramKey: "agt-tool-dispatch",
    diagramTitle: "Araç raftı",
    diagramCaption: "Kayıt dışı ad durur.",
    videoTitle: "araç çağrısı",
    videoCaption: "Bilinmeyen ad düşer.",
    durationSec: 7,
  },
  "ai-agent-temel-4": {
    diagramKey: "agt-memory-window",
    diagramTitle: "Pencere ve raf",
    diagramCaption: "Tavan dolunca eski düşer.",
    videoTitle: "Eşik kapısı",
    videoCaption: "Sahte gömme yok.",
    durationSec: 6,
  },
  "ai-agent-temel-5": {
    diagramKey: "agt-react-loop",
    diagramTitle: "ReAct ritmi",
    diagramCaption: "Düşün, eyle, gözle.",
    videoTitle: "Tur tavanı",
    videoCaption: "Kör savuruş yok.",
    durationSec: 7,
  },
  "ai-agent-temel-6": {
    diagramKey: "agt-weather-notes",
    diagramTitle: "Hava ve not ajanı",
    diagramCaption: "Şema → araç → dur.",
    videoTitle: "Mini proje",
    videoCaption: "Sahte ağ yok.",
    durationSec: 8,
  },
  "ai-agent-orta-1": {
    diagramKey: "ai-embed-space",
    diagramTitle: "Gömme uzayı",
    diagramCaption: "Metin vektöre, benzerlik skora.",
    videoTitle: "Getir sonra üret",
    videoCaption: "Boş kanıt uydurma yok.",
    durationSec: 7,
  },
  "ai-agent-orta-2": {
    diagramKey: "ai-chroma-store",
    diagramTitle: "Vektör kutu",
    diagramCaption: "Koleksiyon yoksa sorgu durur.",
    videoTitle: "Eşik kapısı",
    videoCaption: "top-k gürültü değildir.",
    durationSec: 6,
  },
  "ai-agent-orta-3": {
    diagramKey: "ai-crew-roles",
    diagramTitle: "İki rol",
    diagramCaption: "Kütüphaneci getirir, yazar bakar.",
    videoTitle: "Pas sözleşmesi",
    videoCaption: "Boş el rapor basmaz.",
    durationSec: 7,
  },
  "ai-agent-orta-4": {
    diagramKey: "ai-state-memory",
    diagramTitle: "Ortak defter",
    diagramCaption: "Anahtar yoksa pas kördür.",
    videoTitle: "Tek yazar",
    videoCaption: "kanit yalnız araştırmacıda.",
    durationSec: 6,
  },
  "ai-agent-orta-5": {
    diagramKey: "ai-human-gate",
    diagramTitle: "İnsan kapısı",
    diagramCaption: "Kaşesiz riskli araç yok.",
    videoTitle: "Beklemede",
    videoCaption: "Sessiz True iade değildir.",
    durationSec: 7,
  },
  "ai-agent-orta-6": {
    diagramKey: "ai-multi-capstone",
    diagramTitle: "Çift ajan gişesi",
    diagramCaption: "Getir, yaz, defter, kaşe.",
    videoTitle: "Mini ekip",
    videoCaption: "Sahte arşiv yok.",
    durationSec: 8,
  },
  "ai-agent-ileri-1": {
    diagramKey: "ai-langgraph",
    diagramTitle: "Durum grafiği",
    diagramCaption: "Düğüm, kenar, END.",
    videoTitle: "Tur tavanı",
    videoCaption: "Kayıp kenar durur.",
    durationSec: 5,
  },
  "ai-agent-ileri-2": {
    diagramKey: "ai-agent-loop",
    diagramTitle: "Yansıma döngüsü",
    diagramCaption: "Kırık, bak, yedek, dur.",
    videoTitle: "Tek onarım",
    videoCaption: "Sonsuz retry yok.",
    durationSec: 7,
  },
  "ai-agent-ileri-3": {
    diagramKey: "ai-multi-handshake",
    diagramTitle: "Korkuluk kapısı",
    diagramCaption: "Liste, tarama, kilit.",
    videoTitle: "Varsayılan red",
    videoCaption: "Yetkisiz eylem durur.",
    durationSec: 7,
  },
  "ai-agent-ileri-4": {
    diagramKey: "ai-agent-eval",
    diagramTitle: "Eval terazisi",
    diagramCaption: "Altın küme, baraj.",
    videoTitle: "Kırık satır",
    videoCaption: "PII günlük yok.",
    durationSec: 5,
  },
  "ai-agent-ileri-5": {
    diagramKey: "ai-agent-observe",
    diagramTitle: "Kapı ve kuyruk",
    diagramCaption: "kabul, işçi, iz.",
    videoTitle: "Rota yok",
    videoCaption: "200 uydurma yok.",
    durationSec: 6,
  },
  "ai-agent-ileri-6": {
    diagramKey: "ai-tool-call",
    diagramTitle: "Üretim odası",
    diagramCaption: "Tara, yürüt, kuyruk.",
    videoTitle: "Mini oda",
    videoCaption: "Sahte ağ yok.",
    durationSec: 6,
  },
  "python-temel-1": {
    diagramKey: "py-vars-types",
    diagramTitle: "Değişken ve tip",
    diagramCaption: "Etiket + tip + değer sözleşmesi.",
    videoTitle: "type() ile kontrol",
    videoCaption: "Metin tutar çarpılmaz.",
    durationSec: 7,
  },
  "python-temel-2": {
    diagramKey: "py-control-flow",
    diagramTitle: "Kontrol akışı",
    diagramCaption: "Koşul doğruysa dal çalışır.",
    videoTitle: "if / else",
    videoCaption: "= atama, == karşılaştırma.",
    durationSec: 5,
  },
  "python-temel-3": {
    diagramKey: "py-loops",
    diagramTitle: "Döngüler",
    diagramCaption: "Tekrarlayan işi bir kez yaz.",
    videoTitle: "for + range",
    videoCaption: "Toplamı biriktir.",
    durationSec: 6,
  },
  "python-temel-4": {
    diagramKey: "py-functions",
    diagramTitle: "Fonksiyonlar",
    diagramCaption: "def alır, return verir.",
    videoTitle: "Yeniden kullanım",
    videoCaption: "Kuruş dönüşümü örnek.",
    durationSec: 7,
  },
  "python-temel-5": {
    diagramKey: "py-select-filter",
    diagramTitle: "Liste ve sözlük",
    diagramCaption: "Sıra sıfırdan; anahtar etikettir.",
    videoTitle: "sepet[-1] ve .get",
    videoCaption: "Sınır ve yokluk dürüst kalır.",
    durationSec: 6,
  },
  "python-temel-6": {
    diagramKey: "py-interactive",
    diagramTitle: "Etkileşimli betik",
    diagramCaption: "Girdi doğrulanır, sonuç yazılır.",
    videoTitle: "try / except",
    videoCaption: "«üç» yazılınca çökmez.",
    durationSec: 8,
  },
  "python-orta-1": {
    diagramKey: "py-oop-class",
    diagramTitle: "Sınıf ve örnek",
    diagramCaption: "Kalıp ortak, tepsi ayrı durur.",
    videoTitle: "class / instance",
    videoCaption: "Sınıf listesi sızdırmaz.",
    durationSec: 7,
  },
  "python-orta-2": {
    diagramKey: "py-oop-inherit",
    diagramTitle: "Miras ve kapsül",
    diagramCaption: "Taban taşır, kasa kapalı durur.",
    videoTitle: "super ve property",
    videoCaption: "Eksi stok yazılmaz.",
    durationSec: 6,
  },
  "python-orta-3": {
    diagramKey: "py-json-file",
    diagramTitle: "JSON mühürü",
    diagramCaption: "Parse edilmezse yazılmaz.",
    videoTitle: "loads / dumps",
    videoCaption: "utf-8 ve atomik yazım.",
    durationSec: 7,
  },
  "python-orta-4": {
    diagramKey: "py-try-except",
    diagramTitle: "İsimli hata",
    diagramCaption: "Dar except, zincir kopmaz.",
    videoTitle: "KayitHatasi",
    videoCaption: "Yutmak ihanettir.",
    durationSec: 5,
  },
  "python-orta-5": {
    diagramKey: "py-http-get",
    diagramTitle: "HTTP damgası",
    diagramCaption: "200 değilse kayıt durur.",
    videoTitle: "requests.get",
    videoCaption: "timeout ve gövde tipi.",
    durationSec: 6,
  },
  "python-orta-6": {
    diagramKey: "py-api-seal",
    diagramTitle: "REST mühürü",
    diagramCaption: "çek → doğrula → bas.",
    videoTitle: "id kapısı",
    videoCaption: "Eksik alan diske inmez.",
    durationSec: 8,
  },
  "python-ileri-1": {
    diagramKey: "py-decorator-wrap",
    diagramTitle: "Bezetici damgası",
    diagramCaption: "Kapı dışarıda, iş içeride.",
    videoTitle: "wraps ve kapı",
    videoCaption: "Eksi adet içeri girmez.",
    durationSec: 7,
  },
  "python-ileri-2": {
    diagramKey: "py-generator-flow",
    diagramTitle: "Üreteç akışı",
    diagramCaption: "Fiş fiş; yığın yok.",
    videoTitle: "yield kapısı",
    videoCaption: "id yoksa akış durur.",
    durationSec: 6,
  },
  "python-ileri-3": {
    diagramKey: "py-asyncio-loop",
    diagramTitle: "Olay döngüsü",
    diagramCaption: "await gişeyi boşaltır.",
    videoTitle: "gather",
    videoCaption: "500 yarım sonuç basmaz.",
    durationSec: 7,
  },
  "python-ileri-4": {
    diagramKey: "py-gil-process",
    diagramTitle: "Thread ve süreç",
    diagramCaption: "I/O thread, CPU process.",
    videoTitle: "GIL tezgâhı",
    videoCaption: "Paylaşılan sayaç korunur.",
    durationSec: 6,
  },
  "python-ileri-5": {
    diagramKey: "py-metaclass-gate",
    diagramTitle: "Klişe kapısı",
    diagramCaption: "Sınıf doğmadan tarama.",
    videoTitle: "type.__new__",
    videoCaption: "dogrula yoksa kalıp yok.",
    durationSec: 6,
  },
  "python-ileri-6": {
    diagramKey: "py-async-engine",
    diagramTitle: "İşleme motoru",
    diagramCaption: "çek → doğrula → akıt.",
    videoTitle: "gather + yield",
    videoCaption: "500 tartıya inmez.",
    durationSec: 8,
  },
  ...ACADEMY_GROWTH_LESSON_VISUALS,
};

function emptyLessonMedia<T extends { key: string }>(lesson: T): T & AcademyLessonMediaFields {
  return {
    ...lesson,
    diagrams: [],
    microVideos: [],
  };
}

function draftProse(lesson: AcademyLessonDraft): string {
  return [lesson.intro, lesson.development, lesson.conclusion]
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .join("\n\n");
}

/** Alıştırma çiti — fabrika challenge yok; taslaktaki Vaka veya son paragraf. */
function draftExercise(lesson: AcademyLessonDraft): string {
  const haystack = [lesson.development, lesson.conclusion, lesson.intro].join("\n");
  const vaka = haystack.match(/Vaka:\s*([^\n]+)/u);
  if (vaka?.[1]?.trim()) {
    return vaka[1].trim();
  }
  const paras = draftProse(lesson)
    .split(/\n\n+/u)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  return paras.at(-1) || lesson.title;
}

function sealCurriculumLessons(
  _slug: string,
  lessons: readonly AcademyLessonDraft[],
): readonly AcademyLessonSeed[] {
  return lessons.map((lesson) => {
    const visual = LESSON_VISUALS[lesson.key];
    const practice = LESSON_PRACTICE[lesson.key];
    if (lesson.format === "compact") {
      const sealed = {
        key: lesson.key,
        order: lesson.order,
        title: lesson.title,
        body: composeCompactLessonBody(draftProse(lesson), practice ?? null),
      };
      return visual ? attachAcademyLessonVisuals(sealed, visual) : emptyLessonMedia(sealed);
    }
    if (!visual) {
      throw new Error(`Akademi görsel yuvası yok: ${lesson.key}`);
    }
    if (!practice) {
      throw new Error(`Akademi pratik yuvası yok: ${lesson.key}`);
    }
    if (lesson.dialogue && lesson.quiz && lesson.quiz.length >= 3) {
      return attachAcademyLessonVisuals(
        {
          key: lesson.key,
          order: lesson.order,
          title: lesson.title,
          body: composeFiveActDialogueLessonBody(lesson.dialogue, lesson.quiz, practice),
        },
        visual,
      );
    }
    if (!lesson.intro.trim() || !lesson.development.trim() || !lesson.conclusion.trim()) {
      throw new Error(`Akademi pedagoji perdesi yok: ${lesson.key}`);
    }
    return attachAcademyLessonVisuals(
      {
        key: lesson.key,
        order: lesson.order,
        title: lesson.title,
        body: composePedagogicalLessonBody(
          {
            intro: lesson.intro,
            development: lesson.development,
            conclusion: lesson.conclusion,
            exercise: draftExercise(lesson),
          },
          practice,
        ),
      },
      visual,
    );
  });
}

const LESSONS_BY_SLUG: Record<string, readonly AcademyLessonSeed[]> = Object.fromEntries(
  Object.entries(CURRICULUM_DRAFTS_BY_SLUG).map(([slug, drafts]) => [
    slug,
    sealCurriculumLessons(slug, drafts),
  ]),
);

export function curriculumForCourseSlug(slug: string): readonly AcademyLessonSeed[] {
  return LESSONS_BY_SLUG[slug] ?? [];
}

export function curriculumOutlineForCourseSlug(
  slug: string,
): readonly AcademyCurriculumOutlineItem[] {
  return curriculumForCourseSlug(slug).map((lesson) => ({
    order: lesson.order,
    title: lesson.title,
  }));
}

export function academyLessonByKey(
  slug: string,
  lessonKey: string,
): AcademyLessonSeed | null {
  return curriculumForCourseSlug(slug).find((lesson) => lesson.key === lessonKey) ?? null;
}

export function isAcademyCurriculumComplete(
  slug: string,
  completedKeys: readonly string[],
): boolean {
  const lessons = curriculumForCourseSlug(slug);
  if (lessons.length === 0) {
    return false;
  }
  const done = new Set(completedKeys);
  return lessons.every((lesson) => done.has(lesson.key));
}

export function nextAcademyLessonKey(
  slug: string,
  completedKeys: readonly string[],
): string | null {
  const done = new Set(completedKeys);
  const next = curriculumForCourseSlug(slug).find((lesson) => !done.has(lesson.key));
  return next?.key ?? null;
}

/** Tohum sırası — hash bu diziyi yer. Tamamlama tarihi sırası kullanılmaz. */
export function orderedAcademyLessonKeys(slug: string): readonly string[] {
  return curriculumForCourseSlug(slug).map((lesson) => lesson.key);
}

/**
 * Tamamlanan anahtarları müfredat sırasına indirger.
 * SKU dışı veya atlanan anahtar mühüre girmez.
 */
export function orderedCompletedAcademyLessonKeys(
  slug: string,
  completedKeys: readonly string[],
): string[] {
  const done = new Set(completedKeys);
  return orderedAcademyLessonKeys(slug).filter((key) => done.has(key));
}

export function academyCurriculumSealForSlug(slug: string): string | null {
  const keys = orderedAcademyLessonKeys(slug);
  if (keys.length === 0) {
    return null;
  }
  return computeAcademyCurriculumSeal(keys);
}

/**
 * Müfredat %100 değilse mühür basılmaz. Tamamlanmış küme tohum sırasına indirgenir.
 */
export function academyCurriculumSealFromCompletions(
  slug: string,
  completedKeys: readonly string[],
): string | null {
  if (!isAcademyCurriculumComplete(slug, completedKeys)) {
    return null;
  }
  return academyCurriculumSealForSlug(slug);
}
