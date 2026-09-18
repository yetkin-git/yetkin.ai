/**
 * 01_office_ai-w1 Word doküman analizi — doğrudan dosya yükleme SSOT.
 * Neden satır satır okutmak yerine riskli madde aratılır? Yığın çıkar; ceza, fesih, gizlilik kopar.
 * Resmî belgede öğretmen SEN, belge SIZ. PEDAGOJI.md §C / §E.9–E.10.
 */

export const ACADEMY_WORD_WINDOW_TITLE = "Word" as const;
export const ACADEMY_WORD_FILE_NAME = "Sozlesme_Kaya_Gida.docx" as const;
export const ACADEMY_WORD_NATIVE_TOOL = "Doğrudan Dosya Yükleme" as const;

/** Öğrencinin ataşladığı .docx için gerçek istem — Prompt Terminali SSOT. */
export const ACADEMY_WORD_UPLOAD_PROMPT =
  "Yüklediğim sözleşme dosyasını (.docx) baştan sona incele. Şirketimiz aleyhine olabilecek cezai şart maddelerini, fesih koşullarını ve gizlilik yükümlülüklerini liste halinde özetle. Sayfa numarası yaz. Uydurma madde ekleme." as const;

export const ACADEMY_WORD_COPY_FRAGMENTS = [
  {
    id: "frag-ceza",
    cell: "A1",
    page: "syf 4",
    text: "…gecikmede günlük yüzde…",
  },
  {
    id: "frag-fesih",
    cell: "B1",
    page: "syf 11",
    text: "…bildirim süresi belirsiz…",
  },
  {
    id: "frag-gizlilik",
    cell: "C1",
    page: "syf 18",
    text: "…süre ve ceza kopuk…",
  },
] as const;

export type AcademyWordStageKind = "copy" | "attach" | "analysis";

/** Command boyunca madde listesi kapalı (Spoiler Yasağı). Sol split parça parça kopya. */
export function academyWordStageKind(input: {
  pane?: "live" | "before" | "after";
  section: string;
  hideReply?: boolean;
}): AcademyWordStageKind {
  const pane = input.pane ?? "live";
  if (pane === "after") {
    return "analysis";
  }
  if (pane === "before" || input.section === "PARÇA PARÇA" || input.section === "GİRİŞ KÖPRÜSÜ") {
    return "copy";
  }
  if (input.hideReply === true || input.section === "HOŞ GELDİN" || input.section === "ATAŞ YÜKLE") {
    return "attach";
  }
  return "analysis";
}

export const ACADEMY_WORD_CLAUSE_CARDS = [
  {
    id: "frag-ceza",
    cell: "A1",
    tone: "acil",
    mark: "🔴",
    label: "CEZAİ ŞART",
    title: "Gecikmede %15 + günlük işlem",
    detail: "Şirket aleyhine ağır madde",
  },
  {
    id: "frag-fesih",
    cell: "B1",
    tone: "bekle",
    mark: "🟡",
    label: "DİLEKÇE HİTAP",
    title: "Kaymakamlık süre uzatımı",
    detail: "Tarih, sayı, unvan, imza insanda",
  },
  {
    id: "frag-gizlilik",
    cell: "C1",
    tone: "arsiv",
    mark: "🟢",
    label: "RAPOR MADDESİ",
    title: "Başlık + üç madde + sonraki adım",
    detail: "Gözlem ile karar notunu karıştırma",
  },
] as const;
