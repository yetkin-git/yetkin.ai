import { SM103_LESSON_KEYS, type Sm103LessonKey } from "./spoken-body";

/**
 * SM-103 16:9 slayt istemleri.
 * Görsel fırın bu dosyada çağrılmaz. Negatif kelime listesi yazılmaz.
 */

export type Sm103CinemaSlide = {
  cueIndex: number;
  section: string;
  headline: string;
  imagePrompt: string;
  aspectRatio: "16:9";
};

export type Sm103CinemaLesson = {
  title: string;
  slides: readonly Sm103CinemaSlide[];
};

const ASPECT = "16:9" as const;

function slide(
  cueIndex: number,
  section: string,
  headline: string,
  imagePrompt: string,
): Sm103CinemaSlide {
  return {
    cueIndex,
    section,
    headline,
    imagePrompt,
    aspectRatio: ASPECT,
  };
}

export const SM103_CINEMA_LESSONS: Record<Sm103LessonKey, Sm103CinemaLesson> = {
  "03_social_media_ai-1": {
    title: "Fikirden Künyeye",
    slides: [
      slide(
        1,
        "Oryantasyon",
        "NEREDEYİZ",
        "A clean 16:9 photograph of a small ceramic studio table at morning light, a phone leaning on a stack of linen, a notebook open to a blank page, soft window glow, photoreal.",
      ),
      slide(
        2,
        "Saha",
        "AYNI PARLAK KARE",
        "A clean 16:9 photograph of a phone showing a row of glossy identical mug photos next to one real matte green mug with a small kiln mark, warm desk lamp, photoreal.",
      ),
      slide(
        3,
        "Künye",
        "ÜÇ SATIR",
        "A clean 16:9 photograph of a cream index card with three short handwritten lines under a pencil, matte green mug blurred behind, photoreal.",
      ),
      slide(
        4,
        "Değişmezler",
        "BU KUPA NEYSE O",
        "A clean 16:9 photograph of a matte sage green handmade mug of three hundred milliliters beside a small ruler and a color swatch card, plain linen, photoreal.",
      ),
      slide(
        5,
        "Özet",
        "SEÇEN SENSİN",
        "A clean 16:9 photograph of three small sketch cards laid in a row on a wooden table, one card slightly lifted by a hand, daylight, photoreal.",
      ),
    ],
  },
  "03_social_media_ai-2": {
    title: "Işık, Kadraj ve Yüzey",
    slides: [
      slide(
        1,
        "Giriş",
        "KÜNYE ELİNDE",
        "A clean 16:9 photograph of a cream card held beside a matte green mug on a light oak table, morning light from the left, photoreal.",
      ),
      slide(
        2,
        "Beş çekmece",
        "KONU ZEMİN IŞIK KADRAJ HİS",
        "A clean 16:9 photograph of a small wooden chest of five labeled drawers, one drawer pulled open, soft daylight, photoreal.",
      ),
      slide(
        3,
        "Işık",
        "IŞIK SOLDAN",
        "A clean 16:9 close photograph of a matte green ceramic mug with a long soft shadow falling to the right, window light from the left, photoreal.",
      ),
      slide(
        4,
        "Kontrol",
        "RENK ŞEKİL YAZI",
        "A clean 16:9 photograph of a phone screen beside the real matte green mug on a table, a hand comparing the two, photoreal.",
      ),
      slide(
        5,
        "Özet",
        "ÜÇ DENEME",
        "A clean 16:9 photograph of three phone screens in a row showing slightly different mug photos, the middle one tilted forward, photoreal.",
      ),
    ],
  },
  "03_social_media_ai-3": {
    title: "Aynı Dünyadan Beş Kare",
    slides: [
      slide(
        1,
        "Giriş",
        "BEŞ FARKLI DÜKKÂN",
        "A clean 16:9 photograph of five printed mug photos pinned in a loose scattered line on a corkboard, each with a different background, photoreal.",
      ),
      slide(
        2,
        "Stil cümlesi",
        "BİR KEZ YAZ",
        "A clean 16:9 photograph of one cream card with a short paragraph of handwriting pinned at the top of a mood board, photoreal.",
      ),
      slide(
        3,
        "Palet",
        "ÜÇ RENK",
        "A clean 16:9 photograph of three paint swatches in sage green, cream and warm oak brown laid on a linen cloth, photoreal.",
      ),
      slide(
        4,
        "Set",
        "KAPAK DETAY ÖLÇEK",
        "A clean 16:9 photograph of five small matching prints in a tidy row on a wooden table, each showing a different view of the same matte green mug, photoreal.",
      ),
      slide(
        5,
        "Özet",
        "TEK DÜNYA",
        "A clean 16:9 photograph of five matching prints in a row, softly out of focus so only the shared color and light read as one scene, warm light, photoreal.",
      ),
    ],
  },
  "03_social_media_ai-4": {
    title: "Üç Saniyelik Kanca",
    slides: [
      slide(
        1,
        "Giriş",
        "KIPIRDATMADAN ÖNCE",
        "A clean 16:9 photograph of a phone propped upright on a table showing a still vertical image of a matte green mug, soft morning light, photoreal.",
      ),
      slide(
        2,
        "Üç bölüm",
        "KANCA ORTA KAPANIŞ",
        "A clean 16:9 photograph of three small paper strips in a row on a desk, numbered one two three, a pencil beside them, photoreal.",
      ),
      slide(
        3,
        "Tek hareket",
        "BİR KLİP BİR HAREKET",
        "A clean 16:9 photograph of a matte green mug with a thin line of steam rising and a hand blurred slightly in the foreground, photoreal.",
      ),
      slide(
        4,
        "Kontrol",
        "KULP SAYISI",
        "A clean 16:9 photograph of a phone paused on a mug video frame with a single handle clearly visible, a thumb at the edge of the screen, photoreal.",
      ),
      slide(
        5,
        "Özet",
        "ON BEŞ SANİYE",
        "A clean 16:9 photograph of three short film strips laid end to end on a desk beside a phone, evening light, photoreal.",
      ),
    ],
  },
  "03_social_media_ai-5": {
    title: "Söz, Altyazı ve Müzik",
    slides: [
      slide(
        1,
        "Giriş",
        "SESSİZ İZLEYEN",
        "A clean 16:9 photograph of a person's hands holding a phone on a tram handrail with the sound muted, a short video playing, photoreal.",
      ),
      slide(
        2,
        "Ekran yazısı",
        "ÜÇ EKRAN ÜÇ CÜMLE",
        "A clean 16:9 photograph of a phone showing a mug video with one short line of large clean text, a second phone beside it with another line, photoreal.",
      ),
      slide(
        3,
        "Açıklama",
        "KUTU YAZAR SEN KONTROL",
        "A clean 16:9 photograph of a laptop with three short caption drafts on screen and a pencil resting across a printed copy beside it, photoreal.",
      ),
      slide(
        4,
        "Vaat",
        "STOK FİYAT SENDE",
        "A clean 16:9 photograph of a printed caption with one line crossed out by hand using a pencil, a small price tag turned face down, photoreal.",
      ),
      slide(
        5,
        "Özet",
        "SÖZ SENİN",
        "A clean 16:9 photograph of a phone with a finished video ready to post, headphones lying beside it, warm evening light, photoreal.",
      ),
    ],
  },
  "03_social_media_ai-6": {
    title: "Haftalık Akış ve Dürüst Çizgi",
    slides: [
      slide(
        1,
        "Giriş",
        "PARÇALAR HAZIR",
        "A clean 16:9 photograph of a desk with a printed set of five mug prints, a phone, and a small notebook, quiet evening light, photoreal.",
      ),
      slide(
        2,
        "Hafta",
        "BEŞ GÖNDERİ",
        "A clean 16:9 photograph of a wall calendar page with five small prints pinned across five weekdays, photoreal.",
      ),
      slide(
        3,
        "Beş soru",
        "YAYINDAN ÖNCE",
        "A clean 16:9 photograph of an index card with five small check boxes, a pencil resting on the card, a phone face up beside it, photoreal.",
      ),
      slide(
        4,
        "Dürüstlük",
        "OLDUĞU GİBİ",
        "A clean 16:9 photograph of a real matte green mug placed next to its printed photo on a table, both aligned and equal, soft daylight, photoreal.",
      ),
      slide(
        5,
        "Kapanış",
        "BİR ŞEY DEĞİŞTİR",
        "A clean 16:9 photograph of a closed notebook with a single sticky note on it, the studio table cleared, warm late afternoon light, photoreal.",
      ),
    ],
  },
};

const NEGATIVE_PROMPT_LIST = /\b(?:no |without |negative prompt)\b/iu;

function assertSm103CinemaSlides(): void {
  for (const key of SM103_LESSON_KEYS) {
    const lesson = SM103_CINEMA_LESSONS[key];
    if (lesson.slides.length !== 5) {
      throw new Error(`SM-103 slayt sayısı 5 değil: ${key}`);
    }
    lesson.slides.forEach((item, index) => {
      if (item.cueIndex !== index + 1) {
        throw new Error(`SM-103 slayt sırası bozuldu: ${key}`);
      }
      if (item.aspectRatio !== "16:9" || !item.imagePrompt.includes("16:9")) {
        throw new Error(`SM-103 slayt 16:9 değil: ${key} ${item.cueIndex}`);
      }
      if (NEGATIVE_PROMPT_LIST.test(item.imagePrompt)) {
        throw new Error(`SM-103 slayt isteminde negatif liste var: ${key} ${item.cueIndex}`);
      }
    });
  }
}

assertSm103CinemaSlides();
