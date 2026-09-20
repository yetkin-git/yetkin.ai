/**
 * 01_office_ai çıkış paketi — Cuma 30 tek sayfa, 9 istem kartı, KVKK maske şablonu.
 * Sınav yoluna girmez. Yazdır / kopyala / indir; PDF fırını değildir.
 */

import { curriculumLessonKeysForSlug } from "@/lib/academy/curricula/lesson-index";
import { officeAiSections } from "@/lib/academy/curricula/office_ai";
import {
  ACADEMY_OFFICE_AI_1_COPILOT_PROMPT,
  ACADEMY_OFFICE_AI_2_COPILOT_PROMPT,
  ACADEMY_OFFICE_AI_3_COPILOT_PROMPT,
  ACADEMY_OFFICE_AI_4_COPILOT_PROMPT,
  ACADEMY_OFFICE_AI_5_COPILOT_PROMPT,
  ACADEMY_OFFICE_AI_6_COPILOT_PROMPT,
  ACADEMY_OFFICE_AI_G1_COPILOT_PROMPT,
  ACADEMY_OFFICE_AI_K1_COPILOT_PROMPT,
  ACADEMY_OFFICE_AI_W1_COPILOT_PROMPT,
} from "@/lib/academy/lesson-beat-visual";
import { LESSON_PRACTICE } from "@/lib/academy/lesson-practice";

export const OFFICE_AI_EXIT_KIT_SLUG = "01_office_ai" as const;

export type OfficeAiExitPromptCard = {
  lessonKey: string;
  ordinal: number;
  title: string;
  prompt: string;
};

export type OfficeAiFriday30Item = {
  id: string;
  block: string;
  minutes: number;
  label: string;
  hint: string;
};

const SCREEN_PROMPT_BY_KEY: Readonly<Record<string, string>> = {
  "01_office_ai-1": ACADEMY_OFFICE_AI_1_COPILOT_PROMPT,
  "01_office_ai-k1": ACADEMY_OFFICE_AI_K1_COPILOT_PROMPT,
  "01_office_ai-2": ACADEMY_OFFICE_AI_2_COPILOT_PROMPT,
  "01_office_ai-3": ACADEMY_OFFICE_AI_3_COPILOT_PROMPT,
  "01_office_ai-5": ACADEMY_OFFICE_AI_5_COPILOT_PROMPT,
  "01_office_ai-4": ACADEMY_OFFICE_AI_4_COPILOT_PROMPT,
  "01_office_ai-g1": ACADEMY_OFFICE_AI_G1_COPILOT_PROMPT,
  "01_office_ai-w1": ACADEMY_OFFICE_AI_W1_COPILOT_PROMPT,
  "01_office_ai-6": ACADEMY_OFFICE_AI_6_COPILOT_PROMPT,
};

export const OFFICE_AI_FRIDAY_30_ITEMS: readonly OfficeAiFriday30Item[] = [
  {
    id: "calendar",
    block: "Takvim",
    minutes: 0,
    label: "Cuma 30 bloğunu yaz",
    hint: "Başlık Cuma 30, süre 30 dakika, tekrar her hafta, bildirim 5 dakika önce. Çakışırsa toplantıyı kaydır; bloğu kaydırma.",
  },
  {
    id: "excel",
    block: "Excel",
    minutes: 10,
    label: "10 dakika tablo",
    hint: "Copilot varsa şeritten okut; yoksa Excel tablosunu ataş ile yükle. A1 sütun adı, birleşik hücre yok, temiz kopya yan sayfada. Kişisel veri varsa önce maskele.",
  },
  {
    id: "slides",
    block: "Slayt",
    minutes: 10,
    label: "10 dakika slayt",
    hint: "Üç madde + tek karar cümlesi. Slayt başına tek fikir. PowerPoint Copilot veya PowerPoint sunusunu ataş ile yükle.",
  },
  {
    id: "inbox",
    block: "Kutu",
    minutes: 10,
    label: "10 dakika e-posta",
    hint: "Gmail Gemini veya Outlook Copilot. Etiket → taslak → insan onayı → arşiv. Gönder tuşu sende.",
  },
  {
    id: "mask",
    block: "Maske",
    minutes: 0,
    label: "Ham satır sohbete gitmez",
    hint: "Ad, telefon, IBAN, T.C. Kimlik No, maaş ve şirket sırrı varsa 3. Kapı: maskeli kısa özet. Ekran görüntüsü yol değildir.",
  },
] as const;

export const OFFICE_AI_KVKK_MASK_TEMPLATE = `KVKK maskeleme pratik şablonu
(Ham satırı sohbet kutusuna yapıştırma. Takma değer yaz, sorunu yaz.)

Ham satır (yalnız kendi defterinde durur):
Ad soyad:
Telefon:
IBAN:
T.C. Kimlik No:
Maaş / prim:
Şirket sırrı / ceza maddesi:

Maskeli karşılık (sohbete gidebilir):
Kod: Müşteri A
Telefon: MASKELİ_TELEFON
IBAN: MASKELİ_IBAN
Maaş: MASKELİ_MAAŞ
Kimlik: yok
Soru: Bu üç satır maskelidir. Ad yok, telefon yok. Sütun adları Ürün, Adet, Bölge. Bölge bazında üç maddelik özet iste.

Üç sahte satır yeter. Otuz satırlık müşteri dökümü gerekmez.
3. Kapı yalnız maskeli kısa özettir. Silmek yüklemeyi geri almaz.
` as const;

function practicePromptFor(lessonKey: string): string {
  const screen = SCREEN_PROMPT_BY_KEY[lessonKey];
  const practice = LESSON_PRACTICE[lessonKey]?.code.source.trim() ?? "";
  return screen || practice;
}

export function officeAiExitPromptCards(): readonly OfficeAiExitPromptCard[] {
  const keys = curriculumLessonKeysForSlug(OFFICE_AI_EXIT_KIT_SLUG);
  return keys.map((lessonKey, index) => {
    const section = officeAiSections.find((row) => row.lessonKey === lessonKey);
    return {
      lessonKey,
      ordinal: index + 1,
      title: section?.title ?? lessonKey,
      prompt: practicePromptFor(lessonKey),
    };
  });
}

export function renderOfficeAiFriday30Markdown(): string {
  const lines = [
    "# Cuma 30 rutini — tek sayfa",
    "",
    "Her Cuma aynı saat. 10 Excel + 10 slayt + 10 kutu. Kriz gelince blok silinmez.",
    "",
  ];
  for (const item of OFFICE_AI_FRIDAY_30_ITEMS) {
    const time = item.minutes > 0 ? ` (${item.minutes} dk)` : "";
    lines.push(`- [ ] **${item.block}${time} — ${item.label}**`);
    lines.push(`      ${item.hint}`);
    lines.push("");
  }
  lines.push("Sınav şimdi açıldı. Baraj 70 puandır. Satın alma o kartı basmaz.");
  lines.push("");
  return lines.join("\n");
}

export function renderOfficeAiPromptCardsMarkdown(): string {
  const cards = officeAiExitPromptCards();
  const lines = ["# 9 ders — kopyalanabilir istem kartları", ""];
  for (const card of cards) {
    lines.push(`## Ders ${card.ordinal}. ${card.title}`);
    lines.push("");
    lines.push("```");
    lines.push(card.prompt);
    lines.push("```");
    lines.push("");
  }
  return lines.join("\n");
}

export function renderOfficeAiKvkkTemplateMarkdown(): string {
  return `# ${OFFICE_AI_KVKK_MASK_TEMPLATE.trim()}\n`;
}

export function renderOfficeAiExitKitMarkdown(): string {
  return [
    "# Ofiste Yapay Zekâ — çıkış paketi",
    "",
    "Bu dosya 9 mühürlü dersin cebine koyduğu üç somut çıktıdır: Cuma 30 kontrol listesi, istem kartları, KVKK maske şablonu.",
    "",
    renderOfficeAiFriday30Markdown(),
    renderOfficeAiPromptCardsMarkdown(),
    renderOfficeAiKvkkTemplateMarkdown(),
  ].join("\n");
}
