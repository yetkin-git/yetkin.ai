/**
 * Nereye yazılacak — gerçek Copilot paneli vs ChatGPT/Claude kopyala-yapıştır.
 * Soyut «AI Masası» kutusu yok. PEDAGOJI.md §E.8–E.9.
 */

import { academyPromptCueStart } from "@/lib/academy/prompt-console";

export const ACADEMY_AI_DESK_PASTE_GUIDE = "Nereye Yapıştıracaksın?" as const;
export const ACADEMY_AI_DESK_UPLOAD_GUIDE = "Nereye Yükleyeceksin?" as const;
export const ACADEMY_AI_DESK_WRITE_GUIDE = "Nereye Yazacaksın?" as const;
export const ACADEMY_AI_DESK_TAB_HALF_SEC = 8 as const;
export const ACADEMY_AI_DESK_CTRL_C = "Ctrl+C" as const;
export const ACADEMY_AI_DESK_ATTACH = "Ataş" as const;

/** PEDAGOJI.md §E.8 ses SSOT. L4 mühürlü kaset Copilot paneli ve Gmail Gemini yerleşik yolunu öğretir. */
export const ACADEMY_AI_DESK_INSTRUCTOR_LINE =
  "Gmail’de sağdaki Gemini panelini aç. Word veya Excel dosyasını sohbete ataş ile yükle. Masaüstü Outlook’ta lisansın yoksa 1. kapı kapanır; 2. kapı ataş, 3. kapı maskeli kısa yapıştırmadır." as const;

/** Excel 1. Kapı SSOT — lisans varsa şerit, yoksa ataş; ikisi de geçerli yol. PEDAGOJI §E.2. */
export const ACADEMY_INFRA_EXCEL_DOOR_LINE =
  "Lisans varsa Copilot şeridi, yoksa ataş yöntemi kullanılır; her ikisi de geçerli yoldur." as const;

/** Word ataş + Excel çift yol. PEDAGOJI §E.9. */
export const ACADEMY_INFRA_EXCEL_WORD_LINE =
  "Excel’de lisans varsa Copilot şeridinden okutursun; yoksa Word veya Excel dosyasını sohbet yapay zekâsına (ChatGPT, Claude, Gemini, Grok, Kimi, Muse Spark vb.) doğrudan ataş ile yükleyebilirsin. Her iki yol da geçerlidir." as const;

/** Outlook: Copilot lisansı olmadan canlı kutu okunmaz. 3. kapı maskeli kısa yapıştırmadır. */
export const ACADEMY_INFRA_OUTLOOK_LINE =
  "Copilot lisansın yoksa Outlook canlı kutusunu dış araçlara okutamazsın. Önce Gmail Gemini veya ataş; son çare maskeli kısa yapıştırma." as const;

export const ACADEMY_INFRA_OUTLOOK_HONESTY_BADGE = "Copilot yoksa canlı kutu okunmaz" as const;

/** Gmail + Gemini: yerleşik panel. PEDAGOJI §E.10 — birinci kapı. */
export const ACADEMY_INFRA_GMAIL_LINE =
  "Gmail’de Gemini yerleşik panelini aç. Bu birinci kapıdır. İletiyi dış sohbete taşımak varsayılan yol değildir." as const;

/** Yerleşik araç eşleşmesi — ana yöntem SSOT. 3. kapı son çaredir. */
export const ACADEMY_INFRA_TOOL_MATCH = {
  outlook: "Copilot",
  gmail: "Gemini",
  word: "Doğrudan Dosya Yükleme",
  excel: ACADEMY_INFRA_EXCEL_DOOR_LINE,
  pptx: "Copilot",
} as const;

export const ACADEMY_AI_DESK_TABS = [
  { id: "copilot", label: "Copilot (Dahili)" },
  { id: "chatgpt", label: "ChatGPT / Claude" },
] as const;

export const ACADEMY_AI_DESK_GMAIL_TABS = [{ id: "copilot", label: "Gemini (Yerleşik)" }] as const;

export type AcademyAiDeskTab = (typeof ACADEMY_AI_DESK_TABS)[number]["id"];
export type AcademyAiDeskHost = "outlook" | "excel" | "word" | "pptx" | "gmail";
export type AcademyAiDeskPastePhase = "idle" | "select" | "copy" | "paste" | "typed";

export const ACADEMY_AI_DESK_MAIL_CLIP = [
  "Kaya Gıda A.Ş. — Vade bugün — 54.650 TL tahsilat onayı",
  "Yönetim — imza onayı, bugün 17:00",
  "Banka dekontu — rutin, aksiyon yok",
] as const;

export const ACADEMY_AI_DESK_TABLE_CLIP = [
  "Cari | Mart | Nisan | Satır Toplam",
  "Kaya Gıda A.Ş. | 12.450 | 8.200 | 20.650",
  "Yıldız Tekstil | 9.100 | 3.400 | 12.500",
  "Genel Toplam | 29.750 | 20.700 | 50.450",
] as const;

export const ACADEMY_AI_DESK_SLIDE_CLIP = [
  "Yönetim özeti — 54.650 TL tahsilat",
  "Lider cari: Kaya Gıda A.Ş.",
  "Risk bandı: %15 açık vade",
] as const;

export function academyAiDeskClipForHost(host: AcademyAiDeskHost): readonly string[] {
  if (host === "outlook" || host === "gmail") {
    return ACADEMY_AI_DESK_MAIL_CLIP;
  }
  if (host === "pptx") {
    return ACADEMY_AI_DESK_SLIDE_CLIP;
  }
  return ACADEMY_AI_DESK_TABLE_CLIP;
}

export function academyAiDeskClipVerb(host: AcademyAiDeskHost): string {
  if (host === "gmail") {
    return "Gelen kutusunu Gemini ile açtın";
  }
  if (host === "outlook") {
    return "İletileri seçtin";
  }
  if (host === "pptx") {
    return "Slayt dosyası yüklendi";
  }
  if (host === "word") {
    return "Word dosyası yüklendi";
  }
  return "Excel dosyası yüklendi";
}

export function academyInfraAllowsDirectUpload(host: AcademyAiDeskHost): boolean {
  return host === "excel" || host === "word" || host === "pptx";
}

export function academyInfraUsesNativePlugin(host: AcademyAiDeskHost): boolean {
  return host === "gmail";
}

export function academyAiDeskHostFromLayout(layout: string | undefined): AcademyAiDeskHost {
  if (layout === "outlook") {
    return "outlook";
  }
  if (layout === "gmail") {
    return "gmail";
  }
  if (layout === "pptx") {
    return "pptx";
  }
  if (layout === "word") {
    return "word";
  }
  return "excel";
}

export function academyAiDeskGuideTitle(host?: AcademyAiDeskHost): string {
  if (host === "gmail" || (host && academyInfraAllowsDirectUpload(host))) {
    return ACADEMY_AI_DESK_UPLOAD_GUIDE;
  }
  if (host === "outlook") {
    return ACADEMY_AI_DESK_WRITE_GUIDE;
  }
  return ACADEMY_AI_DESK_PASTE_GUIDE;
}

/** Outlook «Nereye Yapıştıracaksın?» taşıma su kapısıdır; ana akışta basılmaz. PEDAGOJI §E.8–E.10. */
export function academyAiDeskGuideVisible(host?: AcademyAiDeskHost): boolean {
  return host === "gmail" || (host != null && academyInfraAllowsDirectUpload(host));
}

export function academyAiDeskGuideHint(tab: AcademyAiDeskTab, host?: AcademyAiDeskHost): string {
  if (host === "gmail") {
    return "Gmail Gemini";
  }
  if (tab === "copilot") {
    return "Sağ üst Copilot";
  }
  if (host && academyInfraAllowsDirectUpload(host)) {
    return "Ataş ile yükle";
  }
  return "ChatGPT yapıştır";
}

export function academyAiDeskCueStart(lessonKey: string, cueIndex: number): number | undefined {
  return academyPromptCueStart(lessonKey, cueIndex);
}

export function academyAiDeskNativeTool(host: AcademyAiDeskHost): string {
  return ACADEMY_INFRA_TOOL_MATCH[host];
}

export function academyAiDeskTabsForHost(
  host: AcademyAiDeskHost,
): readonly { id: AcademyAiDeskTab; label: string }[] {
  if (host === "gmail") {
    return ACADEMY_AI_DESK_GMAIL_TABS;
  }
  return ACADEMY_AI_DESK_TABS;
}

/** Ana akış dersleri yerleşik yola kilitlenir; taşıma su sekmesi otomatik açılmaz. */
export function academyAiDeskPinnedForLesson(lessonKey: string): AcademyAiDeskTab | null {
  const key = lessonKey.trim();
  if (key === "01_office_ai-g1" || key === "01_office_ai-4") {
    return "copilot";
  }
  if (key === "01_office_ai-0") {
    return "chatgpt";
  }
  return null;
}

export function academyAiDeskActiveTab(input: {
  currentTime?: number;
  cueStart?: number;
  reducedMotion?: boolean;
  pinned?: AcademyAiDeskTab | null;
}): AcademyAiDeskTab {
  if (input.pinned === "copilot" || input.pinned === "chatgpt") {
    return input.pinned;
  }
  if (input.reducedMotion === true || input.currentTime == null || input.cueStart == null) {
    return "copilot";
  }
  const elapsed = input.currentTime - input.cueStart;
  if (elapsed < 0) {
    return "copilot";
  }
  return Math.floor(elapsed / ACADEMY_AI_DESK_TAB_HALF_SEC) % 2 === 0 ? "copilot" : "chatgpt";
}

export function academyAiDeskPastePhase(input: {
  tab: AcademyAiDeskTab;
  currentTime?: number;
  cueStart?: number;
  reducedMotion?: boolean;
}): AcademyAiDeskPastePhase {
  if (input.tab !== "chatgpt") {
    return "idle";
  }
  if (input.reducedMotion === true || input.currentTime == null || input.cueStart == null) {
    return "typed";
  }
  const elapsed = input.currentTime - input.cueStart;
  if (elapsed < 0) {
    return "idle";
  }
  const local = elapsed % (ACADEMY_AI_DESK_TAB_HALF_SEC * 2);
  const t = local < ACADEMY_AI_DESK_TAB_HALF_SEC ? 0 : local - ACADEMY_AI_DESK_TAB_HALF_SEC;
  if (t < 1.6) {
    return "select";
  }
  if (t < 3.2) {
    return "copy";
  }
  if (t < 5.2) {
    return "paste";
  }
  return "typed";
}
