import { BOT104_LESSON_KEYS, type Bot104LessonKey } from "./spoken-body";

/**
 * BOT-104 16:9 slayt istemleri.
 * Görsel fırın bu dosyada çağrılmaz. Negatif kelime listesi yazılmaz.
 */

export type Bot104CinemaSlide = {
  cueIndex: number;
  section: string;
  headline: string;
  imagePrompt: string;
  aspectRatio: "16:9";
};

export type Bot104CinemaLesson = {
  title: string;
  slides: readonly Bot104CinemaSlide[];
};

const ASPECT = "16:9" as const;

function slide(
  cueIndex: number,
  section: string,
  headline: string,
  imagePrompt: string,
): Bot104CinemaSlide {
  return {
    cueIndex,
    section,
    headline,
    imagePrompt,
    aspectRatio: ASPECT,
  };
}

export const BOT104_CINEMA_LESSONS: Record<Bot104LessonKey, Bot104CinemaLesson> = {
  "04_chatbot_nocode-1": {
    title: "Kaçan Mesaj",
    slides: [
      slide(
        1,
        "Oryantasyon",
        "NEREDEYİZ",
        "A clean 16:9 photograph of a small bicycle repair shop counter in the evening, a phone lying face up with a long list of unread messages, a bike wheel leaning on the wall, warm lamp light, photoreal.",
      ),
      slide(
        2,
        "Saha",
        "KAÇAN MESAJ",
        "A clean 16:9 photograph of a phone on a workshop bench showing a chat screen where the last message is hours old, grease-stained hands resting beside it, photoreal.",
      ),
      slide(
        3,
        "Devir",
        "BOT BİLİR İNSAN KARAR VERİR",
        "A clean 16:9 photograph of two trays on a desk, one holding short printed answer cards and one holding a single handwritten note marked for the owner, photoreal.",
      ),
      slide(
        4,
        "Soru defteri",
        "AYNI BEŞ SORU",
        "A clean 16:9 photograph of an open paper notebook with five short question lines and small colored sticky tabs, a pencil on the page, photoreal.",
      ),
      slide(
        5,
        "Özet",
        "SORU DEFTERİ HAZIR",
        "A clean 16:9 photograph of a closed notebook with a pencil across its cover on a tidy workshop desk, soft evening light, photoreal.",
      ),
    ],
  },
  "04_chatbot_nocode-2": {
    title: "Karşılama, Soru ve Randevu",
    slides: [
      slide(
        1,
        "Giriş",
        "DEFTER ELİNDE",
        "A clean 16:9 photograph of a notebook open beside a laptop on a workshop desk, a sketch of boxes and arrows drawn on a sheet of paper, daylight, photoreal.",
      ),
      slide(
        2,
        "Karşılama",
        "TEK SORU TEK ADIM",
        "A clean 16:9 photograph of a laptop screen showing a simple flow with a greeting box leading to three button boxes, shallow depth of field, photoreal.",
      ),
      slide(
        3,
        "Düğmeler",
        "SERBEST YAZI YOK",
        "A clean 16:9 close photograph of a phone screen with a chat message offering three large tappable reply buttons, a thumb above the screen, photoreal.",
      ),
      slide(
        4,
        "Randevu",
        "AD GÜN ONAY",
        "A clean 16:9 photograph of a paper calendar page with one day circled in pencil and a small card with a name written on it, photoreal.",
      ),
      slide(
        5,
        "Özet",
        "HER DAL KAPANIR",
        "A clean 16:9 photograph of a hand-drawn flow on paper where every arrow ends in a small drawn square, a pencil resting beside it, photoreal.",
      ),
    ],
  },
  "04_chatbot_nocode-3": {
    title: "WhatsApp Bağlantısı",
    slides: [
      slide(
        1,
        "Giriş",
        "AKIŞ HAZIR SIRA HATTA",
        "A clean 16:9 photograph of a laptop showing a finished flow beside a phone with a messaging app open, a notepad with a phone number written on it, photoreal.",
      ),
      slide(
        2,
        "Hesap",
        "ÖNCE HESAP",
        "A clean 16:9 photograph of a desk with a small business registration paper, a laptop with a business settings page open, and a coffee cup, photoreal.",
      ),
      slide(
        3,
        "Numara",
        "AYRI NUMARA",
        "A clean 16:9 photograph of two phones side by side on a desk, one with a plain SIM card tray open, a sticky note labeled for the shop line, photoreal.",
      ),
      slide(
        4,
        "Pencere",
        "YİRMİ DÖRT SAAT",
        "A clean 16:9 photograph of a wall clock showing evening time next to a phone with an incoming message notification, photoreal.",
      ),
      slide(
        5,
        "Özet",
        "ÖNCE KENDİNE YAZ",
        "A clean 16:9 photograph of a person typing a short test message on a phone at a workshop bench while a laptop shows the reply arriving, photoreal.",
      ),
    ],
  },
  "04_chatbot_nocode-4": {
    title: "Yanlış Anlama",
    slides: [
      slide(
        1,
        "Giriş",
        "BOT ANLAMADI",
        "A clean 16:9 photograph of a phone showing a chat where the same short reply repeats three times, a hand resting on the forehead out of focus, photoreal.",
      ),
      slide(
        2,
        "Yedek cevap",
        "İKİ KEZ SONRA İNSAN",
        "A clean 16:9 photograph of a small paper flow chart with a loop drawn twice and one arrow leaving the loop toward a labeled person icon, photoreal.",
      ),
      slide(
        3,
        "Şikâyet",
        "BU KELİMELER DOĞRUDAN İNSANA",
        "A clean 16:9 photograph of a short handwritten list of keywords on an index card pinned beside a monitor, a pencil in the corner, photoreal.",
      ),
      slide(
        4,
        "Devir",
        "İNSANA DEVİR NOTU",
        "A clean 16:9 photograph of a handwritten handoff note with three short lines clipped to the edge of a laptop, photoreal.",
      ),
      slide(
        5,
        "Bilgi sınırı",
        "BİLMİYORSA BİLMİYORUM",
        "A clean 16:9 photograph of a printed page of shop rules with highlighted lines and a phone showing a short honest reply beside it, photoreal.",
      ),
    ],
  },
  "04_chatbot_nocode-5": {
    title: "Teslim Listesi",
    slides: [
      slide(
        1,
        "Giriş",
        "KURDUN SIRA TESLİMDE",
        "A clean 16:9 photograph of a freelancer handing a folder across a small shop counter to the shop owner, bicycles in the background, photoreal.",
      ),
      slide(
        2,
        "Harita",
        "TEK SAYFA AKIŞ",
        "A clean 16:9 photograph of a single printed page showing a simple flow of boxes and arrows, laid on a clean desk beside a pen, photoreal.",
      ),
      slide(
        3,
        "Erişim",
        "ANAHTAR SAHİBİNDE",
        "A clean 16:9 photograph of a key ring with a small tag placed in the open palm of a shop owner, soft window light, photoreal.",
      ),
      slide(
        4,
        "Gizlilik",
        "BOT KİM OLDUĞUNU SÖYLER",
        "A clean 16:9 photograph of a phone screen showing a short first message that introduces a virtual assistant, a printed notice beside it, photoreal.",
      ),
      slide(
        5,
        "Özet",
        "BEŞ PARÇALI TESLİM",
        "A clean 16:9 photograph of five small items in a row on a desk: a printed flow page, a notebook, a card with keywords, a test log and a small key tag, photoreal.",
      ),
    ],
  },
  "04_chatbot_nocode-6": {
    title: "İlk Deneme",
    slides: [
      slide(
        1,
        "Giriş",
        "CANLIYA ÇIKIŞ",
        "A clean 16:9 photograph of a workshop door sign flipped to open in the morning, a phone propped on the counter, photoreal.",
      ),
      slide(
        2,
        "Deneme",
        "ON GERÇEK KONUŞMA",
        "A clean 16:9 photograph of a desk with ten printed chat transcripts fanned out in a row and a highlighter on top, photoreal.",
      ),
      slide(
        3,
        "Sayım",
        "ÇÖZÜLEN DEVREDİLEN KAÇAN",
        "A clean 16:9 photograph of a hand-drawn tally chart on paper with three labeled columns and neat pencil marks, photoreal.",
      ),
      slide(
        4,
        "Düzeltme",
        "HAFTADA BİR DEĞİŞİKLİK",
        "A clean 16:9 photograph of a calendar with one weekly slot highlighted and a single sticky note describing one small change, photoreal.",
      ),
      slide(
        5,
        "Kapanış",
        "SIRA SENDE",
        "A clean 16:9 photograph of a closed laptop on a calm workshop bench at the end of the day, a phone with the shop chat in the foreground, warm late light, photoreal.",
      ),
    ],
  },
};

const NEGATIVE_PROMPT_LIST = /\b(?:no |without |negative prompt)\b/iu;

function assertBot104CinemaSlides(): void {
  for (const key of BOT104_LESSON_KEYS) {
    const lesson = BOT104_CINEMA_LESSONS[key];
    if (lesson.slides.length !== 5) {
      throw new Error(`BOT-104 slayt sayısı 5 değil: ${key}`);
    }
    lesson.slides.forEach((item, index) => {
      if (item.cueIndex !== index + 1) {
        throw new Error(`BOT-104 slayt sırası bozuldu: ${key}`);
      }
      if (item.aspectRatio !== "16:9" || !item.imagePrompt.includes("16:9")) {
        throw new Error(`BOT-104 slayt 16:9 değil: ${key} ${item.cueIndex}`);
      }
      if (NEGATIVE_PROMPT_LIST.test(item.imagePrompt)) {
        throw new Error(`BOT-104 slayt isteminde negatif liste var: ${key} ${item.cueIndex}`);
      }
    });
  }
}

assertBot104CinemaSlides();
