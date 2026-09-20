/**
 * 01_office_ai-4 E-Posta Akışı — canlı Outlook / gelen kutusu SSOT.
 * Yeşil kutu `getBoundingClientRect` ile mail satırına kilitlenir.
 * Metin üç noktaya düşmez; font clamp + içerik genişliği.
 */

import { academyExcelAlignBox, type AcademyExcelAlignBox } from "@/lib/academy/excel-align";
import type { AcademyExcelMouseCell } from "@/lib/academy/excel-mouse-pointer";
import { ACADEMY_OFFICE_AI_4_COPILOT_PROMPT } from "@/lib/academy/lesson-beat-visual";

export const ACADEMY_OUTLOOK_WINDOW_TITLE = "Outlook" as const;
export const ACADEMY_OUTLOOK_FILE_NAME = "Gelen_Kutusu.ost" as const;
export const ACADEMY_OUTLOOK_FILE_LABEL = "Gelen Kutusu (Outlook)" as const;
export const ACADEMY_OUTLOOK_UNREAD_BEFORE = 142 as const;
export const ACADEMY_OUTLOOK_UNREAD_AFTER = 0 as const;

export const ACADEMY_OUTLOOK_SAMPLE_LOCK =
  "Örnek iletiler; kendi kutundaki işi koy." as const;

export const ACADEMY_OUTLOOK_DRAFT_REPLY =
  "Kaya Gıda tahsilatı için bugün teyit taslağı; Yıldız Tekstil takibi için yarın sabah takip notu." as const;

/** Tek istem SSOT — `ACADEMY_OFFICE_AI_4_COPILOT_PROMPT` alias. */
export const ACADEMY_OUTLOOK_COPILOT_PROMPT = ACADEMY_OFFICE_AI_4_COPILOT_PROMPT;

export const ACADEMY_OUTLOOK_MAILS = [
  {
    id: "mail-kaya",
    cell: "A1",
    from: "Kaya Gıda A.Ş.",
    subject: "Vade bugün — 54.650 TL tahsilat onayı",
    preview: "Ödeme penceresi kapanmadan teyit isteriz",
    tag: "Acil",
  },
  {
    id: "mail-yildiz",
    cell: "B1",
    from: "Yıldız Tekstil",
    subject: "Açık vade ve risk notu 14 gündür bekliyor",
    preview: "Takip cümlesi hâlâ taslak değil",
    tag: "Aksiyon",
  },
  {
    id: "mail-bulletin",
    cell: "C1",
    from: "Haftalık Bülten",
    subject: "Üç toplantı daveti ve iki fatura aynı yığında",
    preview: "Okunmamışlar birbirine giriyor",
    tag: "Arşivlik",
  },
] as const;

/** Beat 3 SONRA — sıfırlanmış kutu: 142 satır değil, 3 net grup kartı. */
export const ACADEMY_OUTLOOK_RESET_GROUPS = [
  {
    id: "mail-kaya",
    cell: "A1",
    tone: "acil",
    mark: "🔴",
    label: "ACİL AKSİYON",
    title: "Kaya Gıda — 54.650 TL Tahsilat",
    detail: "Bugün ödeme ve onay bekliyor",
  },
  {
    id: "mail-yildiz",
    cell: "B1",
    tone: "bekle",
    mark: "🟡",
    label: "AKSİYON / BEKLEYEN",
    title: "Yıldız Tekstil — Vade Takibi",
    detail: "Açık vade 14 gündür bekliyor",
  },
  {
    id: "mail-bulletin",
    cell: "C1",
    tone: "arsiv",
    mark: "🟢",
    label: "ARŞİVLİK",
    title: "140 bülten ve davet",
    detail: "Arşivlik",
  },
] as const;

const ACADEMY_OUTLOOK_DUMP_NOISE = [
  {
    from: "Haftalık Bülten",
    subject: "Pazartesi özeti ve davet listesi",
    preview: "Okunmamış bülten kuyruğa düştü",
  },
  {
    from: "İnsan Kaynakları",
    subject: "Toplantı notu hâlâ açık duruyor",
    preview: "Bilgilendirme satırı okunmadı",
  },
  {
    from: "Muhasebe",
    subject: "Fatura hatırlatması kuyruğa takıldı",
    preview: "Gürültü satırı üst üste biner",
  },
  {
    from: "Etkinlik Ofisi",
    subject: "Webinar kaydı gelen kutuya düştü",
    preview: "Davet arşive gitmeli",
  },
  {
    from: "Pazarlama",
    subject: "Kampanya bülteni okunmamış bekliyor",
    preview: "Reklam metni aksiyon istemez",
  },
] as const;

export type AcademyOutlookListMail = {
  id: string;
  cell: string;
  from: string;
  subject: string;
  preview: string;
  tag: "Acil" | "Aksiyon" | "Arşivlik";
};

function buildOutlookDumpMails(): AcademyOutlookListMail[] {
  const action: AcademyOutlookListMail[] = ACADEMY_OUTLOOK_MAILS.filter((mail) => mail.id !== "mail-bulletin").map(
    (mail) => ({ ...mail }),
  );
  const noise: AcademyOutlookListMail[] = [{ ...ACADEMY_OUTLOOK_MAILS[2] }];
  for (let index = 1; index < 140; index += 1) {
    const seed = ACADEMY_OUTLOOK_DUMP_NOISE[index % ACADEMY_OUTLOOK_DUMP_NOISE.length]!;
    noise.push({
      id: `dump-${String(index + 1).padStart(3, "0")}`,
      cell: "C1",
      from: seed.from,
      subject: `${seed.subject} ${index + 1}`,
      preview: seed.preview,
      tag: "Arşivlik",
    });
  }
  return [...action, ...noise];
}

/** ÖNCE paneli — 142 okunmamış yığın; SONRA bu listeyi tekrar etmez. */
export const ACADEMY_OUTLOOK_DUMP_MAILS = buildOutlookDumpMails();

export type AcademyOutlookMailId = (typeof ACADEMY_OUTLOOK_MAILS)[number]["id"];
export type AcademyOutlookMailTag = (typeof ACADEMY_OUTLOOK_MAILS)[number]["tag"];

export const ACADEMY_OUTLOOK_ELEMENT_IDS = ["mail-kaya", "mail-yildiz", "mail-bulletin"] as const;
export type AcademyOutlookElementId = (typeof ACADEMY_OUTLOOK_ELEMENT_IDS)[number];

export const ACADEMY_OUTLOOK_CELL_TO_ELEMENT: Record<
  Extract<AcademyExcelMouseCell, "A1" | "B1" | "C1">,
  AcademyOutlookElementId
> = {
  A1: "mail-kaya",
  B1: "mail-yildiz",
  C1: "mail-bulletin",
};

export function academyOutlookElementForCell(cell: string | undefined): AcademyOutlookElementId {
  const key = (cell ?? "A1").trim().toUpperCase();
  if (key === "B1") {
    return "mail-yildiz";
  }
  if (key === "C1" || key === "D1") {
    return "mail-bulletin";
  }
  return "mail-kaya";
}

export function academyOutlookMailForElement(element: AcademyOutlookElementId) {
  return ACADEMY_OUTLOOK_MAILS.find((mail) => mail.id === element) ?? ACADEMY_OUTLOOK_MAILS[0];
}

export function academyOutlookAlignBox(
  cell: Pick<DOMRect, "left" | "top" | "width" | "height">,
  wrap: Pick<DOMRect, "left" | "top" | "width" | "height">,
  layout: { offsetWidth: number; offsetHeight: number; scrollLeft: number; scrollTop: number },
): AcademyExcelAlignBox {
  return academyExcelAlignBox(cell, wrap, layout);
}

export function academyOutlookHasInbox(
  slide: {
    layout?: string;
    table?: { headers: readonly string[]; rows: readonly (readonly string[])[] } | undefined;
    nodes?: readonly unknown[];
    bullets?: readonly string[];
  } | null,
): boolean {
  if (!slide || slide.layout !== "outlook") {
    return false;
  }
  if (slide.table && (slide.table.headers.length > 0 || slide.table.rows.length > 0)) {
    return true;
  }
  if ((slide.nodes?.length ?? 0) > 0) {
    return true;
  }
  return (slide.bullets?.length ?? 0) > 0;
}
