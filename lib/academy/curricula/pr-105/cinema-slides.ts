import { PR105_LESSON_KEYS, type Pr105LessonKey } from "./spoken-body";

/**
 * PR-105 16:9 slayt istemleri.
 * Görsel fırın bu dosyada çağrılmaz. Negatif kelime listesi yazılmaz.
 */

export type Pr105CinemaSlide = {
  cueIndex: number;
  section: string;
  headline: string;
  imagePrompt: string;
  aspectRatio: "16:9";
};

export type Pr105CinemaLesson = {
  title: string;
  slides: readonly Pr105CinemaSlide[];
};

const ASPECT = "16:9" as const;

function slide(
  cueIndex: number,
  section: string,
  headline: string,
  imagePrompt: string,
): Pr105CinemaSlide {
  return {
    cueIndex,
    section,
    headline,
    imagePrompt,
    aspectRatio: ASPECT,
  };
}

export const PR105_CINEMA_LESSONS: Record<Pr105LessonKey, Pr105CinemaLesson> = {
  "05_prompt_practice-1": {
    title: "İstem Mimarisinin Anatomisi",
    slides: [
      slide(
        1,
        "Oryantasyon",
        "NERDEYİZ",
        "A clean 16:9 photograph of a quiet wooden desk at morning light, open notebook with four empty ruled bands, closed laptop, ceramic cup, shallow depth of field, photoreal.",
      ),
      slide(
        2,
        "Saha",
        "DAĞILAN İSTEK",
        "A clean 16:9 photograph of a shop counter with a single delivery note and a blank reply card, warm lamp, plain paper, photoreal.",
      ),
      slide(
        3,
        "Dört parça",
        "ROL GÖREV BİÇİM KISIT",
        "A clean 16:9 photograph of four labeled index cards in a row on linen, each card one short blank line, soft daylight, photoreal.",
      ),
      slide(
        4,
        "Şablon",
        "İLK ŞABLON",
        "A clean 16:9 photograph of a single cream template card centered on a desk, four short ruled rows, brass paperweight, photoreal.",
      ),
      slide(
        5,
        "Özet",
        "CEBE KOY",
        "A clean 16:9 photograph of a hand placing one template card into a cloth notebook pocket, warm evening light, photoreal.",
      ),
    ],
  },
  "05_prompt_practice-2": {
    title: "Rol, Bağlam ve Biçim",
    slides: [
      slide(
        1,
        "Giriş",
        "AYNI KARGO İKİ MESAJ",
        "A clean 16:9 photograph of four index cards already on a desk, a fifth blank card waiting beside them, morning light, photoreal.",
      ),
      slide(
        2,
        "İki alıcı",
        "MÜŞTERİ VE EKİP",
        "A clean 16:9 photograph of two envelopes side by side, one pale blue and one kraft, each with a short blank card on top, photoreal.",
      ),
      slide(
        3,
        "Bağlam",
        "ÜÇ GERÇEK SATIR",
        "A clean 16:9 photograph of a narrow notepad showing three handwritten lines and empty space below, desk lamp, photoreal.",
      ),
      slide(
        4,
        "Şablon",
        "ALICI BELLİ",
        "A clean 16:9 photograph of a template card with five short ruled rows, a blue envelope at the left edge, photoreal.",
      ),
      slide(
        5,
        "Özet",
        "KARIŞMAYAN CÜMLE",
        "A clean 16:9 photograph of two finished cards placed in separate trays, one tray marked with a small dot, photoreal.",
      ),
    ],
  },
  "05_prompt_practice-3": {
    title: "Zincirleme Düşünce",
    slides: [
      slide(
        1,
        "Giriş",
        "ÜÇ ŞİKÂYET KÂĞIDI",
        "A clean 16:9 photograph of a context card clipped above an empty answer sheet, soft window light, photoreal.",
      ),
      slide(
        2,
        "Adımlar",
        "ÖNCE YOL",
        "A clean 16:9 photograph of three numbered stones in a straight line on a desk leading to a blank card, photoreal.",
      ),
      slide(
        3,
        "Kaynak adımı",
        "NUMARAYA BAĞLI",
        "A clean 16:9 photograph of three short complaint slips numbered one two three, a pencil beside them, photoreal.",
      ),
      slide(
        4,
        "Şablon",
        "ADIM SONRA SIRA",
        "A clean 16:9 photograph of a page split into an upper list and a lower three-line order, cream paper, photoreal.",
      ),
      slide(
        5,
        "Özet",
        "KAYNAKSIZ ADIM SİLİNİR",
        "A clean 16:9 photograph of one crossed paper strip set aside from three kept strips, calm desk, photoreal.",
      ),
    ],
  },
  "05_prompt_practice-4": {
    title: "Kaynak Sınırı",
    slides: [
      slide(
        1,
        "Giriş",
        "KUTUDA OLMAYAN VAAT",
        "A clean 16:9 photograph of a short source note pinned at the top of a blotter, empty summary space below, photoreal.",
      ),
      slide(
        2,
        "Not",
        "YALNIZ BU SATIRLAR",
        "A clean 16:9 photograph of a small product card listing cloth color size and count, neutral background, photoreal.",
      ),
      slide(
        3,
        "Kapı",
        "NOTTA YOKSA YOK",
        "A clean 16:9 photograph of a summary card aligned edge to edge with its source note, extra loose slip left outside the frame of the pair, photoreal.",
      ),
      slide(
        4,
        "Şablon",
        "ÖZET VE ÇEVİRİ",
        "A clean 16:9 photograph of two matching four-line cards, one above the other, same length, linen desk, photoreal.",
      ),
      slide(
        5,
        "Özet",
        "EŞLEŞMEYEN CÜMLE",
        "A clean 16:9 photograph of four checked lines and one removed line resting on a side tray, photoreal.",
      ),
    ],
  },
  "05_prompt_practice-5": {
    title: "Tablo ve Plan",
    slides: [
      slide(
        1,
        "Giriş",
        "TAHTADAKİ FAZLA SATIR",
        "A clean 16:9 photograph of a locked source card beside an empty grid sheet, daylight, photoreal.",
      ),
      slide(
        2,
        "Üç iş",
        "SATIR SAYISI BAŞTAN",
        "A clean 16:9 photograph of a three-row grid drawn on cream paper, columns left open, ruler at the edge, photoreal.",
      ),
      slide(
        3,
        "Aynı işler",
        "TABLO VE PLAN",
        "A clean 16:9 photograph of a small grid and a three-item plan card sharing the same three job names, side by side, photoreal.",
      ),
      slide(
        4,
        "Şablon",
        "ÜÇ KOLON ÜÇ SATIR",
        "A clean 16:9 photograph of a tidy table card with three columns and three rows, a short plan underneath, photoreal.",
      ),
      slide(
        5,
        "Özet",
        "FAZLA SATIR DIŞARIDA",
        "A clean 16:9 photograph of a three-row table with one extra strip placed off the table onto the desk, photoreal.",
      ),
    ],
  },
  "05_prompt_practice-6": {
    title: "Günlük İstem Seti",
    slides: [
      slide(
        1,
        "Giriş",
        "PAZARTESİ SABAHI",
        "A clean 16:9 photograph of a finished three-row table card at the front of a desk, morning light, photoreal.",
      ),
      slide(
        2,
        "Üç kart",
        "YAZIŞMA ÖZET TABLO",
        "A clean 16:9 photograph of three upright cards in a row on linen, equal size, soft shadow, photoreal.",
      ),
      slide(
        3,
        "Kapı",
        "ÜÇ SORU",
        "A clean 16:9 photograph of three small check boxes drawn on a single card, pencil beside the card, photoreal.",
      ),
      slide(
        4,
        "Set",
        "SABAH KALIBI",
        "A clean 16:9 photograph of a cloth folder holding exactly three cards, folder half open, photoreal.",
      ),
      slide(
        5,
        "Kapanış",
        "YETMİŞ BARAJI",
        "A clean 16:9 photograph of the closed cloth folder centered on a clear desk at evening light, photoreal.",
      ),
    ],
  },
};

const NEGATIVE_PROMPT_LIST = /\b(?:no |without |negative prompt)\b/iu;

function assertPr105CinemaSlides(): void {
  for (const key of PR105_LESSON_KEYS) {
    const lesson = PR105_CINEMA_LESSONS[key];
    if (lesson.slides.length !== 5) {
      throw new Error(`PR-105 slayt sayısı 5 değil: ${key}`);
    }
    lesson.slides.forEach((item, index) => {
      if (item.cueIndex !== index + 1) {
        throw new Error(`PR-105 slayt sırası bozuldu: ${key}`);
      }
      if (item.aspectRatio !== "16:9" || !item.imagePrompt.includes("16:9")) {
        throw new Error(`PR-105 slayt 16:9 değil: ${key} ${item.cueIndex}`);
      }
      if (NEGATIVE_PROMPT_LIST.test(item.imagePrompt)) {
        throw new Error(`PR-105 slayt isteminde negatif liste var: ${key} ${item.cueIndex}`);
      }
    });
  }
}

assertPr105CinemaSlides();
